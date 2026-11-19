export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          contact_name: string | null;
          delivery_channel: string;
          delivery_target: string;
          keywords: string[];
          regions: string[];
          min_budget_bgn: number;
          client_notes: string | null;
          plan_status: string;
          frequency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          contact_name?: string;
          delivery_channel?: string;
          delivery_target: string;
          keywords?: string[];
          regions?: string[];
          min_budget_bgn?: number;
          client_notes?: string;
          plan_status?: string;
          frequency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          contact_name?: string;
          delivery_channel?: string;
          delivery_target?: string;
          keywords?: string[];
          regions?: string[];
          min_budget_bgn?: number;
          client_notes?: string;
          plan_status?: string;
          frequency?: string;
          created_at?: string;
        };
      };
      tenders: {
        Row: {
          id: string;
          external_ref_id: string;
          source_url: string;
          title: string;
          contracting_authority: string;
          region: string | null;
          estimated_value_bgn: number | null;
          submission_deadline: string | null;
          raw_extracted_text: string | null;
          content_hash: string | null;
          scraped_at: string;
        };
        Insert: {
          id?: string;
          external_ref_id: string;
          source_url: string;
          title: string;
          contracting_authority: string;
          region?: string;
          estimated_value_bgn?: number;
          submission_deadline?: string;
          raw_extracted_text?: string;
          content_hash?: string;
          scraped_at?: string;
        };
        Update: {
          id?: string;
          external_ref_id?: string;
          source_url?: string;
          title?: string;
          contracting_authority?: string;
          region?: string;
          estimated_value_bgn?: number;
          submission_deadline?: string;
          raw_extracted_text?: string;
          content_hash?: string;
          scraped_at?: string;
        };
      };
      matches_analysis: {
        Row: {
          id: string;
          client_id: string;
          tender_id: string;
          relevance_score: number;
          verdict: string | null;
          summary_json: Json;
          is_included_in_report: boolean;
          report_id: string | null;
          analyzed_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          tender_id: string;
          relevance_score: number;
          verdict?: string;
          summary_json?: Json;
          is_included_in_report?: boolean;
          report_id?: string;
          analyzed_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          tender_id?: string;
          relevance_score?: number;
          verdict?: string;
          summary_json?: Json;
          is_included_in_report?: boolean;
          report_id?: string;
          analyzed_at?: string;
        };
      };
      outbound_reports: {
        Row: {
          id: string;
          client_id: string;
          tenders_count: number;
          delivery_channel: string;
          delivery_status: string;
          sent_at: string;
          client_feedback: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          tenders_count?: number;
          delivery_channel: string;
          delivery_status?: string;
          sent_at?: string;
          client_feedback?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          tenders_count?: number;
          delivery_channel?: string;
          delivery_status?: string;
          sent_at?: string;
          client_feedback?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type MatchSummaryJson = {
  summary_5_bullets: string[];
  key_dates: {
    submission_deadline: string;
    questions_deadline: string;
    execution_duration: string;
  };
  budget: {
    estimated_value_bgn_no_vat: string;
    guarantee_participation: string;
    guarantee_performance: string;
  };
  requirements_for_sme: {
    specific_experience: string;
    financial_requirements: string;
    team_and_equipment: string;
    subcontractors_allowed: string;
  };
  red_flags_and_risks: string[];
  next_action_checklist: string[];
};