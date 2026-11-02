# Research and documentation guide

TIBER-Research holds work about conducting research with agents, evaluating models
and methods, and understanding football. Start with the question a record asks.
An agent-written player study belongs under football; a study of how that agent
uses evidence belongs under agentic research or model evaluation.

The three areas below are ways to find related work. A mixed study can have a
primary area and links from the others while retaining one original record.
Contracts, custody tools and publishing conventions support all three areas.

**Status snapshot: November 1, 2026**, reconciled with `main` at
`74548b455f7e8f0ecdc667a5265d2e0da2ef0d7c`. Local resource links refer to files
present on that revision. Issue and PR links identify work that may live
outside `main`; their current discussion and exact revisions govern later status.
This is a curated starting map, not an exhaustive research inventory.

| Start here | Main question |
| --- | --- |
| [Agentic research](#agentic-research) | How should humans and agents investigate, coordinate, preserve evidence and review work? |
| [Model capabilities and testing](#model-capabilities-and-testing) | What can a model or method demonstrate under specified inputs, conditions and evaluation? |
| [Football research](#football-research) | What do the available observations support about players, teams, games and fantasy opportunity? |
| [Shared infrastructure](#shared-infrastructure) | Where are the contracts, custody rules, commands and publishing resources? |
| [Prepared-article collection](#prepared-article-collection) | Where are historical format-preparation copies and their source, edition and review mappings across all three areas? |

## Agentic research

This area studies research behavior and the environment around an agent: context,
memory, evidence retrieval, collaboration, handoffs, review and human authority.
Useful outcomes include a clearer procedure, a documented failure mode or a
bounded evaluation proposal. The record should say which of these it supplies.

| Resource | What it helps investigate | Record and availability |
| --- | --- | --- |
| [Agent entry](agent-entry/README.md) and [public entry protocol](agent-entry/tiber-agent-entry-v0.md) | How a new agent receives an operator's question and returns an inspectable thesis proposal. | Protocol and contract files on `main`; the entry documentation retains its draft, unactivated pilot status. |
| [Thesis proposal decisions](contracts/agent-thesis-proposal-v0.md) | Separating external evidence, agent inference, recall and the operator's actual position. | Contract decisions and contamination register on `main`. |
| [Matchup-preview skill](../.agents/skills/tiber-matchup-preview/SKILL.md) | Selecting research questions, keeping evidence cards separate and recording source limitations. | Experimental method on `main` through [PR #70](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/70). |
| [Automated-researcher reading note #19](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/19) and [completion-obligations reading note #32](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/32) | What external research suggests about legibility, completion, authority and durable evidence. | Source-linked reading and comparative-analysis records in issues. |
| [Steward workbench case #21](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/21) | How a persistent workbench handles provenance, shared state and stopping boundaries. | Preliminary operator-side case study; attribution limits are explicit in the record. |

The [first matchup-method audit, PR #72](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/72),
is an open PR containing a methodological audit and proposed workflow repairs,
linked to the football preview in
[#71](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/71).
The audit examines the research method; the preview examines the game. Their
questions and evidence remain separately inspectable.

The [DFS arena, PR #43](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/43),
also connects agent collaboration, model evaluation and football decisions. Its
notebook is on an open feature branch. The handoff update in
[PR #57](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/57) and season
study in [PR #65](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/65)
merged into that feature branch, not into `main`.

## Model capabilities and testing

Here, **model** includes language models, statistical football models and
simulators. This area asks what a particular system can do, how it was tested,
which baseline it was compared with and where the result stops being informative.
Keep the model family, task, inputs, observation window and evaluation scope clear.

| Resource | Evaluation question | Record and availability |
| --- | --- | --- |
| [Agent-entry test procedure](agent-entry/user-zero-test-procedure-v0.md) | Can an unfamiliar agent follow the entry protocol, and what changes across providers? | Pilot procedure on `main`; a procedure is distinct from an executed comparison. |
| [Context Compiler #15](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/15) and [candidate contract family](contracts/context-compiler-contract-family-v0.md) | How does the supplied evidence and tool context affect observable agent continuation? | Experiment brief in an issue and contract documentation on `main`; overlaps agentic research. |
| [Engineering traces #16](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/16) | Which task-dependent behaviors and repair patterns appear in the recorded Opus/Fable work? | Preliminary case study and future comparison design; model attribution comes from operator/session records. |
| [ROP target-share experiment #39](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/39) | How do declared retrospective target-share baselines perform in the retained window? | Completed-experiment summary; its public record states the inputs, scope and limits of the result. |
| [Universe D #50](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/50), [design PR #51](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/51) and [implementation PR #53](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/53) | Can route and coverage features recover an authored target-allocation mechanism in a toy world? | Design and isolated [runner](../experiments/universe-d/001-target-allocation/README.md) on `main`; #53 merged into #51's branch before #51 merged into `main`. Implementation checks do not establish final evaluation or NFL realism. |
| [Persistent player-state design #27](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/27) and [Universe C #29](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/29) | What representations, updating rules and uncertainty treatment are worth investigating for football? | Architecture/research proposals; proposed structure and demonstrated predictive value are separate questions. |

Use the strongest description supported by the check that actually ran:

| Check or result | What it can establish |
| --- | --- |
| Offline validation or capability check | Schema, arithmetic, custody or declared behavior for the checked inputs. |
| Synthetic experiment | Behavior or mechanism recovery inside the specified generated world. |
| Empirical evaluation | Performance on the declared observed data, comparison and evaluation split. |
| Independent review | A named reviewer's assessment of a stated revision and scope. |

Passing software tests does not establish forecasting quality. Synthetic recovery
does not establish NFL realism. Empirical conclusions need their own baselines,
cutoffs, uncertainty and limits; review should identify the exact result it
assesses. The [repository validation boundary](../README.md#what-validation-establishes) explains the narrower
guarantees supplied by the custody tooling.

## Football research

This area examines players, roles, teams, matchups and the mechanisms connecting
football opportunity to fantasy outcomes. Keep the question and observation
window visible, distinguish measured usage from interpretation, and preserve the
pregame view when later evidence arrives.

| Resource | Football question | Record and availability |
| --- | --- | --- |
| [MHJ career translation study](studies/mhj-career-2026w4/README.md) and [origin #33](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/33) | What explains the observed prospect-to-NFL production trajectory through 2026 Week 4? | Descriptive study, retained inputs and calculator on `main`; the study records its evidence and review limitations. |
| [Kicker/DST preparation](preparation/kicker-dst-streaming-2026-10-01/README.md) and [origin #25](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/25) | Can pregame evidence identify useful streaming opportunities? | Design/readiness packet on `main`; the later [prototype PR #58](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/58) remains open outside `main`. |
| [Jacksonville receiving study #45](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/45) | How do Hunter, Thomas and Coen's passing structure divide receiving work? | Living player/team study with separately dated follow-ups. |
| [Jeanty #54](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/54), [McConkey #68](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/68) and [Hockenson #69](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/69) | How do role, matchup and availability affect each player's opportunity? | Separate player investigations with their own windows and checkpoints. |
| [Cardinals–Cowboys #71](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/71), [Browns–Steelers #73](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/73) and [Falcons–Buccaneers #75](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/75) | Which competing mechanisms matter for the upcoming game? | Published Week 8 pregame issue records; publication and outcome verification are separate states. |

For further examples, browse the
[research issues](https://github.com/Prometheus-Frameworks/TIBER-Research/issues).
An issue's open or closed state describes its GitHub workflow; read its evidence
and review statements to understand what the study supports.

The [game-study guide](game-studies/README.md), [registry](game-studies/index.json)
and [closeout template](game-studies/templates/closeout.md) are on `main` through
merged [PR #74](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/74).
They connect preserved pregame questions to later assessments and closeout, starting
with Cardinals–Cowboys. The [original pinned pilot guide](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/791dbbd0ee7ff8d7aedc690cdf3727d8384d1d8f/docs/game-studies/README.md)
remains historical context. Read each study's manifest and dated assessments for
its current state; merged infrastructure does not mean postgame work is complete.
Wider game coverage remains a separate expansion.

## Shared infrastructure

These resources support all three research areas. They explain how records are
represented, checked, found and preserved, and which repository owns subsequent
decisions.

| Resource | Purpose |
| --- | --- |
| [Repository README](../README.md) | Repository orientation, custody/runtime boundaries, commands and lifecycle rules. |
| [Research Gateway](gateway/research-gateway-v0.md) | Local intake validation and deterministic views of one run and attempt. |
| [Schemas](../schemas/v0/), [implementation](../src/) and [tests](../test/) | Executable contracts and offline checks; consult the README for setup and commands. |
| [Thesis proposal contract](contracts/agent-thesis-proposal-v0.md), [context contract family](contracts/context-compiler-contract-family-v0.md) and [event-shock extensions](contracts/event-shock-packet-extensions-v0.md) | Versioned contract decisions and their declared boundaries. |
| [Availability-witness discovery](discovery/open-availability-witness-2026-08-13/README.md) | Source qualification, historical availability and upstream-ownership research. |
| [Tunsil preflight orientation](preflight-orientation/tunsil-absence-shock-v0/README.md) | Orientation to the retained pilot's preparation and custody context. |
| [Shared article format](research-articles/README.md), [full article template](research-articles/templates/article.md) and [dated update template](research-articles/templates/update.md) | Common publishing structure on `main` through merged [PR #74](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/74); specialized evidence remains inside the shared outer shape. |
| [Game-study guide](game-studies/README.md), [registry](game-studies/index.json) and [closeout template](game-studies/templates/closeout.md) | Bounded manual game-study lifecycle and question-level closeout; distinct from governed Research activation or downstream admission. |
| [Prepared-article index](research-articles/prepared/README.md), [source queue](research-articles/preparation-queue.json) and [publication index](research-articles/prepared/publication-index.json) | Existing preparation, source dispositions, separate editions and exact artifact/review receipts on `main`; see the collection notes below. |

### Prepared-article collection

The [prepared collection](research-articles/prepared/README.md) spans agentic
research, model capabilities and testing, and football research. Its finite
October 31 census through issue #75 accounts for **53 source issues**, **60 distinct
public-safe articles** and **114 separately preserved editions**. These are
different units, not 114 independent studies or a complete current issue inventory.
The [source queue](research-articles/preparation-queue.json) records exclusions,
internal-reportability blocks and the separately owned #71 pilot. The
[publication index](research-articles/prepared/publication-index.json) maps article
units, edition paths and exact content/review receipts.

The collection is now on `main` through #74. Its preparation-stage draft labels,
branch targets and pending-merge language are historical assignment context, not
current merge status. The [handoff #76](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/76)
and [original pinned preparation index](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/482c33604257104cfaefb3b1ec985301b4b10b11/docs/research-articles/prepared/README.md)
remain available for that history.

Use the collection's existing origin and edition links instead of creating another
article inventory or copying records into each area. Prepared copies preserve
their capture windows; later findings belong to the original investigation and
its dated follow-ups. Format fidelity, substantive independent research review,
downstream acceptance and activation remain separate. Merge and preparation alone
grant none of those later states and do not refresh the underlying evidence.

## Adding and classifying work

Choose the primary area from **what is being investigated**, then add cross-links
where another area would benefit. For example, a matchup preview is football
research; an audit of the preview's evidence handling is agentic research; a
matched comparison of models producing previews is model evaluation.

Keep these dimensions visible and independent:

| Dimension | What to record |
| --- | --- |
| Research area | Agentic research, model capabilities/testing or football research; relevant secondary areas. |
| Record type | Reading note, design, protocol, case study, experiment, evaluation, preview or closeout. |
| Evidence state | What is proposed, observed, tested, unresolved or superseded, with its actual scope. |
| Review state | Who checked which revision, and whether that was author checking, format fidelity or substantive independent review. |
| Location and merge state | Original issue/file, exact revision where needed, and whether files are on `main` or a proposal branch. |
| Activation and permitted use | The applicable existing authority or acceptance record for any consequential next step. |

These are navigation conventions, not a new executable schema, permission grant
or competing article template. Use the existing applicable contract or publishing
format for the actual record. A merged document can remain a design proposal;
a finished study can have unresolved findings; a faithfully formatted article can
still await substantive review.

Maintain links as work evolves. Preserve original IDs, sources, cutoffs, prior
editions and disagreements. Link mixed studies from multiple areas instead of
copying their evidence into competing versions, and update dated status statements
when the referenced work changes.
