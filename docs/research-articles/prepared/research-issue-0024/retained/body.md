## Purpose

Start a lightweight weekly board for specific players the operator wants to understand: **what changed in their role and opportunity, what changed in the team environment, and what evidence would change our interpretation next?**

**Operator-requested issue capture: September 28, 2026.** Initial watchlist: Josh Downs, Braelon Allen, DK Metcalf, Chase Brown, and Tre Harris.

This is the first weekly board, not a new dashboard or autonomous research service. Keep adding questions here while the Week 3 batch is open; use linked successor issues for later weeks so earlier questions and findings remain inspectable.

**Initial status: intake recorded; Week 3 input readiness not yet checked.** This issue does not assert that Week 3 data or reviewed player/team outputs already exist, or that they are absent. No football finding is established by posting it.

## Initial player board

All five names are operator-selected tracking subjects. Except for the Allen question carried from the preceding discussion, the starting questions below are agent-proposed research framing—not bullish/bearish beliefs attributed to the operator. Canonical player IDs, team membership, positions, and game IDs must be resolved from the exact admitted week before analysis; these local case labels are not canonical IDs.

| Case | Player | Starting ROP question | TTS / competing explanation to inspect | Initial state |
|---|---|---|---|---|
| W03-DOWNS | Josh Downs | How do his target count, target share, air-yard opportunity, and red-zone involvement compare with Weeks 1–2? Inspect actual participation/alignment only where supported. | Distinguish a player-allocation change from changing team pass volume, personnel competition, quarterback context, or game script. | Awaiting input-readiness check |
| W03-ALLEN | Braelon Allen | After Hall's verified exit, did Allen inherit carries **and** passing-down opportunity, or only a narrower situational role? | Separate replacement usage from late-game passing volume; keep the duration of any future Hall absence separate from observed workload. | Awaiting input-readiness check |
| W03-METCALF | DK Metcalf | Did his share and quality of receiving opportunities change, or did production change while the role remained similar? | Examine team dropbacks/pass attempts, scoring chances, quarterback continuity, and distribution to other receivers where witnessed. | Awaiting input-readiness check |
| W03-BROWN | Chase Brown | How are carries, targets, and high-value opportunities divided across the backfield? Distinguish workload change from efficiency or touchdown variance. | Examine team rushing/passing volume, available red-zone opportunities, and score-state context rather than assuming committee or lead-back changes. | Awaiting input-readiness check |
| W03-HARRIS | Tre Harris | Does Week 3 show broader, repeatable involvement versus Weeks 1–2, or isolated opportunities without a demonstrated role expansion? | Separate changes in team passing volume and other players' availability from sustained changes in Harris's allocation. | Awaiting input-readiness check |

These are questions, not findings. Preserve stable roles, negative results, and inconclusive cases just as carefully as apparent breakouts.

## Readiness gate — when Week 3 evidence is available

The first follow-up is a **read-only input inventory**, not an automatic weekly execution:

1. Locate the exact governed **2026 REG Week 3** TIBER-Data evidence and relevant existing ROP / TIBER-Teamstate outputs. Record retrievable paths, source revisions or digests, implementation/rule versions, scope, coverage, and review/authority state separately.
2. Confirm each player's identity and cohort coverage. Do not assume prior Week 1–2 frozen ROP cohorts include these five players; do not silently extend a reviewed cohort.
3. Pin any usable Week 1 and Week 2 baselines independently. Missing player-weeks remain unavailable, not zero. A missing baseline need not prevent a supported Week 3-only description, but it prevents the corresponding change claim.
4. Verify relevant games are final and the admitted input's completeness/correction state is known. A completed game, a published dataset, a produced model output, and a reviewed output are different states.
5. Record readiness per player and per question: `ready_for_bounded_inspection`, `partial`, or `blocked`, with the exact missing witness and owning producer. Partial coverage for one player must not silently become coverage for the whole board.

**Data → ROP remains direct; TTS supplies same-window team context, not a mandatory serial gate for every player observation.** Missing TTS may leave environment/composition questions unresolved while supported player observations remain usable. Conversely, a team-wide report cannot substitute for missing player evidence.

If a required producer output or event-sliced contract does not exist, identify the smallest follow-up in its owning repository. Do not run producers, invent an output, or retrofit reviewed artifacts under this issue-capture request.

## Allen sub-study — preserve the actual post-Hall window

This is the first priority within the board because the operator specifically asked to inspect the replacement role.

- Verify the actual game and Hall's last participating play before the relevant absence. Bind a game ID and play boundary; check for any return. Exclude the exit play from the post-exit window unless a separately stated definition requires otherwise.
- Show **full-game, pre-exit, and post-exit** observations separately. Whole-game totals alone cannot answer the replacement-role question.
- Count Allen's and the other backs' carries, targets, red-zone/inside-10/inside-5 opportunities, and third-down/two-minute opportunities only where the admitted data supports the requested event definition.
- Report numerator, denominator, sample size, and eligible-play rules. Separate RB carry share from all-team rushing share. Define treatment of nullified plays, penalties, sacks, scrambles, kneels, spikes, and two-point attempts rather than mixing accounting universes.
- Snaps and true routes require an actual participation/route witness. Targets do not establish routes; presence on a targeted play does not establish every intervening snap. Report unsupported participation as unavailable, not as an inferred percentage.
- Preserve score differential, time remaining, drives, and run/dropback mix. Where only full-game TTS exists, label it full-game context; do not describe it as post-exit TTS.
- Assess separately: **observed replacement allocation**, **evidence for a broader role**, and **unknown duration of future opportunity**. One late-game sample is neither proof of a full-game rotation nor a multi-week workload forecast.

The preceding chat's numerical Allen summary is an **unverified research lead for this board**, not an admitted ROP result. Re-establish every number from the pinned source rather than importing chat prose or treating external charting as TIBER truth.

External availability lead, not an admitted quantitative input: [Reuters / Field Level Media, September 28, 2026](https://www.reuters.com/sports/report-jets-rb-breece-hall-quad-week-to-week--flm-2026-09-28/). Recheck applicable availability at the eventual research cutoff; do not assume a two- or three-game absence.

## Common ROP × TTS inspection

For each player, keep four layers visible:

**Observed opportunity:** available player counts/shares and the corresponding team totals, with exact denominators and game counts. Include true snaps/routes, alignment, or other enriched fields only when actually witnessed and permitted.

**Role interpretation:** what the exact ROP output says, its limitations, and any separately labeled research inference. Never use fantasy points to backfill a role label.

**Team context:** the exact supported TTS fields for the same team/week, including activity/pass-run environment or scoring opportunity where present. Desired fields are not claims about current producer capability. New aggregations must not be represented as existing TTS outputs.

**Challenge and next observation:** the strongest competing explanation, evidence against the initial idea, remaining missing witnesses, and one feasible next observation. Descriptive deltas do not establish causation or future volume.

Use Week 3 versus Week 2 with Week 1 as additional context where comparable. Keep changes in coverage, definitions, team affiliation, and observation windows visible rather than forcing a continuous trend.

## Output for the first bounded investigation

Return a phone-readable summary plus inspectable evidence references, with one compact case note per player:

```text
Player and exact week/game scope
Original question and attribution
W1 / W2 / W3 evidence availability
Observed opportunity change: counts + shares + denominators
ROP interpretation and exact output reference
TTS context and exact output reference
Research inference, kept separate
Competing explanation / counterevidence
Missing witness and next observation
Disposition: supported | challenged | mixed | unresolved
Review state and input/output identities
Carry forward next week: yes/no, with reason
```

A disposition applies to a stated hypothesis, not to the player's overall quality. Use `unresolved` when the evidence cannot discriminate. No synthetic composite score, player ranking, point projection, or trade/start-sit directive is required.

## How to add players and roll the board forward

Add a comment in ordinary language:

> Add [player] for [week]. I noticed / want to understand [observation or question]. I would change my view if [optional next signal].

A name alone is a valid intake; missing rationale stays unspecified. Agents may propose a neutral question but must not invent an operator belief.

The working board may be updated for navigation, while preserving the original intake and dated additions/corrections in the thread. Each analyzed batch pins its player list and cutoff. Later additions become a labeled supplemental batch rather than silently changing a completed comparison.

For each later week, create a linked successor board when requested, carry forward unresolved players/questions explicitly, and link back to prior evidence. Preserve outcomes and failed hypotheses; do not overwrite Week 3 with Week 4 or claim post-game questions were pregame predictions. This initial intake is retrospective/exploratory, not a preregistered Week 3 forecast.

## Scope and ownership

The authorized change now is this Research issue and its reusable tracking format. Data retains source truth; ROP retains player-role interpretation; Teamstate retains team-environment interpretation; Research retains questions, evidence comparisons, challenges, and findings. Follow the [Research repository boundary](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/main/README.md).

No scheduler, automatic data watch, bot dispatch, provider spending, ingestion, new producer execution, source admission, code/PR work, merge, deployment, promotion, or downstream fantasy action is activated. A later governed execution must bind its actual inputs and applicable operator authority; data arrival alone does not grant execution authority. Independent exact-output review precedes treating a formal research packet as reviewed, and review never grants downstream authority.

Keep private league records, roster details, trade negotiations, and scoring settings out of this public board unless separately authorized.

Related context: [Research #9 — thesis lineage](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/9), [#13 — Colts roster-shock research](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/13), and [#22 — observation/PBP reconciliation](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/22). These are context links, not claims that their findings are current or automatically applicable.

## Completion checklist for the Week 3 batch

- [ ] Verify and pin source/output readiness and player identity for all five subjects.
- [ ] Establish comparable W1/W2 baselines or explicitly record gaps.
- [ ] Reconcile Allen's exact exit split or report the missing event/participation witness.
- [ ] Produce five bounded case notes with ROP, TTS, counterevidence, and next observations separated.
- [ ] Preserve null/unavailable versus zero and publish actual coverage limitations.
- [ ] Record independent-review status honestly; no self-certified review or seal.
- [ ] Summarize which questions to carry forward, resolve, or drop without rewriting the initial intake.

**Current terminal state: weekly_board_created; evidence_inspection_pending; no_execution_activated.**