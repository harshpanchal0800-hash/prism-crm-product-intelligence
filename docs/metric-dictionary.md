# Metric dictionary

Snapshot: 2026-11-18 00:00 UTC. Seed: 42. Population: 1,800 synthetic organizations over the preceding 90 days. Signup intervals are half-open [start, end). Filters apply to organization signup timestamps and subscription tier. Events of those organizations are observed through the fixed snapshot.

| Metric | Definition |
| --- | --- |
| New teams | Distinct organizations signed up in the selected period and plan |
| Activation | Organizations completing the ordered signup → lead import → conversation → AI interaction journey within 14 days / selected signups |
| Draft acceptance | Accepted draft outcomes / successful generated drafts in selected signup cohorts |
| Edited draft rate | Edited outcomes / successful generated drafts; exclusive of accepted outcomes |
| Generation error rate | Failed generations / (successful generated drafts + failed generations) |
| Median latency | Middle successful generation latency, averaging the two middle values for even counts; absent observations display a dash |
| Lead conversion | Organizations completing all six ordered stages within 14 days / selected signups; not a lead-record conversion rate |
| Funnel step conversion | Distinct organizations reaching step / organizations reaching immediately previous step |
| Overall funnel conversion | Distinct organizations reaching step / selected signed-up organizations |
| Retention Dn | Organizations with an active event in [signup + n days, signup + n + 1 days) / organizations observed through the end of that interval |
| Experiment primary | Mature organizations with any accepted draft in [signup, signup + 14 days) / organizations with 14 complete days, by assigned arm |

Funnel stages require nondecreasing event timestamps, one count per organization, and an exclusive upper bound at 14 days after signup. Duplicate occurrences do not inflate stage counts. Recent signup cohorts can have incomplete funnel observation time; the screens disclose this. Cohorts are weekly bins anchored to the snapshot; the label is the start boundary.

Previous comparisons use the preceding equal-duration signup interval and the same plan. Count changes are absolute organization counts; rate changes are percentage points. Different cohorts have different follow-up times. The fixture has only 90 days; unavailable previous cohorts display a dash, not a fabricated change.

Growth lines group selected organizations by signup-date bucket. Activated counts reflect an observed AI event; the generator creates AI events through the ordered journey within 14 days. AI trend outcomes are grouped by organization signup, not draft event date.

Retention is organization-level exact-day return, not user retention, rolling retention, or survival. Immature organizations are excluded separately per cell. A dash indicates no mature denominator. The line chart aggregates numerators and mature denominators, rather than averaging cohort percentages.

Experiment assignment is deterministic and balanced by generated organization index parity, fixed before outcomes are generated. The generator intentionally changes draft acceptance probability between arms. Analysis uses one binary outcome per organization to avoid pretending correlated drafts are independent. The interval is an unpooled normal approximation: difference ± 1.96 × sqrt(p1(1-p1)/n1 + p0(1-p0)/n0). Interpretation is suppressed unless each arm has at least five successes and five failures. It is an illustrative fixed-snapshot simulation without power, sequential, or multiple-testing controls.

A decision opportunity uses the highest relative funnel loss. Its hypothetical extra progressing teams = previous-stage organization count × 0.05. This is explicitly a hypothesis and has no claimed causal or revenue effect.
