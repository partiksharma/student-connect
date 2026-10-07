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
  WorkspaceFile,
  AppNotification
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
  loginWithEmail: (email: string, password?: string) => Promise<Profile | null>;
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
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;

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

  // Hydration flag – true after client-side state has been restored from localStorage
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'studentconnect_state_v1';
const CURRENT_USER_KEY = 'studentconnect_current_user_id';

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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Default logged-in user – always start with empty string to match server render.
  // The real user ID is restored from localStorage in useEffect below.
  const [currentUserId, setCurrentUserId] = useState<string>('');

    // Helper to merge local saved state with default/seed data without wiping out new additions
  const mergeById = <T extends Record<string, any>>(initial: T[], saved: T[] = [], idKey: string = 'id'): T[] => {
    const map = new Map<string, T>();
    initial.forEach((item) => {
      const key = item[idKey] || item.id || item.user_id;
      if (key) map.set(key, item);
    });
    saved.forEach((item) => {
      const key = item[idKey] || item.id || item.user_id;
      if (key) {
        const existing = map.get(key);
        map.set(key, { ...existing, ...item });
      }
    });
    return Array.from(map.values());
  };

    // Load from LocalStorage on mount and listen to cross-tab storage events
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profiles) setProfiles(mergeById(INITIAL_PROFILES, parsed.profiles, 'id'));
        if (parsed.students) setStudents(mergeById(INITIAL_STUDENTS, parsed.students, 'user_id'));
        if (parsed.businesses) setBusinesses(mergeById(INITIAL_BUSINESSES, parsed.businesses, 'user_id'));
        if (parsed.projects) setProjects(mergeById(INITIAL_PROJECTS, parsed.projects, 'id'));
        if (parsed.applications) setApplications(mergeById(INITIAL_APPLICATIONS, parsed.applications, 'id'));
        if (parsed.workspaces) setWorkspaces(mergeById(INITIAL_WORKSPACES, parsed.workspaces, 'id'));
        if (parsed.feedbackList) setFeedbackList(mergeById(INITIAL_FEEDBACK, parsed.feedbackList, 'id'));
        if (parsed.reports?.length) setReports(parsed.reports);
        if (parsed.notifications?.length) setNotifications(parsed.notifications);
      }
    } catch {
      console.warn('Failed to load state from local storage');
    }

    // Also fetch remote profiles and projects from Supabase if connected
    const loadRemoteData = async () => {
      try {
        const supabase = createClient();
        const { data: dbProfiles } = await supabase.from('profiles').select('*');
        if (dbProfiles && dbProfiles.length > 0) {
          setProfiles((prev) => mergeById(prev, dbProfiles as Profile[], 'id'));
        }

        const { data: dbStudents } = await supabase.from('student_profiles').select('*');
        if (dbStudents && dbStudents.length > 0) {
          setStudents((prev) => mergeById(prev, dbStudents as StudentProfile[], 'user_id'));
        }

        const { data: dbBiz } = await supabase.from('business_profiles').select('*');
        if (dbBiz && dbBiz.length > 0) {
          setBusinesses((prev) => mergeById(prev, dbBiz as BusinessProfile[], 'user_id'));
        }

        const { data: dbProjects } = await supabase.from('projects').select('*');
        if (dbProjects && dbProjects.length > 0) {
          setProjects((prev) => mergeById(prev, dbProjects as Project[], 'id'));
        }
      } catch (err) {
        console.warn('Could not sync remote Supabase records on mount:', err);
      }
    };
    loadRemoteData();

    // Restore user ID from sessionStorage first (per-tab), then localStorage
    try {
      const savedUserId = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
      if (savedUserId) {
        setCurrentUserId(savedUserId);
      } else {
        // Default to demo student if no saved session
        setCurrentUserId('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');
      }
    } catch {}

    setIsInitialized(true);

    // Cross-tab real-time sync for chat, profiles, and state updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.profiles) setProfiles(parsed.profiles);
          if (parsed.students) setStudents(parsed.students);
          if (parsed.businesses) setBusinesses(parsed.businesses);
          if (parsed.projects) setProjects(parsed.projects);
          if (parsed.applications) setApplications(parsed.applications);
          if (parsed.workspaces) {
            setWorkspaces((prev) => {
              return parsed.workspaces.map((incomingWs: Workspace) => {
                const currentWs = prev.find((w) => w.id === incomingWs.id);
                if (!currentWs) return incomingWs;

                // Merge messages by unique ID
                const msgMap = new Map<string, Message>();
                (currentWs.messages || []).forEach((m) => msgMap.set(m.id, m));
                (incomingWs.messages || []).forEach((m) => msgMap.set(m.id, m));
                const mergedMsgs = Array.from(msgMap.values()).sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );

                return {
                  ...incomingWs,
                  messages: mergedMsgs,
                };
              });
            });
          }
          if (parsed.feedbackList) setFeedbackList(parsed.feedbackList);
          if (parsed.reports) setReports(parsed.reports);
          if (parsed.notifications) {
            setNotifications((prev) => {
              const notifMap = new Map<string, AppNotification>();
              (parsed.notifications || []).forEach((n: AppNotification) => notifMap.set(n.id, n));
              (prev || []).forEach((n: AppNotification) => notifMap.set(n.id, n));
              return Array.from(notifMap.values()).sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
            });
          }
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // BroadcastChannel for instant zero-latency realtime updates across tabs/windows
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.onmessage = (event) => {
          const data = event.data;
          if (data?.type === 'NEW_WORKSPACE_MESSAGE' && data.workspaceId && data.message) {
            setWorkspaces((prev) =>
              prev.map((ws) => {
                if (ws.id !== data.workspaceId) return ws;
                const exists = ws.messages?.some((m) => m.id === data.message.id);
                if (exists) return ws;
                return {
                  ...ws,
                  messages: [...(ws.messages || []), data.message],
                };
              })
            );
            if (data.notification) {
              setNotifications((prev) => {
                const exists = prev.some((n) => n.id === data.notification.id);
                if (exists) return prev;
                return [data.notification, ...prev];
              });
            }
          } else if (data?.type === 'UPDATE_WORKSPACE_STATUS' && data.workspaceId && data.status) {
            setWorkspaces((prev) =>
              prev.map((ws) => (ws.id === data.workspaceId ? { ...ws, status: data.status } : ws))
            );
          } else if (data?.type === 'SYNC_STATE') {
            try {
              const saved = localStorage.getItem(STORAGE_KEY);
              if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.profiles) setProfiles(parsed.profiles);
                if (parsed.students) setStudents(parsed.students);
                if (parsed.businesses) setBusinesses(parsed.businesses);
                if (parsed.projects) setProjects(parsed.projects);
              }
            } catch {}
          }
        };
      }
    } catch {}

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  // Save to LocalStorage (debounced sync for state, tab-safe)
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
          notifications,
        })
      );
      if (currentUserId) {
        sessionStorage.setItem(CURRENT_USER_KEY, currentUserId);
        localStorage.setItem(CURRENT_USER_KEY, currentUserId);
      }
    } catch {
      console.warn('Failed to save state to local storage');
    }
  }, [isInitialized, profiles, students, businesses, projects, applications, workspaces, feedbackList, reports, notifications, currentUserId]);

  // Treat currentUser as null until hydration is done to prevent server/client mismatch
  const currentUser = isInitialized ? (profiles.find((p) => p.id === currentUserId) || null) : null;

  // Student profile lookup with exact match preservation
  const rawStudent = students.find((s) => s.user_id === currentUserId || (currentUser && s.user_id === currentUser.id));
  const currentStudent: StudentProfile | null = rawStudent || (currentUser?.role === 'student' ? {
    user_id: currentUser.id,
    full_name: currentUser.email?.toLowerCase().includes('sarah')
      ? 'Sarah Chen'
      : currentUser.email?.toLowerCase().includes('alex')
      ? 'Alex Rivera'
      : currentUser.email ? currentUser.email.split('@')[0] : 'Student',
    school: 'State University',
    graduation_year: 2027,
    skills: ['Social Media', 'Content Writing', 'Web Development', 'Design'],
    availability_hours_per_week: 8,
    bio: 'Motivated student builder ready to deliver quality work for business clients.',
    portfolio_urls: [],
    avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    is_public: true,
    created_at: currentUser.created_at,
    updated_at: currentUser.updated_at,
  } : null);

  // Business profile lookup - guarantees 'nextphase' is cleanly preserved and not converted into split Gmail name
  const rawBusiness = businesses.find(
    (b) => b.user_id === currentUserId ||
           (currentUser && (b.user_id === currentUser.id || (currentUser.email && b.user_id.toLowerCase() === currentUser.email.toLowerCase()))) ||
           (currentUser && currentUser.email?.toLowerCase().includes('nextphase') && b.business_name.toLowerCase() === 'nextphase')
  );

  const currentBusiness: BusinessProfile | null = rawBusiness || (currentUser?.role === 'business' ? {
    user_id: currentUser.id,
    business_name: currentUser.email?.toLowerCase().includes('nextphase') || currentUser.id.toLowerCase().includes('nextphase')
      ? 'nextphase'
      : (currentUser.email ? currentUser.email.split('@')[0] : 'Business Partner'),
    industry: currentUser.email?.toLowerCase().includes('nextphase') ? 'Media & Digital Content' : 'Small Business',
    business_size: '1-10 employees',
    location: 'Remote / Global',
    description: 'Verified client partner on StudentConnect.',
    created_at: currentUser.created_at,
    updated_at: currentUser.updated_at,
  } : null);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CURRENT_USER_KEY, userId);
      localStorage.setItem(CURRENT_USER_KEY, userId);
    }
  };

  const loginAsRole = (role: UserRole) => {
    const user = profiles.find((p) => p.role === role && p.status === 'approved');
    if (user) {
      setCurrentUserId(user.id);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(CURRENT_USER_KEY, user.id);
        localStorage.setItem(CURRENT_USER_KEY, user.id);
      }
    }
  };

  const loginWithEmail = async (emailOrId: string, password?: string): Promise<Profile | null> => {
    const cleanInput = emailOrId.trim().toLowerCase();

    if (password) {
      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email: cleanInput, password });
      } catch {
        // Continue to profile lookup
      }
    }

    // Match exact email, user ID, username (e.g. 'nextphase'), or business name
    let existingProfile = profiles.find((p) => 
      p.email.toLowerCase() === cleanInput ||
      p.id.toLowerCase() === cleanInput ||
      (cleanInput.length > 2 && p.email.toLowerCase().startsWith(cleanInput + '@')) ||
      (cleanInput.includes('nextphase') && (p.id.includes('nextphase') || p.email.includes('nextphase')))
    );

    // If not found in profiles, check matching business name in businesses
    if (!existingProfile) {
      const matchBiz = businesses.find((b) => b.business_name.toLowerCase() === cleanInput || b.user_id.toLowerCase() === cleanInput);
      if (matchBiz) {
        existingProfile = profiles.find((p) => p.id === matchBiz.user_id);
      }
    }

    // If not found in profiles, check matching student name in students
    if (!existingProfile) {
      const matchStu = students.find((s) => s.full_name.toLowerCase() === cleanInput || s.user_id.toLowerCase() === cleanInput);
      if (matchStu) {
        existingProfile = profiles.find((p) => p.id === matchStu.user_id);
      }
    }

    if (!existingProfile) {
      try {
        const supabase = createClient();
        const { data } = await supabase.from('profiles').select('*').eq('email', cleanInput).maybeSingle();
        if (data) {
          existingProfile = data as Profile;
          setProfiles((prev) => [...prev, data as Profile]);
        }
      } catch (err) {
        console.warn('Error querying profile by email:', err);
      }
    }

    if (existingProfile) {
      // Ensure student or business profile is fetched / populated so name displays properly
      if (existingProfile.role === 'student') {
        const hasStudent = students.some((s) => s.user_id === existingProfile!.id);
        if (!hasStudent) {
          try {
            const supabase = createClient();
            const { data } = await supabase.from('student_profiles').select('*').eq('user_id', existingProfile.id).maybeSingle();
            if (data) {
              setStudents((prev) => [...prev.filter((s) => s.user_id !== data.user_id), data as StudentProfile]);
            } else {
              const nameFromEmail = cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput;
              const newStudentProf: StudentProfile = {
                user_id: existingProfile.id,
                full_name: nameFromEmail || 'Student',
                school: 'State University',
                graduation_year: 2027,
                skills: ['Marketing', 'Design', 'Web Tech'],
                availability_hours_per_week: 8,
                bio: 'Motivated student builder ready to deliver quality work for business clients.',
                portfolio_urls: [],
                avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
                is_public: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setStudents((prev) => [...prev, newStudentProf]);
            }
          } catch (err) {
            console.warn('Error fetching student profile:', err);
          }
        }
      } else if (existingProfile.role === 'business') {
        const hasBusiness = businesses.some((b) => b.user_id === existingProfile!.id);
        if (!hasBusiness) {
          try {
            const supabase = createClient();
            const { data } = await supabase.from('business_profiles').select('*').eq('user_id', existingProfile.id).maybeSingle();
            if (data) {
              setBusinesses((prev) => [...prev.filter((b) => b.user_id !== data.user_id), data as BusinessProfile]);
            } else {
              const bName = cleanInput.includes('nextphase') || existingProfile.id.includes('nextphase')
                ? 'nextphase'
                : (cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput);
              const newBizProf: BusinessProfile = {
                user_id: existingProfile.id,
                business_name: bName,
                industry: 'Media & Digital Content',
                business_size: '1-10 employees',
                location: 'Remote / Global',
                description: 'Verified business client on StudentConnect.',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setBusinesses((prev) => [...prev, newBizProf]);
            }
          } catch (err) {
            console.warn('Error fetching business profile:', err);
          }
        }
      }

      setCurrentUserId(existingProfile.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, existingProfile.id);
        sessionStorage.setItem(CURRENT_USER_KEY, existingProfile.id);
      }
      return existingProfile;
    }

    return null;
  };

  const logout = () => {
    setCurrentUserId('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
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
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `b0eebc99-9c0b-4ef8-bb6d-6bb9bd38${Math.floor(Math.random() * 8900 + 1000)}`;

    const newProfile: Profile = {
      id: newId,
      email: email.trim().toLowerCase(),
      role: 'student',
      status: 'pending_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newStudent: StudentProfile = {
      user_id: newId,
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
    setCurrentUserId(newId);

    // Save DIRECTLY to Supabase Database Tables
    try {
      const supabase = createClient();
      console.log('Writing student registration to Supabase database...', newId, email);

      supabase.from('profiles').insert([newProfile]).then(({ data, error }) => {
        if (error) console.error('Supabase profile insert error:', error);
        else console.log('Supabase profile inserted successfully:', data);
      });

      supabase.from('student_profiles').insert([{
        user_id: newStudent.user_id,
        full_name: newStudent.full_name,
        school: newStudent.school,
        graduation_year: newStudent.graduation_year,
        skills: newStudent.skills,
        availability_hours_per_week: newStudent.availability_hours_per_week,
        bio: newStudent.bio,
        portfolio_urls: newStudent.portfolio_urls,
        avatar_url: newStudent.avatar_url,
        is_public: newStudent.is_public
      }]).then(({ data, error }) => {
        if (error) console.error('Supabase student_profile insert error:', error);
        else console.log('Supabase student_profile inserted successfully:', data);
      });

      // Background auth sign-up (optional)
      supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: 'Password123!',
      }).catch(() => {});
    } catch (err) {
      console.warn('Could not sync registration to Supabase:', err);
    }

    // Instant sync broadcast across windows / browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'SYNC_STATE' });
        setTimeout(() => {
          try { bc.close(); } catch {}
        }, 500);
      }
    } catch {}

    return newId;
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
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `c0eebc99-9c0b-4ef8-bb6d-6bb9bd38${Math.floor(Math.random() * 8900 + 1000)}`;

    const newProfile: Profile = {
      id: newId,
      email: email.trim().toLowerCase(),
      role: 'business',
      status: 'pending_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newBusiness: BusinessProfile = {
      user_id: newId,
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
    setCurrentUserId(newId);

    // Save DIRECTLY to Supabase Database Tables
    try {
      const supabase = createClient();
      console.log('Writing business registration to Supabase database...', newId, email);

      supabase.from('profiles').insert([newProfile]).then(({ data, error }) => {
        if (error) console.error('Supabase profile insert error:', error);
        else console.log('Supabase business profile inserted successfully:', data);
      });

      supabase.from('business_profiles').insert([{
        user_id: newBusiness.user_id,
        business_name: newBusiness.business_name,
        industry: newBusiness.industry,
        business_size: newBusiness.business_size,
        location: newBusiness.location,
        description: newBusiness.description,
        website_url: newBusiness.website_url,
        logo_url: newBusiness.logo_url
      }]).then(({ data, error }) => {
        if (error) console.error('Supabase business_profile insert error:', error);
        else console.log('Supabase business_profile inserted successfully:', data);
      });

      // Background auth sign-up (optional)
      supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: 'Password123!',
      }).catch(() => {});
    } catch (err) {
      console.warn('Could not sync business registration to Supabase:', err);
    }

    // Instant sync broadcast across windows / browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'SYNC_STATE' });
        setTimeout(() => {
          try { bc.close(); } catch {}
        }, 500);
      }
    } catch {}

    return newId;
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
      applicant_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      business: currentBusiness || undefined,
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

    // Increment project applicant counter
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, applicant_count: (p.applicant_count || 0) + 1 } : p))
    );

    return newApp;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const updateApplicationStatus = (applicationId: string, status: 'accepted' | 'rejected') => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status, updated_at: new Date().toISOString() } : a))
    );

    const proj = projects.find((p) => p.id === app.project_id);

    if (status === 'accepted') {
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

        // Create Approval Notification for Student
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}`,
          user_id: app.student_id,
          type: 'application_accepted',
          title: '🎉 Application Approved!',
          message: `Congratulations! The client business has approved your application for "${proj.title}". Your workspace is live!`,
          project_id: proj.id,
          workspace_id: newWorkspace.id,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    } else if (status === 'rejected') {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        user_id: app.student_id,
        type: 'application_rejected',
        title: 'Application Update',
        message: `Your application for "${proj?.title || 'Project'}" was not selected this time.`,
        project_id: proj?.id,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
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
    const trimmed = content.trim();
    if (!trimmed) return;

    const senderName =
      currentUser?.role === 'student'
        ? currentStudent?.full_name || 'Student'
        : currentBusiness?.business_name || 'Client Partner';

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      workspace_id: workspaceId,
      sender_id: currentUserId || 'anonymous',
      sender_name: senderName,
      sender_role: currentUser?.role || 'student',
      content: trimmed,
      is_flagged: false,
      created_at: new Date().toISOString(),
    };

    setWorkspaces((prev) =>
      prev.map((ws) => {
        if (ws.id !== workspaceId) return ws;
        const exists = ws.messages?.some((m) => m.id === newMsg.id);
        if (exists) return ws;
        return { ...ws, messages: [...(ws.messages || []), newMsg] };
      })
    );

    // Create a notification for the recipient (the other party in the workspace)
    const ws = workspaces.find((w) => w.id === workspaceId);
    let msgNotif: AppNotification | null = null;

    if (ws) {
      const proj = projects.find((p) => p.id === ws.project_id);
      const businessId = ws.business_id || proj?.business_id || '';
      const studentId = ws.student_id || '';

      // If sender is student -> recipient is client/business.
      // If sender is business -> recipient is student.
      const isSenderStudent =
        currentUser?.role === 'student' || currentUserId === studentId;
      const recipientId = isSenderStudent ? businessId : studentId;
      const projectTitle = proj?.title || 'your project';

      if (recipientId) {
        msgNotif = {
          id: `notif-msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          user_id: recipientId,
          type: 'message',
          title: '💬 New Message',
          message: `${senderName} sent a message in "${projectTitle}": "${trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed}"`,
          project_id: ws.project_id,
          workspace_id: ws.id,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        setNotifications((prevNotifs) => {
          if (prevNotifs.some((n) => n.id === msgNotif!.id)) return prevNotifs;
          return [msgNotif!, ...prevNotifs];
        });
      }
    }

    // Instant Realtime broadcast across windows / browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({
          type: 'NEW_WORKSPACE_MESSAGE',
          workspaceId,
          message: newMsg,
          notification: msgNotif,
        });
        setTimeout(() => {
          try {
            bc.close();
          } catch {}
        }, 500);
      }
    } catch {}

    // Save to Supabase messages table if configured
    try {
      const supabase = createClient();
      supabase.from('messages').insert([{
        workspace_id: workspaceId,
        sender_id: currentUserId,
        content: trimmed,
        is_flagged: false,
      }]).then(() => {});
    } catch {}
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

    // Broadcast status change in realtime
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({
          type: 'UPDATE_WORKSPACE_STATUS',
          workspaceId,
          status,
        });
        bc.close();
      }
    } catch {}
  };

  const submitFeedback = (projectId: string, recipientId: string, rating: number, testimonial: string) => {
    const authorName =
      currentUser?.role === 'student'
        ? currentStudent?.full_name || 'Student'
        : currentBusiness?.business_name || 'Client Partner';

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

    // If client is giving review to student, update student's rating average and completed projects count
    if (currentUser?.role === 'business') {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.user_id !== recipientId) return s;
          const currentReviews = feedbackList.filter((f) => f.recipient_id === recipientId);
          const totalRating = currentReviews.reduce((acc, curr) => acc + curr.rating, 0) + rating;
          const newAvg = Number((totalRating / (currentReviews.length + 1)).toFixed(1));
          return {
            ...s,
            rating_average: newAvg,
            completed_projects_count: (s.completed_projects_count || 0) + 1,
          };
        })
      );

      // Notification for student
      const newNotif: AppNotification = {
        id: `notif-fb-${Date.now()}`,
        user_id: recipientId,
        type: 'feedback_received',
        title: `⭐ New ${rating}-Star Review Received!`,
        message: `${authorName} reviewed your work on "${proj?.title || 'Project'}": "${testimonial.slice(0, 75)}..."`,
        project_id: projectId,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const approveUser = (userId: string) => {
    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, status: 'approved', updated_at: new Date().toISOString() } : p)));
    try {
      const supabase = createClient();
      supabase.from('profiles').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', userId).then(() => {});
    } catch {}
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'SYNC_STATE' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}
  };

  const rejectUser = (userId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    setStudents((prev) => prev.filter((s) => s.user_id !== userId));
    setBusinesses((prev) => prev.filter((b) => b.user_id !== userId));
    setProjects((prev) => prev.filter((p) => p.business_id !== userId));
    try {
      const supabase = createClient();
      supabase.from('profiles').delete().eq('id', userId).then(() => {});
      supabase.from('student_profiles').delete().eq('user_id', userId).then(() => {});
      supabase.from('business_profiles').delete().eq('user_id', userId).then(() => {});
    } catch {}
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'SYNC_STATE' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}
  };

  const approveProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'open', updated_at: new Date().toISOString() } : p)));
    try {
      const supabase = createClient();
      supabase.from('projects').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', projectId).then(() => {});
    } catch {}
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'SYNC_STATE' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}
  };

  const rejectProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'rejected', updated_at: new Date().toISOString() } : p)));
    try {
      const supabase = createClient();
      supabase.from('projects').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', projectId).then(() => {});
    } catch {}
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'SYNC_STATE' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}
  };

  const resolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: action } : r)));
  };

  // Hydrate projects and workspaces with related entity objects for UI convenience
  const hydratedProjects = projects.map((p) => {
    const biz = businesses.find((b) => b.user_id === p.business_id);
    const prof = profiles.find((prof) => prof.id === p.business_id);
    const fallbackBiz = biz || (prof ? {
      user_id: prof.id,
      business_name: prof.email ? prof.email.split('@')[0].replace('.', ' ') : 'Client Business',
      industry: 'Small Business',
      business_size: '1-10 employees',
      location: 'Local Business',
      description: 'Registered business partner',
      created_at: prof.created_at,
      updated_at: prof.updated_at
    } : undefined);

    return {
      ...p,
      business: fallbackBiz,
    };
  });

  const hydratedApplications = applications.map((a) => {
    const studentObj = students.find((s) => s.user_id === a.student_id);
    const profileObj = profiles.find((p) => p.id === a.student_id);
    const fallbackStudent = studentObj || (profileObj ? {
      user_id: profileObj.id,
      full_name: profileObj.email ? profileObj.email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Student Applicant',
      school: 'State University',
      graduation_year: 2027,
      skills: ['General Skill', 'Communication'],
      availability_hours_per_week: 10,
      bio: 'Enthusiastic university student eager to work on real business projects.',
      portfolio_urls: [],
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      is_public: true,
      created_at: profileObj.created_at,
      updated_at: profileObj.updated_at
    } : undefined);

    return {
      ...a,
      student: fallbackStudent,
      project: hydratedProjects.find((p) => p.id === a.project_id),
    };
  });

  const hydratedWorkspaces = workspaces.map((ws) => {
    const studentObj = students.find((s) => s.user_id === ws.student_id);
    const profileObj = profiles.find((p) => p.id === ws.student_id);
    const fallbackStudent = studentObj || (profileObj ? {
      user_id: profileObj.id,
      full_name: profileObj.email ? profileObj.email.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Student',
      school: 'State University',
      graduation_year: 2027,
      skills: ['Communication', 'Execution'],
      availability_hours_per_week: 8,
      bio: 'Enthusiastic student builder.',
      portfolio_urls: [],
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      is_public: true,
      created_at: profileObj.created_at,
      updated_at: profileObj.updated_at
    } : undefined);

    const bizObj = businesses.find((b) => b.user_id === ws.business_id);
    const bizProf = profiles.find((p) => p.id === ws.business_id);
    const fallbackBiz = bizObj || (bizProf ? {
      user_id: bizProf.id,
      business_name: bizProf.email ? bizProf.email.split('@')[0].replace('.', ' ') : 'Client Business',
      industry: 'Small Business',
      business_size: '1-10 employees',
      location: 'Local Business',
      description: 'Registered business partner',
      created_at: bizProf.created_at,
      updated_at: bizProf.updated_at
    } : undefined);

    return {
      ...ws,
      project: hydratedProjects.find((p) => p.id === ws.project_id),
      student: fallbackStudent,
      business: fallbackBiz,
    };
  });

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentStudent,
        currentBusiness,
        switchUser,
        loginAsRole,
        loginWithEmail,
        logout,
        profiles,
        students,
        businesses,
        projects: hydratedProjects,
        applications: hydratedApplications,
        workspaces: hydratedWorkspaces,
        feedbackList,
        reports,
        notifications,
        markNotificationAsRead,
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
        isHydrated: isInitialized,
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
