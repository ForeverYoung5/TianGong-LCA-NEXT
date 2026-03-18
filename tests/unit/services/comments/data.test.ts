import {
  isCommentModellingAndValidation,
  mapCommentJsonRecord,
  mapCommentRow,
  toCommentJson,
} from '@/services/comments/data';

describe('Comments data helpers (src/services/comments/data.ts)', () => {
  it('returns null for non-object comment json', () => {
    expect(toCommentJson(null)).toBeNull();
    expect(toCommentJson('invalid' as never)).toBeNull();
  });

  it('keeps comment message and modellingAndValidation subset', () => {
    const result = toCommentJson({
      comment: {
        message: 'review comment',
      },
      modellingAndValidation: {
        validation: {
          review: {
            '@type': 'Independent external review',
          },
        },
        complianceDeclarations: {
          compliance: {
            'common:approvalOfOverallCompliance': 'Fully compliant',
            'common:nomenclatureCompliance': 'Not defined',
            'common:methodologicalCompliance': 'Fully compliant',
            'common:reviewCompliance': 'Fully compliant',
            'common:documentationCompliance': 'Not defined',
            'common:qualityCompliance': 'Not defined',
            'common:referenceToComplianceSystem': {
              '@refObjectId': 'source-1',
            },
          },
        },
        otherSection: {
          should: 'be dropped',
        },
      },
    });

    expect(result).toEqual({
      comment: {
        message: 'review comment',
      },
      modellingAndValidation: {
        validation: {
          review: {
            '@type': 'Independent external review',
          },
        },
        complianceDeclarations: {
          compliance: {
            'common:approvalOfOverallCompliance': 'Fully compliant',
            'common:nomenclatureCompliance': 'Not defined',
            'common:methodologicalCompliance': 'Fully compliant',
            'common:reviewCompliance': 'Fully compliant',
            'common:documentationCompliance': 'Not defined',
            'common:qualityCompliance': 'Not defined',
            'common:referenceToComplianceSystem': {
              '@refObjectId': 'source-1',
            },
          },
        },
      },
    });
  });

  it('returns null when comment json has no recognized fields', () => {
    expect(
      toCommentJson({
        other: 'value',
      }),
    ).toBeNull();
  });

  it('drops invalid modellingAndValidation payloads instead of blindly asserting them', () => {
    expect(
      toCommentJson({
        modellingAndValidation: {
          validation: 'invalid',
        },
      } as never),
    ).toBeNull();

    expect(
      isCommentModellingAndValidation({
        validation: {
          review: [{ '@type': 'peer review' }],
          summary: { id: 'summary-1' },
        },
      }),
    ).toBe(true);
  });

  it('maps full rows without changing nullable row fields', () => {
    const row = {
      created_at: '2024-01-01T00:00:00Z',
      json: {
        comment: {
          message: 'review comment',
        },
      },
      modified_at: null,
      review_id: 'review-1',
      reviewer_id: 'user-1',
      state_code: null,
    };

    expect(mapCommentRow(row)).toEqual({
      created_at: '2024-01-01T00:00:00Z',
      json: {
        comment: {
          message: 'review comment',
        },
      },
      modified_at: null,
      review_id: 'review-1',
      reviewer_id: 'user-1',
      state_code: null,
    });
  });

  it('maps json-only selections for rejected comment queries', () => {
    expect(
      mapCommentJsonRecord({
        json: {
          comment: {
            message: 'rejected',
          },
        },
      }),
    ).toEqual({
      json: {
        comment: {
          message: 'rejected',
        },
      },
    });
  });
});
