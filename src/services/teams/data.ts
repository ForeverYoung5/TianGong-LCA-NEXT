import type { LangTextEntry } from '../general/data';
import { isJsonObject, toLangTextList } from '../general/util';
import type {
  Json as DatabaseJson,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../supabase/database.types';

export type TeamRole =
  | 'admin'
  | 'owner'
  | 'member'
  | 'is_invited'
  | 'rejected'
  | 'review-admin'
  | 'review-member';

export type TeamRow = Tables<'teams'>;
export type TeamInsert = TablesInsert<'teams'>;
export type TeamUpdate = TablesUpdate<'teams'>;

export type TeamMemberTable = {
  user_id: string;
  team_id: string;
  role: TeamRole;
  display_name?: string;
  email: string;
};

export type TeamLangTextList = LangTextEntry[];

export type TeamJson = {
  title?: TeamLangTextList;
  description?: TeamLangTextList;
  lightLogo?: string | null;
  darkLogo?: string | null;
};

export type TeamRuntimeJson = TeamJson & {
  previewLightUrl?: string | null;
  previewDarkUrl?: string | null;
};

export type TeamTable = {
  id: string;
  json: TeamRuntimeJson;
  rank: number;
  is_public?: boolean;
  user_id?: string;
  ownerEmail?: string;
  created_at?: string;
  modified_at?: string;
};

export type TeamSummaryTable = Pick<TeamTable, 'id' | 'json' | 'rank'>;

export type TeamDetailTable = Pick<
  TeamTable,
  'id' | 'json' | 'rank' | 'is_public' | 'created_at' | 'modified_at'
>;

export const isTeamJson = (value: DatabaseJson | null | undefined): value is TeamJson =>
  isJsonObject(value);

export const toTeamJson = (value: DatabaseJson | null | undefined): TeamJson => {
  if (!isTeamJson(value)) {
    return {};
  }

  const teamJson: TeamJson = {};
  const title = toLangTextList(value.title);
  const description = toLangTextList(value.description);

  if (title) {
    teamJson.title = title;
  } else {
    delete teamJson.title;
  }

  if (description) {
    teamJson.description = description;
  } else {
    delete teamJson.description;
  }

  if (typeof value.lightLogo === 'string') {
    teamJson.lightLogo = value.lightLogo;
  } else {
    delete teamJson.lightLogo;
  }

  if (typeof value.darkLogo === 'string') {
    teamJson.darkLogo = value.darkLogo;
  } else {
    delete teamJson.darkLogo;
  }

  return teamJson;
};

export const mapTeamSummaryRow = (
  row: Pick<TeamRow, 'id' | 'json' | 'rank'>,
): TeamSummaryTable => ({
  id: row.id,
  json: toTeamJson(row.json),
  rank: row.rank ?? 0,
});

export const mapTeamSummaryRows = (
  rows: Pick<TeamRow, 'id' | 'json' | 'rank'>[] | null | undefined,
): TeamSummaryTable[] => (rows ?? []).map(mapTeamSummaryRow);

export const mapTeamRow = (row: TeamRow): TeamDetailTable => ({
  ...mapTeamSummaryRow(row),
  ...(row.is_public !== null && typeof row.is_public !== 'undefined'
    ? { is_public: row.is_public }
    : {}),
  ...(row.created_at !== null && typeof row.created_at !== 'undefined'
    ? { created_at: row.created_at }
    : {}),
  ...(row.modified_at !== null && typeof row.modified_at !== 'undefined'
    ? { modified_at: row.modified_at }
    : {}),
});

export const mapTeamRows = (rows: TeamRow[] | null | undefined): TeamDetailTable[] =>
  (rows ?? []).map(mapTeamRow);
