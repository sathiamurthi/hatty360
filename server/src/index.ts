import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { initDb } from './db/db';
import * as auth from './controllers/auth';
import * as comm from './controllers/community';
import * as fin from './controllers/finance';
import * as gov from './controllers/governance';
import * as ai from './controllers/ai';
import * as groups from './controllers/groups';
import * as helpline from './controllers/helpline';

import * as path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize Database & Start Server
async function startServer() {
  try {
    await initDb();
    
    // --- API Routes ---
    
    // Auth & Profile
    app.post('/api/auth/login', auth.login);
    app.post('/api/auth/register', auth.register);
    app.post('/api/auth/profile', auth.updateProfile);
    app.post('/api/auth/approve', auth.approveUser);
    app.post('/api/auth/role', auth.updateRole);
    app.get('/api/auth/pending', auth.getPendingUsers);
    app.get('/api/auth/hattys', auth.getHattys);

    // Member Directory
    app.get('/api/members', comm.getMembers);
    app.post('/api/members/:id/phone', comm.getMemberPhone);

    // Announcements
    app.get('/api/announcements', comm.getAnnouncements);
    app.post('/api/announcements', comm.createAnnouncement);

    // Events
    app.get('/api/events', comm.getEvents);
    app.post('/api/events', comm.createEvent);
    app.post('/api/events/:event_id/rsvp', comm.submitRsvp);
    app.get('/api/events/:event_id/rsvps', comm.getEventRsvps);

    // Vachana Library
    app.get('/api/vachanas', comm.getVachanas);

    // Help Board & Jobs
    app.get('/api/help-board', comm.getHelpPosts);
    app.post('/api/help-board', comm.createHelpPost);
    app.get('/api/jobs/external', comm.searchExternalJobs);

    // Campaigns & Donations
    app.get('/api/campaigns', fin.getCampaigns);
    app.get('/api/campaigns/:id', fin.getCampaignDetails);
    app.post('/api/campaigns', fin.createCampaign);
    app.post('/api/donations', fin.createDonation);

    // Women's Groups (SHGs)
    app.get('/api/shg', fin.getWomensGroups);
    app.post('/api/shg', fin.proposeWomensGroup);
    app.get('/api/shg/:id/ledger', fin.getShgLedger);
    app.post('/api/shg/:id/ledger', fin.logShgTransaction);

    // Governance Issues
    app.get('/api/issues', gov.getIssues);
    app.post('/api/issues', gov.createIssue);
    app.post('/api/issues/:id/escalate', gov.escalateIssue);
    app.post('/api/issues/:id/resolve', gov.resolveIssue);
    app.post('/api/issues/:id/letter', gov.composeAuthorityLetter);

    // Feedback
    app.post('/api/feedback', gov.submitFeedback);
    app.get('/api/feedback', gov.getFeedback);

    // Sponsored Ads
    app.get('/api/ads', gov.getAds);
    app.post('/api/ads', gov.submitAd);
    app.get('/api/ads/pending', gov.getPendingAds);
    app.post('/api/ads/:id/approve', gov.approveAd);

    // AI Assistant
    app.post('/api/ai/chat', ai.chatbot);
    app.post('/api/ai/draft-assist', ai.draftAssist);

    // Community Groups & Discussion Threads
    app.get('/api/groups', groups.getGroups);
    app.post('/api/groups', groups.createGroup);
    app.get('/api/groups/:id', groups.getGroupDetails);
    app.post('/api/groups/:id/threads', groups.createThread);
    app.get('/api/threads/:id', groups.getThreadDetails);
    app.post('/api/threads/:id/replies', groups.createReply);
    app.post('/api/threads/:id/status', groups.updateThreadStatus);

    // Helpline Contacts
    app.get('/api/helpline', helpline.getHelplines);
    app.post('/api/helpline', helpline.createHelpline);
    app.delete('/api/helpline/:id', helpline.deleteHelpline);

    // Start listening
    app.listen(port, () => {
      console.log(`Server: Running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Server: Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
