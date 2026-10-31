# Game studies — experimental closeout pilot

This is a manual research notebook workflow for taking an issue through a bounded
observation window, postgame assessment and a reviewed closeout PR. It is not an
activated Research run, a Research seal, source admission or downstream authority.
The existing Research/Ops boundaries continue to apply.

## Find a study

Read [index.json](index.json), then the referenced `study.json`. The registry lists
registered studies only; it is not a complete NFL schedule or coverage claim.
The first entry is [Arizona at Dallas, 2026 Week 8](2026/reg/week-08/ari-at-dal/README.md).

One study represents one game and its selected questions. Multiple player questions
share that game record and underlying evidence; they are not independent games or
independent confirmations. Longer player investigations can link to these records
without copying or silently upgrading their conclusions.

## Identity and storage

- Stable study ID: `nfl-<season>-<reg|post>-w<week>-<away>-<home>`.
- Store at `<season>/<reg|post>/week-<week>/<away>-at-<home>/`.
- Scope question IDs to the study: for example `nfl-2026-reg-w08-ari-dal/Q2a`.
- Preserve provider-native game IDs only when verified. A local study ID is not a
  provider identity mapping. A changed kickoff does not silently rename the study;
  record the schedule amendment. A corrected game identity requires an explicit
  successor and a link to the old record.
- The registry stores locators, not duplicate mutable assessment or review states.
  Discover the study, read its current manifest, then follow its retained records.
- Keep original issue bodies and amendments in separate, create-only `retained/`
  records. Hashes bind the bytes actually captured; they do not prove original
  publication bytes, source reliability or pre-cutoff availability.

## Lifecycle

| Checkpoint | Required result |
| --- | --- |
| Intake | Game, issue, owner, question IDs, observation endpoint, evidence deadline and source limits. |
| Baseline | Preserve the pregame record and cutoff. Later amendments are separately dated and linked. |
| Postgame | Verify this game is final; assess personnel, proposed interactions, opportunity, execution/outcome and question usefulness separately. |
| Closeout candidate | A report and per-question assessments, explicit gaps, follow-up disposition and bounded conclusions. |
| Review and merge decision | Independent substantive review of the exact candidate; repair findings and re-review changed material; Joe decides whether to merge. |
| Downstream proposal | Name particular statements, immutable source revision, destination, intended use, validity conditions and the destination owner's acceptance requirements. |

A time window ending triggers evaluation, not a positive result or an automatic
merge. Pending means not yet assessed. Supported, challenged, mixed and unresolved
are question-level research judgments, not calibrated probabilities. An unresolved
assessment must explain the missing or conflicting evidence; it can form part of a
completed study. Missing observations alone cannot establish that a mechanism
failed. An inactive player can make a mechanism untestable rather than false.

The observation window ends at the verified final whistle, unless postponed or
abandoned. The declared evidence deadline bounds this iteration of analysis.
At that deadline, complete the account with explicit unresolved findings or record
that evidence/access failure blocked closeout. Do not silently extend monitoring.
Later corrections or newly available film get dated successor assessments; the
original pregame view and earlier assessments remain retrievable in Git history
and retained records. Do not retrofit new questions into the original prediction.

Use [the closeout template](templates/closeout.md). Preserve both adverse and
favorable results. Role, exposure, opportunity, efficiency and fantasy production
are distinct. No fantasy scoring is calculated without an explicit format.
Full postings and substantive follow-ups use the proposed
[shared article structure](../research-articles/README.md), with the game manifest
remaining the single structured register for game-study state.

## Merge conditions

1. Game identity, scope, original baseline and dated amendments are traceable.
2. Every selected question is assessed or explicitly unresolved, with evidence and
   uncertainty sufficient to explain that disposition. Deferred questions stay
   deferred unless a separately dated expansion is authorized.
3. Metric definitions, numerators, denominators, sample windows, provider lineage,
   exclusions, access failures and alternatives are inspectable where material.
4. Claims match their evidence. A touchdown, final score or successful scenario
   alone does not validate a mechanism, workflow or reusable predictive edge.
5. The report distinguishes factual observations, attributed reports and
   interpretation, with specific follow-up or closure for remaining questions.
6. Structural checks and independent substantive review pass at the exact proposed
   revision. Author checks and CI are not independent football review.
7. Joe explicitly authorizes merge. Merge accepts the account as reviewed research;
   it grants no source admission, model change or downstream activation.

Close the bounded issue only after its accepted closeout is linked and outstanding
work is explicitly resolved, deferred or moved to linked follow-up issues. Do not
auto-close a broader player study because one game checkpoint finished. Setup PRs
use `Refs #N`, not `Closes #N`.

## Downstream use

All records in this pilot declare `downstream.admission: not_admitted`.
Consumers may discover and display them as attributed research with that status;
they must not silently treat their statements as admitted model inputs or validated
rules. Each future proposal names exact statement IDs and an immutable repository
revision, plus source lineage, evidence window, strongest alternative, applicable
personnel/conditions, missingness, expiry/recheck trigger and permitted use.
The receiving repository/owner must separately assess acceptance. Research does
not issue its own consumer acceptance receipt. Existing Data/source admission and
Ops authority remain separate from editorial research merge.

A single game can support a scoped historical observation. Carrying that finding
into a next-game interpretation requires checking changed conditions. A general
rule requires a suitable evaluation across relevant cases; no universal number of
games or confidence score is established here. Several reports repeating the same
underlying source remain one lineage.

## Scale deliberately

Add one registry entry and manifest per game; use stable question references across
studies. Record an owner, finite checkpoints and a stopping condition. Reuse source
locators and provenance without counting copied research as independent evidence.
Before claiming a full week or season, reconcile a separate schedule inventory
against official fixtures and explicitly mark unstarted, pending and missing
studies. An absent registry row does not mean there was no game.

This pilot creates no all-game scheduler, database, automatic claim promotion or
downstream ingestion. Those need their own bounded design after the pilot exposes
the practical costs and gaps. Scheduled research is limited to the named pilot,
its issue and its documentation branch/PR; it cannot merge or change consumers.

## Structural check

Run `npm run game-studies:check`. It checks the registry, closed manifest shape,
identity/path consistency, retained byte hashes, question/reference integrity,
postgame assessment prerequisites and readiness declarations. Tests exercise the
failure boundaries. The ordinary `npm run check` includes this check.

Passing establishes internal consistency only. It cannot establish source truth,
reviewer independence, external permissions, a completed scheduled run or whether
a finding is suitable for a consumer. An existing external review receipt must be
read and its exact revision verified before any merge decision.
