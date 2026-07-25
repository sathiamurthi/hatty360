# Lingayat community app — feature overview (v1)

Simple reference document covering everything discussed so far. Meant to be shared with the committee/developer and revised after feedback — not a final spec.

## Purpose

A mobile-first app for the Lingayat community, organized around 8 hattys, to handle communication, fundraising, member connection, and community governance in one place instead of scattered WhatsApp groups.

## Roles

| Role | Scope | Key permissions |
|---|---|---|
| Member | Self | Browse directory, RSVP events, post to help board/threads, donate, report issues |
| Hatty thalaivar | One hatty | Approve new members, approve within-hatty issues, sign off on hatty campaigns/festivals |
| Secretary | One hatty | Post announcements/events, manage festival calendar, review student nominations |
| Finance secretary | One hatty | Manage donation ledger, log expenses, upload utilization proof |
| Community admin | All hattys | Approve escalated issues, approve women's group creation, manage shared campaigns (student felicitation), moderate threads/groups |
| Group creator | One group | Any member — create/manage a community thread or group, no approval needed |

**Note:** community admin can create additional custom roles beyond this default set (e.g. event coordinator, youth wing lead) and assign permissions per role — role management should be configurable, not hardcoded.

## Modules

### 1. Onboarding
Name + mobile number (no OTP) → profile setup → submitted for thalaivar approval → once approved, member logs in directly with mobile number going forward.

**Registration (mandatory, minimal):**
- Full name
- Phone number

**Profile setup (separate step, prompted after registration, editable anytime):**
- Hatty (mandatory before full access — needed for approval routing)
- Gender (mandatory before full access — needed for women's group eligibility)
- Father's name
- Mother's name
- Profession
- Location/city (used in directory search)

**Approval → login:** once thalaivar/community admin approves the profile, the member can log in with just their mobile number on future visits — no re-verification step.

**Note on security:** skipping any verification (OTP or otherwise) means anyone who knows a member's phone number could log in as them, since mobile number becomes the sole credential. Worth deciding whether to keep an OTP step just for the very first login (to confirm the number is genuinely theirs) even if later logins stay simple — a call for the committee, not a technical requirement.

### 2. Announcements & events
Hatty-level and community-wide announcements. Event calendar with RSVP.

### 3. Member directory
Searchable by hatty, location, profession. Phone numbers hidden by default, visible on request. Members can opt out.

### 4. Vachana / knowledge library
Vachana literature and teachings, searchable, Kannada/English/transliteration.

### 5. Help board
Job referrals, medical/financial help requests, general asks. Light moderation only, no approval gate.

### 6. Hatty fundraising — temple construction
Each of the 8 hattys runs its own ongoing campaign. Progress bar, donor count, milestone updates, donation receipts. UPI-based.

### 7. Student felicitation (annual, community-wide)
Shared campaign combining donations + student nominations (10th/12th pass). Nomination requires secretary approval. Past years archived.

### 8. Festival calendar
Per-hatty festival listings. Optional mini-fundraiser per festival (decorations, prasad, hall) — same donation mechanism as temple fund, lighter weight.

### 9. Issue reporting & escalation
Two types: within-hatty (visible to thalaivar/secretary only) and community-wide (escalated by thalaivar to community admin — members can't skip the hierarchy). Status tracking, optional anonymity.

### 10. Women's group (SHG)
Woman member proposes a group → thalaivar + community admin approve → group elects own head/treasurer → group runs its own monthly savings log and loan/rotation tracker. Separate from hatty temple fund and donation flow.

### 11. Community threads, groups & invite
Peer-to-peer discussion threads, member-created groups (open or invite-only), no approval needed. Two separate invite actions: invite a friend to a group (in-app), invite someone new to the app (share link).

### 12. Matrimonial — link out only, not built in-house
Decision: do not build. Established platforms (BharatMatrimony/Lingayat Matrimony, 100Matrimony, Lingayath Weds, Saptapadi Vivah) already serve this exact community across Karnataka with verified profiles at scale. Building in-house would mean competing from zero and taking on IT Act matrimonial-site compliance (ID verification, grievance officer, IP logging) for a low-odds feature.
**v1 approach:** a "Matrimony" tab that deep-links out to an established platform, possibly via an affiliate/referral arrangement.

### 13. Feedback
In-app feedback: a simple form (star rating + free text) accessible from settings, plus lightweight in-context prompts after key actions (e.g. after RSVP, after donation) — "how was this?". All feedback routes to community admin, not individual hatty thalaivars, so patterns across the whole app are visible in one place. Use this to prioritize what gets built next.

## Language support

- v1 languages: English, Kannada, Tamil, Badaga
- Language selectable at onboarding, changeable anytime from settings
- Priority for translation: announcements, event details, help board, community guidelines (safety-critical text first)
- Member-generated content (threads, help board posts) stays in whatever language the member typed — not auto-translated in v1, to avoid mistranslation risk on sensitive posts (issues, help requests)
- Vachana library: keep original + transliteration + translation side by side, don't replace original text

## Advertisements, coupons & event listings (paid, external)

Separate revenue stream from donations — outside businesses pay to reach the community, not community members paying each other.

- **Ad types:** banner/listing placement (home screen or directory), coupon/discount offers, paid event registration listings (e.g. a wedding hall or caterer running a promotion)
- **Who can post:** external businesses, not existing community members' personal posts — keeps this distinct from the member-to-member help board
- **Advertiser registration (self-serve):** a business registers directly — business name, category, contact, ad type wanted, duration — submits for review. Not a full member account, a separate lightweight advertiser profile.
- **Approval required:** every ad and every new advertiser reviewed by community admin before going live — no self-serve auto-publish, since trust in this app is the whole value proposition
- **Placement rules:** clearly labeled "sponsored"/"ad", never mixed into announcements or threads, capped number of slots so the app doesn't feel commercial
- **Pricing:** flat fee per listing/time period (e.g. per week/month), or per-event for event registration promotions — set by community admin, revenue can fund app maintenance or feed back into hatty temple funds
- **Relevance filter:** business category relevance to the community (local vendors, caterers, halls, services) preferred over generic/unrelated advertisers

### 14. Outreach / broadcast messaging
Distinct from announcements (feed post) — this is direct push messaging.
- **Within-hatty broadcast:** thalaivar or secretary sends a message to all members of their own hatty. Unrestricted, since it's their own hatty. Every member gets a push notification immediately (+ optional SMS fallback for low-connectivity members).
- **Cross-hatty outreach:** thalaivar or secretary can message other hattys' thalaivar/secretary directly — not that hatty's full member list. Only the receiving thalaivar/secretary is notified; if they relay it onward, that relay (not the original message) is what triggers notifications to their members.
- Community admin can broadcast to all thalaivars/secretaries across all 8 hattys at once, or to the entire community if genuinely community-wide (e.g. student felicitation reminder) — every member notified.
- **Notification categories are member-controlled:** members can mute individual categories (e.g. help board replies) while keeping others on (hatty broadcasts, event reminders, donation receipts, issue status updates) — prevents notification fatigue that tends to kill engagement in community apps after the first few months.
- Delivery: in-app + push notification, optionally SMS fallback for low-connectivity members.

### 15. AI features
- **Community assistant (chatbot):** answers plain-language questions using live app data — event dates, temple fund progress, Vachana lookup — instead of member navigating menus. Available in all 4 supported languages.
- **Auto-translate on demand:** a "translate" button on any thread/announcement, translated on the fly for the reader — original text stays untouched (per language policy above).
- **Voice input:** speak instead of type for posts, help board requests, issue reports — accessibility for elderly/low-literacy members.
- **Vachana Q&A:** ask a question in plain language, get a relevant Vachana back with source reference.
- **Draft assist for thalaivar/secretary:** turns a few bullet points into a draft announcement/festival post — human reviews and sends, never auto-posts.
- **AI-assisted moderation (backend only):** strengthens the keyword filter with language understanding to catch political/illegal content a simple keyword list would miss. Uncertain cases still route to human review — AI does not auto-publish or auto-delete.

### 16. Jobs
Separated out from the general help board into its own module.
- **Community postings:** members post openings they know of, or post that they're seeking work — peer-to-peer, community-only, no approval gate (light moderation like help board).
- **AI-powered external search:** member enters role + location, AI runs a live web search and returns a summarized list of relevant external listings with links back to the original source — does not scrape/reproduce full postings.
- **Redirect to external job portal:** a link out to a configurable job portal (Naukri, Indeed, WorkIndia, Jobs360, or similar) for broader search — same principle as matrimony: don't rebuild what already exists at scale.
- Note: "Jobs360" is used by more than one portal in India (a healthcare-staffing focused one, and a government/PSU vacancy-focused one) — confirm which one, if any, before hardcoding the redirect link.

### 17. Family function & invite
Personal events, distinct from hatty festivals (organizational) and threads (open discussion).
- **Who can create:** any member, for their own family function (wedding, naming ceremony, housewarming, etc.) — no thalaivar approval, it's personal content.
- **Invite, not broadcast:** creator selects specific members or a group they've made to invite, rather than posting to a general feed — keeps it private and intentional.
- **Visibility control:** creator chooses invite-only, or also visible/discoverable to their hatty (for more open functions).
- **RSVP tracking:** invited members respond; creator sees guest count/list.
- Notifications: invited members get a push notification (subject to their notification preferences).

- **Letter composition for authorities:** from an escalated issue, community admin can trigger AI to draft a formal letter to the local panchayat or higher authority — addressee, subject, body, closing, using the issue's details (what happened, impact, requested action). Available in English and Tamil. Human reviews and edits before sending; output is a downloadable/printable PDF, never auto-sent.

## Content moderation & submission policy

Applies to every place a member can post text: threads, groups, help board, issue reports, event comments.

- **Prohibited content:** political content/campaigning, illegal activity, hate speech, harassment, obscene material, spam/solicitation unrelated to community purpose.
- **Text sanitization at submission (automated, before it goes live):**
  - Keyword/phrase filter blocks a defined list of political party names, election-related terms, and known illegal-activity terms — post is held, not silently discarded.
  - Basic profanity/hate-speech filter.
  - Flagged posts go to a moderation queue (community admin, not hatty thalaivar) for manual review before publishing — not auto-published and taken down later.
  - Member sees a clear message if their post is held: what rule it may have triggered, and that it's under review — not a silent block.
- **Manual layer:** every member can report/flag any post after the fact; 2+ reports auto-escalates to community admin queue regardless of the automated filter.
- **Repeat offenders:** community admin can mute/suspend a member's posting ability; thalaivar is notified if it's someone from their hatty.
- **Transparency:** community guidelines (this policy, in plain language) shown once at onboarding and always accessible from settings.

## Approval matrix (summary)

- Member action, no money/sensitive data → no approval (help board, threads, RSVP)
- Hatty-level, sensitive → hatty thalaivar/secretary (issues, nominations, member approval, festival posts)
- Community-wide or cross-hatty → community admin, always routed through the thalaivar first, never member-direct
- Group/thread creation → no approval, moderated after the fact by community admin

## Next steps

- Collect feedback on this v1 module list from committee and a small test group of members
- Prioritize which modules ship first (recommend: onboarding, announcements, directory, temple fund, help board as v1; issues, women's group, threads, felicitation as v2)
- Decide build approach: no-code (Glide/Adalo) for fast MVP vs custom app for full control
