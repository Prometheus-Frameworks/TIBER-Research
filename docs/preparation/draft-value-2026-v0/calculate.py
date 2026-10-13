"""Offline component accounting for the public, source-native W1 extract.

No network access, writes, market identity join or promotion.
Source: nflverse contributors, CC BY 4.0; no endorsement implied.
"""

import json
from decimal import Decimal
from pathlib import Path


def calculate():
    data = json.loads(Path(__file__).with_name("public-accounting.json").read_text())
    if data["market_join_performed"] or data["source_admitted"] or data["consumer_activated"]:
        raise ValueError("This calculator is scoped to unjoined candidate observations.")
    totals = []
    seen = set()
    for row in data["observations"]:
        key = (row["native_player_id"], row["game_id"])
        if key in seen or (row["season"], row["season_type"], row["week"]) != (2026, "REG", 1):
            raise ValueError("Duplicate observation or unsupported scope.")
        seen.add(key)
        components = {
            field: Decimal(str(row[field])) * Decimal(str(weight))
            for field, weight in data["scoring"].items()
        }
        points = sum(components.values(), Decimal(0))
        if points != Decimal(str(row["source_ppr"])):
            raise ValueError("Recomputed points do not match the retained source field.")
        totals.append((row, components, points))
        print(f"{row['name']}: {points:.1f} generic PPR; {row['targets']} credited targets")
    if len(totals) != 2 or totals[0][0]["game_id"] != totals[1][0]["game_id"]:
        raise ValueError("This comparison requires exactly two observations in the same game.")
    first, second = totals
    gap = first[2] - second[2]
    td_gap = first[1]["receiving_tds"] - second[1]["receiving_tds"]
    print(f"Points gap: {gap:.1f}; receiving TD component: {td_gap:.1f}; remaining: {gap-td_gap:.1f}")
    print("Partial candidate accounting only; no draft-value grade or independent source acceptance.")


if __name__ == "__main__":
    calculate()
