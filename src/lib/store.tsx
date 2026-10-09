'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
import { generateUUID } from './utils';
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
  refreshData: () => Promise<void>;

  // Mutations
  registerStudent: (
    email: string,
    fullName: string,
    school: string,
    gradYear: number,
    skills: string[],
    hours: number,
    bio: string,
    portfolioUrls: string[],
    password?: string
  ) => Promise<string>;
  registerBusiness: (
    email: string,
    businessName: string,
    industry: string,
    size: string,
    location: string,
    description: string,
    websiteUrl?: string,
    password?: string
  ) => Promise<string>;
  
  createProject: (projectData: Omit<Project, 'id' | 'business_id' | 'status' | 'created_at' | 'updated_at'>) => Promise<Project>;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  deleteProject: (projectId: string) => Promise<void>;
  
  applyToProject: (projectId: string, pitchNote: string) => Promise<Application>;
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
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  resetUserToPending: (userId: string) => Promise<void>;
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

  // Helper to merge local saved state with default/seed data without wiping out new additions or duplicating by email
  const mergeById = <T extends Record<string, any>>(initial: T[], saved: T[] = [], idKey: string = 'id'): T[] => {
    const map = new Map<string, T>();
    const emailToKey = new Map<string, string>();

    initial.forEach((item) => {
      const primaryKey = item[idKey] || item.id || item.user_id;
      if (primaryKey) {
        map.set(primaryKey, item);
        if (item.email) {
          emailToKey.set(item.email.toLowerCase(), primaryKey);
        }
      }
    });

    saved.forEach((item) => {
      const primaryKey = item[idKey] || item.id || item.user_id;
      const email = item.email ? item.email.toLowerCase() : '';
      
      // If we already have a record for this email under another key, prioritize the latest primaryKey
      const existingKeyForEmail = email ? emailToKey.get(email) : null;
      const targetKey = primaryKey || existingKeyForEmail;

      if (targetKey) {
        const existing = map.get(targetKey) || (existingKeyForEmail ? map.get(existingKeyForEmail) : undefined);
        if (existingKeyForEmail && existingKeyForEmail !== targetKey) {
          map.delete(existingKeyForEmail);
        }
        map.set(targetKey, { ...existing, ...item });
        if (email) {
          emailToKey.set(email, targetKey);
        }
      }
    });

    return Array.from(map.values());
  };

  // Load state from localStorage & Supabase Cloud DB
  const refreshData = useCallback(async () => {
    // 1. Sync from localStorage first for instant multi-tab sync
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.profiles?.length) setProfiles((prev) => mergeById(prev, parsed.profiles, 'id'));
          if (parsed.students?.length) setStudents((prev) => mergeById(prev, parsed.students, 'user_id'));
          if (parsed.businesses?.length) setBusinesses((prev) => mergeById(prev, parsed.businesses, 'user_id'));
          if (parsed.projects?.length) setProjects((prev) => mergeById(prev, parsed.projects, 'id'));
          if (parsed.applications?.length) setApplications((prev) => mergeById(prev, parsed.applications, 'id'));
          if (parsed.workspaces?.length) setWorkspaces((prev) => mergeById(prev, parsed.workspaces, 'id'));
          if (parsed.feedbackList?.length) setFeedbackList((prev) => mergeById(prev, parsed.feedbackList, 'id'));
          if (parsed.reports?.length) setReports((prev) => mergeById(prev, parsed.reports, 'id'));
          if (parsed.notifications?.length) setNotifications((prev) => mergeById(prev, parsed.notifications, 'id'));
        }
      } catch (err) {
        console.warn('Failed reading localStorage in refreshData:', err);
      }
    }

    // 2. Authoritative sync from Supabase Cloud DB via Server API & direct Supabase fallback
    try {
      let dbProfiles: Profile[] | null = null;
      let dbStudents: StudentProfile[] | null = null;
      let dbBiz: BusinessProfile[] | null = null;

      try {
        const apiRes = await fetch('/api/auth/profiles');
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.profiles) dbProfiles = apiData.profiles;
          if (apiData.students) dbStudents = apiData.students;
          if (apiData.businesses) dbBiz = apiData.businesses;
        }
      } catch {}

      if (!dbProfiles) {
        const supabase = createClient();
        const [{ data: pData }, { data: sData }, { data: bData }] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('student_profiles').select('*'),
          supabase.from('business_profiles').select('*'),
        ]);
        dbProfiles = pData as Profile[] | null;
        dbStudents = sData as StudentProfile[] | null;
        dbBiz = bData as BusinessProfile[] | null;
      }

      if (dbProfiles && dbProfiles.length > 0) {
        setProfiles((prev) => mergeById(prev, dbProfiles as Profile[], 'id'));
      }
      if (dbStudents && dbStudents.length > 0) {
        setStudents((prev) => mergeById(prev, dbStudents as StudentProfile[], 'user_id'));
      }
      if (dbBiz && dbBiz.length > 0) {
        setBusinesses((prev) => mergeById(prev, dbBiz as BusinessProfile[], 'user_id'));
      }

      try {
        let dbProjects: Project[] | null = null;
        try {
          const apiRes = await fetch('/api/projects');
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.projects) dbProjects = apiData.projects;
          }
        } catch {}

        if (!dbProjects) {
          const supabase = createClient();
          const { data: pData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
          dbProjects = pData as Project[] | null;
        }

        if (dbProjects && dbProjects.length > 0) {
          // DB is authoritative: replace temp-id projects with real DB ones, keep local-only items
          setProjects((prev) => {
            const dbMap = new Map(dbProjects!.map((p) => [p.id, p]));
            // Keep local projects that have temp IDs (not yet synced) and merge DB projects
            const localOnly = prev.filter((p) => p.id.startsWith('proj-') && !dbMap.has(p.id));
            return [...dbProjects!, ...localOnly].sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        }
      } catch {}

      try {
        let dbApps: Application[] | null = null;
        try {
          const apiRes = await fetch('/api/applications');
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.applications) dbApps = apiData.applications;
          }
        } catch {}

        if (!dbApps) {
          const supabase = createClient();
          const { data: aData } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
          dbApps = aData as Application[] | null;
        }

        if (dbApps && dbApps.length > 0) {
          // DB is authoritative: replace temp-id apps with real DB ones, keep local-only items
          setApplications((prev) => {
            const dbMap = new Map(dbApps!.map((a) => [a.id, a]));
            const localOnly = prev.filter((a) => a.id.startsWith('app-') && !dbMap.has(a.id));
            return [...dbApps!, ...localOnly].sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
          });
        }
      } catch {}
    } catch (err) {
      console.warn('Could not sync remote Supabase records:', err);
    }
  }, []);

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

    // Initial cloud load
    refreshData();

    // Auto sync when tab refocuses or becomes visible
    const handleFocus = () => {
      refreshData();
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Background polling every 2.5 seconds for instant multi-device sync
    const syncInterval = setInterval(() => {
      refreshData();
    }, 2500);

    // Restore user ID from sessionStorage first (per-tab), then localStorage
    try {
      const savedUserId = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
      if (savedUserId) {
        setCurrentUserId(savedUserId);
      }
    } catch {}

    setIsInitialized(true);

    // Supabase Realtime channel subscription (both Broadcast & Postgres Changes)
    let realtimeChannel: any = null;
    try {
      const supabase = createClient();
      realtimeChannel = supabase
        .channel('studentconnect_global_sync')
        .on('broadcast', { event: 'ACCOUNT_REGISTERED' }, (payload: any) => {
          if (payload?.payload?.profile) {
            setProfiles((prev) => mergeById(prev, [payload.payload.profile], 'id'));
          }
          if (payload?.payload?.student) {
            setStudents((prev) => mergeById(prev, [payload.payload.student], 'user_id'));
          }
          if (payload?.payload?.business) {
            setBusinesses((prev) => mergeById(prev, [payload.payload.business], 'user_id'));
          }
          refreshData();
        })
        .on('broadcast', { event: 'USER_STATUS_CHANGE' }, (payload: any) => {
          if (payload?.payload?.id && payload?.payload?.status) {
            setProfiles((prev) => prev.map((p) => p.id === payload.payload.id ? { ...p, status: payload.payload.status } : p));
          }
          refreshData();
        })
        .on('broadcast', { event: 'PROJECT_STATUS_CHANGE' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'student_profiles' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'business_profiles' }, () => {
          refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
          refreshData();
        })
        .subscribe();
    } catch {}

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
          if (data?.type === 'ACCOUNT_REGISTERED') {
            if (data.profile) {
              setProfiles((prev) => mergeById(prev, [data.profile], 'id'));
            }
            if (data.student) {
              setStudents((prev) => mergeById(prev, [data.student], 'user_id'));
            }
            if (data.business) {
              setBusinesses((prev) => mergeById(prev, [data.business], 'user_id'));
            }
            refreshData();
          } else if (data?.type === 'USER_STATUS_CHANGE' && data.userId && data.status) {
            setProfiles((prev) =>
              prev.map((p) => (p.id === data.userId ? { ...p, status: data.status, updated_at: new Date().toISOString() } : p))
            );
          } else if (data?.type === 'USER_DELETED' && data.userId) {
            setProfiles((prev) => prev.filter((p) => p.id !== data.userId));
            setStudents((prev) => prev.filter((s) => s.user_id !== data.userId));
            setBusinesses((prev) => prev.filter((b) => b.user_id !== data.userId));
          } else if (data?.type === 'NEW_WORKSPACE_MESSAGE' && data.workspaceId && data.message) {
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
          } else if (data?.type === 'PROJECT_DELETED' && data.projectId) {
            setProjects((prev) => prev.filter((p) => p.id !== data.projectId));
          } else if (data?.type === 'PROJECT_STATUS_CHANGE' && data.project) {
            setProjects((prev) => {
              const exists = prev.some((p) => p.id === data.project.id);
              if (exists) {
                return prev.map((p) => (p.id === data.project.id ? data.project : p));
              }
              return [data.project, ...prev];
            });
          } else if (data?.type === 'SYNC_STATE') {
            refreshData();
          }
        };
      }
    } catch {}

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(syncInterval);
      if (realtimeChannel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(realtimeChannel);
        } catch {}
      }
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
  const currentUser = isInitialized
    ? profiles.find(
        (p) =>
          p.id === currentUserId ||
          (p.email && currentUserId && p.email.toLowerCase() === currentUserId.toLowerCase())
      ) || null
    : null;

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

    // Check for administrator login
    if (cleanInput === 'admin' || cleanInput === 'admin@studentconnect.org' || cleanInput === 'admin@studentconnect.com') {
      let adminProfile = profiles.find((p) => p.role === 'admin' || p.email === 'admin@studentconnect.org');
      if (!adminProfile) {
        adminProfile = {
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          email: 'admin@studentconnect.org',
          role: 'admin',
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfiles((prev) => [...prev, adminProfile!]);
      }
      setCurrentUserId(adminProfile.id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_USER_KEY, adminProfile.id);
        sessionStorage.setItem(CURRENT_USER_KEY, adminProfile.id);
        localStorage.setItem('studentconnect_admin_secret', 'Admin@StudentConnect2025!');
      }
      return adminProfile;
    }

    if (password) {
      try {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({ email: cleanInput, password });
      } catch {
        // Continue to profile lookup
      }
    }

    // Always check authoritative Supabase cloud database first for the latest profile state and verification status
    let existingProfile: Profile | null = null;
    try {
      const apiRes = await fetch(`/api/auth/profiles?email=${encodeURIComponent(cleanInput)}`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.profile) {
          existingProfile = apiData.profile as Profile;
          setProfiles((prev) => mergeById(prev, [apiData.profile], 'id'));
          if (apiData.student) setStudents((prev) => mergeById(prev, [apiData.student], 'user_id'));
          if (apiData.business) setBusinesses((prev) => mergeById(prev, [apiData.business], 'user_id'));
        }
      }
    } catch {}

    if (!existingProfile) {
      try {
        const supabase = createClient();
        const { data: dbProfile } = await supabase
          .from('profiles')
          .select('*')
          .or(`email.eq.${cleanInput},id.eq.${cleanInput}`)
          .maybeSingle();

        if (dbProfile) {
          existingProfile = dbProfile as Profile;
          setProfiles((prev) => mergeById(prev, [dbProfile as Profile], 'id'));
        }
      } catch (err) {
        console.warn('Notice querying Supabase during login:', err);
      }
    }

    // Fallback to local profiles list if database was offline or reached by alias
    if (!existingProfile) {
      existingProfile = profiles.find((p) => 
        p.email.toLowerCase() === cleanInput ||
        p.id.toLowerCase() === cleanInput ||
        (cleanInput.length > 2 && p.email.toLowerCase().startsWith(cleanInput + '@')) ||
        (cleanInput.includes('nextphase') && (p.id.includes('nextphase') || p.email.includes('nextphase')))
      ) || null;
    }

    // If not found in profiles, check matching business name in businesses
    if (!existingProfile) {
      const matchBiz = businesses.find((b) => b.business_name.toLowerCase() === cleanInput || b.user_id.toLowerCase() === cleanInput);
      if (matchBiz) {
        existingProfile = profiles.find((p) => p.id === matchBiz.user_id) || null;
      }
    }

    // If not found in profiles, check matching student name in students
    if (!existingProfile) {
      const matchStu = students.find((s) => s.full_name.toLowerCase() === cleanInput || s.user_id.toLowerCase() === cleanInput);
      if (matchStu) {
        existingProfile = profiles.find((p) => p.id === matchStu.user_id) || null;
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

  const registerStudent = async (
    email: string,
    fullName: string,
    school: string,
    gradYear: number,
    skills: string[],
    hours: number,
    bio: string,
    portfolioUrls: string[],
    password?: string
  ): Promise<string> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Authoritative Server Registration Call
    let registeredProfile: Profile | null = null;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: password || 'Password123!',
          role: 'student',
          fullName,
          school,
          graduationYear: gradYear,
          skills,
          availabilityHours: hours,
          bio,
          portfolioUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      if (data.profile) {
        registeredProfile = data.profile;
      }
    } catch (apiErr: any) {
      console.warn('Server registration notice:', apiErr);
      if (apiErr.message && !apiErr.message.includes('fetch')) {
        throw apiErr;
      }
    }

    const assignedId = registeredProfile?.id || generateUUID();
    const newProfile: Profile = registeredProfile || {
      id: assignedId,
      email: cleanEmail,
      role: 'student',
      status: 'pending_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newStudent: StudentProfile = {
      user_id: assignedId,
      full_name: fullName,
      school,
      graduation_year: gradYear,
      skills,
      availability_hours_per_week: hours,
      bio,
      portfolio_urls: portfolioUrls,
      is_public: true,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      created_at: newProfile.created_at,
      updated_at: newProfile.updated_at,
    };

    setProfiles((prev) => [...prev.filter((p) => p.id !== assignedId && p.email.toLowerCase() !== cleanEmail), newProfile]);
    setStudents((prev) => [...prev.filter((s) => s.user_id !== assignedId), newStudent]);
    setCurrentUserId(assignedId);

    // Immediate LocalStorage persist for instant availability across tabs and reloads
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : {};
        const updatedProfiles = [...(parsed.profiles || profiles).filter((p: any) => p.id !== assignedId && p.email?.toLowerCase() !== cleanEmail), newProfile];
        const updatedStudents = [...(parsed.students || students).filter((s: any) => s.user_id !== assignedId), newStudent];
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...parsed,
            profiles: updatedProfiles,
            students: updatedStudents,
          })
        );
        sessionStorage.setItem(CURRENT_USER_KEY, assignedId);
        localStorage.setItem(CURRENT_USER_KEY, assignedId);
      } catch {}
    }

    // Instant sync broadcast across windows / browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({
          type: 'ACCOUNT_REGISTERED',
          profile: newProfile,
          student: newStudent,
          role: 'student'
        });
        setTimeout(() => {
          try { bc.close(); } catch {}
        }, 500);
      }
    } catch {}

    // Direct Supabase upsert fallback if server was not reached
    if (!registeredProfile) {
      try {
        const supabase = createClient();
        await supabase.from('profiles').upsert([newProfile], { onConflict: 'id' });
        await supabase.from('student_profiles').upsert([newStudent], { onConflict: 'user_id' });
      } catch (err) {
        console.warn('Direct fallback registration notice:', err);
      }
    }

    // Trigger immediate refresh so admin queues reflect the new signup
    refreshData().catch(() => {});

    return assignedId;
  };

  const registerBusiness = async (
    email: string,
    businessName: string,
    industry: string,
    size: string,
    location: string,
    description: string,
    websiteUrl?: string,
    password?: string
  ): Promise<string> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Authoritative Server Registration Call
    let registeredProfile: Profile | null = null;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: password || 'Password123!',
          role: 'business',
          businessName,
          industry,
          businessSize: size,
          location,
          description,
          websiteUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      if (data.profile) {
        registeredProfile = data.profile;
      }
    } catch (apiErr: any) {
      console.warn('Server registration notice:', apiErr);
      if (apiErr.message && !apiErr.message.includes('fetch')) {
        throw apiErr;
      }
    }

    const assignedId = registeredProfile?.id || generateUUID();
    const newProfile: Profile = registeredProfile || {
      id: assignedId,
      email: cleanEmail,
      role: 'business',
      status: 'pending_approval',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newBusiness: BusinessProfile = {
      user_id: assignedId,
      business_name: businessName,
      industry,
      business_size: size,
      location,
      description,
      website_url: websiteUrl,
      logo_url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80`,
      created_at: newProfile.created_at,
      updated_at: newProfile.updated_at,
    };

    setProfiles((prev) => [...prev.filter((p) => p.id !== assignedId && p.email.toLowerCase() !== cleanEmail), newProfile]);
    setBusinesses((prev) => [...prev.filter((b) => b.user_id !== assignedId), newBusiness]);
    setCurrentUserId(assignedId);

    // Immediate LocalStorage persist for instant availability across tabs and reloads
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : {};
        const updatedProfiles = [...(parsed.profiles || profiles).filter((p: any) => p.id !== assignedId && p.email?.toLowerCase() !== cleanEmail), newProfile];
        const updatedBusinesses = [...(parsed.businesses || businesses).filter((b: any) => b.user_id !== assignedId), newBusiness];
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...parsed,
            profiles: updatedProfiles,
            businesses: updatedBusinesses,
          })
        );
        sessionStorage.setItem(CURRENT_USER_KEY, assignedId);
        localStorage.setItem(CURRENT_USER_KEY, assignedId);
      } catch {}
    }

    // Instant sync broadcast across windows / browser tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({
          type: 'ACCOUNT_REGISTERED',
          profile: newProfile,
          business: newBusiness,
          role: 'business'
        });
        setTimeout(() => {
          try { bc.close(); } catch {}
        }, 500);
      }
    } catch {}

    // Direct Supabase upsert fallback if server was not reached
    if (!registeredProfile) {
      try {
        const supabase = createClient();
        await supabase.from('profiles').upsert([newProfile], { onConflict: 'id' });
        await supabase.from('business_profiles').upsert([newBusiness], { onConflict: 'user_id' });
      } catch (err) {
        console.warn('Direct fallback registration notice:', err);
      }
    }

    // Trigger immediate refresh so admin queues reflect the new signup
    refreshData().catch(() => {});

    return assignedId;
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'business_id' | 'status' | 'created_at' | 'updated_at'>): Promise<Project> => {
    if (!currentUser || currentUser.role !== 'business') {
      throw new Error('Only approved businesses can post projects');
    }
    if (currentUser.status === 'pending_approval') {
      throw new Error('Your client business account is pending administrator verification.');
    }
    if (currentUser.status === 'rejected') {
      throw new Error('Your client business account has been rejected. Posting projects is restricted.');
    }

    // Approved business accounts publish projects live ('open') immediately for student applicants
    const targetStatus: ProjectStatus = currentUser.status === 'approved' ? 'open' : 'pending_approval';

    const tempId = `proj-${Date.now()}`;
    const newProject: Project = {
      ...projectData,
      id: tempId,
      business_id: currentUser.id,
      status: targetStatus,
      applicant_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      business: currentBusiness || undefined,
    };

    // Optimistically update React Context state
    setProjects((prev) => [newProject, ...prev]);

    // Save to server API & Supabase database — AWAIT to get real DB ID
    let savedProject: Project = newProject;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectData.title,
          category: projectData.category,
          description: projectData.description,
          deliverables_description: projectData.deliverables_description,
          skills_required: projectData.skills_required,
          estimated_hours_per_week: projectData.estimated_hours_per_week,
          duration_weeks: projectData.duration_weeks,
          business_id: currentUser.id,
          status: targetStatus,
          perks: projectData.perks,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          savedProject = { ...data.project, business: currentBusiness || data.project.business };
          // Replace temp project with the real DB version
          setProjects((prev) =>
            prev.map((p) => (p.id === tempId ? savedProject : p))
          );
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Failed to save project:', errData.error || res.statusText);
      }
    } catch (err) {
      console.warn('Notice saving project to database:', err);
    }

    // Immediate LocalStorage persist with the saved project (real ID)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updatedProjects = [savedProject, ...(parsed.projects || []).filter((p: any) => p.id !== tempId && p.id !== savedProject.id)];
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, projects: updatedProjects }));
        }
      } catch {}
    }

    // Instant BroadcastChannel sync across tabs/windows
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'PROJECT_STATUS_CHANGE', project: savedProject });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}

    // Trigger background refresh for full sync
    refreshData().catch(() => {});

    return savedProject;
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status, updated_at: new Date().toISOString() } : p))
    );
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    if (!currentUser) {
      throw new Error('Authentication required to delete a project');
    }

    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    if (proj.business_id !== currentUser.id && currentUser.role !== 'admin') {
      throw new Error('Unauthorized: You can only delete your own projects');
    }

    // 1. Optimistically remove project from state
    setProjects((prev) => prev.filter((p) => p.id !== projectId));

    // 2. Persist removal to localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updatedProjects = (parsed.projects || []).filter((p: any) => p.id !== projectId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, projects: updatedProjects }));
        }
      } catch {}
    }

    // 3. Request server-side deletion / safe deactivation in Supabase
    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(projectId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role,
          'x-user-email': currentUser.email,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn('Notice deleting project on server:', errData.error || res.statusText);
      }
    } catch (err) {
      console.warn('Notice communicating project deletion to database:', err);
    }

    // 4. Broadcast instant deletion across tabs
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'PROJECT_DELETED', projectId });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}

    // 5. Refresh background data
    refreshData().catch(() => {});
  };

  const applyToProject = async (projectId: string, pitchNote: string): Promise<Application> => {
    if (!currentUser || currentUser.role !== 'student') {
      throw new Error('Only students can apply to projects');
    }
    if (currentUser.status === 'pending_approval') {
      throw new Error('Your student account is pending administrator verification.');
    }
    if (currentUser.status === 'rejected') {
      throw new Error('Your student account has been rejected. Applications are restricted.');
    }

    // Prevent duplicate application submission to the same project
    const alreadyApplied = applications.some((a) => a.project_id === projectId && a.student_id === currentUser.id);
    if (alreadyApplied) {
      throw new Error('You have already submitted an application for this project.');
    }

    const tempAppId = `app-${Date.now()}`;
    const newApp: Application = {
      id: tempAppId,
      project_id: projectId,
      student_id: currentUser.id,
      pitch_note: pitchNote,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student: currentStudent || undefined,
    };

    // Optimistically update applications and project applicant counter
    setApplications((prev) => [newApp, ...prev]);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, applicant_count: (p.applicant_count || 0) + 1 } : p))
    );

    // Create a real-time Notification for the client business owner
    const proj = projects.find((p) => p.id === projectId);
    if (proj && proj.business_id) {
      const studentName = currentStudent?.full_name || (currentUser.email ? currentUser.email.split('@')[0] : 'Student');
      const appNotif: AppNotification = {
        id: `notif-app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        user_id: proj.business_id,
        type: 'message',
        title: '📩 New Student Application',
        message: `${studentName} submitted an application for your project "${proj.title}".`,
        project_id: proj.id,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => [appNotif, ...prev]);
    }

    // Save application to database via Server API — AWAIT for confirmation
    let savedApp: Application = newApp;
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          student_id: currentUser.id,
          pitch_note: pitchNote,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.application) {
          savedApp = { ...data.application, student: currentStudent || data.application.student };
          // Replace temp app with real DB version
          setApplications((prev) =>
            prev.map((a) => (a.id === tempAppId ? savedApp : a))
          );
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error || 'Failed to save application';
        console.error('Application save failed:', errMsg);
        // Remove the optimistic entry since it failed
        if (res.status === 409) {
          // Duplicate — remove local optimistic entry
          setApplications((prev) => prev.filter((a) => a.id !== tempAppId));
          throw new Error(errMsg);
        }
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      console.warn('Notice saving application to database:', err);
    }

    // Save to LocalStorage with the saved app (real ID)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updatedApps = [savedApp, ...(parsed.applications || []).filter((a: any) => a.id !== tempAppId && a.id !== savedApp.id)];
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, applications: updatedApps }));
        }
      } catch {}
    }

    // Broadcast sync across tabs/windows
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'APPLICATION_SUBMITTED', application: savedApp });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}

    // Trigger background refresh for full sync
    refreshData().catch(() => {});

    return savedApp;
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

    // Save status update to database via Server API
    fetch('/api/applications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status }),
    }).catch(() => {});

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

  const approveUser = async (userId: string) => {
    const isMatch = (p: any) => p.id === userId || (p.email && p.email.toLowerCase() === userId.toLowerCase());

    // 1. Optimistic update in state
    setProfiles((prev) => prev.map((p) => (isMatch(p) ? { ...p, status: 'approved', updated_at: new Date().toISOString() } : p)));

    // 2. Immediate LocalStorage persist
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = (parsed.profiles || []).map((p: any) => isMatch(p) ? { ...p, status: 'approved', updated_at: new Date().toISOString() } : p);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, profiles: updated }));
        }
      } catch {}
    }

    // 3. Instant BroadcastChannel sync
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'USER_STATUS_CHANGE', userId, status: 'approved' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}

    // 4. Cloud DB sync via Server API & direct Supabase fallback
    try {
      const adminSecret = (typeof window !== 'undefined' && localStorage.getItem('studentconnect_admin_secret')) || 'Admin@StudentConnect2025!';
      await fetch('/api/admin/user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ userId, status: 'approved' }),
      });
    } catch {
      try {
        const supabase = createClient();
        await supabase.from('profiles').update({ status: 'approved', updated_at: new Date().toISOString() }).or(`id.eq.${userId},email.eq.${userId.toLowerCase()}`);
      } catch {}
    }

    try {
      const supabase = createClient();
      const channel = supabase.channel('studentconnect_global_sync');
      channel.send({
        type: 'broadcast',
        event: 'USER_STATUS_CHANGE',
        payload: { id: userId, status: 'approved' }
      }).catch(() => {});
    } catch {}

    refreshData().catch(() => {});
  };

  const rejectUser = async (userId: string) => {
    const isMatch = (p: any) => p.id === userId || (p.email && p.email.toLowerCase() === userId.toLowerCase());

    // 1. Optimistic update to 'rejected' (DO NOT DELETE THE USER RECORD)
    setProfiles((prev) => prev.map((p) => (isMatch(p) ? { ...p, status: 'rejected', updated_at: new Date().toISOString() } : p)));

    // 2. Immediate LocalStorage persist
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = (parsed.profiles || []).map((p: any) => isMatch(p) ? { ...p, status: 'rejected', updated_at: new Date().toISOString() } : p);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, profiles: updated }));
        }
      } catch {}
    }

    // 3. Instant BroadcastChannel sync
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'USER_STATUS_CHANGE', userId, status: 'rejected' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}

    // 4. Cloud DB sync via Server API & direct Supabase fallback
    try {
      const adminSecret = (typeof window !== 'undefined' && localStorage.getItem('studentconnect_admin_secret')) || 'Admin@StudentConnect2025!';
      await fetch('/api/admin/user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ userId, status: 'rejected' }),
      });
    } catch {
      try {
        const supabase = createClient();
        await supabase.from('profiles').update({ status: 'rejected', updated_at: new Date().toISOString() }).or(`id.eq.${userId},email.eq.${userId.toLowerCase()}`);
      } catch {}
    }

    try {
      const supabase = createClient();
      const channel = supabase.channel('studentconnect_global_sync');
      channel.send({
        type: 'broadcast',
        event: 'USER_STATUS_CHANGE',
        payload: { id: userId, status: 'rejected' }
      }).catch(() => {});
    } catch {}

    refreshData().catch(() => {});
  };

  const resetUserToPending = async (userId: string) => {
    const isMatch = (p: any) => p.id === userId || (p.email && p.email.toLowerCase() === userId.toLowerCase());

    setProfiles((prev) => prev.map((p) => (isMatch(p) ? { ...p, status: 'pending_approval', updated_at: new Date().toISOString() } : p)));

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = (parsed.profiles || []).map((p: any) => isMatch(p) ? { ...p, status: 'pending_approval', updated_at: new Date().toISOString() } : p);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, profiles: updated }));
        }
      } catch {}
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'USER_STATUS_CHANGE', userId, status: 'pending_approval' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}

    try {
      const adminSecret = (typeof window !== 'undefined' && localStorage.getItem('studentconnect_admin_secret')) || 'Admin@StudentConnect2025!';
      await fetch('/api/admin/user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ userId, status: 'pending_approval' }),
      });
    } catch {
      try {
        const supabase = createClient();
        await supabase.from('profiles').update({ status: 'pending_approval', updated_at: new Date().toISOString() }).or(`id.eq.${userId},email.eq.${userId.toLowerCase()}`);
      } catch {}
    }

    try {
      const supabase = createClient();
      const channel = supabase.channel('studentconnect_global_sync');
      channel.send({
        type: 'broadcast',
        event: 'USER_STATUS_CHANGE',
        payload: { id: userId, status: 'pending_approval' }
      }).catch(() => {});
    } catch {}

    refreshData().catch(() => {});
  };

  const approveProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'open', updated_at: new Date().toISOString() } : p)));

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = (parsed.projects || []).map((p: any) => p.id === projectId ? { ...p, status: 'open', updated_at: new Date().toISOString() } : p);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, projects: updated }));
        }
      } catch {}
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'SYNC_STATE' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}

    try {
      const supabase = createClient();
      supabase.from('projects').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', projectId).then(() => {});
      const channel = supabase.channel('studentconnect_global_sync');
      channel.send({
        type: 'broadcast',
        event: 'PROJECT_STATUS_CHANGE',
        payload: { id: projectId, status: 'open' }
      }).catch(() => {});
    } catch {}
  };

  const rejectProject = (projectId: string) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, status: 'rejected', updated_at: new Date().toISOString() } : p)));

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const updated = (parsed.projects || []).map((p: any) => p.id === projectId ? { ...p, status: 'rejected', updated_at: new Date().toISOString() } : p);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, projects: updated }));
        }
      } catch {}
    }

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('studentconnect_chat_channel');
        bc.postMessage({ type: 'SYNC_STATE' });
        setTimeout(() => { try { bc.close(); } catch {} }, 500);
      }
    } catch {}

    try {
      const supabase = createClient();
      supabase.from('projects').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', projectId).then(() => {});
      const channel = supabase.channel('studentconnect_global_sync');
      channel.send({
        type: 'broadcast',
        event: 'PROJECT_STATUS_CHANGE',
        payload: { id: projectId, status: 'rejected' }
      }).catch(() => {});
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
        refreshData,
        registerStudent,
        registerBusiness,
        createProject,
        updateProjectStatus,
        deleteProject,
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
        resetUserToPending,
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
