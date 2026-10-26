# Kicker / DST: published inputs and run instructions

This is the cleaned public edition of our October 26 Week 8 input-readiness
packet, published at the operator's request. Research anchor:
[#25](https://github.com/Prometheus-Frameworks/TIBER-Research/issues/25).
Prototype: [PR #58](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/58).
Preparation record: [Ops #96](https://github.com/Prometheus-Frameworks/TIBER-Ops/issues/96).

**We can run the fictional policy demo and replay the real-input checks today.
A real Week 8 policy run is not yet implemented or activated.** No predictions
or picks have been frozen, and no streaming edge has been established.

## Download and inspect

- [Download the public input packet](week08-input-readiness.zip?raw=true)

The archive contains:

- `public-inputs/readiness.json`: captured inputs and remaining gaps
- `public-inputs/scoring-profile.json`: actual captured league rules
- `public-inputs/validation.json`: offline validation results
- `public-inputs/MANIFEST.json`: every published input file hash
- `public-inputs/PUBLICATION.json`: publication transformations
- `prototype/`: the runnable fictional policy demo and tests
- `verify_publication.py`: input integrity and content-exclusion checks

The public edition contains K/DST scoring and ownership observations approved
for publication. League-member/account metadata, nicknames, unrelated roster
positions, publisher articles/recaps, media and unrelated response fields are
omitted. The private original remains distinct. These files are not byte-identical
to that original archive.

Every source excerpt has a new `published_excerpt_sha256`. Original HTTP-response
hashes are retained as locators in separate fields; the full original HTTP bytes
are not in this public edition. Offline validation checks the published excerpts
and extraction reproducibility. It does not authenticate unavailable original
HTTP bytes or establish source rights/admission.

## 1. Run the existing policy demo

Requires Node.js 20 or newer and Git. No npm install, API key or paid model is
required for these standalone commands. The prototype is on PR #58's branch,
so checking out default `main` alone may not contain it.

```bash
git clone https://github.com/Prometheus-Frameworks/TIBER-Research.git
cd TIBER-Research
git fetch origin codex/25-kicker-dst-policy-prototype
git switch --detach FETCH_HEAD
node --test tools/kicker-dst-streaming-v0/policy.test.mjs
node tools/kicker-dst-streaming-v0/policy.mjs --demo
```

The tests exercise 17 policy/contract cases. The demo outputs separate kicker
and DST ranks from fictional examples, plus baseline choices and evidence gaps.
Its rank scores are uncalibrated ordinal values, not expected fantasy points,
win probabilities or confidence levels. It deliberately rejects real-data input.
Do not set `synthetic: true` on real observations or remove the guard to force a
Week 8 result.

Record the checked-out commit with `git rev-parse HEAD` when sharing results.
The branch can advance; reproducible review should bind the exact commit used.

## 2. Replay the real-input checks

Requires Python 3.10 or newer; only the standard library is used. From the
checked-out repository root:

```bash
python3 -m zipfile -e docs/preparation/kicker-dst-streaming-2026-10-26/week08-input-readiness.zip ../tiber-kdst-week08-replay
python3 ../tiber-kdst-week08-replay/public-inputs/validate_inputs.py
python3 ../tiber-kdst-week08-replay/verify_publication.py
```

On Windows, `py -3 validate_inputs.py` is an alternative when the Python launcher
is installed. For a ZIP download, extract it, enter its `public-inputs` directory,
then run the same validation command. The archive also contains this README and
the policy demo files under `prototype/`, runnable with
`node --test prototype/policy.test.mjs` and `node prototype/policy.mjs --demo`
from the archive root.

Expected audit totals: **41 source excerpts, 32 completed-game responses, 64
team-game rows and 36 rows in nine four-game lookbacks, with zero errors**.
The audit checks hashes, source extraction replay, completed-game identities,
required numeric fields, capture-before-proposed-cutoff clocks and reconciliation
of credited defensive sacks with opponent sacks suffered. Same-provider
reconciliation is not independent corroboration or a fantasy-scoring test.

This command reads retained files without acquiring new data. It may rewrite
`validation.json` with the deterministic result. The original network capture
and mutable assembly entry points are omitted so replay cannot silently replace
the frozen observations with later versions.

## 3. What is needed for an actual football model run

These are outstanding implementation/evidence requirements, not commands that
already exist. We have not implemented a supported real-data run command.

1. **Independent prototype review.** Bind review to the exact policy head and
   resolve substantive findings; passing fixture tests establishes arithmetic
   and contract behavior, not football validity.
2. **Complete the original consideration pool.** The snapshot retains 19 DST
   consideration entries including our incumbent, and 26 kicker-directory entries
   before bye/inactive/job qualification. Only three DST and four kicker cases
   have sample feature histories. Preserve the full pool and missingness. The
   sample cannot quietly replace it or yield an apparent full-pool ranking.
3. **Qualify identity, job and acquisition state.** Directory `active` is not
   proof of the kicking job: multiple entries can be active on one team.
   Observed depth charts include undated/older updates. Unrostered does not prove
   claim eligibility, lock state, processing time or successful acquisition.
   Bind each candidate to its real scheduled game and common decision cutoff.
4. **Implement and review the real-source adapter.** Bind exact source excerpts,
   hashes/revisions, identities, counts, observation/availability witnesses and
   source-purpose qualification to Research's existing contracts. Exact event-end
   clocks are absent: retain the distinct observed-final witness rather than
   inventing an ending time from kickoff or retrieval. Keep feature inputs and
   outcome evidence separate. The synthetic-only engine must not be bypassed.
5. **Finish scoring and baseline outcomes.** The captured league gives 3 points
   for 40–49-yard FGs, 5 for 50+ and 1 for made PATs, with observed miss penalties
   zero. It also has forced-fumble/special-teams coefficients that differ from
   the study example. Validate distance/event attribution, DST points-allowed
   treatment and overlapping categories before reconstructing recent fantasy
   points or target outcomes. A matching profile ID is not a scoring audit.
6. **Freeze a bounded prospective job and choices before outcomes.** Bind the
   scoring profile, full eligible pool, exact input versions, candidate policy,
   simple baselines, cutoff, output path and review/activation under the existing
   Research lifecycle. Hash the selections before joining the independently
   supported results. Report both positions separately, including abstentions
   and failures. A Week 8 exploratory result cannot establish a general edge.

The candidate DST policy combines opponent prior-four-game passing attempts,
opponent sacks suffered and defense credited sacks. The kicker policy combines
team FG/PAT attempts. Both use equally weighted within-pool percentile ranks.
Weather, QB/line injuries, markets, probabilities and next-week stash value are
separate unimplemented extensions with their own evidence requirements.

## Proposed cutoffs, not scheduled tasks

| Study checkpoint | Toronto local time | UTC |
| --- | --- | --- |
| Waiver policy | Tuesday October 27, 8:00 p.m. EDT | October 28, 00:00Z |
| Thursday refresh | Thursday October 29, noon EDT | October 29, 16:00Z |
| Sunday refresh | Sunday November 1, noon EST | November 1, 17:00Z |

The daylight-saving change is intentional. These are study proposals, not a
claim about the league's actual waiver deadline and not a monitor or scheduled
execution. Tuesday and Sunday cannot use the same later information in a
supposed Tuesday replay. Refresh stale ownership/job/lock information before a
future declared freeze, and preserve this October 26 snapshot as its own version.

## Publication and validation scope

The operator explicitly requested publication of the private download and run
requirements. Codex prepared this cleaned edition; this statement is an audit
record, not cryptographic human-origin proof. Publication does not grant source
admission, activate a Research study, merge code, deploy a ranking or authorize
roster changes. The existing #25 study and the source/field gaps remain in force.
