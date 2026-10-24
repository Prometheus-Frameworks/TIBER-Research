# Implementation validation receipt

Prepared by Codex on October 23, 2026 (America/Toronto), following Joe's request
to proceed with the smallest implementation. This is author validation, not
independent substantive review, operator merge approval or a completed benchmark.

## Scope and checks

- Node 20.19.0, V8 11.3.244.8-node.26, Linux x64.
- All 13 implementation tests passed, including hand-calculated probabilities,
  finite-difference gradients, null-path removal, feature/label contamination,
  target eligibility, scope/identity joins, route denominators and output-path
  rejection. A forced one-iteration fit correctly reports nonconvergence.
- The default development run generated only seeds 1001/1002, each with 128
  training and 64 development plays in each main/null condition: 512 training
  and 256 development plays in total. All 16 learned model fits converged.
- Two identical-input default development runs produced identical manifests and
  all 58 artifact byte strings/hashes. The manifest excludes destination and time.
- No train/dev/test population for the planned benchmark seeds 101–112 was
  generated. Unit tests of the support rule use hand-authored score rows, not
  observations or fitted predictions from that benchmark.

No held-out benchmark score, calibration claim, recovery success or NFL
external-validity result is asserted.

## Numerical budget amendment and preserved failure

The initial candidate used the design PR's 2,000-iteration cap. Eight fits in
development world 1001 reached it above the maximum-gradient tolerance 0.001.
The runner returned exit code 2 and preserved optimizer_nonconvergence, rather
than accepting a recovery claim.

The implementation proposes a cap of 10,000. The objective, L2 coefficient,
learning rate, gradient tolerance, evidence sets, generator and benchmark seeds
are unchanged. The proposal is recorded explicitly in the protocol diff.

| Condition / world | Model | Maximum gradient at original cap | Iterations to converge after amendment |
| --- | --- | ---: | ---: |
| main / 1001 | B0 | 0.001523262 | 2534 |
| main / 1001 | BR | 0.001797133 | 2699 |
| main / 1001 | BC | 0.001805892 | 2700 |
| main / 1001 | BRC | 0.001693972 | 2612 |
| null / 1001 | B0 | 0.002032935 | 3151 |
| null / 1001 | BR | 0.001431625 | 2493 |
| null / 1001 | BC | 0.001385792 | 2451 |
| null / 1001 | BRC | 0.001297343 | 2332 |

All eight world-1002 fits had already converged within the original cap
(767–1726 iterations); their stopping iterations remain unchanged.
The maximum final gradient across all 16 fits is below 0.001.

All 36 generated input artifacts (common/rich evidence, outcomes, private truth
and profiles) match byte-for-byte before and after the amendment. The adjustment
responds to optimizer diagnostics, not a selected prediction gain, and did not
regenerate a different development sample.

## Exact local capture bindings

The captures below were produced before the implementation commit, from design
parent 0e23bcc84378e20033f337384e930e80f420e23f with the worktree honestly marked
dirty and exact source-file hashes retained in each manifest.

| Capture | SHA-256 |
| --- | --- |
| Initial 2,000-cap config | bbf20e3307570de35117c656c1d78b59624cf347e9d1efc4689ec977921f209f |
| Initial nonconverged manifest | 4a38891d159c684b82a132821c7dc8adba029e2bad2afb0a3281a4d9ca0020e9 |
| Amended pinned config | 027dcb83d75074110a8af2ecff42325605bd9f0625374cffcb7a4e4be684b9de |
| Final development manifest, both replays | ec3774c523397f4a74d631458477087d65113801b33780bb0a0e227589608f3a |

Generated captures are local validation outputs, not checked-in experiment
results or sealed Research records. Reproducing from a later committed checkout
records that new commit/clean state and therefore changes the manifest hash;
within that same checkout, replay bytes must still match. Source and config
hashes, not this prose receipt, bind an eventual accepted result.

## Remaining review boundary

The design and implementation remain candidates. Independent review should
check the structural equations, masks and feature parity, null condition, raw
and projected field allowlists, training-only fitting boundary, objective and
score calculations, and the numerical amendment before a final evaluation.
Nothing here activates a production consumer, admits NFL evidence or approves
a merge. Any eventual recovery result concerns the authored simulator only.
