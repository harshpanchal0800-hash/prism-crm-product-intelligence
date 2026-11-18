export const DAY = 86400000;
export const AS_OF = Date.parse('2026-11-18T00:00:00Z');
export const stages = ['Signed up', 'Imported leads', 'First conversation', 'AI interaction', 'Appointment booked', 'Lead converted'];
export type Tier = 'Starter' | 'Growth' | 'Enterprise';
export type EventName = 'signup' | 'import' | 'conversation' | 'ai' | 'appointment' | 'conversion' | 'active' | 'generated' | 'accepted' | 'edited' | 'discarded' | 'failed';
export type Org = { id: string; tier: Tier; signup: number; variant: 'Control' | 'Treatment' };
export type Event = { id: string; org: string; name: EventName; at: number; latency?: number };
export type Dataset = { orgs: Org[]; events: Event[] };
export const stageEvents: EventName[] = ['signup', 'import', 'conversation', 'ai', 'appointment', 'conversion'];
export function generate(seed = 42, size = 1800): Dataset {
  let state = seed >>> 0;
  const random = () => ((state = (Math.imul(1664525, state) + 1013904223) >>> 0) / 4294967296);
  const orgs: Org[] = [], events: Event[] = [];
  const push = (org: string, name: EventName, at: number, latency?: number) => {
    if (at < AS_OF) events.push({ id: `evt-${events.length}`, org, name, at, ...(latency === undefined ? {} : { latency }) });
  };
  for (let i = 0; i < size; i++) {
    const signup = AS_OF - (1 + Math.floor(random() * 90)) * DAY + Math.floor(random() * DAY);
    const org: Org = { id: `org-${i + 1}`, tier: (['Starter', 'Growth', 'Enterprise'] as const)[Math.floor(random() * 3)], signup, variant: i % 2 ? 'Treatment' : 'Control' };
    orgs.push(org);
    push(org.id, 'signup', signup);
    let at = signup;
    for (let step = 1; step < stageEvents.length; step++) {
      if (random() > [1, .85, .82, .78, .58, .64][step]) break;
      at += (.15 + random() * 1.5) * DAY;
      push(org.id, stageEvents[step], at);
      if (step === 3 && at < AS_OF) {
        for (let draft = 0; draft < 8; draft++) {
          const generated = at + draft * .6 * DAY;
          if (random() < .045) { push(org.id, 'failed', generated); continue; }
          push(org.id, 'generated', generated, 400 + Math.floor(random() * 2100));
          const outcome = random();
          push(org.id, outcome < (org.variant === 'Treatment' ? .67 : .59) ? 'accepted' : outcome < .85 ? 'edited' : 'discarded', generated + 60000);
        }
      }
    }
    for (let day = 1; day <= 89; day++) {
      if (random() < (.72 * Math.exp(-day / 43) + (org.tier === 'Enterprise' ? .13 : .03))) push(org.id, 'active', signup + day * DAY);
    }
  }
  return { orgs, events };
}
export const dataset = generate();
export const pct = (n: number, d: number) => d ? n / d * 100 : 0;
export const percent = (n: number | null, digits = 1) => n === null ? '—' : `${n.toFixed(digits)}%`;
export function select(data: Dataset, days: number, tier: string, offset = 0): Dataset {
  const end = AS_OF - offset * DAY, start = end - days * DAY;
  const orgs = data.orgs.filter(o => o.signup >= start && o.signup < end && (tier === 'All plans' || o.tier === tier));
  const ids = new Set(orgs.map(o => o.id));
  return { orgs, events: data.events.filter(e => ids.has(e.org)) };
}
export function funnel(data: Dataset) {
  const signups = new Map(data.orgs.map(o => [o.id, o.signup]));
  const ordered = [...data.events].sort((a, b) => a.at - b.at);
  let eligible = new Map(signups);
  return stageEvents.map((name, i) => {
    const previous = eligible.size;
    const next = new Map<string, number>();
    for (const e of ordered) {
      const last = eligible.get(e.org);
      if (e.name === name && last !== undefined && e.at >= last && e.at < signups.get(e.org)! + 14 * DAY && !next.has(e.org)) next.set(e.org, e.at);
    }
    eligible = next;
    return { name: stages[i], count: next.size, rate: pct(next.size, previous), overall: pct(next.size, data.orgs.length), drop: previous - next.size };
  });
}
export function metrics(data: Dataset) {
  const count = (name: EventName) => data.events.filter(e => e.name === name).length;
  const f = funnel(data), generated = count('generated');
  const latencies = data.events.filter(e => e.name === 'generated' && e.latency !== undefined).map(e => e.latency!).sort((a, b) => a - b);
  const middle = Math.floor(latencies.length / 2);
  return { teams: data.orgs.length, activation: pct(f[3].count, f[0].count), adoption: f[3].count, acceptance: generated ? pct(count('accepted'), generated) : null, accepted: count('accepted'), generated, edited: count('edited'), discarded: count('discarded'), failed: count('failed'), error: generated + count('failed') ? pct(count('failed'), generated + count('failed')) : null, latency: latencies.length ? (latencies.length % 2 ? latencies[middle] : (latencies[middle - 1] + latencies[middle]) / 2) : null, conversion: f.at(-1)!.overall };
}
export function trend(data: Dataset, days: number) {
  const buckets = Math.min(days, 12), width = Math.ceil(days / buckets);
  return Array.from({ length: Math.ceil(days / width) }, (_, i) => {
    const start = AS_OF - days * DAY + i * width * DAY, end = Math.min(AS_OF, start + width * DAY);
    const orgs = data.orgs.filter(o => o.signup >= start && o.signup < end);
    const ids = new Set(orgs.map(o => o.id));
    const events = data.events.filter(e => ids.has(e.org));
    return { date: new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }), signups: orgs.length, activated: new Set(events.filter(e => e.name === 'ai').map(e => e.org)).size, accepted: events.filter(e => e.name === 'accepted').length, edited: events.filter(e => e.name === 'edited').length };
  });
}
export function retention(data: Dataset) {
  const groups = new Map<string, Org[]>();
  const activity = new Map<string, Set<number>>();
  const signups = new Map(data.orgs.map(o => [o.id, o.signup]));
  for (const e of data.events) if (e.name === 'active' && signups.has(e.org)) {
    const days = activity.get(e.org) ?? new Set<number>();
    days.add(Math.floor((e.at - signups.get(e.org)!) / DAY)); activity.set(e.org, days);
  }
  for (const org of [...data.orgs].sort((a, b) => a.signup - b.signup)) {
    const week = Math.floor((AS_OF - org.signup) / DAY / 7);
    const key = new Date(AS_OF - (week + 1) * 7 * DAY).toISOString().slice(5, 10);
    groups.set(key, [...(groups.get(key) ?? []), org]);
  }
  return [...groups].map(([week, orgs]) => ({ week, size: orgs.length, cells: [1, 7, 14, 21, 30].map(day => {
    const eligible = orgs.filter(o => o.signup + (day + 1) * DAY <= AS_OF);
    const retained = eligible.filter(o => activity.get(o.id)?.has(day)).length;
    return { day, eligible: eligible.length, retained, rate: eligible.length ? pct(retained, eligible.length) : null };
  }) }));
}
export function experiment(data: Dataset) {
  // shortcut: one binary outcome per organization, use clustered methods for draft-level outcomes.
  const signups = new Map(data.orgs.map(o => [o.id, o.signup]));
  const accepted = new Set(data.events.filter(e => e.name === 'accepted' && signups.has(e.org) && e.at >= signups.get(e.org)! && e.at < signups.get(e.org)! + 14 * DAY).map(e => e.org));
  const groups = (['Control', 'Treatment'] as const).map(variant => {
    const orgs = data.orgs.filter(o => o.variant === variant && o.signup + 14 * DAY <= AS_OF);
    const successes = orgs.filter(o => accepted.has(o.id)).length;
    return { variant, n: orgs.length, successes, rate: orgs.length ? successes / orgs.length : 0 };
  });
  const [a, b] = groups;
  const sufficient = groups.every(g => g.successes >= 5 && g.n - g.successes >= 5);
  const delta = b.rate - a.rate;
  const se = Math.sqrt(a.rate * (1 - a.rate) / (a.n || 1) + b.rate * (1 - b.rate) / (b.n || 1));
  return { groups, delta: delta * 100, low: (delta - 1.96 * se) * 100, high: (delta + 1.96 * se) * 100, sufficient };
}

