import type {
  TeamDetailTable,
  TeamJson,
  TeamMemberTable,
  TeamRow,
  TeamRuntimeJson,
  TeamSummaryTable,
  TeamTable,
} from '@/services/teams/data';
import {
  mapTeamRow,
  mapTeamRows,
  mapTeamSummaryRow,
  mapTeamSummaryRows,
  toTeamJson,
} from '@/services/teams/data';

describe('teams data shapes', () => {
  it('supports team member rows with optional display names', () => {
    const member: TeamMemberTable = {
      user_id: 'user-1',
      team_id: 'team-1',
      role: 'admin',
      display_name: 'Alice',
      email: 'alice@example.com',
    };

    expect(member.role).toBe('admin');
    expect(member.display_name).toBe('Alice');
  });

  it('supports public team tables with localized team json payloads', () => {
    const json: TeamJson = {
      title: [{ '@xml:lang': 'en', '#text': 'Team Alpha' }],
      description: [{ '@xml:lang': 'en', '#text': 'Primary org team' }],
      lightLogo: 'light.png',
      darkLogo: 'dark.png',
    };
    const runtimeJson: TeamRuntimeJson = {
      ...json,
      previewLightUrl: 'https://example.com/light.png',
      previewDarkUrl: 'https://example.com/dark.png',
    };
    const team: TeamTable = {
      id: 'team-1',
      json: runtimeJson,
      rank: 1,
      is_public: true,
      user_id: 'owner-1',
      ownerEmail: 'owner@example.com',
      created_at: '2026-03-01T00:00:00Z',
      modified_at: '2026-03-13T00:00:00Z',
    };
    const titleList = Array.isArray(team.json.title) ? team.json.title : [team.json.title];

    expect(titleList[0]?.['#text']).toBe('Team Alpha');
    expect(team.is_public).toBe(true);
    expect(team.ownerEmail).toBe('owner@example.com');
    expect(team.json.previewLightUrl).toBe('https://example.com/light.png');
  });

  it('supports persisted team json without runtime-only preview fields', () => {
    const member: TeamMemberTable = {
      user_id: 'user-2',
      team_id: 'team-2',
      role: 'member',
      email: 'member@example.com',
    };
    const json: TeamJson = {
      title: [{ '@xml:lang': 'zh', '#text': '团队 Beta' }],
      description: [{ '@xml:lang': 'en', '#text': 'Team Beta' }],
    };

    expect(member.display_name).toBeUndefined();
    expect(json.description?.[0]?.['#text']).toBe('Team Beta');
  });

  it('normalizes null or non-object database json payloads to empty objects', () => {
    expect(toTeamJson(null)).toEqual({});
    expect(toTeamJson('legacy-string')).toEqual({});
  });

  it('normalizes single lang-text objects into the teams json array contract', () => {
    expect(
      toTeamJson({
        title: { '@xml:lang': 'zh', '#text': '团队' },
        description: { '@xml:lang': 'en', '#text': 'Team description' },
      }),
    ).toEqual({
      title: [{ '@xml:lang': 'zh', '#text': '团队' }],
      description: [{ '@xml:lang': 'en', '#text': 'Team description' }],
    });
  });

  it('maps nullable database team rows into UI-safe team tables', () => {
    const row: TeamRow = {
      id: 'team-db-1',
      json: null,
      rank: null,
      is_public: null,
      created_at: null,
      modified_at: null,
    };

    expect(mapTeamRow(row)).toEqual({
      id: 'team-db-1',
      json: {},
      rank: 0,
    });
  });

  it('maps summary rows without leaking fields outside the queried shape', () => {
    const row: TeamRow = {
      id: 'team-summary-1',
      json: {
        title: [{ '@xml:lang': 'en', '#text': 'Summary Team' }],
      },
      rank: 3,
      is_public: true,
      created_at: '2026-03-12T00:00:00Z',
      modified_at: '2026-03-13T00:00:00Z',
    };

    const summary: TeamSummaryTable = mapTeamSummaryRow(row);

    expect(summary).toEqual({
      id: 'team-summary-1',
      json: {
        title: [{ '@xml:lang': 'en', '#text': 'Summary Team' }],
      },
      rank: 3,
    });
    expect('created_at' in summary).toBe(false);
    expect('is_public' in summary).toBe(false);
  });

  it('maps database rows arrays while preserving object json payloads', () => {
    const rows: TeamRow[] = [
      {
        id: 'team-db-2',
        json: {
          title: [{ '@xml:lang': 'en', '#text': 'Team DB' }],
          lightLogo: 'light-db.png',
        },
        rank: 2,
        is_public: true,
        created_at: '2026-03-10T00:00:00Z',
        modified_at: '2026-03-11T00:00:00Z',
      },
    ];

    const detailRows: TeamDetailTable[] = mapTeamRows(rows);

    expect(detailRows).toEqual([
      {
        id: 'team-db-2',
        json: {
          title: [{ '@xml:lang': 'en', '#text': 'Team DB' }],
          lightLogo: 'light-db.png',
        },
        rank: 2,
        is_public: true,
        created_at: '2026-03-10T00:00:00Z',
        modified_at: '2026-03-11T00:00:00Z',
      },
    ]);
    expect(mapTeamSummaryRows(rows)).toEqual([
      {
        id: 'team-db-2',
        json: {
          title: [{ '@xml:lang': 'en', '#text': 'Team DB' }],
          lightLogo: 'light-db.png',
        },
        rank: 2,
      },
    ]);
  });
});
