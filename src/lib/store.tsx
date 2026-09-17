'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from './supabase/client';
import {
  Profile,
  StudentProfile,
  BusinessProfile,
  Project,
  Application,
  Workspace,
  Feedback,
  Report,
  UserRole,
  ProjectStatus,
  WorkspaceTask,
  Message,
  WorkspaceFile
} from './types/database';
import {
  INITIAL_PROFILES,
  INITIAL_STUDENTS,
  INITIAL_BUSINESSES,
  INITIAL_PROJECTS,
  INITIAL_APPLICATIONS,
  INITIAL_WORKSPACES,
  INITIAL_FEEDBACK,
  INITIAL_REPORTS
} from './mock-data';

interface AppContextType {
  // Current Authenticated User Context
  currentUser: Profile | null;
  currentStudent: StudentProfile | null;
  currentBusiness: BusinessProfile | null;
  switchUser: (userId: string) => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;

  // Collections
  profiles: Profile[];
  students: StudentProfile[];
  businesses: BusinessProfile[];
  projects: Project[];
  applications: Application[];
  workspaces: Workspace[];
  feedbackList: Feedback[];
  reports: Report[];

  // Mutations
  registerStudent: (email: string, fullName: string, school: string, gradYear: number, skills: string[], hours: number, bio: string, portfolioUrls: string[]) => string;
  registerBusiness: (email: string, businessName: string, industry: string, size: string, location: string, description: string, websiteUrl?: string) => string;
  
  createProject: (projectData: Omit<Project, 'id' | 'business_id' | 'status' | 'created_at' | 'updated_at'>) => Project;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  
  applyToProject: (projectId: string, pitchNote: string) => Application;
  updateApplicationStatus: (applicationId: string, status: 'accepted' | 'rejected') => void;
  
  // Workspace Actions
  addWorkspaceTask: (workspaceId: string, title: string) => void;
  toggleWorkspaceTask: (workspaceId: string, taskId: string) => void;
  sendWorkspaceMessage: (workspaceId: string, content: string) => void;
  flagWorkspaceMessage: (messageId: string) => void;
  addWorkspaceFile: (workspaceId: string, fileName: string, fileSize: number) => void;
  updateWorkspaceStatus: (workspaceId: string, status: Workspace['status']) => void;
  
  // Feedback & Reviews
  submitFeedback: (projectId: string, recipientId: string, rating: number, testimonial: string) => void;
  
  // Admin Moderation Actions
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  approveProject: (projectId: string) => void;
  rejectProject: (projectId: string) => void;
  resolveReport: (reportId: string, action: 'resolved' | 'dismissed') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'studentconnect_state_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>(INITIAL_BUSINESSES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(INITIAL_FEEDBACK);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  
  // Default logged-in user (Student: Sarah Chen)
  const [currentUserId, setCurrentUserId] = useState<string>('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profiles) setProfiles(parsed.profiles);
        if (parsed.students) setStudents(parsed.students);
        if (parsed.businesses) setBusinesses(parsed.businesses);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.applications) setApplications(parsed.applications);
        if (parsed.workspaces) setWorkspaces(parsed.workspaces);
        if (parsed.feedbackList) setFeedbackList(parsed.feedbackList);
        if (parsed.reports) setReports(parsed.reports);
        if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
      }
    } catch {
      console.warn('Failed to parse saved state from local storage');
    }
    setIsInitialized(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profiles,
          students,
          businesses,
          projects,
          applications,
          workspaces,
          feedbackList,
          reports,
          currentUserId,
        })
      );
    } catch {
      console.warn('Failed to save state to local storage');
    }
  }, [isInitialized, profiles, students, businesses, projects, applications, workspaces, feedbackList, reports, currentUserId]);

  const currentUser = profiles.find((p) => p.id === currentUserId) || null;
  const currentStudent = students.find((s) => s.user_id === currentUserId) || null;
  const currentBusiness = businesses.find((b) => b.user_id === currentUserId) || null;

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const loginAsRole = (role: UserRole) => {
    const user = profiles.find((p) => p.role === role && p.status === 'approved');
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const logout = () => {
    setCurrentUserId('');
  };

  const registerStudent = (
    email: string,
    fullName: string,
    school: string,
    gradYear: number,
    skills: string[],
    hours: number,
    bio: string,
    portfolioUrls: string[]
  ) => {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b0eebc99-9c0b-4ef8-bb6d-6bb9bd38${Math.floor(Math.random() * 8900 + 1000)}`;

    const newProfile: Profile = {
      id: tempId,
      email,
      role: 'student',
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newStudent: StudentProfile = {
      user_id: tempId,
      full_name: fullName,
      school,
      graduation_year: gradYear,
      skills,
      availability_hours_per_week: hours,
      bio,
      portfolio_urls: portfolioUrls,
      is_public: true,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProfiles((prev) => [...prev, newProfile]);
    setStudents((prev) => [...prev, newStudent]);
    setCurrentUserId(tempId);

    // Save to Supabase with Auth Sign Up
    try {
      const supabase = createClient();
      supabase.auth.signUp({
        email,
        password: 'Password123!',
        options: {
          data: { full_name: fullName, role: 'student' }
        }
      }).then(({ data, error }) => {
        const userId = data?.user?.id || tempId;
        const finalProfile = { ...newProfile, id: userId };
        const finalStudent = { ...newStudent, user_id: userId };

        supabase.from('profiles').upsert([finalProfile]).then(({ error: pErr }) => {
          if (pErr) console.error('Supabase profile insert error:', pErr);
        });

        supabase.from('student_profiles').upsert([{
          user_id: finalStudent.user_id,
          full_name: finalStudent.full_name,
          school: finalStudent.school,
          graduation_year: finalStudent.graduation_year,
          skills: finalStudent.skills,
          availability_hours_per_week: finalStudent.availability_hours_per_week,
          bio: finalStudent.bio,
          portfolio_urls: finalStudent.portfolio_urls,
          avatar_url: finalStudent.avatar_url,
          is_public: finalStudent.is_public
        }]).then(({ error: sErr }) => {
          if (sErr) console.error('Supabase student_profile insert error:', sErr);
        });
      });
    } catch (err) {
      console.warn('Could not sync registration to Supabase:', err);
    }

    return tempId;
  };

  const registerBusiness = (
    email: string,
    businessName: string,
    industry: string,
    size: string,
    location: string,
    description: string,
    websiteUrl?: string
  ) => {
    const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c0eebc99-9c0b-4ef8-bb6d-6bb9bd38${Math.floor(Math.random() * 8900 + 1000)}`;

    const newProfile: Profile = {
      id: tempId,
      email,
      role: 'business',
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newBusiness: BusinessProfile = {
      user_id: tempId,
      business_name: businessName,
      industry,
      business_size: size,
      location,
      description,
      website_url: websiteUrl,
      logo_url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProfiles((prev) => [...prev, newProfile]);
    setBusinesses((prev) => [...prev, newBusiness]);
    setCurrentUserId(tempId);

    // Save to Supabase with Auth Sign Up
    try {
      const supabase = createClient();
      supabase.auth.signUp({
        email,
        password: 'Password123!',
        options: {
          data: { business_name: businessName, role: 'business' }
        }
      }).then(({ data, error }) => {
        const userId = data?.user?.id || tempId;
        const finalProfile = { ...newProfile, id: userId };
        const finalBusiness = { ...newBusiness, user_id: userId };

        supabase.from('profiles').upsert([finalProfile]).then(({ error: pErr }) => {
          if (pErr) console.error('Supabase profile insert error:', pErr);
        });

        supabase.from('business_profiles').upsert([{
          user_id: finalBusiness.user_id,
          business_name: finalBusiness.business_name,
          industry: finalBusiness.industry,
          business_size: finalBusiness.business_size,
          location: finalBusiness.location,
          description: finalBusiness.description,
          website_url: finalBusiness.website_url,
          logo_url: finalBusiness.logo_url
        }]).then(({ error: bErr }) => {
          if (bErr) console.error('Supabase business_profile insert error:', bErr);
        });
      });
    } catch (err) {
      console.warn('Could not sync business registration to Supabase:', err);
    }

    return tempId;
  };

  const createProject = (projectData: Omit<Project, 'id' | 'business_id' | 'status' | 'created_at' | 'updated_at'>) => {
    if (!currentUser || currentUser.role !== 'business') {
      throw new Error('Only approved businesses can post projects');
    }

    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      business_id: currentUser.id,
      status: 'pending_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status, updated_at: new Date().toISOString() } : p))
    );
  };

  const applyToProject = (projectId: string, pitchNote: string) => {
    if (!currentUser || currentUser.role !== 'student') {
      throw new Error('Only students can apply to projects');
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      project_id: projectId,
      student_id: currentUser.id,
      pitch_note: pitchNote,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setApplications((prev) => [...prev, newApp]);
    return newApp;
  };

  const updateApplicationStatus = (applicationId: string, status: 'accepted' | 'rejected') => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status, updated_at: new Date().toISOString() } : a))
    );

    if (status === 'accepted') {
      // Find the project
      const proj = projects.find((p) => p.id === app.project_id);
      if (proj) {
        // Create active Workspace
        const newWorkspace: Workspace = {
          id: `ws-${Date.now()}`,
          project_id: proj.id,
          student_id: app.student_id,
          business_id: proj.business_id,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          tasks: [
            {
              id: `task-${Date.now()}-1`,
              workspace_id: `ws-${Date.now()}`,
              title: 'Kickoff: Align on deliverables & timeline',
              is_completed: false,
              created_by: proj.business_id,
              created_at: new Date().toISOString(),
            },
            {
              id: `task-${Date.now()}-2`,
              workspace_id: `ws-${Date.now()}`,
              title: 'Draft initial concept / proposal',
              is_completed: false,
              created_by: app.student_id,
              created_at: new Date().toISOString(),
            },
            {
              id: `task-${Date.now()}-3`,
              workspace_id: `ws-${Date.now()}`,
              title: 'Deliver final files & handoff',
              is_completed: false,
              created_by: app.student_id,
              created_at: new Date().toISOString(),
            }
          ],
          messages: [
            {
              id: `msg-${Date.now()}`,
              workspace_id: `ws-${Date.now()}`,
              sender_id: proj.business_id,
              sender_name: currentBusiness?.business_name || 'Business Partner',
              sender_role: 'business',
              content: `Hi! Welcome to the project workspace. Excited to kick off this project with you!`,
              is_flagged: false,
              created_at: new Date().toISOString(),
            }
          ],
          files: []
        };

        setWorkspaces((prev) => [newWorkspace, ...prev]);
        updateProjectStatus(proj.id, 'in_progress');
      }
    }
  };

  const addWorkspaceTask = (workspaceId: string, title: string) => {
    const newTask: WorkspaceTask = {
      id: `task-${Date.now()}`,
      workspace_id: workspaceId,
      title,
      is_completed: false,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
    };

    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === workspaceId ? { ...ws, tasks: [...(ws.tasks || []), newTask] } : ws))
    );
  };

  const toggleWorkspaceTask = (workspaceId: string, taskId: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        return {
          ...ws,
          tasks: (ws.tasks || []).map((t) => (t.id === taskId ? { ...t, is_completed: !t.is_completed } : t)),
        };
      })
    );
  };

  const sendWorkspaceMessage = (workspaceId: string, content: string) => {
    const senderName =
      currentUser?.role === 'student'
        ? currentStudent?.full_name || 'Student'
        : currentBusiness?.business_name || 'Business';

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      workspace_id: workspaceId,
      sender_id: currentUserId,
      sender_name: senderName,
      sender_role: currentUser?.role,
      content,
      is_flagged: false,
      created_at: new Date().toISOString(),
    };

    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === workspaceId ? { ...ws, messages: [...(ws.messages || []), newMsg] } : ws))
    );
  };

  const flagWorkspaceMessage = (messageId: string) => {
    setWorkspaces((prev) =>
      prev.map((ws) => ({
        ...ws,
        messages: (ws.messages || []).map((m) => (m.id === messageId ? { ...m, is_flagged: true } : m)),
      }))
    );

    // Create moderation report
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporter_id: currentUserId,
      reported_user_id: 'unknown',
      message_id: messageId,
      reason: 'Flagged inappropriate or unsafe workspace message.',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const addWorkspaceFile = (workspaceId: string, fileName: string, fileSize: number) => {
    const newFile: WorkspaceFile = {
      id: `file-${Date.now()}`,
      workspace_id: workspaceId,
      uploader_id: currentUserId,
      file_name: fileName,
      file_path: `/mock-files/${fileName}`,
      file_size_bytes: fileSize,
      created_at: new Date().toISOString(),
    };

    setWorkspaces((prev) =>
      prev.map((ws) => (ws.id === workspaceId ? { ...ws, files: [...(ws.files || []), newFile] } : ws))
    );
  };

  const updateWorkspaceStatus = (workspaceId: string, status: Workspace['status']) => {
    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        const updated = { ...ws, status, updated_at: new Date().toISOString() };
        if (status === 'completed') {
          updated.completed_at = new Date().toISOString();
          updateProjectStatus(ws.project_id, 'completed');
        }
        return updated;
      })
    );
  };

  const submitFeedback = (projectId: string, recipientId: string, rating: number, testimonial: string) => {
    const authorName =
      currentUser?.role === 'student'
        ? currentStudent?.full_name || 'Student'
        : currentBusiness?.business_name || 'Business';

    const proj = projects.find((p) => p.id === projectId);

    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      project_id: projectId,
      author_id: currentUserId,
      recipient_id: recipientId,
      rating,
      testimonial,
      is_public_on_profile: true,
      created_at: new Date().toISOString(),
      author_name: authorName,
      author_role: currentUser?.role,
      project_title: proj?.title || 'Project Engagement',
    };

    setFeedbackList((prev) => [newFeedback, ...prev]);
  };

  const approveUser = (userId: string) => {
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, status: 'approved' } : p)));
  };

  const rejectUser = (userId: string) => {
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, status: 'rejected' } : p)));
  };

  const approveProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'open' } : p)));
  };

  const rejectProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'cancelled' } : p)));
  };

  const resolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: action } : r)));
  };

  // Hydrate projects and workspaces with related entity objects for UI convenience
  const hydratedProjects = projects.map((p) => ({
    ...p,
    business: businesses.find((b) => b.user_id === p.business_id),
  }));

  const hydratedApplications = applications.map((a) => ({
    ...a,
    student: students.find((s) => s.user_id === a.student_id),
    project: hydratedProjects.find((p) => p.id === a.project_id),
  }));

  const hydratedWorkspaces = workspaces.map((ws) => ({
    ...ws,
    project: hydratedProjects.find((p) => p.id === ws.project_id),
    student: students.find((s) => s.user_id === ws.student_id),
    business: businesses.find((b) => b.user_id === ws.business_id),
  }));

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentStudent,
        currentBusiness,
        switchUser,
        loginAsRole,
        logout,
        profiles,
        students,
        businesses,
        projects: hydratedProjects,
        applications: hydratedApplications,
        workspaces: hydratedWorkspaces,
        feedbackList,
        reports,
        registerStudent,
        registerBusiness,
        createProject,
        updateProjectStatus,
        applyToProject,
        updateApplicationStatus,
        addWorkspaceTask,
        toggleWorkspaceTask,
        sendWorkspaceMessage,
        flagWorkspaceMessage,
        addWorkspaceFile,
        updateWorkspaceStatus,
        submitFeedback,
        approveUser,
        rejectUser,
        approveProject,
        rejectProject,
        resolveReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
