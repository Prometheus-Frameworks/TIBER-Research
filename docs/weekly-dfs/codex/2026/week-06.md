# 2026 Week 6: Codex hypothetical DFS lineup

| Field | Record |
|---|---|
| Platform / slate | DraftKings NFL Sunday main slate, October 18, 2026 |
| Budget / roster | $50,000; QB, 2 RB, 3 WR, TE, FLEX, DST |
| Selection snapshot | Saturday evening, October 17, 2026; exact original selection second not recorded |
| Author / review | Codex; same-author self-review, not an independent review |
| Status | Pregame notebook; postgame results pending |
| Machine-readable record | [week-06.json](week-06.json) |
| Notebook index | [Codex weekly DFS](../README.md) |

The operator requested a hypothetical lineup, followed by a review and a second
draft. This entry preserves the recommendation made in that conversation. The
selection existed before the operator's 19:17 EDT request to publish it; that
request time is not represented as a more precise selection freeze.

The objective was an appealing overall scoring lineup under the salary cap.
There was no full-pool optimization, contest-specific ownership objective or
claim of mathematical optimality.

## V1: initial draft

| Slot | Player | Team | Opponent | Published salary |
|---|---|---|---|---:|
| QB | Josh Allen | BUF | at LV | $7,500 |
| RB | Kyren Williams | LAR | vs ARI | $6,800 |
| RB | Braelon Allen | NYJ | at NE | $5,700 |
| WR | Puka Nacua | LAR | vs ARI | $8,100 |
| WR | Khalil Shakir | BUF | at LV | $5,300 |
| WR | Germie Bernard | PIT | at TB | $4,000 |
| TE | Dallas Goedert | PHI | vs CAR | $3,900 |
| FLEX | Tyler Allgeier | ARI | at LAR | $4,800 |
| DST | Steelers | PIT | at TB | $3,300 |
| **Total** | | | | **$49,400** |
| **Remaining** | | | | **$600** |

Salary provenance is recorded per player in the JSON: S1/S2 for the primary
Rams/Bills/Giants/Steelers prices, S4 for Braelon/Allgeier, and S5 for Shakir.

The initial construction combined Allen's individual ceiling with a Buffalo
receiver, kept Puka and Kyren, and used lower-priced starters to fit the budget.
That was a judgment-based construction, not an optimizer output.

## Self-review and revisions

| Slot | V1 | V2 | Salary change | Reason |
|---|---|---|---:|---|
| QB | Josh Allen | Matthew Stafford | -$1,100 | Redirect salary toward the receiver position while retaining a quarterback in an attractive scoring environment. |
| WR | Khalil Shakir | Malik Nabers | +$1,200 | Prefer Nabers's recent target concentration over Shakir's projected opportunity at his price. |
| TE | Dallas Goedert | Harold Fannin Jr. | +$200 | A small salary increase buys the preferred option in FTN's quoted comparison. |
| **Net** | | | **+$300** | V2 leaves $300 unused. |

The supporting observations and their limits were:

- S5's October 17, 11:30 a.m. ET model run listed Shakir at 4.8 projected targets
  and 9.3 projected DraftKings points. These are external estimates, not observed
  future volume.
- S1 reported Nabers at a 31.3% target share across his last two games. That is
  recent descriptive evidence from a small sample, not a promise of repetition.
- S3 quoted Fannin at 12.7 projected points and Goedert at 10.2. The comparison
  comes from one provider; it does not establish a universal ranking.
- S1 identified the Rams with the slate's highest implied team total. That is a
  pregame market expectation reported by the source, not an observed game result.

**Codex judgment:** prefer the revised salary distribution and Stafford/Puka
pairing. Allen remains the preferred individual quarterback. Pairing a quarterback
and receiver changes the joint outcome distribution; it does not add free
expected points. Using Kyren alongside them also introduces competition for
touchdowns. A quiet Rams offense is a meaningful shared risk.

No consistent full-lineup projection model was assembled. V2 was not demonstrated
to have a higher expected score than v1 in every external model.

## V2: final Saturday draft

| Slot | Player | Team | Opponent | Published salary |
|---|---|---|---|---:|
| QB | **Matthew Stafford** | LAR | vs ARI | $6,400 |
| RB | **Kyren Williams** | LAR | vs ARI | $6,800 |
| RB | **Braelon Allen** | NYJ | at NE | $5,700 |
| WR | **Puka Nacua** | LAR | vs ARI | $8,100 |
| WR | **Malik Nabers** | NYG | vs NO | $6,500 |
| WR | **Germie Bernard** | PIT | at TB | $4,000 |
| TE | **Harold Fannin Jr.** | CLE | vs BAL | $4,100 |
| FLEX | **Tyler Allgeier** | ARI | at LAR | $4,800 |
| DST | **Steelers** | PIT | at TB | $3,300 |
| **Total** | | | | **$49,700** |
| **Remaining** | | | | **$300** |

The three Rams selections express confidence in that offense. Puka is the most
committed selection; Nabers is the additional receiver spend. Bernard supplies
salary relief with a plausible expanded role (S1). Fannin's final salary is from S3.

Hall, Love, Roman Wilson and Mayfield were listed out (S6). Those absences support
the opportunity arguments for Braelon, Allgeier, Bernard and Pittsburgh's defense,
respectively; they do not determine their scores.

**Most fragile selection: Allgeier.** S7 supports the replacement starting role
but also documents offensive-line losses and limited receiving involvement.
Trailing Arizona game scripts could hurt the choice even if he starts. His value
rests on affordable opportunity rather than an established receiving floor.

The Saturday recommendation remained subject to Sunday inactives. No Sunday
recheck or late substitution is recorded here.

## Evidence and validity limits

- Salaries came from public Week 6 articles and player pages. A complete official
  DraftKings salary CSV, official player IDs and the exact official slate pool
  were not retained. The roster and arithmetic were checked against the reported
  positions/prices; official entry eligibility is not certified.
- Sources were checked on October 17. Exact retrieval seconds, source revision
  digests and full raw page bytes were not retained. The source register is an
  inspectable citation list, not a qualified historical availability receipt.
- A Saturday DraftKings discussion page encountered during research described
  Henderson as out. The official Patriots report (S8), corroborated by later
  Saturday reporting, still listed him questionable. No exclusive Stevenson
  workload was assumed in either recorded lineup. This conflict is a concrete
  reason to prefer official status evidence over an unverified summary.
- No private league context or retained ROP/TTS dataset was used in these picks.
  No governed run, independent review or empirical forecasting edge is claimed.

## Source register

All sources below were consulted on October 17, 2026. Source publication or model
timestamps are distinct from the date of consultation.

| ID | Source | Used for |
|---|---|---|
| S1 | [FantasyPros: Week 6 lineup advice](https://www.fantasypros.com/2026/10/nfl-dfs-lineup-advice-picks-predictions-week-6-2026/) | Published salaries, role descriptions and Rams/Giants construction |
| S2 | [FTN: Week 6 DFS picks](https://ftnfantasy.com/best-nfl-dfs-picks-for-week-6-2026) | Allen/Stafford/Puka/Steelers salaries and external projections |
| S3 | [FTN: Week 6 cash picks](https://ftnfantasy.com/top-nfl-dfs-cash-game-picks-for-week-6-2026) | Fannin salary and Fannin/Goedert projection comparison |
| S4 | [Splash Play: Week 6 player pool](https://splashplaypodcast.com/dfs/nfl/players/) | Braelon and Allgeier prices |
| S5 | [Splash Play: Shakir](https://splashplaypodcast.com/dfs/nfl/players/khalil-shakir/) | Salary and October 17, 11:30 a.m. ET model estimates |
| S6 | [NFL: Week 6 injury report](https://www.nfl.com/news/nfl-week-6-injury-report-2026-season) | Opponents and absence designations |
| S7 | [DraftKings Network: Allgeier](https://dknetwork.draftkings.com/2026/10/16/tyler-allgeier-start-or-sit-advice-for-week-6/) | Starting opportunity and role limitations |
| S8 | [Patriots: Week 6 injury report](https://www.patriots.com/news/week-6-injury-report-patriots-vs-jets) | Henderson questionable / Hall out |
| S9 | [DraftKings: Classic overview](https://support.draftkings.com/dk/en-us/game-style-classic-overview?id=kb_article_view&sysparm_article=KB0010665) | Salary-cap format |

## Postgame review: pending

Preserve the pregame selections above. Add a dated review after verified scoring
is available; do not replace either draft with players selected after the games.

| Measure | V1 | V2 |
|---|---|---|
| Actual DraftKings points | Pending | Pending |
| Points per $1,000 spent | Pending | Pending |
| Major opportunity assumptions | Not yet evaluated | Not yet evaluated |

With unchanged scoring for the six shared selections, the revision's score
difference is:

`(Stafford - Josh Allen) + (Nabers - Shakir) + (Fannin - Goedert)`

Evaluate the result of each replacement alongside what was knowable before the
game. A single week is a case study, not evidence of durable skill. A full-slate
optimality comparison remains unavailable without the original complete pool.
