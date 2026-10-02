import { Profile, StudentProfile, BusinessProfile, Project, Application, Feedback, Workspace, Report } from './types/database';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    email: 'sarah.chen@university.edu',
    role: 'student',
    status: 'approved',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    email: 'alex.rivera@tech.edu',
    role: 'student',
    status: 'approved',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    email: 'owner@hearthandstonebakery.com',
    role: 'business',
    status: 'approved',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    email: 'contact@greenscapenursery.com',
    role: 'business',
    status: 'approved',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    email: 'hello@urbanfitgym.com',
    role: 'business',
    status: 'approved',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'nextphase-client-id',
    email: 'nextphase@gmail.com',
    role: 'business',
    status: 'approved',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'admin@platform.internal',
    role: 'admin',
    status: 'approved',
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    full_name: 'Sarah Chen',
    school: 'State University',
    major: 'Computer Science & Human-Computer Interaction',
    graduation_year: 2026,
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Figma', 'UI/UX Design', 'TypeScript', 'Thumbnail Design', 'Photoshop'],
    availability_hours_per_week: 10,
    bio: 'Junior CS student eager to build high-performance web applications, sleek landing pages, and high-CTR thumbnail graphics for business clients.',
    portfolio_urls: ['https://github.com/sarahchen-dev', 'https://behance.net/sarahchen-design'],
    github_url: 'https://github.com/sarahchen-dev',
    linkedin_url: 'https://linkedin.com/in/sarahchen',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    is_public: true,
    completed_projects_count: 3,
    rating_average: 4.9,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    full_name: 'Alex Rivera',
    school: 'Institute of Technology',
    major: 'Digital Marketing & Content Strategy',
    graduation_year: 2025,
    skills: ['Social Media Marketing', 'SEO Copywriting', 'Canva', 'Instagram Reels', 'Google Ads', 'Thumbnail Design'],
    availability_hours_per_week: 8,
    bio: 'Marketing senior passionate about helping independent shops grow their organic reach, craft engaging viral reels, and improve local Google Maps SEO ranking.',
    portfolio_urls: ['https://instagram.com/alexmarketing', 'https://medium.com/@alexrivera'],
    linkedin_url: 'https://linkedin.com/in/alexrivera-marketing',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    is_public: true,
    completed_projects_count: 2,
    rating_average: 5.0,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_BUSINESSES: BusinessProfile[] = [
  {
    user_id: 'nextphase-client-id',
    business_name: 'nextphase',
    industry: 'Media & Digital Content',
    business_size: '1-10 employees',
    location: 'Remote / Global',
    website_url: 'https://nextphase.media',
    description: 'Digital creator studio creating high-growth content, video productions, and social media campaigns.',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    contact_person: 'nextphase',
    verified_business: true,
    projects_posted_count: 1,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    business_name: 'Hearth & Stone Artisanal Bakery',
    industry: 'Food & Beverage / Retail',
    business_size: '1-10 employees',
    location: 'Austin, TX',
    website_url: 'https://hearthandstonebakery.example.com',
    description: 'A neighborhood wood-fired sourdough bakery serving organic breads, pastries, and specialty espresso to our local community.',
    logo_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    contact_person: 'Elena Martinez (Founder)',
    verified_business: true,
    projects_posted_count: 2,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    business_name: 'Greenscape Organic Nursery',
    industry: 'Gardening & Eco Living',
    business_size: '1-5 employees',
    location: 'Portland, OR',
    website_url: 'https://greenscape-plants.example.com',
    description: 'Family-owned plant nursery specializing in drought-tolerant native plants, organic soil mixes, and indoor flora workshops.',
    logo_url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=150&auto=format&fit=crop&q=80',
    contact_person: 'David Park (Owner)',
    verified_business: true,
    projects_posted_count: 1,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    business_name: 'UrbanFit Community Gym',
    industry: 'Fitness & Health',
    business_size: '5-15 employees',
    location: 'Chicago, IL',
    website_url: 'https://urbanfitgym.example.com',
    description: 'Independent boutique fitness center focused on functional strength training, small group classes, and personal nutrition coaching.',
    logo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=80',
    contact_person: 'Marcus Vance (Head Trainer)',
    verified_business: true,
    projects_posted_count: 1,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p-pending-1',
    business_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    title: 'TikTok Short-Form Video Producer & Creator Strategy',
    category: 'video_media',
    description: 'Looking for an energetic student video creator to produce 10 high-energy 30-second TikToks and Reels showcasing our functional fitness classes and personal trainer tips.',
    problem_statement: 'We have great class energy, but we lack high-converting vertical video content to reach young athletes on TikTok and Instagram Reels.',
    deliverables_description: '1. 10 edited vertical short-form videos with captions\n2. Hook scripts and trending sound recommendations\n3. Source video files and project templates.',
    skills_required: ['CapCut', 'Premiere Pro', 'TikTok', 'Video Editing', 'Content Strategy'],
    estimated_hours_per_week: 6,
    duration_weeks: 3,
    perks: [
      'Official Client Reference & LinkedIn Endorsement',
      'Free 3-Month Premium Gym Membership',
      'Verified Experience Letter from UrbanFit'
    ],
    status: 'pending_approval',
    applicant_count: 0,
    featured: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    business: INITIAL_BUSINESSES[3]
  },
  {
    id: 'p-pending-2',
    business_id: 'nextphase-client-id',
    title: 'Mobile App UI Wireframe & Interactive Prototype',
    category: 'design',
    description: 'We are conceptualizing a new creator collaboration tool and need a UI/UX design student to build low and high-fidelity wireframes in Figma.',
    problem_statement: 'We need structured user flows and a clickable prototype to present to our initial beta creators and gather early UX feedback.',
    deliverables_description: '1. Complete Figma user flow architecture\n2. 12 High-fidelity screen designs (Mobile iOS & Android)\n3. Clickable interactive prototype\n4. Reusable Figma UI component kit.',
    skills_required: ['Figma', 'UI/UX Design', 'Wireframing', 'User Research', 'Mobile Design'],
    estimated_hours_per_week: 8,
    duration_weeks: 4,
    perks: [
      'Verified Experience Letter signed by nextphase Founder',
      'Feature in Creator Showcase & Full Portfolio Rights',
      'Mentorship on Digital Product Management'
    ],
    status: 'pending_approval',
    applicant_count: 0,
    featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    business: INITIAL_BUSINESSES[0]
  },
  {
    id: 'proj-thumbnail-designer',
    business_id: 'nextphase-client-id',
    title: 'Thumbnail Designer for YouTube & Social Media',
    category: 'design',
    description: 'Looking for a creative thumbnail designer to craft high-CTR, vibrant YouTube thumbnails and Instagram cover graphics for our upcoming digital video releases.',
    problem_statement: 'Our current video click-through rates need a strong boost. We need high-converting, attention-grabbing thumbnail designs with bold expressive typography, dramatic color grading, and custom composition.',
    deliverables_description: '1. 10 Custom High-CTR YouTube Thumbnails (1280x720 PNG & editable PSD)\n2. 5 Matching Instagram Story / Reel Cover Templates\n3. Source design files with editable layers & typography\n4. Brand Style Guide with optimized fonts and color presets.',
    skills_required: ['Thumbnail Design', 'Photoshop', 'Figma', 'Graphic Design', 'Visual Hierarchy', 'Typography'],
    estimated_hours_per_week: 8,
    duration_weeks: 3,
    perks: [
      'Official Client Reference & LinkedIn Endorsement',
      'Portfolio Showcase Rights & Live CTR Analytics Access',
      'Long-term Freelance Retainer Opportunity',
      'Verified Experience Letter from nextphase'
    ],
    status: 'in_progress',
    applicant_count: 2,
    featured: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    business: INITIAL_BUSINESSES[0]
  },
  {
    id: 'p-101',
    business_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Mobile-Responsive Online Menu & Catering Booking Page',
    category: 'web_tech',
    description: 'Our neighborhood bakery needs a fast, lightweight, and modern website where customers can view our daily sourdough rotation and submit weekly catering requests.',
    problem_statement: 'Currently, customers only find our menu on low-resolution chalkboard photos on Facebook. We need a clean, mobile-first menu and booking inquiry form that our staff can easily update.',
    deliverables_description: '1. Fully responsive static website (Next.js/React or HTML/Tailwind)\n2. Interactive weekly bakery menu tab\n3. Catering inquiry contact form with email notifications\n4. Basic SEO optimization for local search.',
    skills_required: ['React', 'Tailwind CSS', 'Responsive Web Design', 'HTML/CSS', 'UI/UX'],
    estimated_hours_per_week: 6,
    duration_weeks: 3,
    perks: [
      'Verified Recommendation Letter signed by Founder',
      'Full LinkedIn Endorsement & Recommendation',
      'Feature in Bakery Newsletter (2,500+ subscribers)',
      'Free Artisan Pastries & Coffee Voucher'
    ],
    status: 'open',
    applicant_count: 2,
    featured: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    business: INITIAL_BUSINESSES[1]
  },
  {
    id: 'p-102',
    business_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    title: 'Instagram Growth Strategy & Spring Workshop Reel Templates',
    category: 'social_media',
    description: 'We are launching our Spring Plant Propagation Workshops and need a student marketing talent to design eye-catching Canva templates and a 30-day Instagram content calendar.',
    problem_statement: 'We have beautiful rare plants and workshops, but our social media posts are sporadic and lack a consistent visual identity to attract younger local plant enthusiasts.',
    deliverables_description: '1. 30-Day Content Calendar with post ideas and caption prompts\n2. 8 reusable Canva post & story templates with brand colors\n3. 4 short-form video concept hooks for TikTok / Instagram Reels\n4. Hashtag & local discovery guide.',
    skills_required: ['Social Media Marketing', 'Canva', 'Content Strategy', 'Instagram Reels', 'Copywriting'],
    estimated_hours_per_week: 5,
    duration_weeks: 2,
    perks: [
      'Verified Experience Letter & Testimonial',
      'Portfolio Showcase Rights & Metric Stats Access',
      '1-on-1 Business Mentorship on Local Retail Operations'
    ],
    status: 'open',
    applicant_count: 3,
    featured: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    business: INITIAL_BUSINESSES[2]
  },
  {
    id: 'p-rejected-1',
    business_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Automated Direct Messaging & Aggressive Cold Outreach Campaign',
    category: 'marketing',
    description: 'Project proposal to build mass cold DM spam scripts on Instagram and Twitter.',
    problem_statement: 'Flagged by moderation: Violates platform safety rules on automated spamming and cold messaging.',
    deliverables_description: 'N/A - Scope prohibited under community terms of service.',
    skills_required: ['Spam Automation', 'Cold Outreach'],
    estimated_hours_per_week: 5,
    duration_weeks: 1,
    perks: ['N/A'],
    status: 'rejected',
    applicant_count: 0,
    featured: false,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    business: INITIAL_BUSINESSES[1]
  },
  {
    id: 'p-103',
    business_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
    title: 'Brand Identity & Member Onboarding Welcome Packet',
    category: 'design',
    description: 'Looking for a talented graphic design or UI/UX student to revamp our fitness club logo vectors, workout tracker PDF sheets, and new member welcome booklet.',
    problem_statement: 'Our current onboarding materials look dated and printed on standard black-and-white sheets. We want vibrant, modern branding that inspires new members.',
    deliverables_description: '1. Modernized vector logo package (SVG, PNG, dark/light modes)\n2. 4-page Member Welcome Guide PDF\n3. Printable 12-week Workout Log Sheet\n4. Brand Style Guide (color palette, typography, icon set).',
    skills_required: ['Figma', 'Graphic Design', 'Adobe Illustrator', 'Brand Identity', 'Typography'],
    estimated_hours_per_week: 8,
    duration_weeks: 3,
    perks: [
      'Official Client Reference & LinkedIn Endorsement',
      'Complete Design Credit on all printed Gym Materials',
      'Complimentary 3-Month Gym Membership'
    ],
    status: 'open',
    applicant_count: 1,
    featured: false,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    business: INITIAL_BUSINESSES[3]
  },
  {
    id: 'p-104',
    business_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    title: 'Local SEO Audit & Google Business Profile Optimization',
    category: 'marketing',
    description: 'Help our bakery rank #1 on Google Maps and Local Search for "Artisan Bakery" and "Fresh Sourdough Bread" in Austin.',
    problem_statement: 'We have great foot traffic, but tourists and new residents searching online often get directed to big box supermarkets instead of our local shop.',
    deliverables_description: '1. Local SEO keyword roadmap\n2. Google Business Profile setup & photo tagging optimization\n3. Review generation strategy guide for counter staff\n4. Competitor analysis report.',
    skills_required: ['SEO', 'Google Business Profile', 'Local Search', 'Market Research', 'Copywriting'],
    estimated_hours_per_week: 4,
    duration_weeks: 2,
    perks: [
      'Documented Case Study with before/after ranking metrics',
      'Signed Recommendation Letter from Business Owner',
      'Direct Business Consultation Reference'
    ],
    status: 'open',
    applicant_count: 0,
    featured: false,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    business: INITIAL_BUSINESSES[1]
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-thumbnail-sarah',
    project_id: 'proj-thumbnail-designer',
    student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    pitch_note: 'Hi nextphase! I am an experienced visual designer specializing in high-CTR YouTube thumbnails and social graphics. I have created thumbnails for creator channels averaging 100k+ views using high-contrast color grading, 3D text styling, and emotional facial emphasis. I can deliver 3 concept drafts in 24 hours!',
    estimated_days: 14,
    proposed_milestones: [
      'Style exploration & 3 layout mockups',
      'Batch 1: 5 High-CTR YouTube Thumbnails',
      'Batch 2: 5 YouTube Thumbnails + Instagram Story Covers + Layered PSDs'
    ],
    relevant_links: ['https://behance.net/sarahchen-design', 'https://github.com/sarahchen-dev'],
    status: 'accepted',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[0],
    project: INITIAL_PROJECTS[0]
  },
  {
    id: 'app-thumbnail-alex',
    project_id: 'proj-thumbnail-designer',
    student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    pitch_note: 'Hello nextphase! As a digital marketing & content creator senior, I specialize in thumbnail A/B testing psychology (click triggers, subject cutouts, vibrant borders). I would love to design your thumbnails and help optimize your YouTube CTR!',
    estimated_days: 10,
    proposed_milestones: [
      'Thumbnail visual benchmark & CTR trigger map',
      'Batch design of 10 customized thumbnails'
    ],
    relevant_links: ['https://instagram.com/alexmarketing'],
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[1],
    project: INITIAL_PROJECTS[0]
  },
  {
    id: 'app-501',
    project_id: 'p-101',
    student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    pitch_note: 'Hi Elena! I love Hearth & Stone (your rosemary sourdough is incredible!). I am a junior CS student specializing in fast, mobile-responsive Next.js & Tailwind websites. I can build a clean menu page and automated catering booking form in under 2 weeks so your customers can order seamlessly on mobile.',
    estimated_days: 14,
    proposed_milestones: [
      'Wireframe & menu layout design in Figma',
      'Build responsive frontend with Next.js & Tailwind',
      'Integrate email inquiry form & deploy to custom domain'
    ],
    relevant_links: ['https://github.com/sarahchen-dev', 'https://behance.net/sarahchen-design'],
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[0],
    project: INITIAL_PROJECTS[1]
  },
  {
    id: 'app-502',
    project_id: 'p-102',
    student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    pitch_note: 'Hello David! As an avid houseplant collector and senior marketing major, I would love to build your 30-day spring campaign. I have previously grown an eco-brand Instagram page by 240% using short educational reels on plant care. I will provide high-quality Canva templates that your team can reuse anytime!',
    estimated_days: 10,
    proposed_milestones: [
      'Audience research & 30-day content roadmap',
      '8 branded Canva templates + Reel audio hooks',
      'Staff training guide on posting & hashtag strategy'
    ],
    relevant_links: ['https://instagram.com/alexmarketing'],
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    student: INITIAL_STUDENTS[1],
    project: INITIAL_PROJECTS[2]
  }
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'fb-1',
    project_id: 'p-prev-1',
    author_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    recipient_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    rating: 5,
    testimonial: 'Sarah was extraordinary! She treated our small business problem with genuine care, delivered ahead of schedule, and gave us an amazing website that doubled our weekend orders. Highest recommendation!',
    is_public_on_profile: true,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    author_name: 'Elena Martinez (Hearth & Stone Bakery)',
    author_role: 'business',
    project_title: 'Artisan Bakery Menu & Online Ordering Page',
    endorsements: ['Fast Delivery', 'Clean Code', 'Great Communication', 'Proactive']
  },
  {
    id: 'fb-2',
    project_id: 'p-prev-2',
    author_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
    recipient_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
    rating: 5,
    testimonial: 'Alex created phenomenal content templates for our nursery. Our engagement tripled in 3 weeks. Incredible student talent!',
    is_public_on_profile: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    author_name: 'David Park (Greenscape Nursery)',
    author_role: 'business',
    project_title: 'Social Media Campaign & Content Templates',
    endorsements: ['High Creativity', 'Strategic Thinker', 'Super Responsive']
  }
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-thumbnail-designer-1',
    project_id: 'proj-thumbnail-designer',
    student_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    business_id: 'nextphase-client-id',
    status: 'in_progress',
    started_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    tasks: [
      {
        id: 'task-thumb-1',
        workspace_id: 'ws-thumbnail-designer-1',
        title: 'Kickoff: Discuss brand guidelines, fonts, and video themes',
        is_completed: true,
        created_by: 'nextphase-client-id',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'task-thumb-2',
        workspace_id: 'ws-thumbnail-designer-1',
        title: 'Draft initial 3 thumbnail concept sketches & style directions',
        is_completed: true,
        created_by: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'task-thumb-3',
        workspace_id: 'ws-thumbnail-designer-1',
        title: 'Complete batch of 10 High-CTR YouTube Thumbnails (1280x720 PNG/PSD)',
        is_completed: false,
        created_by: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'task-thumb-4',
        workspace_id: 'ws-thumbnail-designer-1',
        title: 'Final review & handoff of source PSD files and Instagram covers',
        is_completed: false,
        created_by: 'nextphase-client-id',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      }
    ],
    messages: [
      {
        id: 'msg-thumb-1',
        workspace_id: 'ws-thumbnail-designer-1',
        sender_id: 'nextphase-client-id',
        sender_name: 'nextphase',
        sender_role: 'business',
        content: 'Hi Sarah! Super excited to collaborate with you on the thumbnail designer project for nextphase.',
        is_flagged: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'msg-thumb-2',
        workspace_id: 'ws-thumbnail-designer-1',
        sender_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        sender_name: 'Sarah Chen',
        sender_role: 'student',
        content: 'Hey nextphase! Thanks for accepting my application. I have uploaded the first concept drafts and thumbnail layout variations.',
        is_flagged: false,
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'msg-thumb-3',
        workspace_id: 'ws-thumbnail-designer-1',
        sender_id: 'nextphase-client-id',
        sender_name: 'nextphase',
        sender_role: 'business',
        content: 'These concepts look fantastic! Let us proceed with batch 1 with the high contrast typography.',
        is_flagged: false,
        created_at: new Date().toISOString(),
      }
    ],
    files: [
      {
        id: 'file-thumb-1',
        workspace_id: 'ws-thumbnail-designer-1',
        uploader_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        file_name: 'nextphase_thumbnail_concepts_v1.zip',
        file_path: '/files/nextphase_thumbnail_concepts_v1.zip',
        file_size_bytes: 14857600,
        mime_type: 'application/zip',
        created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      }
    ]
  }
];

export const INITIAL_REPORTS: Report[] = [];


