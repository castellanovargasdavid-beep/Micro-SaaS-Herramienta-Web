export type PlanType = "free" | "pro" | "lifetime";
export type BriefNiche = "web_design" | "copywriting" | "branding" | "video";
export type BriefStatus = "draft" | "published" | "archived";
export type SubmissionStatus = "pending" | "processed" | "archived";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired";
export type SubscriptionPlan = "pro_monthly" | "lifetime";

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "email"
  | "url";

export interface BriefQuestion {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface AiSummary {
  objective: string;
  deliverables: string[];
  tone: string;
  deadline: string | null;
  assets_needed: string[];
  target_audience?: string;
  budget_notes?: string;
  key_risks?: string[];
  executive_summary: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          brand_name: string | null;
          brand_color: string | null;
          brand_logo_url: string | null;
          plan: PlanType;
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      brief_templates: {
        Row: {
          id: string;
          slug: string;
          name: string;
          niche: BriefNiche;
          description: string | null;
          icon: string | null;
          questions: BriefQuestion[];
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["brief_templates"]["Row"]
        > & { slug: string; name: string; niche: BriefNiche };
        Update: Partial<Database["public"]["Tables"]["brief_templates"]["Row"]>;
        Relationships: [];
      };
      briefs: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          title: string;
          niche: BriefNiche;
          status: BriefStatus;
          client_name: string | null;
          intro_message: string | null;
          questions: BriefQuestion[];
          brand_color: string | null;
          brand_logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["briefs"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["briefs"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "briefs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "briefs_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "brief_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      submissions: {
        Row: {
          id: string;
          brief_id: string;
          client_name: string | null;
          client_email: string | null;
          answers: Record<string, string>;
          status: SubmissionStatus;
          ai_summary: AiSummary | null;
          ai_summary_markdown: string | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["submissions"]["Row"]> & {
          brief_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["submissions"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "submissions_brief_id_fkey";
            columns: ["brief_id"];
            isOneToOne: false;
            referencedRelation: "briefs";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: SubscriptionPlan;
          status: SubscriptionStatus;
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          user_id: string;
          plan: SubscriptionPlan;
          stripe_customer_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      brief_public: {
        Row: {
          id: string;
          title: string;
          niche: BriefNiche;
          client_name: string | null;
          intro_message: string | null;
          questions: BriefQuestion[];
          brand_color: string | null;
          brand_logo_url: string | null;
          status: BriefStatus;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type BriefTemplate = Database["public"]["Tables"]["brief_templates"]["Row"];
export type Brief = Database["public"]["Tables"]["briefs"]["Row"];
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type BriefPublic = Database["public"]["Views"]["brief_public"]["Row"];
