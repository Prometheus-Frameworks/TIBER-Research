# Reusable research records

Copy or adapt these templates for the particular host and assignment. Use real source locators and timestamps; explicitly mark unknown or unavailable values. The templates are not schemas that certify facts or activate a TIBER Research run.

## Execution record

```text
Author / session or context / start time and timezone:
Skill repository revision / SKILL.md and required references actually read:
Entry mode: automatic selection / explicit skill request / direct file read / unknown
Observed discovery, selection or file-read events / original trace locators:
Unavailable execution evidence / independence or carryover limits:
Original selection-log locator / saved version or digest / time saved:
Original pregame-record locator / saved version or digest:
```

Record only observed events. A self-authored receipt or well-formatted preview does
not prove invocation; a skill listed as enabled does not prove its selection for
this task. Directly reading and applying the files is valid methodology use, but
must not be relabeled automatic selection. Preserve a separately saved original
selection log before the main question-specific retrieval where supported. Mark
missing timestamps or traces unknown; never backfill them from a later probe.
Keep private trace details in a permitted private location when publishing.

## Question-selection log

Complete the original entry after the baseline and **before** collecting the main question-specific evidence. A retrospective log must say it is reconstructed.

```text
Game / season / week / kickoff / home and venue:
Information cutoff, timezone / decision-log timestamp, timezone:
Baseline evidence and latest game covered for each team:

SELECTED — repeat for every question and material linked subquestion
ID / parent or linked IDs:
Question and offense/defense interaction:
Why it matters (consequence / exposure):
Priority (high / medium / low) and reason:
If A, the preview changes by:
If B, the preview changes by:
Evidence that could distinguish A and B / feasibility:
Evidence card ID:

DEFERRED — repeat for each plausible deferred candidate
ID / question / reason deferred:
What would make it consequential or researchable:

DATED SELECTION CHANGE — append if the agenda changes
Timestamp and timezone / affected IDs:
New evidence or limitation / source:
Previous decision and reason / revised decision and reason:
```

At least one meaningful selected interaction must address each offense. Use three to five main questions where supported; linked material subquestions retain their own IDs and cards, even when grouped under one theme.

## Evidence card

```text
ID / linked question IDs:
Question / why it matters:
A and B, with different consequences:
Working explanation / strongest credible alternative:
Evidence that would distinguish them:
Chosen season, games, sample, personnel regime and reason:
Metric definition, numerator, denominator and exclusions:

Observation or attributed report / source URL or inspectable artifact:
Publisher, original provider / publication or update time:
Retrieval time / latest game covered / pre-cutoff availability:
Supporting passage, calculation or scoped film locator:
Contrary evidence, provider disagreement and access failures:
Remaining unknowns:

Current interpretation / competing scenario:
Confidence in observed state / confidence in projected consequence:
What would change the view:
Implications for each team and relevant players:
Specific in-game indicator / broadcast-visible or needs film/charting:
Status: supported / mixed / unresolved / superseded
```

For film, include game, quarter, clock or play identifier, source, viewing angle and sample selection. Repeat claim/source fields as needed. Status and confidence describe evidential support, not probabilities of future results.

For a failed or incomplete source read, retain the exact attempted URL, observed
failure or missing field, attempt time (or known interval, otherwise unknown),
fallback source and the narrower claim it supports. Include the claim operands
or a brief permissible supporting passage for mutable sources; a URL alone does
not preserve the evidence. A later successful read cannot reconstruct the earlier
failure or prove the earlier page contents.

## Reader-facing preview

```text
[AWAY] at [HOME] — season / week / date / kickoff and venue
Information cutoff and timezone / purpose and scoring assumptions

1. Matchup in brief: interpretation and conditions.
2. Current state: both teams' personnel, offenses, defenses, roles, environment,
   evidence coverage and recent changes.
3. Three to five main questions: why selected, evidence, interaction, credible
   alternative, uncertainty and what would change the view. Include linked but
   distinct subquestions with separate evidence requirements and cover both offenses.
4. How the game could develop: leading scenario and credible alternative; material
   availability or environment branches when supported.
5. Player and fantasy implications when requested: team volume, participation,
   opportunity share, efficiency, scoring access and relevant assumptions.
6. Three things to watch: observable indicators; distinguish broadcast from film.
7. Evidence and open questions: source links, windows, definitions, missingness,
   deferred candidates, access failures and independent-review status.
```

Keep the full selection log and evidence cards in the preserved record. A concise reader-facing summary does not replace them.

## Original and amendments

Create a new original record in a user-authorized durable destination. Include game identity, evidence cutoff and timezone, the preview, original question-selection log, separate cards, sources, limitations and unresolved questions. Example names in a **private permitted destination**:

```text
2026-w08-bal-at-buf-pregame-20261031T102640-0400.md
2026-w08-bal-at-buf-amendment-20261101T113000-0500.md
```

Names are examples, not instructions to create a public repository issue or directory. Avoid collisions by using a unique timestamp or identifier; use create-only semantics for the original. Where supported, retain its stable locator, version and byte digest. Never claim a digest, immutability or successful save that was not actually established.

Create each amendment as a separate dated record linked to the original and, where applicable, earlier amendments. Record the new evidence and source time, amendment time and timezone, affected question/card IDs, previous view, revised view or unchanged conclusion, and remaining uncertainty. Preserve the original pregame content and cutoff. Later evidence does not retroactively enter the original sample. If no authorized durable destination is available, report that limitation and provide the complete record for the user to retain.
