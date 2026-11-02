## Purpose and relation to existing research

Establish Universe D as an explicitly synthetic football research track alongside [Universe C #29](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/29), including its October 7 architecture synthesis. Reuse the evidence/state/distribution/outcome distinctions, separable views, scoped verification and uncertainty. Related foundations: [OL Context #28](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/28) and [Defensive Unit State #30](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/30).

The inspiration is OpenAI's [indexed, cached offline web environment](https://openai.com/index/securing-our-frontier-model-training-environment/). That is an interaction environment; its description does not establish a validated synthetic football simulator.

## Proposed structure

Keep the initial design and experiment in TIBER-Research. Start with `docs/universe-d/`, this tracking issue and a documentation PR. Defer a dedicated repository until a reusable simulator interface or independent release/maintenance boundary exists.

## Experiment 001

A reduced passing subgame contains three fictional receivers, three defenders, route/block assignments, toy man/zone responsibilities, abstract pressure and a categorical target/no-target outcome. All coefficients and distributions are authored assumptions.

Compare learned target probabilities using receiver identity and a shared eligibility mask (B0) with route/coverage features (BRC); include route-only/regime-only ablations, an evaluator-only oracle and a null generator that removes every information pathway. Predeclare independent world/split seeds, held-out log loss, paired uncertainty, sample counts, denominators, leakage checks and honest failure outcomes.

The prediction phase is assignments-known/before-target, not an NFL pregame forecast. A model learning this generator's rules does not establish that those rules describe football. Synthetic observations remain in their own namespace and cannot fill missing NFL fields or enter production consumers.

## Status and smallest next slice

Prepared by Codex on October 23, 2026 (America/Toronto), following Joe's live request to document this track and identify its first reproducible implementation. This is a research-design candidate, not an activated/sealed Research run. No simulator or empirical result is claimed. Independent review remains pending; repository activity is not operator approval.

The next implementation is an isolated Node 20 runner using standard-library modules: keyed generator, restricted feature projections, conditional-softmax baselines, main/null evaluation and reproducibility/invariant tests. [Draft PR #51](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/51) contains the full protocol and implementation handoff at head `0e23bcc84378e20033f337384e930e80f420e23f`.

Design files: [track charter](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/README.md), [experiment protocol](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/experiment-001.md), [smallest implementation](https://github.com/Prometheus-Frameworks/TIBER-Research/blob/0e23bcc84378e20033f337384e930e80f420e23f/docs/universe-d/IMPLEMENTATION.md).

No proprietary data, real-player mapping, provider, production consumer, model promotion, automatic merge, deployment or fantasy action is included.