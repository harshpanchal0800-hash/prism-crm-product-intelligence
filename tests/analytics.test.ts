import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AS_OF, DAY, dataset, experiment, funnel, generate, metrics, retention, select, trend, type Dataset, type EventName } from '../src/analytics';
const fixture = (names: [EventName, number][]): Dataset => ({ orgs: [{ id: 'a', signup: AS_OF - 40 * DAY, tier: 'Growth', variant: 'Control' }], events: names.map(([name, day], i) => ({ id: String(i), org: 'a', name, at: AS_OF - (40 - day) * DAY })) });
test('seed is reproducible and event identifiers, timestamps and references are valid', () => {
  assert.deepEqual(generate(7, 10), generate(7, 10));
  assert.equal(new Set(dataset.events.map(e => e.id)).size, dataset.events.length);
  const ids = new Set(dataset.orgs.map(o => o.id));
  assert.ok(dataset.events.every(e => e.at < AS_OF && ids.has(e.org)));
});
test('funnel excludes out-of-order events, duplicates and events outside 14 days', () => {
  const d = fixture([['signup', 0], ['import', 1], ['import', 1], ['conversation', .5], ['ai', 2]]);
  assert.deepEqual(funnel(d).map(s => s.count), [1, 1, 0, 0, 0, 0]);
  assert.deepEqual(funnel(fixture([['signup', 0], ['import', 14]])).map(s => s.count), [1, 0, 0, 0, 0, 0]);
});
test('filters select exact signup cohort and plan with no event leaks', () => {
  const d = select(dataset, 7, 'Growth');
  assert.ok(d.orgs.length > 0);
  assert.ok(d.orgs.every(o => o.tier === 'Growth' && o.signup >= AS_OF - 7 * DAY && o.signup < AS_OF));
  const ids = new Set(d.orgs.map(o => o.id));
  assert.ok(d.events.every(e => ids.has(e.org)));
});
test('metrics reconcile with raw outcomes and trend buckets', () => {
  const d = select(dataset, 30, 'All plans'), m = metrics(d);
  assert.equal(m.acceptance, d.events.filter(e => e.name === 'accepted').length / m.generated * 100);
  assert.equal(trend(d, 30).reduce((n, row) => n + row.signups, 0), m.teams);
  assert.equal(m.adoption, funnel(d)[3].count);
});
test('retention excludes immature organizations and counts each organization once', () => {
  const d = fixture([['active', 7], ['active', 7]]);
  const mature = retention(d)[0].cells[1];
  assert.equal(mature.retained, 1); assert.equal(mature.eligible, 1); assert.equal(mature.rate, 100);
  d.orgs[0].signup = AS_OF - 2 * DAY;
  assert.equal(retention(d)[0].cells[1].rate, null);
});
test('experiment uses mature organizations once, with transparent difference and interval', () => {
  const result = experiment(dataset);
  assert.equal(result.groups.reduce((n, g) => n + g.n, 0), dataset.orgs.filter(o => o.signup + 14 * DAY <= AS_OF).length);
  assert.ok(result.groups.every(g => g.successes <= g.n));
  assert.equal(result.delta, (result.groups[1].rate - result.groups[0].rate) * 100);
  assert.ok(result.low <= result.delta && result.high >= result.delta);
  assert.equal(experiment(select(dataset, 7, 'All plans')).sufficient, false);
});
test('empty data produces no NaN and zero denominators are disclosed', () => {
  const empty = { orgs: [], events: [] };
  assert.equal(metrics(empty).acceptance, null);
  assert.equal(metrics(empty).latency, null);
  assert.ok(funnel(empty).every(s => Number.isFinite(s.rate)));
  assert.deepEqual(retention(empty), []);
});
