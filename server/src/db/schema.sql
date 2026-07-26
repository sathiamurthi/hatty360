-- Database schema for Hatty360 (Lingayat Community App)

-- 1. Hattys
CREATE TABLE IF NOT EXISTS hattys (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT NOT NULL
);

-- Seed Hattys
INSERT INTO hattys (id, name, region) VALUES
(1, 'Kethorai', 'Coonoor Region'),
(2, 'Jegathala', 'Kotagiri Region'),
(3, 'Balacola', 'Ooty Region'),
(4, 'Bikkatti', 'Kundah Region'),
(5, 'Kethi', 'Valley Region'),
(6, 'Hubbathalai', 'Coonoor Region'),
(7, 'Melur', 'Coonoor Region'),
(8, 'Adigaratty', 'Ooty Region')
ON CONFLICT DO NOTHING;

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  father_name TEXT,
  mother_name TEXT,
  gender TEXT,
  location TEXT,
  profession TEXT,
  hatty_id INTEGER REFERENCES hattys(id),
  role TEXT DEFAULT 'Member', -- 'Member', 'Thalaivar', 'Secretary', 'Finance Secretary', 'Admin'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'suspended'
  selected_language TEXT DEFAULT 'en', -- 'en', 'kn', 'ta', 'bd'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Users (Default credentials for testing)
-- Phone: 9999999999 -> Community Admin (Shiva Gowda)
-- Phone: 8888888888 -> Hatty Thalaivar (Basavaraj)
-- Phone: 7777777777 -> Hatty Secretary (Lingappa)
-- Phone: 6666666666 -> Hatty Finance Secretary (Mahadevappa)
-- Phone: 5555555555 -> Approved Member (Parvati)
-- Phone: 4444444444 -> Pending Member (Kumar)
INSERT INTO users (phone, name, father_name, mother_name, gender, location, profession, hatty_id, role, status, selected_language) VALUES
('9999999999', 'Shiva Gowda', 'Malleshappa', 'Gangamma', 'Male', 'Ooty', 'Business Owner', 3, 'Admin', 'approved', 'en'),
('8888888888', 'Basavaraj Thalaivar', 'Gurushantappa', 'Siddamma', 'Male', 'Kethorai', 'Retired Officer', 1, 'Thalaivar', 'approved', 'kn'),
('7777777777', 'Lingappa Secretary', 'Somashekhar', 'Girijamma', 'Male', 'Kethorai', 'Teacher', 1, 'Secretary', 'approved', 'en'),
('6666666666', 'Mahadevappa Finance', 'Nandeesh', 'Parvathamma', 'Male', 'Kethorai', 'Accountant', 1, 'Finance Secretary', 'approved', 'en'),
('5555555555', 'Parvati Patil', 'Kalyanappa', 'Neelamma', 'Female', 'Kethorai', 'IT Professional', 1, 'Member', 'approved', 'en'),
('4444444444', 'Kumar Swamy', 'Sharanappa', 'Shantamma', 'Male', 'Jegathala', 'Farmer', 2, 'Member', 'pending', 'ta')
ON CONFLICT (phone) DO NOTHING;

-- 3. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'community', -- 'community', 'hatty'
  hatty_id INTEGER REFERENCES hattys(id),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Announcements
INSERT INTO announcements (title, content, type, hatty_id, created_by) VALUES
('Welcome to Hatty360', 'We are pleased to launch the Hatty360 app to connect all 8 Hattys of the Lingayat community. Share, donate, and connect!', 'community', NULL, 'Shiva Gowda'),
('Annual Student Felicitation 2026', 'Nominations are now open for student felicitation of 10th and 12th graders who scored above 90%. Submit details under the Achievements tab.', 'community', NULL, 'Shiva Gowda'),
('Kethorai Temple Festival Invitation', 'The annual temple car festival will be celebrated on August 15th. All members are requested to join and help with preparations.', 'hatty', 1, 'Basavaraj Thalaivar')
ON CONFLICT DO NOTHING;

-- 4. Events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  location TEXT NOT NULL,
  hatty_id INTEGER REFERENCES hattys(id),
  type TEXT DEFAULT 'community', -- 'community', 'hatty'
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Events
INSERT INTO events (title, description, event_date, event_time, location, hatty_id, type, created_by) VALUES
('Guru Basava Jayanthi Celebration', 'Grand celebration of Basava Jayanthi with community prasad and cultural programs.', '2026-08-05', '09:00 AM', 'Community Hall, Balacola', NULL, 'community', 'Shiva Gowda'),
('Kethorai Temple Cleansing Seva', 'Shramadaan for cleansing the temple premises before the festival.', '2026-08-10', '07:00 AM', 'Kethorai Temple Ground', 1, 'hatty', 'Basavaraj Thalaivar'),
('Youth Career Guidance Seminar', 'Special coaching and mentoring for college graduates by industry professionals.', '2026-09-01', '10:00 AM', 'Ooty Auditorium', NULL, 'community', 'Shiva Gowda')
ON CONFLICT DO NOTHING;

-- 5. RSVPs
CREATE TABLE IF NOT EXISTS rsvps (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'going', 'maybe', 'not_going'
  guests_count INTEGER DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id)
);

-- Seed RSVPs
INSERT INTO rsvps (event_id, user_id, status, guests_count) VALUES
(1, 1, 'going', 3),
(1, 5, 'going', 2),
(2, 5, 'going', 1)
ON CONFLICT DO NOTHING;

-- 6. Fundraising Campaigns
CREATE TABLE IF NOT EXISTS fundraising_campaigns (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  raised_amount DECIMAL(12, 2) DEFAULT 0.00,
  type TEXT NOT NULL, -- 'temple', 'felicitation', 'festival'
  hatty_id INTEGER REFERENCES hattys(id)
);

-- Seed Campaigns (8 hattys temple funds + 1 student felicitation)
INSERT INTO fundraising_campaigns (id, title, description, target_amount, raised_amount, type, hatty_id) VALUES
(1, 'Kethorai Basaveshwara Temple Construction', 'Rebuilding the main sanctuary and establishing a community dining hall.', 1500000.00, 450000.00, 'temple', 1),
(2, 'Jegathala Temple Renovation', 'Repairing the roofing and painting of the temple towers.', 800000.00, 120000.00, 'temple', 2),
(3, 'Balacola Temple Gopura Fund', 'Constructing the main entrance Gopura for the historic temple.', 2000000.00, 850000.00, 'temple', 3),
(4, 'Bikkatti Temple Restoration', 'Sanctuary wall restoration and marble flooring.', 1000000.00, 50000.00, 'temple', 4),
(5, 'Kethi Temple Expansion', 'Adding extra rooms for pilgrims and general maintenance.', 1200000.00, 300000.00, 'temple', 5),
(6, 'Hubbathalai Temple Compound Wall', 'Securing the temple premises with a stone compound wall.', 600000.00, 450000.00, 'temple', 6),
(7, 'Melur Temple Prasad Hall Construction', 'Creating a spacious dining area for distributing prasad.', 900000.00, 200000.00, 'temple', 7),
(8, 'Adigaratty Temple Silver Chariot Fund', 'Crafting a new silver chariot for the annual rathotsava.', 2500000.00, 1950000.00, 'temple', 8),
(9, 'Community-Wide Student Felicitation 2026', 'Fund for awarding cash prizes and scholarships to top Lingayat students.', 500000.00, 150000.00, 'felicitation', NULL)
ON CONFLICT (id) DO NOTHING;

-- 7. Donations
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES fundraising_campaigns(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'completed',
  transaction_id TEXT UNIQUE NOT NULL,
  donor_name TEXT NOT NULL,
  hatty_id INTEGER REFERENCES hattys(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Donations
INSERT INTO donations (campaign_id, user_id, amount, transaction_id, donor_name, hatty_id) VALUES
(1, 5, 5000.00, 'TXN_KETH_001', 'Parvati Patil', 1),
(1, 1, 25000.00, 'TXN_KETH_002', 'Shiva Gowda', 1),
(9, 5, 2000.00, 'TXN_FEL_001', 'Parvati Patil', 1),
(8, 1, 100000.00, 'TXN_ADI_001', 'Shiva Gowda', 8)
ON CONFLICT (transaction_id) DO NOTHING;

-- 8. Vachanas
CREATE TABLE IF NOT EXISTS vachanas (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  text_kannada TEXT NOT NULL,
  text_english TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  explanation TEXT NOT NULL
);

-- Seed Vachanas (Basavanna, Akka Mahadevi, Allama Prabhu)
INSERT INTO vachanas (author, text_kannada, text_english, transliteration, explanation) VALUES
(
  'Basavanna',
  'ಕಳಬೇಡ, ಕೊಲಬೇಡ, ಹುಸಿಯ ನುಡಿಯಲು ಬೇಡ, ಮುನಿಯಬೇಡ, ಅನ್ಯರಿಗೆ ಅಸಹ್ಯಪಡಬೇಡ, ತನ್ನ ಬಣ್ಣಿಸಬೇಡ, ಇದಿರು ಹಳಿಯಲು ಬೇಡ. ಇದೇ ಅಂತರಂಗಶುದ್ಧಿ, ಇದೇ ಬಹಿರಂಗಶುದ್ಧಿ, ಇದೇ ನಮ್ಮ ಕೂಡಲಸಂಗಮದೇವನನೊಲಿಸುವ ಪರಿ.',
  'Do not steal, do not kill, do not speak lies. Do not lose your temper, do not detest others. Do not self-glorify, do not deprecate others. This is internal purity, this is external purity; this is the way to win our Koodalasangamadeva.',
  'Kalabeda, kolabeda, husiya nudiyalu beda, muniyabeda, anyarige asahyapadabeda, tanna bannisabeda, idiru haliyalu beda. Ide antarangashuddhi, ide bahirangashuddhi, ide namma Koodalasangamadevananolisuva pari.',
  'This vachana forms the core moral code of Veerashaivism (Lingayatism), describing the seven commandments for pure living and spiritual realization.'
),
(
  'Basavanna',
  'ಉಳ್ಳವರು ಶಿವಾಲಯ ಮಾಡುವರು ನಾನೇನ ಮಾಡಲಿ ಬಡವನಯ್ಯಾ, ಎನ್ನ ಕಾಲೇ ಕಂಬ, ದೇಹವೇ ದೇಗುಲ, ಶಿರವೇ ಹೊನ್ನ ಕಳಶವಯ್ಯಾ, ಕೂಡಲಸಂಗಮದೇವ ಕೇಳಯ್ಯಾ, ಸ್ಥಾವರಕ್ಕಳಿವುಂಟು ಜಂಗಮಕ್ಕಳಿವಿಲ್ಲ.',
  'The rich will make temples for Shiva, what shall I, a poor man, do? My legs are pillars, my body the temple, my head the golden cupola. Listen, O Lord of the Meeting Rivers, things standing shall fall, but the moving shall ever stay.',
  'Ullavaru shivalaya maduvaru nanena madali badavanayya, Enna kale kamba, dehave degula, shirave honna kalashavayya. Koodalasangamadeva kelayya, sthavarakkalivuntu jangamakkalivilla.',
  'Highlights the belief that the human body itself is the ultimate temple of the Divine. Physical temples decay, but the living soul/spirit is eternal.'
),
(
  'Akka Mahadevi',
  'ಹಸಿವಾದರೆ ಭಿಕ್ಷಾನ್ನಗಳುಂಟು, ತೃಷೆಯಾದರೆ ಕೆರೆ ಬಾವಿ ಹಳ್ಳಗಳುಂಟು, ಶಯನಕ್ಕೆ ಹಾಳು ದೇಗುಲಗಳುಂಟು, ಆತ್ಮಸಂಗಾತಕ್ಕೆ ಚೆನ್ನಮಲ್ಲಿಕಾರ್ಜುನನೆನಗುಂಟು.',
  'If hungry, there is alms food; if thirsty, there are ponds, wells, and streams; for sleep, there are ruined temples; for the soul''s companionship, I have Chennamallikarjuna.',
  'Hasivadare bhikshannagaluntu, trisheyadare kere bavi hallagaluntu, shayanakke halu degulagaluntu, atmasangatakke Chennamallikarjananaguntu.',
  'Expresses Akka Mahadevi''s absolute surrender and detachment from worldly comforts, finding all she needs in her union with Shiva (Chennamallikarjuna).'
)
ON CONFLICT DO NOTHING;

-- 9. Help Board & Jobs
CREATE TABLE IF NOT EXISTS help_board_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'medical', 'financial', 'job_opening', 'job_seeking', 'general'
  is_anonymous BOOLEAN DEFAULT FALSE,
  contact_number TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Help Board Posts
INSERT INTO help_board_posts (user_id, title, content, category, is_anonymous, contact_number) VALUES
(5, 'Urgent: Blood Donor Needed (O-ve)', 'My relative is admitted in Ooty District Hospital and requires O-negative blood for an emergency surgery tomorrow morning.', 'medical', FALSE, '9876543210'),
(1, 'Software Engineer Job Referral', 'Our company (Tech Solutions) is hiring React Developers with 2+ years of experience. Please share your resumes with me.', 'job_opening', FALSE, '9999999999'),
(5, 'Sponsorship for Higher Education', 'A brilliant student from our hatty has secured admission in engineering but needs Rs. 30,000 for tuition fees. Any help is appreciated.', 'financial', TRUE, NULL)
ON CONFLICT DO NOTHING;

-- 10. Issues / Grievance Reports
CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL, -- 'within_hatty', 'community_wide'
  status TEXT DEFAULT 'reported', -- 'reported', 'investigating', 'resolved'
  is_anonymous BOOLEAN DEFAULT FALSE,
  hatty_id INTEGER REFERENCES hattys(id),
  escalated_to_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Issues
INSERT INTO issues (reporter_id, title, description, type, status, is_anonymous, hatty_id, escalated_to_admin) VALUES
(5, 'Water Leakage in Main Street', 'The main drinking water pipe has a leak near the temple gate. Water is being wasted for 3 days.', 'within_hatty', 'reported', FALSE, 1, FALSE),
(1, 'Encroachment on Common Grazing Land', 'Private individuals are constructing fences around the common pasture land in Melur. Needs immediate legal attention.', 'community_wide', 'investigating', FALSE, 7, TRUE)
ON CONFLICT DO NOTHING;

-- 11. Women's Self-Help Groups (SHGs)
CREATE TABLE IF NOT EXISTS womens_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  hatty_id INTEGER REFERENCES hattys(id),
  head_id INTEGER REFERENCES users(id),
  monthly_savings_amt DECIMAL(10, 2) DEFAULT 500.00,
  status TEXT DEFAULT 'approved', -- 'pending', 'approved'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed SHGs
INSERT INTO womens_groups (name, hatty_id, head_id, monthly_savings_amt) VALUES
('Basava Mahila Sakhi SHG', 1, 5, 500.00)
ON CONFLICT DO NOTHING;

-- 12. SHG Savings & Loan Ledger
CREATE TABLE IF NOT EXISTS shg_ledger (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES womens_groups(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  type TEXT NOT NULL, -- 'savings', 'loan_disbursement', 'loan_repayment'
  amount DECIMAL(10, 2) NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Seed Ledger
INSERT INTO shg_ledger (group_id, user_id, type, amount, log_date) VALUES
(1, 5, 'savings', 500.00, '2026-06-01'),
(1, 5, 'savings', 500.00, '2026-07-01')
ON CONFLICT DO NOTHING;

-- 13. Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  context_action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Feedback
INSERT INTO feedback (user_id, rating, comment, context_action) VALUES
(5, 5, 'The RSVP for the temple event was so easy to use! Great job.', 'event_rsvp'),
(1, 4, 'UPI payment was fast, but can we download PDF receipt?', 'donation_success')
ON CONFLICT DO NOTHING;

-- 14. Advertisers & Sponsored Ads
CREATE TABLE IF NOT EXISTS advertisers (
  id SERIAL PRIMARY KEY,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'approved' -- 'pending', 'approved'
);

CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  advertiser_id INTEGER REFERENCES advertisers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  ad_type TEXT NOT NULL, -- 'banner', 'coupon', 'event'
  status TEXT DEFAULT 'approved', -- 'pending', 'approved'
  price DECIMAL(8, 2) DEFAULT 0.00,
  duration_weeks INTEGER DEFAULT 4
);

-- Seed Advertisers and Ads
INSERT INTO advertisers (id, business_name, category, contact_phone, email, status) VALUES
(1, 'Shanti Wedding Hall & Catering', 'Caterer/Hall', '9894012345', 'info@shantihall.com', 'approved'),
(2, 'Vachana Publications', 'Book Store', '9443298765', 'sales@vachanabooks.com', 'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ads (advertiser_id, title, description, ad_type, status, price, duration_weeks) VALUES
(1, '10% Discount on Wedding Hall Bookings', 'Exclusive discount for community families booking for marriage ceremonies between Aug-Oct 2026.', 'coupon', 'approved', 500.00, 8),
(2, 'Complete Vachana Samputa Collection', 'Hardcover compilation of Veerashaiva teachings. Doorstep delivery available across Nilgiris.', 'banner', 'approved', 200.00, 4)
ON CONFLICT DO NOTHING;

-- 16. Community Groups
CREATE TABLE IF NOT EXISTS community_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  privacy TEXT NOT NULL DEFAULT 'public', -- 'public', 'private'
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Threads inside groups
CREATE TABLE IF NOT EXISTS threads (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES community_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'pinned'
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Replies inside threads
CREATE TABLE IF NOT EXISTS thread_replies (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Helpline Contacts
CREATE TABLE IF NOT EXISTS helpline_contacts (
  id SERIAL PRIMARY KEY,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  hatty_id INTEGER REFERENCES hattys(id) ON DELETE CASCADE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Privacy Alterations
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_contact_publicly BOOLEAN DEFAULT FALSE;

-- 21. Contact Access Requests
CREATE TABLE IF NOT EXISTS contact_requests (
  id SERIAL PRIMARY KEY,
  requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  requested_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, requested_id)
);
