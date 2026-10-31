---
format: "tiber-research-article/v0"
record_id: "research-issue-0050-universe-d-charter"
record_kind: "conceptual note"
subject: "Universe D: synthetic football research"
study_window: "Synthetic design and separate development validation; no final benchmark result"
evidence_cutoff: null
timezone: "America/Toronto"
latest_observation_covered: "Source edition only; exact game/event coverage retained below"
authored_at: "2026-10-31T19:30:11.552299Z"
record_origin: "historical format copy"
original_record: "https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/README.md"
game_manifest: null
research_state: "Historical source state retained; no new assessment"
review_state: "Format self-check only; independent format review pending; historical receipts retained separately"
owner: "unknown"
admission_granted_by_record: false
external_acceptance_refs: []
source_record_authored_at: "unknown (source describes October 23)"
---

# Universe D: synthetic football research — historical format preparation

## 1. Summary

This is a historical-format copy of the source edition, not fresh research. No football evidence was refreshed and no independent research review was performed. Original observations, reports, calculations, hypotheses, contrary evidence and limits remain source-authored below.

### Universe D: synthetic football research

**Status: research-design candidate, October 23, 2026 (America/Toronto).**
No simulator, experiment result, independent review or production integration is
claimed by this packet. Start with [Experiment 001](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/experiment-001.md); the
[implementation handoff](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/IMPLEMENTATION.md) identifies the smallest runnable slice.
Tracking record: [Research #50](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/50).

Universe D is an explicitly invented football environment for testing inference
and evaluation methods under known assumptions. It is a companion to
[Universe C / Research #29](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/29),
not a replacement for the real football world or a source of NFL observations.



## 2. Question and scope

### Preserved study context (navigation, not a new evidence cut)

Synthetic assignments-known-before-target experiment with shared eligibility mask: B0 versus BRC, BR/BC ablations, U sanity and evaluator-only oracle. Original and amended protocol remain separate; development is not benchmark. The original and this edition retain their own cutoffs; no later result is imported backward.

#### Question and intended use

Can a controlled environment help TIBER test what additional evidence preserves,
what a compressed state omits, and whether a model recovers deliberately planted
structure without leaking hidden truth into its inputs?

Potential later questions include target probability per route, route-specific
opportunity, defensive responsibilities, protection and quarterback choices.
The first experiment addresses only generated target allocation. It does not
train a general football agent, simulate a season, or estimate real-player value.

The inspiration is OpenAI's description of an indexed, cached offline web in
[Securing our frontier model training environment](https://openai.com/index/securing-our-frontier-model-training-environment/),
section **Building an offline world**, inspected for this design. That is an
interaction environment built from web content. A generative football simulator
is a further proposal: the article does not establish its football fidelity,
training benefit or implementation. The transferable idea is controlled,
repeatable interaction without effects on external systems.



## 3. Baseline and alternatives

#### Carry forward Universe C's distinctions

The October 7 architecture synthesis in #29 is the controlling conceptual
reference. Superscript `D` below means **inside the invented environment**;
it does not extend a production schema.

This design inspected the current issue records and Research main at
`bd553c985409ecfda7de6f6ca6188e4d5e588d1e`. Issue text can change; these links
identify the conceptual sources, not immutable experimental inputs or fresh
certifications of their linked producers.

| Universe C concept | Universe D counterpart | Boundary retained |
| --- | --- | --- |
| Real state `S_t` | Simulator state `S_t^D`: fictional profiles, assignments and private shocks | The experimenter can inspect simulator truth; that does not reveal NFL truth |
| Eligible evidence `E_t` | A declared projection `E_t^D` emitted before target selection | Learners receive only their feature allowlist, not latent fields or future labels |
| Bounded state `Ŝ_t` | A fitted representation of synthetic opportunity | A learned summary is not automatically sufficient or causally correct |
| Modeled outcome distribution | `P_M(Y^D given E_t^D)` | Model probabilities remain distinguishable from the generator's probabilities |
| Realized outcome `Y` | One categorical target/no-target draw `Y^D` | A single draw does not validate a forecast or erase its uncertainty |
| Separable ROP/TTS lenses | Separate participation, matchup and team-context views | Do not manufacture independent evidence from shared generated ancestry |
| Scoped verification | Check eligibility, probability mass, denominators, splits and byte replay | Conformance is separate from substantive review, empirical support and authority |

Synthetic observations are observations **of the simulator only**. Their claim
kind, world identity, generator version and prediction phase must survive every
export. Missing evidence is not zero. A simulated route cannot fill a missing NFL
route field, become a ROP observation, or unblock a real-data evaluation.

Adjacent foundations:

- [OL Context #28](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/28)
  and its [readiness packet](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/28#issuecomment-5986419259)
  distinguish route volume from targets per route and protection outcomes from
  isolated line contribution. Here a blocking/pressure rule is an authored
  assumption, not confirmation of either real-world mechanism.
- [Defensive Unit State #30](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/30)
  motivates separable functions and interactions rather than one defense grade.
  The first simulator uses explicit coverage responsibilities. Its coefficients
  cannot validate front/secondary attribution in the NFL.
- #29 also reconciles [Research #27](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/27)
  and [Forecast #190](https://github.com/Prometheus-Frameworks/TIBER-Forecast/issues/190).
  Their real-evidence qualification and point-in-time requirements remain separate.



#### Repository decision

| Choice | Initial benefit | Initial cost | Recommendation |
| --- | --- | --- | --- |
| Extend `TIBER-Research` | Existing notebook, source links, PR review and CI; one place to inspect assumptions and later results | Keep experimental code clearly separate from the custody runtime | Use now |
| Create a dedicated repository | Independent simulator package, releases and contributors | Another README, ownership boundary, CI setup and navigation surface before a reusable engine exists | Defer |

The smallest structure is this documentation folder, one tracking issue and one
documentation PR. A later implementation can live in
`experiments/universe-d/001-target-allocation/` without a service, database,
provider, UI, new package dependency or change to the Research CLI.

Revisit extraction when there is a reusable simulator interface needed by
multiple experiments or consumers, independently versioned releases, or a
maintenance/performance boundary that this repository cannot support cleanly.
A new experiment alone is not a reason to create infrastructure.



## 4. Evidence by question

### Retrospective question-to-evidence mapping

These are format-preparation navigation cards, not new observations, tests or assessments. Original IDs are retained; `retro-` labels are newly assigned organizational mappings only. Every row keeps observation/report/calculation/interpretation distinct as labelled in the source blocks; missing metrics, publication/retrieval clocks and observation coverage remain unknown rather than reconstructed.

| Question / ID | Evidence to locate in this edition and original | Type / scope / contrary evidence and limit |
| --- | --- | --- |
| `BRC versus B0` | Richer-information recovery test; [source edition](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/README.md), exact retained text and section map linked in §8 | Authored synthetic mechanism only; no benchmark/NFL-validity result. |
| `BR / BC` | Route-only and regime-only ablations; [source edition](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/README.md), exact retained text and section map linked in §8 | Shared mask and explicit feature restrictions; no causal attribution from ablations. |
| `h=0` | Null information control; [source edition](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/README.md), exact retained text and section map linked in §8 | All richer pathways must be removed; development tests not final benchmark. |
| `U / Oracle` | Sanity/reference bounds; [source edition](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/README.md), exact retained text and section map linked in §8 | Uniform unlearned; oracle private-truth evaluator-only, not attainable learner evidence. |

Source provider/lineage, metric numerator/denominator, exclusions, personnel, actual observation window, supporting passages, confidence and observability remain attached to the corresponding original blocks. These cards grant no independent-source status or final adjudication.

No separately headed empirical evidence card was supplied in this edition. This does not turn proposed work or coordination into executed evidence.

## 5. Interpretation and assessment

No final synthetic recovery or NFL-validity result. Development conformance and replay are separate from independent substantive design acceptance and authorization. See the edition’s original opening and individual cards for its exact dated assessment; this orientation grants no new verdict.

## 6. Unknowns and revision triggers

#### Validity and the research ladder

1. **Mechanical validity:** the implementation follows its declared rules and
   replays from exact inputs.
2. **Synthetic-world validity:** held-out measurements show what models learn
   under those particular rules, observation limits and parameter populations.
3. **Robustness across invented worlds:** changed generators, missingness and
   policies test dependence on assumptions. This still concerns invented worlds.
4. **Real-football validity:** separately qualified NFL evidence and an
   independently specified external evaluation would be required to establish
   relevance. No such bridge is established here.

Learning the simulator's rules is not evidence that its rules describe the NFL.
An injected route/coverage effect makes this a recovery test, not a discovery of
football laws. More synthetic plays can narrow Monte Carlo uncertainty while
leaving simulator misspecification completely unresolved. Even a simulation
intervention identifies only the authored mechanism unless external evidence
supports transfer.



## 7. Next checkpoint and closeout

#### Workflow and current boundary

This is an ordinary, agent-authored research design in a branch/PR, not an
activated or sealed Research run. The live request covers documenting this track
and identifying its first implementation. The design-only boundaries in the
older issues do not themselves supply execution authority.

Keep author checks, independent review, any empirical result and Joe's eventual
merge decision distinct. Review should bind the exact PR head and test whether
the protocol can fail honestly. No reviewer approval or operator conclusion is
inferred from repository activity. This documentation PR contains no runnable
simulator, generated results or new source admission.

The proposed implementation uses invented identities and parameters only.
Proprietary football data, NFL tracking/route imports, real-player identifiers,
production consumers, model promotion and fantasy actions are outside this
track's initial experiment.


## 8. Sources, review and amendment history

### Format-preparation provenance

- [Original source](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/README.md); [exact captured text](retained/universe-d-charter.md).
- Source record created: `unknown (source describes October 23)`; source record updated: `immutable Git 0e23bcc84378e20033f337384e930e80f420e23f`. These are record clocks, not evidence cutoffs.
- Retrieved: `2026-10-31T19:26:31Z to 2026-10-31T19:26:36Z (retrieval call window; exact per-file clock not retained)`; prepared: `2026-10-31T19:30:11.552299Z`.
- SHA-256 of UTF-8 source body: `a5eff1448cea3b093fdb401632b7110b6c22b2984fc7fc7b07bb7b32921dfd1d`. This authenticates the captured API string only, not original-publication bytes or external source pages.
- [Source/version and section mapping](source-map.json). Organization is retrospective; original question IDs remain unchanged.
- External source links are retained locators, not fresh content verification. No private PDFs, datasets or correspondence were copied.
- Format preparation is separate from research completion, independent review, merge and downstream acceptance.
