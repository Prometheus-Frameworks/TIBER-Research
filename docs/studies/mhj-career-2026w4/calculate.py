#!/usr/bin/env python3
"""Offline descriptive calculations over retained public factual observations."""
import argparse
from collections import Counter
import csv
import hashlib
import io
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
MHJ = 'marvin-harrison-jr'


def validate(evidence):
    if evidence['promotable'] is not False or evidence['governed_research_attempt'] is not False:
        raise ValueError('Manual study cannot claim governed admission or promotion')
    members = {x['player_slug'] for x in evidence['cohort']['members']}
    if len(members) != 7 or evidence['cohort']['size'] != 7:
        raise ValueError('Cohort membership changed')
    expected = {(p, y) for p in members for y in [2024, 2025, 2026]}
    rows = evidence['season_rows']
    if len(rows) != 21 or {(x['player_slug'], x['season']) for x in rows} != expected:
        raise ValueError('Incomplete/duplicate peer-season matrix')
    sources = {x['source_id'] for x in evidence['source_ledger']}
    if len(sources) != len(evidence['source_ledger']):
        raise ValueError('Duplicate source')
    for row in rows:
        if row['source_ref'] not in sources or row['season_type'] != 'REG':
            raise ValueError('Source or season-type mismatch')
        counts = [row[k] for k in ['games', 'receptions', 'receiving_yards', 'receiving_tds']]
        if row['status'].startswith('unavailable'):
            if any(x is not None for x in counts):
                raise ValueError('Unavailable observation masquerades as a measured value')
            continue
        if any(type(x) is not int or x < 0 for x in counts) or row['games'] <= 0:
            raise ValueError('Invalid observed season count')
        if row['games'] > (4 if row['season'] == 2026 else 17):
            raise ValueError('Future observation exceeds cutoff')
    weekly = evidence['weekly_rows']
    if len({(x['season'], x['week']) for x in weekly}) != len(weekly):
        raise ValueError('Duplicate weekly row')
    for row in weekly:
        if row['source_ref'] not in sources or row['season_type'] != 'REG':
            raise ValueError('Invalid weekly source/lane')
        if row['season'] == 2026 and (row['week'] > 4 or row['game_date'] > '2026-10-04'):
            raise ValueError('Future game leaked into pre-trade checkpoint')
        if row['status'] != 'played_receiving_row' and any(row[k] is not None for k in ['receptions', 'receiving_yards', 'receiving_tds']):
            raise ValueError('Blank game-log row was imputed')
    for year in [2024, 2025, 2026]:
        season = next(x for x in rows if x['player_slug'] == MHJ and x['season'] == year)
        played = [x for x in weekly if x['season'] == year and x['status'] == 'played_receiving_row']
        if len(played) != season['games']:
            raise ValueError('Played-game denominator does not reconcile')
        for metric in ['receptions', 'receiving_yards', 'receiving_tds']:
            if sum(x[metric] for x in played) != season[metric]:
                raise ValueError('Weekly/season disagreement: ' + metric)
    if Counter(x['season'] for x in evidence['targets']) != {2024: 1, 2025: 1, 2026: 1}:
        raise ValueError('Target observations missing or duplicated')
    for row in evidence['targets']:
        if not set(row['source_refs']).issubset(sources):
            raise ValueError('Unresolved target source')


def symmetric_product_change(a0, b0, a1, b1):
    """Two-factor arithmetic decomposition, averaging both replacement orders."""
    return {'factor_a_component': (a1 - a0) * (b0 + b1) / 2,
            'factor_b_component': (b1 - b0) * (a0 + a1) / 2,
            'total_change': a1 * b1 - a0 * b0,
            'interpretation': 'Accounting identity, not a causal attribution.'}


def csv_text(rows):
    buffer = io.StringIO(newline='')
    writer = csv.DictWriter(buffer, fieldnames=list(rows[0]), lineterminator='\n')
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def calculate(evidence):
    validate(evidence)
    peer_metrics = []
    for row in evidence['season_rows']:
        r = {k: row[k] for k in ['player_name', 'player_slug', 'draft_pick', 'season', 'status', 'games', 'receptions', 'receiving_yards', 'receiving_tds']}
        measured = row['games'] is not None
        r['receptions_per_game'] = round(row['receptions'] / row['games'], 6) if measured else None
        r['receiving_yards_per_game'] = round(row['receiving_yards'] / row['games'], 6) if measured else None
        points = row['receptions'] + 0.1 * row['receiving_yards'] + 6 * row['receiving_tds'] if measured else None
        r['receiving_ppr_proxy'] = round(points, 6) if measured else None
        r['receiving_ppr_proxy_per_game'] = round(points / row['games'], 6) if measured else None
        peer_metrics.append(r)
    mhj = [x for x in peer_metrics if x['player_slug'] == MHJ]
    target_metrics = []
    for target in evidence['targets']:
        r = next(x for x in mhj if x['season'] == target['season'])
        target_metrics.append({'season': r['season'], 'targets': target['targets'], 'qualification': target['qualification'],
                               'targets_per_played_game': target['targets'] / r['games'],
                               'catch_rate': r['receptions'] / target['targets'],
                               'yards_per_target': r['receiving_yards'] / target['targets'],
                               'primary_only_eligible': target['qualification'] == 'primary_public_count'})
    by_year = {x['season']: x for x in mhj}
    first, second = by_year[2024], by_year[2025]
    season_decomposition = symmetric_product_change(first['games'], first['receiving_yards'] / first['games'],
                                                    second['games'], second['receiving_yards'] / second['games'])
    season_decomposition['factors'] = ['played_games', 'receiving_yards_per_played_game']
    season_decomposition['played_games_accounting_share'] = season_decomposition['factor_a_component'] / season_decomposition['total_change']
    t25 = next(x for x in target_metrics if x['season'] == 2025)
    t26 = next(x for x in target_metrics if x['season'] == 2026)
    provisional = symmetric_product_change(t25['targets_per_played_game'], t25['yards_per_target'],
                                           t26['targets_per_played_game'], t26['yards_per_target'])
    provisional['factors'] = ['targets_per_played_game', 'yards_per_target']
    provisional['status'] = 'provisional_2026_target_receipt_requires_verification'
    ranks = []
    for year in [2024, 2025, 2026]:
        available = [x for x in peer_metrics if x['season'] == year and x['games'] is not None]
        mhj_rate = by_year[year]['receiving_yards_per_game']
        ranks.append({'season': year, 'total_members': 7, 'members_with_observed_rows': len(available),
                      'mhj_yards_per_game_rank_among_observed': 1 + sum(x['receiving_yards_per_game'] > mhj_rate for x in available),
                      'missing_members': [x['player_name'] for x in peer_metrics if x['season'] == year and x['games'] is None],
                      'caution': 'Tiny, heterogeneous cohort; ranks describe realized receiving volume and cannot calibrate a prospect grade.'})
    matched_weeks = []
    for year in [2024, 2025, 2026]:
        window = [x for x in evidence['weekly_rows'] if x['season'] == year and x['week'] <= 4 and x['status'] == 'played_receiving_row']
        if len(window) != 4:
            raise ValueError('Matched early-season window is incomplete')
        rec = sum(x['receptions'] for x in window)
        yards = sum(x['receiving_yards'] for x in window)
        tds = sum(x['receiving_tds'] for x in window)
        matched_weeks.append({'season': year, 'weeks': '1-4', 'played_games': 4, 'receptions': rec,
                              'receiving_yards': yards, 'receiving_tds': tds,
                              'receiving_yards_per_game': yards / 4,
                              'receiving_ppr_proxy_per_game': (rec + 0.1 * yards + 6 * tds) / 4})
    result = {'artifact': 'manual_descriptive_study_results_v0', 'status': 'candidate_pending_independent_review',
              'promotable': False, 'governed_research_attempt': False,
              'evidence_sha256': hashlib.sha256((HERE / 'evidence_v0.json').read_bytes()).hexdigest(),
              'scoring': {'name': 'receiving_only_ppr_proxy', 'formula': 'receptions + 0.1 * receiving_yards + 6 * receiving_tds',
                          'excluded': ['rushing', 'two-point conversions', 'fumble penalties', 'returns', 'postseason'],
                          'warning': 'Not complete fantasy PPR scoring. Games means NFL games played, including zero-catch and partial-snap appearances.'},
              'mhj_seasons': mhj, 'matched_weeks_1_to_4': matched_weeks,
              'target_metrics': target_metrics, 'peer_rank_summary': ranks,
              '2024_to_2025_yards_decomposition': season_decomposition,
              '2025_to_2026_yards_per_game_decomposition_provisional': provisional,
              'sensitivity': {'without_provisional_2026_targets': 'Season/weekly receiving tables, 2024-to-2025 accounting, and peer comparison unchanged. 2026 target conversion and decomposition become unavailable.'}}
    return {'results_v0.json': json.dumps(result, indent=2) + '\n', 'mhj_seasons_v0.csv': csv_text(mhj),
            'peer_seasons_v0.csv': csv_text(peer_metrics), 'mhj_weekly_v0.csv': csv_text(evidence['weekly_rows'])}


def self_test(evidence):
    import copy
    for mutate, expected in [
        (lambda e: next(x for x in e['season_rows'] if x['season'] == 2026 and x['player_slug'] == MHJ).update(games=5), 'cutoff'),
        (lambda e: e['weekly_rows'].append(dict(e['weekly_rows'][0])), 'Duplicate weekly'),
        (lambda e: next(x for x in e['season_rows'] if x['status'].startswith('unavailable')).update(games=0), 'Unavailable'),
        (lambda e: e['weekly_rows'][-1].update(week=5), 'Future game'),
    ]:
        e = copy.deepcopy(evidence)
        try:
            mutate(e)
            validate(e)
        except ValueError as error:
            if expected.lower() not in str(error).lower():
                raise AssertionError('Wrong admission failure: ' + str(error))
        else:
            raise AssertionError('Unsafe observation admitted: ' + expected)
    d = symmetric_product_change(17, 885 / 17, 12, 608 / 12)
    if abs(d['factor_a_component'] + d['factor_b_component'] - d['total_change']) > 1e-9:
        raise AssertionError('Decomposition does not reconcile')
    print('Five admission/accounting checks passed.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check candidate reproducibility without writing.')
    parser.add_argument('--self-test', action='store_true', help='Run adversarial cutoff, missingness and accounting checks.')
    args = parser.parse_args()
    evidence = json.loads((HERE / 'evidence_v0.json').read_text())
    if args.self_test:
        self_test(evidence)
    artifacts = calculate(evidence)
    for filename, content in artifacts.items():
        path = HERE / filename
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise ValueError('Candidate differs: ' + filename)
        else:
            path.write_text(content)
    print('Validated 21 peer-season records and reconciled MHJ 17/12/4 played-game denominators.')


if __name__ == '__main__':
    main()
