# 2026 draft-value research pilot v0

**PUBLIC DOCUMENTATION / PARTIAL DESCRIPTIVE CANDIDATE.**

Prepared October 13, 2026, following the operator's request to retain the pilot
on GitHub. This publishes the eligible documentation and already-public factual
accounting portion of the private exploratory packet. It does not publish the
original private PDF/ZIP, exact FFC market rows, private ROP records or league data.

- Empirical owner: [Research #37](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/37).
- Proposed lesson destination: [Strategy #12](https://github.com/Prometheus-Frameworks/TIBER-Strategy/issues/12).
- Status: **partial; qualified Weeks 1-5 draft-value comparison blocked**.
- Review: local source-fidelity and arithmetic checks; independent output review pending.
- Lifecycle: manual candidate, not a governed Research attempt, acceptance or terminal seal.

## Question and scope

What did a player's preseason acquisition cost require to go right, what happened
in the first five weeks, and which explanations survive counterexamples?

The operator nominated Christian Watson, Kenneth Walker III, Matthew Golden,
Omarion Hampton and Travis Etienne Jr. Their proposed success/disappointment
classifications remain hypotheses. No hit/bust grade is assigned here.

Use 2026 REG Weeks 1-4 as Q1; report Week 5 separately and cumulative W1-5 only
with complete compatible evidence. Both windows are retrospective. Week 5 is
not a holdout. A future test requires its own actual pre-event freeze.

## Preseason reference and permitted use

Three retained early-August FFC lanes were inspected: PPR requested-12,
PPR requested-10, and half-PPR requested-10, all captured August 7 in UTC.
No later preseason reference was located in the inspected main trees and file
search. This is a scoped search result, not a claim that no later observation exists.

The PPR lanes record a July 31-August 7 sample window; the half-PPR lane records
August 1-6. Their fetched_at values are retrieval clocks. Source generation,
availability, semantic revision and window-timezone definitions remain unbound.
These are early-August observations, not established closing ADP or prices paid
in the operator's actual leagues.

FFC describes its ADP as human selections in hosted mock drafts, excluding
computer selections before averaging. The requested team/scoring labels do not
establish an exclusively managed-redraft, one-QB population or a full scoring
contract. The retained PPR 10-/12-team observations have identical substantive
player values apart from formatted pick notation. This reproduces the existing
definition warning; it does not prove that the provider ignores team count.

The [August 19 permission addendum](https://github.com/Prometheus-Frameworks/TIBER-Data/blob/0d9f82a8d0225602faea4887adf314983ee25a3a/docs/audits/dated-redraft-adp-ffc-permission-addendum-2026-08-19.md)
records permission to store and display FFC observations. The original reply was
also checked during private preparation. Automated API access and public
repository/API redistribution were not separately granted. Storage/display
permission does not silently grant public redistribution of exact market rows.
The August 19 response also does not authenticate the August 7 capture process.

**No exact FFC prices, provider IDs, selected market rows or market payload are
copied into this public packet.** Existing source references remain with their
current owners; linking them does not admit them. The retained wrapper's Git
identity authenticates committed bytes, not the original HTTP response.

The [source qualification record](https://github.com/Prometheus-Frameworks/TIBER-Data/blob/0d9f82a8d0225602faea4887adf314983ee25a3a/docs/audits/dated-redraft-adp-source-qualification-2026-08-10.md)
and [Data #251](https://github.com/Prometheus-Frameworks/TIBER-Data/issues/251)
continue to control unresolved source-definition and identity requirements.
The inspected promoted identity crosswalk supports Sleeper only; it supplies no
governed FFC-to-GSIS edge. A matching name/team/position is not such an edge.

## Public partial accounting: same game, same scoring

The following facts are extracted from existing public, pinned TIBER-Data
nflverse support. They remain source-native observations, with no FFC price join.

| 2026 REG Week 1, GB-MIN | Credited targets | Receptions | Receiving yards | Receiving TDs | Generic PPR |
| --- | ---: | ---: | ---: | ---: | ---: |
| Christian Watson | 8 | 6 | 147 | 2 | 32.7 |
| Matthew Golden | 12 | 6 | 95 | 0 | 15.5 |

Watson's 17.2-point advantage contains 12.0 receiving-TD points and 5.2 yardage
points; reception points are equal. Removing receiving-TD points leaves 20.7
versus 15.5. Golden's larger target count did not yield more points in this game.
This falsifies only the deterministic claim that more targets necessarily mean
more realized points. It does not estimate the average effect of targets,
opportunity quality, luck, expected fantasy points or future regression.

The complete generic scoring policy for these selected rows is bound in
[public-accounting.json](public-accounting.json): 1/reception; .1/rush or
receiving yard; 6/rush or receiving TD; .04/pass yard; 4/pass TD;
-2/interception or total fumble lost; 2/credited passing, rushing or receiving
two-point conversion; 6/special-teams or fumble-recovery TD. All other categories,
bonuses, return yardage, IDP and kicking score zero. Ancillary components are
observed zero for these two rows. This is not an official Sleeper league score.

The early retained W1 support contains 15 of 16 scheduled games, missing DEN-KC.
It is not the later complete W1 support used by the private ROP packets.
Walker is therefore not observed in this particular capture: no appearance,
absence, bye, injury, lost role or zero is inferred. Positive offensive statistics
support the exact appearances of the two displayed players, not complete-window
games-played coverage. Finality is unknown and corrections remain possible.

Player/team tables and related ROP work share an upstream source family;
agreement is not independent football corroboration. Raw CSV byte hashes were
checked against the retained receipt. These checks do not admit a Data source.

Attribution: **nflverse contributors, CC BY 4.0**, no endorsement implied.
Source URL, Git pin, original retrieval clocks, byte digest and license reference
are retained in the JSON. Only bounded factual extracts are reproduced here;
the source files remain in their existing public repository.

The existing [MHJ Q1 study](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/bd553c985409ecfda7de6f6ca6188e4d5e588d1e/docs/studies/mhj-career-2026w4/README.md)
is another reusable partial-evidence lead. Its receiving-only component is not
complete PPR; its provisional target receipt and independent-review limits remain.
No private ROP comparison values are republished or reauthenticated here.

## Comparison protocol awaiting eligible inputs

1. Bind one exact eligible preseason snapshot and market. Target market is
   12-team full-PPR one-QB redraft; do not assume the FFC prototype establishes it.
2. Preserve all QB/RB/WR/TE rows at source ADP <=180, including unresolved identities
   and nonparticipants. Exclude kicker/defense. Missing evidence is not zero.
3. For each anchor, sort same-position rows by (ADP, source-native ID), then select
   the three immediately preceding and three following rows, excluding the anchor.
   Preserve ties, edges and cost spans. This selector is retrospective, not preregistered.
4. Bind the exact FFC-to-GSIS identity and permitted-purpose path before joining
   any market row to an outcome. No such mapping is created by this packet.
5. For W1-4, W5 and W1-5 separately, show delivered points, appearances, PPG,
   weekly concentration, byes, verified nonappearances, carries/targets and eligible
   team denominators. Count zero-catch appearances; never infer appearances from
   missing rows. With zero appearances, PPG is undefined.
6. Compare same-position, same-window, same-scoring peer distributions with
   contributing counts. Residuals are descriptive, not ADP-implied expectations.
   Never divide points by ADP or subtract overall ADP from positional finish.
7. Half-PPR uses recomputed scoring components and its own eligible market lane.
   Do not mix formats. Pool shares from summed operands, not averaged percentages.
8. Keep price-relative performance, availability, injury timing, role change,
   opportunity growth and conversion distinct. Ordinary variance needs a defensible
   distribution; severe disappointment needs a declared positional/league benchmark.
   Five weeks cannot establish a full-season bust label or calibrated probability.

## Hypotheses and falsifiers

| Candidate hypothesis | Required test | Counterexample or challenge |
| --- | --- | --- |
| Cheap uncertain roles can create surplus | Dated preseason uncertainty evidence, fixed position/cost comparisons and all failures | Cheap failures offset winners; equally uncertain expensive cases perform similarly; the result reverses across windows |
| An expensive price charged for improvement | Contemporaneous expectations beside eligible prices | Ordinary improvement justified the cost, or dated expectations contradict the retrospective story |
| Availability and playing rate change the lesson | Actual appearances, totals and per-appearance rates; limited appearances retained | A shortfall remains with comparable exposure; role/conversion changes explain more |
| Positional value changes the lesson | Eligible positional replacement and actual lineup constraints | The apparent edge disappears under valid replacement/roster alternatives |

These remain untested hypotheses. The same-game accounting example establishes
only a narrow target-count/realized-scoring distinction. It validates no draft
selection method, causal mechanism, roster construction strategy or repeatable edge.

## Research-to-Strategy handoff

Research owns player-level evidence, source/identity/coverage status, computations,
comparisons, negative cases and revisions. Strategy #12 may later receive a
separately reviewed, visibility-eligible, **player-free** field note containing:

- question, exact eligible Research references and observed window;
- evidence status, interpretation and alternative explanations;
- what was knowable before the draft versus reconstructed afterward;
- falsifier, subsequent observation, revised lesson and limitations;
- downstream status initially `not_activated`.

Use synthetic teaching examples in Strategy. No ontology change, numeric player
classification, ranking, forecast or consumer activation follows. Existing
Strategy #8/#10 and DYNASTY_STRATEGY_ONTOLOGY_V1 are preserved.

## Next dependencies and limits

- Existing Data source/identity owners qualify retained FFC market/purpose semantics
  and exact identities; storage/display permission alone is not admission.
- Existing evidence custodians identify compatible retained W1-5 scoring,
  appearances and basic opportunity for the fixed cases.
- Independent review binds the resulting exact packet before any qualified
  draft-value conclusion or Strategy handoff.

**Week 3 remains paused.** No access repair, producer rerun, new acquisition,
source admission, scheduler, predictive model or downstream activation occurs.
If retained evidence cannot supply the operands, acquisition or an alternative
actual-draft-price study is a later operator decision.

## Reproduce this public accounting

From this directory, with Python's standard library:

```bash
python3 calculate.py
```

The calculator reads only the checked-in public extract and prints component
totals. It performs no network call, writes no output and joins no market row.
It checks arithmetic, not rights, source authenticity or governed acceptance.
The SHA-256 fields identify existing retained source bytes; this public calculator
does not claim to download or reauthenticate those originals.
