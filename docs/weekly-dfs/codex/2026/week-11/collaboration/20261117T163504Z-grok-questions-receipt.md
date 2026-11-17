<!-- 2026-w11-r1-grok-questions -->
# grok_questions_ready — 2026-week-11, round 1

**Author / posted by:** Grok Bot, through the operator's connected GitHub account. Runtime/model: not recorded beyond "Grok Bot". This is a question pass. It does not select a lineup, endorse a lineup, or freeze anything. Hypothetical research only: no contest entry, transactions or provider dispatch. Neither draft was changed.
**Completed:** 2026-11-17 ~14:40Z / 09:40 Toronto (EST, UTC-5). **Evidence cutoff:** 2026-11-17 14:36Z / 09:36 Toronto (last web retrieval).
**Practice reports:** none exist yet. It is Tuesday, and for Sunday games the first official Week 11 reports arrive Wednesday Nov 18. Every availability statement below is reporting or a team quote. None is a practice or game designation.
**Duplicate/freeze check, just before posting:** PR #144 has no Week 11 Grok comment and no Week 11 freeze. Both drafts say `frozen: false`. No commits landed in the repo after Claude's bd01626c.

## Exact inputs read
1. **Codex v1**, `docs/weekly-dfs/codex/2026/week-11/daily/2026-11-17.json` and `.md` @ commit `078ea5e002f3eeb5fe15197fdd562b3f4f5d6906` (blobs `d8c3c94327b7eb0f2a7c42684ea13e760a0d5612` and `e04a6d7ceea87c158bc027dc84c0af1f303fedb5`). The bytes are unchanged at PR #144 head `b38f1e69c73cd8ed2e84cf96ba5a6e5abcba53d8`. **$49,900 / $100 left.** recorded_at 2026-11-17T11:49:43Z.
2. **Claude v1**, `docs/weekly-dfs/codex/2026/week-11/collaboration/20261117T140000Z-claude-v1.json` and `.md` @ commit `bd01626c3ab7005c37d996a965675e87c5226bdf` on branch `claude/brave-maxwell-pph5nq`, not on the PR #144 head (blobs `4b530f911a92a888b85d9277cf173203a1814535` and `08fa5d39e214fb114b6dfd25ad297cccbdc4be35`). **$49,500 / $500 left.**
3. **Claude's actual completion post:** PR #43 comment [6950189950](https://github.com/Prometheus-Frameworks/TIBER-Research/pull/43#issuecomment-6950189950), created 2026-11-17T13:59:42Z.

**Context also read:**
- Common inputs `20261117T114943Z-common-inputs.json` @ `078ea5e0` (blob `04a169e45c1883b231145f76d68b588279486ab8`), 16 rows.
- Codex v1-ready receipt @ `ed581e4a` (blob `b5657c34541c9bbb74d8d51c52a50eee99844d8e`).
- Codex journal `docs/weekly-dfs/codex/journal/20261117T115214Z.md` @ `ed581e4a` (blob `d9cafff5ca5fd5f5d787994ba31e5c935280c253`).
- PR #43 comment 6947294705 (codex_v1_ready).

**Not opened:** `site-feed.json`, `daily/2026-11-16.*`, the official DraftKings export and IDs, and Covers (Claude's line source was not re-opened).

**What the exchange already resolved:** nothing beyond the two originals. No Claude or Codex response to either draft exists yet. Several questions below press on triggers the authors already wrote (Codex: Walker/Ott, Freiermuth. Claude: Tate/Robinson, Pickens, PHI QB). In those cases I add evidence and a resolution test rather than restating the trigger.

---

## Questions (ranked by possible lineup consequence)

### G-W11-Q1: Do the Week 10 roles behind Claude's five-player TEN@DAL stack survive a different script and Tennessee's returning receivers?
- **Claim/version:** Claude v1 @ bd01626c. Five of nine come from TEN@DAL: Prescott, Pickens, Flournoy, Pollard and Ayomanor, **$29,000, 58% of the cap**. The bring-back rests on "Pollard receiving role (8/9 tgt) and Ayomanor (10 tgt) with Tate and Robinson hurt."
- **Evidence gap:**
  - **Pollard:** 9 targets and only 9 carries in Week 10. CBS's season column shows 22 receptions and 142 carries through Week 10, so 8 of his 22 catches came in that one game. A receiving role on the scale Claude assumes appears once in the season.
  - **Ayomanor:** his season line is 18 receptions; 5 came in Week 10.
  - **Tate:** he did not get hurt in Week 10. He was already out, with no practice all week (shoulder). On Monday, Saleh said he was "hopeful" Tate returns against Dallas (E4).
  - **Robinson:** he played Week 10 (4 targets, 3-10), hurt his ankle, and is "being evaluated" (E5).
  - **Flournoy:** in the SF gamebook he had **1 first-half target and 6 after halftime**, while Dallas trailed 31-19 and then 38-19 (E1). His 7 targets came from a trailing script, the opposite of a DAL −8.5/−9.5 script.
- **Possible lineup consequence:** if Tate returns at a normal workload, Claude's own trigger fires (Ayomanor → Dike $3,500, or drop the TEN WR leg). If Pollard's targets regress to his season rate, the bring-back value goes. Flournoy is the slot most exposed to the favored script Claude expects.
- **Resolving observation:**
  - Titans Wed–Fri participation for Tate and Robinson, and Friday designations.
  - Dallas's first-half target split in games it led this season.
  - Pollard's targets per game before Week 10, from team game logs. This is not yet inspected; the CBS season column shows receptions only.

### G-W11-Q2: Shared Prescott/Pickens/Cook. Is either draft paying for Week 10 efficiency or trailing-script volume?
- **Claim/version:** both drafts start Prescott $6,700, Pickens $6,800 and Cook $7,900. Codex states it does "not forecast that volume or TD efficiency again." Claude's thesis cites the 51 attempts and 5 TD directly.
- **Observations:**
  - **Prescott:** 17 attempts in the first half and 34 after it (E1).
  - **Pickens:** his role looks durable rather than script-made: 10 targets in the first half, 74 of 83 snaps (89%), routes on 51 of 54 dropbacks (94%), and a 37% target share (E1, E7). His three touchdowns are the efficiency.
  - **Dallas season context:** Prescott has 2,724 yards and 21 TD through 10 games, about 272 and 2.1 per game (E6). SI notes Dallas has trailed often.
  - **Cook:** 157 rushing yards, but 74 came on one fourth-quarter TD run, so the other 17 carries made 83 yards. He had one target (E8). Buffalo is a −16.5 home favorite (Claude's Covers line), which raises the chance of a light fourth quarter.
- **Evidence gap:**
  - How many attempts Prescott throws in games Dallas leads. I did not inspect this split.
  - Cook's carry share in the second half of Buffalo blowouts.
- **Possible lineup consequence:**
  - The three shared players cost $21,400. If Prescott's volume depends on script, Claude's three-man Dallas pass stack is more exposed than Codex's two-man pair.
  - Neither draft has a run-game hedge. Javonte Williams is $7,300 and had 16 carries in Week 10.
  - Cook's floor without a receiving role is a 2026 question both drafts share.
- **Resolving observation:** Prescott's attempts in Dallas wins this season, and Cook's 4th-quarter snaps or carries in Buffalo's wins by 14 or more.

### G-W11-Q3: Johnson vs Pollard. Does any current evidence beat "Walker expected back"?
- **Claim/version:**
  - Codex v1 holds Emmett Johnson ($6,000, +$1,300) conditionally, on "Walker/Ott Week 11 availability unresolved."
  - Claude v1 declines Johnson because "Week 10 reports expect Walker back." Claude cites that from search snippets only.
- **Newly sourced evidence:**
  - Rapoport via RotoWire/CBS, Nov 15 11:21 ET: Walker is expected to "be able to go" against Arizona, and his absence was "more precautionary than anything else" (E2).
  - Schefter via Chiefs Wire, Nov 16 21:46 CT: KC intended only "to shut him down for a week" for a "short-term injury" (E3).
  - Yahoo, Nov 16 18:31Z: "he should be back Week 11" (E9).
  - These upgrade Claude's premise from snippet to attributed reporting. **They are not established availability.** Walker is still priced at $9,000 (E10). Ott's status is unknown: an aggregator snippet lists him questionable with a hamstring, which I did not verify.
- **Evidence gap:** Walker's Wednesday through Friday participation. Last week the groin first appeared Thursday and Friday.
- **Possible lineup consequence:**
  - **For Codex:** if Walker practices fully by Thursday, Codex's own trigger fires. A $6,000 backup in a −16.5 game has only a garbage-time path, which Yahoo notes.
  - **Funded RB swaps at or under $6,100:** Barkley $6,100, Breece Hall $5,900, Skattebo $5,800, Ollie Gordon $5,600 (prices only; roles not inspected). Johnson → Pollard costs $50,400, over the cap by $400.
  - **For Claude:** Q3 does not support Pollard. Claude's reason for declining Johnson is now better sourced, but Pollard's case stands or falls on Q1.
- **Resolving observation:**
  - KC's Wednesday through Friday report.
  - KC inactives at about 16:30Z on Nov 22, which is **before** the 17:30Z freeze. Last week's freeze record already corrected this ordering.

### G-W11-Q4: Thin receiving slots. Are funded alternatives being declined for evidence or for convenience?
- **Claim/version:** Codex has Freiermuth (FLEX, $3,900) and LaPorta (TE, $4,400). Claude has Kincaid (TE, $4,800) and Meyers (FLEX, $4,500).
- **Observations (Week 10 targets, then season receptions/yards/TD from the CBS season column):**

  | Player | Week 10 targets | Season rec / yds / TD |
  |---|---|---|
  | Freiermuth | 3 | 27 / 270 / 5 (touchdown-heavy) |
  | LaPorta | 4 (1-16) | not checked (per Codex's NE–DET gamebook) |
  | Kincaid | 3 (one 54-yard catch) | 32 / 487 / 2 |
  | Meyers | 6 (3-34) | 29 / 408 / 2 |
  | Parker Washington | 9 (7-152-1), led JAX | $6,700 |
  | Helm | 4 (4-23) | 21 / 183 / 0 |

  Ferguson ($3,600) was **Not Active** in Week 10 per the SF–DAL gamebook (E1). He did not practice Nov 11 with a knee injury (E11).
- **Salary-legal alternatives I checked** (prices at E10 14:32Z; roles not certified):
  - **Codex:**
    - Freiermuth → Helm saves $600. Adding Dallas DST → Pittsburgh DST gives **$49,700**, legal.
    - Freiermuth → Ferguson plus the same DST change comes to exactly $50,000, but Ferguson's availability is unproven.
    - LaPorta → Kincaid is $300 over the cap, as Codex already found.
  - **Claude:**
    - Kincaid → LaPorta comes to $49,100. Kincaid → Loveland comes to $49,800 (Burden's concussion could matter, E9).
    - Claude's "Pickens → Lamb" trigger is fundable as Pickens → Lamb plus Kincaid → Helm, exactly $50,000.
    - **Flournoy → Lamb** (the Week 10 role Claude passed over) **is not fundable by changing only TE and FLEX.** Kincaid → Helm plus Meyers → Dike still totals $50,500. It would need a third downgrade, an RB or the DST.
- **Possible lineup consequence:** these are the cheapest slots to fix. Codex's weakest role can be changed without touching its core. Claude's Lamb fallback is cap-constrained in a way its trigger table does not state.
- **Resolving observation:** a target-per-route or target-share comparison for Freiermuth, Helm, Kincaid, Meyers and LaPorta from qualified data, plus Ferguson's Wednesday and Thursday participation.

### G-W11-Q5: Defenses. Is Dallas DST more than salary relief, and is Claude's Philadelphia QB premise actually established?
- **Dallas DST** (Codex v1, $2,900):
  - Dallas allowed 46 points in Week 10, but sacked Purdy **5 times** in that game (E1).
  - SI reports Dallas allows 28.2 points per game and that Tennessee has scored 23 or more in each of its last four games (E6).
  - At SI's 54.5 total and DAL −8.5, Tennessee's implied total is about 23.
  - SI lists DaRon Bland "Out", but that is an unofficial pre-report listing, so I am not counting it.
  - The case is mostly win probability plus price, and it correlates positively with Codex's Dak/Pickens pair.
  - **Consequence:** the Pittsburgh DST package in Q4 is a legal alternative. KC DST ($4,000, against ARI at −16.5) is not affordable for Codex without a further $1,000.
- **Claude's PHI premise** (Pittsburgh DST, $3,300). **Verified, with one correction to its basis:**
  - Hurts is on IR, placed Oct 17 per the team site (E12), and is expected to miss the season (E13).
  - There was no QB move at the deadline, and no named starter as of the morning of Monday Nov 16 (E13, E14). Claude had relied on snippets; I read both pages in full.
  - Milton started the last game, a 19-11 loss to the Giants on Nov 8, and was **sacked 7 times**. McKee was sacked 10 times in his three starts (E13).
  - DeVonta Smith (hamstring) is on Yahoo's Week 11 list (E9).
- **Contrary or unsettled:**
  - Pittsburgh lost 38-18 at Cincinnati.
  - A search-engine summary told me "McKee will start Nov 22," but it was built on an **Oct 19** SteelersNow article (E15). An aggregator depth chart lists Milton as QB1. Neither is a team announcement.
- **Possible lineup consequence:** Claude's trigger, "PHI names a veteran", is unlikely to fire from the current roster. The real swing is Milton vs McKee and whether Smith and Wicks return.
- **Resolving observation:** a Sirianni announcement or Wednesday practice reps. For Dallas, Tennessee's Week 11 offensive availability (Q1) and the official DAL injury report.

### G-W11-Q6: Source integrity. Points to retain, not silently correct.
1. **Decision clock.** Claude's JSON and MD state `decision_at_utc` 2026-11-17T14:00:00Z. Commit bd01626c is authored and committed at **13:59:28Z**, and the completion post was created at **13:59:42Z**. The stated decision time is later than both artifacts. Keep 14:00Z as Claude's stated clock and note the 32 s and 18 s discrepancies. The artifacts prove completion no later than 13:59:28Z.
2. **Curated-row exposure is understated by one.** Claude's JSON sets `salary_in_manifest_curated_rows: false` for **James Cook III**, and the MD says "three of the nine (Prescott, Pickens, Kincaid)." Cook III at $7,900 is row 7 of the 16 manifest rows. **Four** of Claude's nine are in the curated rows, and Cook is also a Codex pick. Prescott, Pickens and Cook are the three players both drafts share.
3. **Salaries.** All nine prices in each draft match my FantasyPros re-retrieval at 14:32:48Z (E10), including Claude's six prices that are not in the manifest. Codex's stated cap arithmetic all checks out: Lamb for Pickens $51,900, Mahomes for Dak −$200, LaPorta → Kincaid +$300 over, Dallas $16,400, KC $12,100. The table lists players on IR (Roman Wilson $3,900, Lamar Jackson, Tyler Huntley; E9), so **a reported price is not evidence of availability.** That supports Codex's rejection of Wilson more strongly than the gamebook reason it gave. The official DraftKings pool and IDs are still unverified.
4. **Lines.** Claude used Covers at 53.5 / DAL −9.5 (Nov 16 21:41 ET). SI showed **54.5 / DAL −8.5** at about 14:33Z, with no absolute publish time ("37 seconds ago"). That is one book, and its change is small. Claude's "total below ~50" trigger is not close to firing.
5. **Branch.** Claude's v1 is not on PR #144's head. The final editor should bind it by the SHA above.

---

## Opinions (mine; not evidence)
- Q1 matters most because it moves the most salary: $29,000 depends on one game's role distribution, and two of the five roles are each one game old.
- Codex's weakest point is Johnson at $6,000. Current reporting on Walker cuts against him, and the first real test comes Wednesday.
- Claude's Pittsburgh DST premise is better supported than its sources showed. Codex's Dallas DST is mostly a salary choice.
- I am not proposing a third lineup. The swaps above are cap checks, not recommendations.

## Newly sourced evidence (retrieved 2026-11-17, 14:28–14:36Z unless noted)
- **E1:** NFL official gamebook, SF@DAL, Nov 15 ([PDF](https://static.www.nfl.com/image/upload/v1794829724/gamecenter/ab78a748-4feb-11f1-abca-2c54536568a9.pdf)). Full text read with pdftotext. It covers the scoring timeline, first-half statistics, the not-active list (Ferguson, Mingo, Locke) and five DAL sacks. No publication time is shown.
- **E2:** [RotoWire via CBS, "Kenneth Walker: Expected back in Week 11"](https://www.cbssports.com/fantasy/football/news/chiefs-kenneth-walker-expected-back-in-week-11/), Nov 15 11:21 ET. Search highlight only.
- **E3:** [Chiefs Wire, Walker update](https://chiefswire.usatoday.com/story/sports/nfl/chiefs/2026/11/16/kenneth-walker-injury-good-news-positive-update-kansas-city-chiefs-nfl-week-11/92820694007/), Nov 16 21:46 CT. Page fetched.
- **E4:** [RotoWire via CBS, "Carnell Tate: Expected back for Week 11"](https://www.cbssports.com/fantasy/football/news/titans-carnell-tate-expected-back-for-week-11/), Nov 16 9:23 ET. Search highlight only.
- **E5:** CBS box score, [JAC@TEN](https://www.cbssports.com/nfl/gametracker/boxscore/NFL_20261115_JAC@TEN/), HTML fetched with curl. It gives Pollard, Ayomanor, Robinson, Helm, Dike, Meyers and P. Washington lines plus season columns, and the AP recap notes Tate was scratched and Robinson hurt his ankle. A Fully Guaranteed piece (Nov 17) says the same; search highlight only.
- **E6:** [SI, Titans vs. Cowboys odds/prediction](https://www.si.com/betting/titans-vs-cowboys-prediction-odds-spread-injuries-trends-for-nfl-week-11-2026). Fetched about 14:33Z; it shows only "published 37 seconds ago". Its injury lists predate official reports.
- **E7:** [DraftSharks, Pickens Week 10](https://www.draftsharks.com/fantasy-football-news/84257/george-pickens-goes-nuclear-in-his-return-with-11-catches) (snaps, routes, target share), search highlight only. Also [Dallas Sports Journal](https://dallassportsjournal.com/george-pickens-taunting-ceedee-lamb-brian-schottenheimer-49ers/), Nov 16 6:07 pm CST, for halves and the hamstring timeline.
- **E8:** CBS box score, [BUF@NYJ](https://www.cbssports.com/nfl/gametracker/boxscore/NFL_20261115_BUF@NYJ/), HTML fetched, including its play-by-play and AP recap.
- **E9:** [Yahoo, NFL injury report Week 11](https://sports.yahoo.com/fantasy/article/nfl-injury-report-week-11-latest-news-updates-for-drake-maye-kenneth-walker-iii-brock-bowers-more-players-for-fantasy-football-183145114.html), Nov 16 18:31Z. Page fetched.
- **E10:** [FantasyPros DK salary changes, Week 11](https://www.fantasypros.com/daily-fantasy/nfl/draftkings-salary-changes.php), full HTML at 14:32:48Z. No publication time shown.
- **E11:** [DallasCowboys.com November updates](https://www.dallascowboys.com/news/updates-november-2026), search highlight only. Nov 11 practice: Ferguson (knee) did not practice.
- **E12:** [PhiladelphiaEagles.com, Hurts to IR](https://www.philadelphiaeagles.com/news/eagles-place-jalen-hurts-on-injured-reserve-sign-jaydon-blue-to-the-active-roster-2026-nfl-week-6-panthers), Oct 17. Search highlight only.
- **E13:** [Northeast Times, Eagles QB plan](https://northeasttimes.com/?p=166359), Nov 11. Page fetched in full; this is the article Claude cited from snippets.
- **E14:** [Northeast Times, "Eagles bye is over"](https://northeasttimes.com/2026/11/16/eagles-steelers-week-opens-bye-over-nfc-east-standings-november-2026/), Nov 16. Search highlight only.
- **E15:** [SteelersNow](https://steelersnow.com/eagles-will-be-without-jalen-hurts-vs-steelers/), Oct 19, page fetched. It is stale for the Week 11 starter and is recorded here as the source of a misleading summary.

**Screened, not relied on:** an exa.ai injury aggregator (Ott questionable, among others); the whosstarting.com depth chart (Milton QB1); search-engine syntheses. No projections were used. I did not inspect route data beyond E7.

The request named no Grok documentation branch, so nothing was committed. This PR comment is the record, and a matching copy is kept outside the repository. Claude and Codex respond next. The freeze must be archived **before Sun Nov 22, 12:30 p.m. Toronto (17:30Z)**, or before an earlier included kickoff. Missing contributions do not extend it.

