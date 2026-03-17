export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      comments: {
        Row: {
          created_at: string | null;
          json: Json | null;
          modified_at: string | null;
          review_id: string;
          reviewer_id: string;
          state_code: number | null;
        };
        Insert: {
          created_at?: string | null;
          json?: Json | null;
          modified_at?: string | null;
          review_id: string;
          reviewer_id?: string;
          state_code?: number | null;
        };
        Update: {
          created_at?: string | null;
          json?: Json | null;
          modified_at?: string | null;
          review_id?: string;
          reviewer_id?: string;
          state_code?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_review_id_fkey';
            columns: ['review_id'];
            isOneToOne: false;
            referencedRelation: 'reviews';
            referencedColumns: ['id'];
          },
        ];
      };
      contacts: {
        Row: {
          created_at: string | null;
          embedding: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          modified_at: string | null;
          review_id: string | null;
          reviews: Json | null;
          rule_verification: boolean | null;
          state_code: number | null;
          team_id: string | null;
          user_id: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          embedding?: string | null;
          id: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      flowproperties: {
        Row: {
          created_at: string | null;
          embedding: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          modified_at: string | null;
          review_id: string | null;
          reviews: Json | null;
          rule_verification: boolean | null;
          state_code: number | null;
          team_id: string | null;
          user_id: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          embedding?: string | null;
          id: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      flows: {
        Row: {
          created_at: string | null;
          embedding: unknown;
          embedding_at: string | null;
          embedding_flag: number | null;
          embedding_ft: string | null;
          embedding_ft_at: string | null;
          extracted_md: string | null;
          extracted_text: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          modified_at: string | null;
          review_id: string | null;
          reviews: Json | null;
          rule_verification: boolean | null;
          state_code: number | null;
          team_id: string | null;
          user_id: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          embedding?: unknown;
          embedding_at?: string | null;
          embedding_flag?: number | null;
          embedding_ft?: string | null;
          embedding_ft_at?: string | null;
          extracted_md?: string | null;
          extracted_text?: string | null;
          id: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          embedding?: unknown;
          embedding_at?: string | null;
          embedding_flag?: number | null;
          embedding_ft?: string | null;
          embedding_ft_at?: string | null;
          extracted_md?: string | null;
          extracted_text?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      ilcd: {
        Row: {
          created_at: string | null;
          file_name: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          modified_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          file_name?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          file_name?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      lca_active_snapshots: {
        Row: {
          activated_at: string;
          activated_by: string | null;
          note: string | null;
          scope: string;
          snapshot_id: string;
          source_hash: string;
        };
        Insert: {
          activated_at?: string;
          activated_by?: string | null;
          note?: string | null;
          scope: string;
          snapshot_id: string;
          source_hash: string;
        };
        Update: {
          activated_at?: string;
          activated_by?: string | null;
          note?: string | null;
          scope?: string;
          snapshot_id?: string;
          source_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lca_active_snapshots_snapshot_fk';
            columns: ['snapshot_id'];
            isOneToOne: false;
            referencedRelation: 'lca_network_snapshots';
            referencedColumns: ['id'];
          },
        ];
      };
      lca_factorization_registry: {
        Row: {
          backend: string;
          created_at: string;
          diagnostics: Json;
          id: string;
          last_used_at: string | null;
          lease_until: string | null;
          numeric_options_hash: string;
          owner_worker_id: string | null;
          prepared_at: string | null;
          prepared_job_id: string | null;
          scope: string;
          snapshot_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          backend?: string;
          created_at?: string;
          diagnostics?: Json;
          id?: string;
          last_used_at?: string | null;
          lease_until?: string | null;
          numeric_options_hash: string;
          owner_worker_id?: string | null;
          prepared_at?: string | null;
          prepared_job_id?: string | null;
          scope?: string;
          snapshot_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          backend?: string;
          created_at?: string;
          diagnostics?: Json;
          id?: string;
          last_used_at?: string | null;
          lease_until?: string | null;
          numeric_options_hash?: string;
          owner_worker_id?: string | null;
          prepared_at?: string | null;
          prepared_job_id?: string | null;
          scope?: string;
          snapshot_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lca_factorization_registry_prepared_job_fk';
            columns: ['prepared_job_id'];
            isOneToOne: false;
            referencedRelation: 'lca_jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lca_factorization_registry_snapshot_fk';
            columns: ['snapshot_id'];
            isOneToOne: false;
            referencedRelation: 'lca_network_snapshots';
            referencedColumns: ['id'];
          },
        ];
      };
      lca_jobs: {
        Row: {
          attempt: number;
          created_at: string;
          diagnostics: Json | null;
          finished_at: string | null;
          id: string;
          idempotency_key: string | null;
          job_type: string;
          max_attempt: number;
          payload: Json | null;
          request_key: string | null;
          requested_by: string | null;
          snapshot_id: string;
          started_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          attempt?: number;
          created_at?: string;
          diagnostics?: Json | null;
          finished_at?: string | null;
          id?: string;
          idempotency_key?: string | null;
          job_type: string;
          max_attempt?: number;
          payload?: Json | null;
          request_key?: string | null;
          requested_by?: string | null;
          snapshot_id: string;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          attempt?: number;
          created_at?: string;
          diagnostics?: Json | null;
          finished_at?: string | null;
          id?: string;
          idempotency_key?: string | null;
          job_type?: string;
          max_attempt?: number;
          payload?: Json | null;
          request_key?: string | null;
          requested_by?: string | null;
          snapshot_id?: string;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lca_jobs_snapshot_fk';
            columns: ['snapshot_id'];
            isOneToOne: false;
            referencedRelation: 'lca_network_snapshots';
            referencedColumns: ['id'];
          },
        ];
      };
      lca_latest_all_unit_results: {
        Row: {
          computed_at: string;
          created_at: string;
          id: string;
          job_id: string;
          query_artifact_byte_size: number;
          query_artifact_format: string;
          query_artifact_sha256: string;
          query_artifact_url: string;
          result_id: string;
          snapshot_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          computed_at?: string;
          created_at?: string;
          id?: string;
          job_id: string;
          query_artifact_byte_size: number;
          query_artifact_format: string;
          query_artifact_sha256: string;
          query_artifact_url: string;
          result_id: string;
          snapshot_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          computed_at?: string;
          created_at?: string;
          id?: string;
          job_id?: string;
          query_artifact_byte_size?: number;
          query_artifact_format?: string;
          query_artifact_sha256?: string;
          query_artifact_url?: string;
          result_id?: string;
          snapshot_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lca_latest_all_unit_results_job_fk';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'lca_jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lca_latest_all_unit_results_result_fk';
            columns: ['result_id'];
            isOneToOne: false;
            referencedRelation: 'lca_results';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lca_latest_all_unit_results_snapshot_fk';
            columns: ['snapshot_id'];
            isOneToOne: true;
            referencedRelation: 'lca_network_snapshots';
            referencedColumns: ['id'];
          },
        ];
      };
      lca_network_snapshots: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          lcia_method_id: string | null;
          lcia_method_version: string | null;
          process_filter: Json | null;
          provider_matching_rule: string;
          scope: string;
          source_hash: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          lcia_method_id?: string | null;
          lcia_method_version?: string | null;
          process_filter?: Json | null;
          provider_matching_rule?: string;
          scope?: string;
          source_hash?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          lcia_method_id?: string | null;
          lcia_method_version?: string | null;
          process_filter?: Json | null;
          provider_matching_rule?: string;
          scope?: string;
          source_hash?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lca_network_snapshots_lcia_fk';
            columns: ['lcia_method_id', 'lcia_method_version'];
            isOneToOne: false;
            referencedRelation: 'lciamethods';
            referencedColumns: ['id', 'version'];
          },
        ];
      };
      lca_result_cache: {
        Row: {
          created_at: string;
          error_code: string | null;
          error_message: string | null;
          hit_count: number;
          id: string;
          job_id: string | null;
          last_accessed_at: string;
          request_key: string;
          request_payload: Json;
          result_id: string | null;
          scope: string;
          snapshot_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          error_code?: string | null;
          error_message?: string | null;
          hit_count?: number;
          id?: string;
          job_id?: string | null;
          last_accessed_at?: string;
          request_key: string;
          request_payload: Json;
          result_id?: string | null;
          scope?: string;
          snapshot_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          error_code?: string | null;
          error_message?: string | null;
          hit_count?: number;
          id?: string;
          job_id?: string | null;
          last_accessed_at?: string;
          request_key?: string;
          request_payload?: Json;
          result_id?: string | null;
          scope?: string;
          snapshot_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lca_result_cache_job_fk';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'lca_jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lca_result_cache_result_fk';
            columns: ['result_id'];
            isOneToOne: false;
            referencedRelation: 'lca_results';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lca_result_cache_snapshot_fk';
            columns: ['snapshot_id'];
            isOneToOne: false;
            referencedRelation: 'lca_network_snapshots';
            referencedColumns: ['id'];
          },
        ];
      };
      lca_results: {
        Row: {
          artifact_byte_size: number | null;
          artifact_format: string | null;
          artifact_sha256: string | null;
          artifact_url: string | null;
          created_at: string;
          diagnostics: Json | null;
          id: string;
          job_id: string;
          payload: Json | null;
          snapshot_id: string;
        };
        Insert: {
          artifact_byte_size?: number | null;
          artifact_format?: string | null;
          artifact_sha256?: string | null;
          artifact_url?: string | null;
          created_at?: string;
          diagnostics?: Json | null;
          id?: string;
          job_id: string;
          payload?: Json | null;
          snapshot_id: string;
        };
        Update: {
          artifact_byte_size?: number | null;
          artifact_format?: string | null;
          artifact_sha256?: string | null;
          artifact_url?: string | null;
          created_at?: string;
          diagnostics?: Json | null;
          id?: string;
          job_id?: string;
          payload?: Json | null;
          snapshot_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lca_results_job_fk';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'lca_jobs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lca_results_snapshot_fk';
            columns: ['snapshot_id'];
            isOneToOne: false;
            referencedRelation: 'lca_network_snapshots';
            referencedColumns: ['id'];
          },
        ];
      };
      lca_snapshot_artifacts: {
        Row: {
          a_nnz: number;
          artifact_byte_size: number;
          artifact_format: string;
          artifact_sha256: string;
          artifact_url: string;
          b_nnz: number;
          c_nnz: number;
          coverage: Json | null;
          created_at: string;
          flow_count: number;
          id: string;
          impact_count: number;
          process_count: number;
          snapshot_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          a_nnz: number;
          artifact_byte_size: number;
          artifact_format: string;
          artifact_sha256: string;
          artifact_url: string;
          b_nnz: number;
          c_nnz: number;
          coverage?: Json | null;
          created_at?: string;
          flow_count: number;
          id?: string;
          impact_count: number;
          process_count: number;
          snapshot_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          a_nnz?: number;
          artifact_byte_size?: number;
          artifact_format?: string;
          artifact_sha256?: string;
          artifact_url?: string;
          b_nnz?: number;
          c_nnz?: number;
          coverage?: Json | null;
          created_at?: string;
          flow_count?: number;
          id?: string;
          impact_count?: number;
          process_count?: number;
          snapshot_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lca_snapshot_artifacts_snapshot_fk';
            columns: ['snapshot_id'];
            isOneToOne: false;
            referencedRelation: 'lca_network_snapshots';
            referencedColumns: ['id'];
          },
        ];
      };
      lciamethods: {
        Row: {
          created_at: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          modified_at: string | null;
          state_code: number | null;
          user_id: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          state_code?: number | null;
          user_id?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          state_code?: number | null;
          user_id?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      lifecyclemodels: {
        Row: {
          created_at: string | null;
          embedding: unknown;
          embedding_at: string | null;
          embedding_flag: number | null;
          embedding_ft: string | null;
          embedding_ft_at: string | null;
          extracted_md: string | null;
          extracted_text: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          json_tg: Json | null;
          modified_at: string | null;
          reviews: Json | null;
          rule_verification: boolean | null;
          state_code: number | null;
          team_id: string | null;
          user_id: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          embedding?: unknown;
          embedding_at?: string | null;
          embedding_flag?: number | null;
          embedding_ft?: string | null;
          embedding_ft_at?: string | null;
          extracted_md?: string | null;
          extracted_text?: string | null;
          id: string;
          json?: Json | null;
          json_ordered?: Json | null;
          json_tg?: Json | null;
          modified_at?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          embedding?: unknown;
          embedding_at?: string | null;
          embedding_flag?: number | null;
          embedding_ft?: string | null;
          embedding_ft_at?: string | null;
          extracted_md?: string | null;
          extracted_text?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          json_tg?: Json | null;
          modified_at?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      processes: {
        Row: {
          created_at: string | null;
          embedding: unknown;
          embedding_at: string | null;
          embedding_flag: number | null;
          embedding_ft: string | null;
          embedding_ft_at: string | null;
          extracted_md: string | null;
          extracted_text: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          model_id: string | null;
          modified_at: string | null;
          review_id: string | null;
          reviews: Json | null;
          rule_verification: boolean | null;
          state_code: number | null;
          team_id: string | null;
          user_id: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          embedding?: unknown;
          embedding_at?: string | null;
          embedding_flag?: number | null;
          embedding_ft?: string | null;
          embedding_ft_at?: string | null;
          extracted_md?: string | null;
          extracted_text?: string | null;
          id: string;
          json?: Json | null;
          json_ordered?: Json | null;
          model_id?: string | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          embedding?: unknown;
          embedding_at?: string | null;
          embedding_flag?: number | null;
          embedding_ft?: string | null;
          embedding_ft_at?: string | null;
          extracted_md?: string | null;
          extracted_text?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          model_id?: string | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          created_at: string | null;
          data_id: string | null;
          data_version: string | null;
          deadline: string | null;
          id: string;
          json: Json | null;
          modified_at: string | null;
          reviewer_id: Json | null;
          state_code: number | null;
        };
        Insert: {
          created_at?: string | null;
          data_id?: string | null;
          data_version?: string | null;
          deadline?: string | null;
          id: string;
          json?: Json | null;
          modified_at?: string | null;
          reviewer_id?: Json | null;
          state_code?: number | null;
        };
        Update: {
          created_at?: string | null;
          data_id?: string | null;
          data_version?: string | null;
          deadline?: string | null;
          id?: string;
          json?: Json | null;
          modified_at?: string | null;
          reviewer_id?: Json | null;
          state_code?: number | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          created_at: string | null;
          modified_at: string | null;
          role: string;
          team_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          modified_at?: string | null;
          role: string;
          team_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          modified_at?: string | null;
          role?: string;
          team_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      sources: {
        Row: {
          created_at: string | null;
          embedding: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          modified_at: string | null;
          review_id: string | null;
          reviews: Json | null;
          rule_verification: boolean | null;
          state_code: number | null;
          team_id: string | null;
          user_id: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          embedding?: string | null;
          id: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          created_at: string | null;
          id: string;
          is_public: boolean | null;
          json: Json | null;
          modified_at: string | null;
          rank: number | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          is_public?: boolean | null;
          json?: Json | null;
          modified_at?: string | null;
          rank?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_public?: boolean | null;
          json?: Json | null;
          modified_at?: string | null;
          rank?: number | null;
        };
        Relationships: [];
      };
      unitgroups: {
        Row: {
          created_at: string | null;
          embedding: string | null;
          id: string;
          json: Json | null;
          json_ordered: Json | null;
          modified_at: string | null;
          review_id: string | null;
          reviews: Json | null;
          rule_verification: boolean | null;
          state_code: number | null;
          team_id: string | null;
          user_id: string | null;
          version: string;
        };
        Insert: {
          created_at?: string | null;
          embedding?: string | null;
          id: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version: string;
        };
        Update: {
          created_at?: string | null;
          embedding?: string | null;
          id?: string;
          json?: Json | null;
          json_ordered?: Json | null;
          modified_at?: string | null;
          review_id?: string | null;
          reviews?: Json | null;
          rule_verification?: boolean | null;
          state_code?: number | null;
          team_id?: string | null;
          user_id?: string | null;
          version?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          contact: Json | null;
          id: string;
          raw_user_meta_data: Json | null;
        };
        Insert: {
          contact?: Json | null;
          id: string;
          raw_user_meta_data?: Json | null;
        };
        Update: {
          contact?: Json | null;
          id?: string;
          raw_user_meta_data?: Json | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      _navicat_temp_stored_proc:
        | {
            Args: {
              data_source?: string;
              extracted_text_weight?: number;
              filter_condition?: string;
              full_text_weight?: number;
              match_count?: number;
              match_threshold?: number;
              page_current?: number;
              page_size?: number;
              query_embedding: string;
              query_text: string;
              rrf_k?: number;
              semantic_weight?: number;
              this_user_id?: string;
            };
            Returns: {
              id: string;
              json: Json;
            }[];
          }
        | {
            Args: {
              data_source?: string;
              extracted_text_weight?: number;
              filter_condition?: string;
              full_text_weight?: number;
              match_count?: number;
              match_threshold?: number;
              page_current?: number;
              page_size?: number;
              query_embedding: string;
              query_text: string;
              rrf_k?: number;
              semantic_weight?: number;
              this_user_id?: string;
            };
            Returns: {
              id: string;
              json: Json;
            }[];
          };
      flows_embedding_ft_input: {
        Args: { proc: Database['public']['Tables']['flows']['Row'] };
        Returns: string;
      };
      flows_embedding_input: {
        Args: { flow: Database['public']['Tables']['flows']['Row'] };
        Returns: string;
      };
      hybrid_search_flows: {
        Args: {
          data_source?: string;
          extracted_text_weight?: number;
          filter_condition?: string;
          full_text_weight?: number;
          match_count?: number;
          match_threshold?: number;
          page_current?: number;
          page_size?: number;
          query_embedding: string;
          query_text: string;
          rrf_k?: number;
          semantic_weight?: number;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          version: string;
        }[];
      };
      hybrid_search_lifecyclemodels: {
        Args: {
          data_source?: string;
          extracted_text_weight?: number;
          filter_condition?: string;
          full_text_weight?: number;
          match_count?: number;
          match_threshold?: number;
          page_current?: number;
          page_size?: number;
          query_embedding: string;
          query_text: string;
          rrf_k?: number;
          semantic_weight?: number;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          version: string;
        }[];
      };
      hybrid_search_processes: {
        Args: {
          data_source?: string;
          extracted_text_weight?: number;
          filter_condition?: string;
          full_text_weight?: number;
          match_count?: number;
          match_threshold?: number;
          page_current?: number;
          page_size?: number;
          query_embedding: string;
          query_text: string;
          rrf_k?: number;
          semantic_weight?: number;
        };
        Returns: {
          id: string;
          json: Json;
          model_id: string;
          modified_at: string;
          version: string;
        }[];
      };
      ilcd_classification_get: {
        Args: {
          category_type: string;
          get_values: string[];
          this_file_name: string;
        };
        Returns: Json[];
      };
      ilcd_flow_categorization_get: {
        Args: { get_values: string[]; this_file_name: string };
        Returns: Json[];
      };
      ilcd_location_get: {
        Args: { get_values: string[]; this_file_name: string };
        Returns: Json[];
      };
      lca_enqueue_job: {
        Args: { p_message: Json; p_queue_name: string };
        Returns: number;
      };
      lifecyclemodels_embedding_ft_input: {
        Args: { proc: Database['public']['Tables']['lifecyclemodels']['Row'] };
        Returns: string;
      };
      lifecyclemodels_embedding_input: {
        Args: { models: Database['public']['Tables']['lifecyclemodels']['Row'] };
        Returns: string;
      };
      pgroonga_search: {
        Args: { query_text: string };
        Returns: {
          id: string;
          json: Json;
          rank: number;
        }[];
      };
      pgroonga_search_contacts: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
          this_user_id?: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_flowproperties: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
          this_user_id?: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_flows_text_v1: {
        Args: {
          data_source?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
        };
        Returns: {
          extracted_text: string;
          id: string;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_flows_v1: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          order_by?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_lifecyclemodels_text_v1: {
        Args: {
          data_source?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
        };
        Returns: {
          extracted_text: string;
          id: string;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_lifecyclemodels_v1: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          order_by?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_processes_text_v1: {
        Args: {
          data_source?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
        };
        Returns: {
          extracted_text: string;
          id: string;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_processes_v1: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          order_by?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
        };
        Returns: {
          id: string;
          json: Json;
          model_id: string;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_sources: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
          this_user_id?: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      pgroonga_search_unitgroups: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          page_current?: number;
          page_size?: number;
          query_text: string;
          this_user_id?: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      policy_is_current_user_in_roles: {
        Args: { p_roles_to_check: string[]; p_team_id: string };
        Returns: boolean;
      };
      policy_is_team_id_used: { Args: { _team_id: string }; Returns: boolean };
      policy_is_team_public: { Args: { _team_id: string }; Returns: boolean };
      policy_roles_delete: {
        Args: { _role: string; _team_id: string; _user_id: string };
        Returns: boolean;
      };
      policy_roles_insert: {
        Args: { _role: string; _team_id: string; _user_id: string };
        Returns: boolean;
      };
      policy_roles_select: {
        Args: { _role: string; _team_id: string };
        Returns: boolean;
      };
      policy_roles_update: {
        Args: { _role: string; _team_id: string; _user_id: string };
        Returns: boolean;
      };
      policy_user_has_team: { Args: { _user_id: string }; Returns: boolean };
      processes_embedding_ft_input: {
        Args: { proc: Database['public']['Tables']['processes']['Row'] };
        Returns: string;
      };
      processes_embedding_input: {
        Args: { proc: Database['public']['Tables']['processes']['Row'] };
        Returns: string;
      };
      semantic_search: {
        Args: {
          match_count?: number;
          match_threshold?: number;
          query_embedding: string;
        };
        Returns: {
          id: string;
          json: Json;
          rank: number;
        }[];
      };
      semantic_search_flows_v1: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          match_count?: number;
          match_threshold?: number;
          query_embedding: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      semantic_search_lifecyclemodels_v1: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          match_count?: number;
          match_threshold?: number;
          query_embedding: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
      semantic_search_processes_v1: {
        Args: {
          data_source?: string;
          filter_condition?: string;
          match_count?: number;
          match_threshold?: number;
          query_embedding: string;
        };
        Returns: {
          id: string;
          json: Json;
          modified_at: string;
          rank: number;
          total_count: number;
          version: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      filtered_row: {
        id: string | null;
        embedding: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
