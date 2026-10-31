# Shared research article format — v0 candidate

Joe requested a consistent format for research postings and preparation of the
existing articles on October 31, 2026. This document proposes the shared publishing
shape. It remains a draft in PR #74 pending review/merge; using it for a bounded
preparation task does not activate the governed Research runtime.

Use [the full article template](templates/article.md) for new articles and
[the dated update template](templates/update.md) for follow-up findings. Matchup,
player, team, comparative, experiment and external-reading studies share the same
outer sections; retain their necessary question-level evidence inside that shape.
Administrative coordination and code-review comments are not research articles.

## Shared shape

1. Summary.
2. Question and scope.
3. Baseline and alternatives.
4. Evidence by question.
5. Interpretation and assessment.
6. Unknowns and revision triggers.
7. Next checkpoint and closeout.
8. Sources, review and amendment history.

Every section appears in a full article. If genuinely inapplicable, say why rather
than invent content. A conceptual design can have no empirical findings; a future
test can remain a proposal; an unresolved question can stay unresolved. Concision
comes from short answers and linked evidence, not omission of provenance or gaps.

The record header names a format version, stable record ID, type, subject, window,
evidence cutoff, observation coverage, authoring time, origin, research state,
review state, owner and original record. These are readable publishing conventions,
not a new validated source-admission schema. Unknown values remain unknown/null.
For a game study, link its [game manifest](../game-studies/README.md) rather than
maintaining a second mutable game-state register in the article header.

Keep three dimensions separate:

| Dimension | Question it answers |
| --- | --- |
| Format preparation | Has a faithful copy been organized into the shared shape? |
| Research/evidence state | What has been investigated, assessed or left unresolved? |
| Review and permitted use | Who reviewed which revision, and what external acceptance actually exists? |

A formatting pass changes only the first dimension. It cannot complete a study,
refresh its football evidence, create independent review or grant downstream use.
Preserve any genuine existing external acceptance receipt as a source fact; this
new formatting record itself grants no authority.

## Preserve study-specific depth

- Matchup previews retain the separate selection log, all selected/deferred IDs,
  separate evidence cards, both offenses and competing game scenarios. The existing
  matchup skill's methodology still applies. These headings wrap its content;
  they do not replace that method or prove runtime skill invocation.
- Player/team studies retain original games, windows, hypotheses and endpoints.
  A rolling study does not become a one-game case because we standardized its form.
- Experiments retain design versus execution, synthetic versus observed data,
  exact reviewed artifacts and actual results/limits. No invented terminal seal.
- External-reading and conceptual records retain their sources and proposed tests;
  empirical football fields can be explicitly inapplicable.
- Short substantive updates use the common dated-update variant, referencing
  original IDs and cutoffs. A final closeout uses the full outer shape and the
  [closeout requirements](../game-studies/templates/closeout.md) where applicable.

## Existing-article preparation

[preparation-queue.json](preparation-queue.json) inventories every non-PR issue
returned by the October 31 all-state repository census through #75: **53 records**.
This is a triage universe, not a claim that all 53 are articles. Dot must read each
full issue, all comments and relevant linked article files/PR notebooks before
assigning a final preparation disposition. Engineering or coordination exclusions
need a reason. New issues after this census are not silently added to this batch.
Linked article candidates are recorded with their actual publication/review state.

The inventory's body digests bind the strings returned by that census; original
publication bytes were not recovered, and complete bodies are not retained in this
inventory. Re-read before preparing each item; if it changed, record the new source
capture explicitly. Do not treat a digest without retained bytes as a replayable
source archive or infer evidence readiness from GitHub's open/closed state.

Preparation rules:

1. Preserve original issue bodies, comments, cutoffs, decisions and earlier claims.
   Create a new clearly dated format-preparation copy with stable origin links.
2. Preserve original question IDs. If none exist, label any new mapping as a
   retrospective organizational ID, not an original pregame selection record.
3. Keep observations, attributed reports, calculations, agent interpretation and
   the operator's actual assertions separate. An exploratory question is not a
   belief Joe asserted. Preserve dissent and conflicting source definitions.
4. Map existing material into the sections. Mark missing evidence, clocks, owner,
   next checkpoint or endpoint unknown; do not fill them with new assumptions.
5. Do not turn this formatting task into new football research. Flag needed work
   and preserve its existing owner/cadence. No monitor transfer is implied.
6. Use isolated documentation branches and draft PRs with explicit source/version
   mappings. Keep public-safe material public; do not pull private linked datasets,
   correspondence or credentials into a public preparation copy.
7. Verify source-to-copy fidelity and links, read back writes, and record prepared,
   not-an-article or blocked dispositions. Formatting acceptance and independent
   research review are different checks. No automatic merge or issue closure.

Suggested first batch: #73, #75 and #69, as three upcoming-game records. #71's
active closeout pilot remains Codex-owned; Dot can record a link and format needs
without editing the pilot's files or duplicating its scheduled assessment.

## Downstream and growth

Stable record IDs, origin locators, declared windows and question mappings allow
later readers to locate statements and their limits. A receiving system still
needs its own explicit contract and acceptance decision. Markdown/YAML layout is
not an authorized machine-ingestion interface. No parser, automatic migration,
database or claim promotion is introduced by this document.

The task handoff is prepared separately. Execution is not active until Dot
acknowledges the assignment and reports the actual branch/checkpoint. Existing
owners and scheduled research remain in place; this preparation brief does not
silently give Dot continuing ownership of all research investigations.
