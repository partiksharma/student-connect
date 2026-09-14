-- ==============================================================================
-- StudentConnect Platform: Seed Data for Development & Testing
-- ==============================================================================

-- 1. Demo User Profiles
INSERT INTO public.profiles (id, email, role, status)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@studentconnect.org', 'admin', 'approved'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'sarah.chen@stanford.edu', 'student', 'approved'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'marcus.vance@austin.edu', 'student', 'approved'),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'elena.rostova@nyu.edu', 'student', 'pending_approval'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'owner@artisanbakery.com', 'business', 'approved'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'growth@greenscape.eco', 'business', 'approved'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'hello@localcoffeeroasters.com', 'business', 'pending_approval')
ON CONFLICT (id) DO NOTHING;

-- 2. Student Profiles
INSERT INTO public.student_profiles (user_id, full_name, school, graduation_year, skills, availability_hours_per_week, bio, portfolio_urls, avatar_url)
VALUES
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'Sarah Chen',
        'Stanford University',
        2027,
        ARRAY['Social Media Strategy', 'Content Writing', 'Canva', 'Instagram Growth', 'SEO Copywriting'],
        8,
        'Junior studying Communications & Digital Media. Passionate about helping local bakeries and sustainable brands tell their story and grow their community.',
        ARRAY['https://github.com/sarah-chen', 'https://behance.net/sarahchen-media'],
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
        'Marcus Vance',
        'UT Austin',
        2026,
        ARRAY['React', 'Next.js', 'Tailwind CSS', 'Shopify', 'Webflow', 'Google Analytics'],
        10,
        'Senior Computer Science major building fast, accessible web experiences for small local businesses. 3 past completed projects.',
        ARRAY['https://marcusvance.dev', 'https://github.com/marcusvance'],
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    ),
    (
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24',
        'Elena Rostova',
        'New York University',
        2028,
        ARRAY['Figma', 'UI/UX Design', 'Brand Identity', 'Illustration'],
        6,
        'Design enthusiast looking to revamp visual identities for neighborhood coffee shops and independent retailers.',
        ARRAY['https://dribbble.com/elenarostova'],
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    )
ON CONFLICT (user_id) DO NOTHING;

-- 3. Business Profiles
INSERT INTO public.business_profiles (user_id, business_name, industry, business_size, location, website_url, description, logo_url)
VALUES
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'Rustic Crumb Bakery',
        'Food & Beverage / Retail',
        '1-5',
        'Portland, OR',
        'https://rusticcrumb.example.com',
        'Family-owned sourdough bakery specializing in organic ancient grains and artisan pastries. Serving the community since 2018.',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80'
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
        'GreenScape Eco Services',
        'Environmental & Home Services',
        '6-20',
        'Austin, TX',
        'https://greenscape-eco.example.com',
        'Eco-friendly landscape design, rain garden installation, and native Texas plant preservation.',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80'
    ),
    (
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
        'Summit Ridge Coffee',
        'Food & Beverage',
        '1-5',
        'Denver, CO',
        'https://summitridgecoffee.example.com',
        'Micro-batch fair trade roastery sourcing direct from Colombian and Ethiopian smallholder farms.',
        'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80'
    )
ON CONFLICT (user_id) DO NOTHING;

-- 4. Projects
INSERT INTO public.projects (id, business_id, title, category, description, deliverables_description, skills_required, estimated_hours_per_week, duration_weeks, status)
VALUES
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'Instagram Content Strategy & 30-Day Launch Calendar',
        'marketing',
        'We want to highlight our seasonal pastry specials and behind-the-scenes sourdough baking process to boost weekend foot traffic.',
        '1. 30-day content calendar with image templates in Canva.\n2. 5 high-converting Instagram Reel concepts & captions.\n3. Local hashtag research cheat sheet.',
        ARRAY['Social Media Strategy', 'Instagram Growth', 'Canva', 'Content Writing'],
        4,
        4,
        'in_progress'
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34',
        'Website Redesign & Native Plants Service Booking Page',
        'web_tech',
        'Our existing website is outdated and not mobile-friendly. We need a modern, fast 3-page site with an inquiry contact form for Austin homeowners.',
        '1. Responsive homepage, about page, and services inquiry page.\n2. Integration with simple email notification form.\n3. Mobile optimization score > 90.',
        ARRAY['React', 'Next.js', 'Tailwind CSS', 'UI/UX Design'],
        6,
        6,
        'open'
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'Brand Style Guide & Custom Bakery Packaging Labels',
        'design',
        'Design cohesive product labels for our artisan flour bags and jam jars with our vintage aesthetic.',
        '1. Vector label templates for print (3 sizes).\n2. Color palette and typography guide.',
        ARRAY['Figma', 'Brand Identity', 'Illustration', 'Graphic Design'],
        4,
        3,
        'completed'
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35',
        'Local SEO & Google Business Profile Optimization',
        'marketing',
        'Improve our Google Maps ranking and discoverability for specialty coffee in the Denver area.',
        '1. Audit report of current ranking & keywords.\n2. Fully optimized Google Business Profile with photo schedule.\n3. 10 review response templates.',
        ARRAY['SEO Copywriting', 'Google Analytics', 'Local SEO'],
        3,
        3,
        'pending_approval'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Applications
INSERT INTO public.applications (id, project_id, student_id, pitch_note, status)
VALUES
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'Hi Rustic Crumb! I love artisan sourdough and have built visual content strategies for local food producers in the Bay Area. I would love to build your 30-day reel and story calendar!',
        'accepted'
    ),
    (
        'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
        'Hello GreenScape team! I am a senior CS student at UT Austin with strong experience building fast Next.js & Tailwind websites. Eco-landscaping is something I care deeply about and I can build your mobile-optimized booking flow.',
        'pending'
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Workspace
INSERT INTO public.workspaces (id, project_id, student_id, business_id, status, started_at)
VALUES
    (
        'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61',
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'in_progress',
        NOW() - INTERVAL '7 days'
    )
ON CONFLICT (id) DO NOTHING;

-- 7. Workspace Tasks
INSERT INTO public.workspace_tasks (workspace_id, title, is_completed, created_by)
VALUES
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'Audit existing Instagram posts & audience demographics', TRUE, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'Draft 5 reel storyboard concepts & hook lines', TRUE, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'Deliver editable Canva brand template kit', FALSE, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'Final 30-day publishing calendar review with bakery owner', FALSE, 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33');

-- 8. Messages
INSERT INTO public.messages (workspace_id, sender_id, content, created_at)
VALUES
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Welcome Sarah! Super excited to work with you on our Instagram revamp.', NOW() - INTERVAL '6 days'),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Thank you! I reviewed your current feed. Sourdough loaf scoring videos perform exceptionally well in engagement. I will send over the first 5 storyboard hooks tomorrow!', NOW() - INTERVAL '5 days'),
    ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Love that idea. We bake fresh batches every morning at 6 AM, so I can capture all the video footage you need.', NOW() - INTERVAL '4 days');

-- 9. Feedback (Completed Project)
INSERT INTO public.feedback (project_id, author_id, recipient_id, rating, testimonial)
VALUES
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        5,
        'Sarah went above and beyond for our bakery packaging labels! The designs are gorgeous, print-ready, and our customers constantly compliment them. Highly recommend Sarah to any business.'
    ),
    (
        'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        5,
        'Working with Rustic Crumb Bakery was an incredible experience. Clear requirements, prompt communication, and genuine appreciation for the work. A fantastic partner for student projects!'
    )
ON CONFLICT (project_id, author_id) DO NOTHING;
