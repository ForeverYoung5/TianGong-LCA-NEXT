import {
  mapReviewDetailRow,
  toReviewMutableJson,
  type ReviewsTable,
} from '@/services/reviews/data';

const createReviewName = (text: string) => ({
  baseName: [{ '@xml:lang': 'en', '#text': text }],
});

describe('reviews data shapes', () => {
  it('supports the nested review payload used by assignment and review tables', () => {
    const row: ReviewsTable = {
      key: 'review-1',
      id: 'review-1',
      name: 'Review A',
      teamName: 'Team Alpha',
      modifiedAt: '2026-03-13T10:00:00Z',
      userName: 'Alice',
      createAt: '2026-03-12T08:00:00Z',
      isFromLifeCycle: true,
      stateCode: 20,
      comments: [{ state_code: 10 }, { state_code: 20 }],
      json: {
        data: {
          id: 'process-1',
          version: '01.00.000',
          name: {
            baseName: [{ '@xml:lang': 'en', '#text': 'Process A' }],
          },
        },
        team: {
          id: 'team-1',
          name: 'Team Alpha',
        },
        user: {
          id: 'user-1',
          name: 'Alice',
          email: 'alice@example.com',
        },
      },
      modelData: {
        id: 'model-1',
        version: '01.00.000',
        json: {
          lifeCycleModelDataSet: {
            lifeCycleModelInformation: {},
          },
        },
        json_tg: { xflow: { nodes: [], edges: [] } },
      },
    };

    expect(row.comments?.map((item) => item.state_code)).toEqual([10, 20]);
    expect(row.json.team.name).toBe('Team Alpha');
    expect(row.modelData?.json_tg?.xflow?.nodes).toEqual([]);
  });

  it('allows review rows without model data for process-only reviews', () => {
    const row: ReviewsTable = {
      key: 'review-2',
      id: 'review-2',
      name: 'Review B',
      teamName: 'Team Beta',
      userName: 'Bob',
      isFromLifeCycle: false,
      json: {
        data: {
          id: 'process-2',
          version: '02.00.000',
          name: {
            baseName: { '@xml:lang': 'en', '#text': 'Process B' },
          },
        },
        team: {
          id: 'team-2',
          name: 'Team Beta',
        },
        user: {
          id: 'user-2',
          name: 'Bob',
          email: 'bob@example.com',
        },
      },
      modelData: null,
    };

    expect(row.isFromLifeCycle).toBe(false);
    expect(row.modelData).toBeNull();
  });

  it('supports rows without optional comment state arrays or timestamps', () => {
    const row: ReviewsTable = {
      key: 'review-3',
      id: 'review-3',
      name: 'Review C',
      teamName: 'Team Gamma',
      userName: 'Carol',
      isFromLifeCycle: false,
      json: {
        data: {
          id: 'process-3',
          version: '03.00.000',
          name: {
            baseName: [{ '@xml:lang': 'en', '#text': 'Process C' }],
          },
        },
        team: {
          id: 'team-3',
          name: 'Team Gamma',
        },
        user: {
          id: 'user-3',
          name: 'Carol',
          email: 'carol@example.com',
        },
      },
    };

    expect(row.comments).toBeUndefined();
    expect(row.modifiedAt).toBeUndefined();
    const baseName = row.json.data.name.baseName;
    expect(Array.isArray(baseName) ? baseName[0]?.['#text'] : baseName?.['#text']).toBe(
      'Process C',
    );
  });

  it('keeps known mutable review fields while rejecting invalid field shapes', () => {
    expect(
      toReviewMutableJson({
        data: {
          id: 'process-1',
          version: '01.00.000',
          name: createReviewName('Process A'),
        },
        team: {
          id: 'team-1',
          name: 'Team Alpha',
        },
        user: {
          id: 'user-1',
          email: 'alice@example.com',
        },
        logs: [
          {
            action: 'approved',
            time: '2026-03-18T08:00:00.000Z',
            user: {
              id: 'user-1',
              display_name: 'Alice',
            },
          },
        ],
      }),
    ).toEqual({
      data: {
        id: 'process-1',
        version: '01.00.000',
        name: createReviewName('Process A'),
      },
      team: {
        id: 'team-1',
        name: 'Team Alpha',
      },
      user: {
        id: 'user-1',
        email: 'alice@example.com',
      },
      logs: [
        {
          action: 'approved',
          time: '2026-03-18T08:00:00.000Z',
          user: {
            id: 'user-1',
            display_name: 'Alice',
          },
        },
      ],
    });

    expect(
      toReviewMutableJson({
        logs: 'invalid',
      }),
    ).toBeNull();

    expect(
      toReviewMutableJson({
        data: {
          id: 'process-1',
          version: '01.00.000',
          name: 'Process A',
        },
      }),
    ).toBeNull();
  });

  it('accepts persisted review metadata with nullable team and email fields', () => {
    const sample = {
      data: {
        id: '289a7384-2dc2-4116-b1f5-73dd48195ab4',
        version: '01.01.001',
        name: {
          baseName: [
            {
              '#text': 'raw coal mining',
              '@xml:lang': 'en',
            },
            {
              '#text': '原煤开采',
              '@xml:lang': 'zh',
            },
          ],
          mixAndLocationTypes: [
            {
              '#text': 'in the underground coal mine',
              '@xml:lang': 'en',
            },
            {
              '#text': '在井工煤矿',
              '@xml:lang': 'zh',
            },
          ],
          treatmentStandardsRoutes: [
            {
              '#text': 'underground mining',
              '@xml:lang': 'en',
            },
            {
              '#text': '井工开采',
              '@xml:lang': 'zh',
            },
          ],
        },
      },
      logs: [
        {
          time: '2025-12-13T12:05:29.650Z',
          user: {
            id: '9e82fec1-faf9-424c-82c7-af5eff9991e7',
            display_name: 'ZhangSi',
          },
          action: 'submit_review',
        },
      ],
      team: {
        id: null,
      },
      user: {
        id: '9e82fec1-faf9-424c-82c7-af5eff9991e7',
        name: 'ZhangSi',
        email: null,
      },
      comment: {
        message: '',
      },
    };

    expect(toReviewMutableJson(sample)).toEqual(sample);
  });

  it('maps review detail rows through the mutable json guard', () => {
    expect(
      mapReviewDetailRow({
        id: 'review-detail-1',
        json: {
          logs: [{ action: 'assigned' }],
        },
      } as never),
    ).toEqual({
      id: 'review-detail-1',
      json: {
        logs: [{ action: 'assigned' }],
      },
    });
  });
});
