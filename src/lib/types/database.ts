export type UserRole = 'student' | 'business' | 'admin';
export type AccountStatus = 'pending_approval' | 'approved' | 'rejected' | 'suspended';
export type ProjectStatus = 'draft' | 'pending_approval' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
export type ApplicationStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
export type WorkspaceStatus = 'not_started' | 'in_progress' | 'under_review' | 'completed';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type MilestoneStatus = 'todo' | 'in_progress' | 'submitted' | 'completed';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  user_id: string;
  full_name: string;
  school: string;
  major?: string;
  graduation_year: number;
  skills: string[];
  availability_hours_per_week: number;
  bio: string;
  portfolio_urls: string[];
  github_url?: string;
  linkedin_url?: string;
  avatar_url?: string;
  is_public: boolean;
  completed_projects_count?: number;
  rating_average?: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  user_id: string;
  business_name: string;
  industry: string;
  business_size: string;
  location: string;
  website_url?: string;
  description?: string;
  logo_url?: string;
  contact_person?: string;
  verified_business?: boolean;
  projects_posted_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  due_date?: string;
  completed_at?: string;
}

export interface DeliverableSubmission {
  id: string;
  workspace_id: string;
  title: string;
  notes: string;
  link_url?: string;
  file_name?: string;
  submitted_at: string;
  status: 'pending_review' | 'revision_requested' | 'accepted';
  feedback_notes?: string;
}

export interface ExperienceCertificate {
  id: string;
  student_id: string;
  student_name: string;
  business_id: string;
  business_name: string;
  project_id: string;
  project_title: string;
  category: string;
  skills: string[];
  completion_date: string;
  testimonial: string;
  rating: number;
  verification_code: string;
}

export interface Project {
  id: string;
  business_id: string;
  title: string;
  category:
    | 'web_tech'
    | 'design'
    | 'marketing'
    | 'social_media'
    | 'content'
    | 'data_analytics'
    | 'video_media'
    | 'operations'
    | 'finance'
    | 'research'
    | 'sales'
    | 'other';
  description: string;
  problem_statement?: string;
  deliverables_description?: string;
  skills_required: string[];
  estimated_hours_per_week: number;
  duration_weeks: number;
  perks?: string[];
  status: ProjectStatus;
  applicant_count?: number;
  featured?: boolean;
  created_at: string;
  updated_at: string;
  business?: BusinessProfile;
}

export interface Application {
  id: string;
  project_id: string;
  student_id: string;
  pitch_note: string;
  estimated_days?: number;
  proposed_milestones?: string[];
  relevant_links?: string[];
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  student?: StudentProfile;
  project?: Project;
}

export interface Workspace {
  id: string;
  project_id: string;
  student_id: string;
  business_id: string;
  status: WorkspaceStatus;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  project?: Project;
  student?: StudentProfile;
  business?: BusinessProfile;
  tasks?: WorkspaceTask[];
  milestones?: Milestone[];
  submissions?: DeliverableSubmission[];
  messages?: Message[];
  files?: WorkspaceFile[];
  certificate?: ExperienceCertificate;
}

export interface WorkspaceTask {
  id: string;
  workspace_id: string;
  title: string;
  is_completed: boolean;
  created_by: string;
  created_at: string;
}

export interface WorkspaceFile {
  id: string;
  workspace_id: string;
  uploader_id: string;
  file_name: string;
  file_path: string;
  file_size_bytes: number;
  mime_type?: string;
  created_at: string;
}

export interface Message {
  id: string;
  workspace_id: string;
  sender_id: string;
  content: string;
  is_flagged: boolean;
  created_at: string;
  sender_name?: string;
  sender_role?: UserRole;
  attachment_url?: string;
}

export interface Feedback {
  id: string;
  project_id: string;
  author_id: string;
  recipient_id: string;
  rating: number;
  testimonial?: string;
  is_public_on_profile: boolean;
  created_at: string;
  author_name?: string;
  author_role?: UserRole;
  project_title?: string;
  endorsements?: string[];
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  message_id?: string;
  project_id?: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'application_accepted' | 'application_rejected' | 'feedback_received' | 'message' | 'system';
  title: string;
  message: string;
  project_id?: string;
  workspace_id?: string;
  is_read: boolean;
  created_at: string;
}
