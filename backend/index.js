const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock Firebase Init
console.log('[Info] Real Firebase Admin initialization will require keys in .env');

// Mock Routes setup
const upload = multer({ dest: 'uploads/' }); // Temporary local store instead of real Firebase Storage for mock

// Auth Routes (Mocked OTP)
app.post('/api/auth/verify-otp', (req, res) => {
  res.json({ success: true, message: "Mock OTP verified", token: "mock_jwt_token" });
});

app.post('/api/users/register', (req, res) => {
  res.json({ success: true, message: "Mock user registered", uid: "mock_uid_123" });
});

app.get('/api/users/:uid', (req, res) => {
  res.json({ success: true, user: { name: "Mock User", role: "donor" } });
});

// Reports API (Mocked Firestore DB)
let mockReports = [];

app.post('/api/reports/organic', (req, res) => {
  const newReport = { id: Date.now().toString(), type: 'organic', ...req.body, status: 'pending' };
  mockReports.push(newReport);
  res.json({ success: true, message: "Report submitted to mock DB", report: newReport });
});

app.post('/api/reports/food', upload.single('photo'), (req, res) => {
  const newReport = { id: Date.now().toString(), type: 'food', ...req.body, status: 'pending' };
  mockReports.push(newReport);
  res.json({ success: true, message: "Food donation submitted to mock DB", report: newReport });
});

app.get('/api/reports/nearby', (req, res) => {
  res.json({ success: true, reports: mockReports.filter(r => r.status === 'pending') });
});

app.patch('/api/reports/:id/accept', (req, res) => {
  const idx = mockReports.findIndex(r => r.id === req.params.id);
  if(idx > -1) mockReports[idx].status = 'accepted';
  res.json({ success: true, message: "Mock Accepted" });
});

app.patch('/api/reports/:id/decline', (req, res) => {
  res.json({ success: true, message: "Mock Declined" });
});

app.get('/api/impact/:uid', (req, res) => {
  res.json({
    success: true,
    impact: { kg_diverted: 210, pickups_count: 24, co2_saved: 105 }
  });
});

app.post('/api/payments/create-order', (req, res) => {
  res.json({ success: true, orderId: "order_mock_123", amount: req.body.amount });
});

app.post('/api/payments/verify', (req, res) => {
  res.json({ success: true, status: "paid" });
});

app.post('/api/nyckel/check-image', upload.single('photo'), (req, res) => {
  // Mocking Nyckel response (70% fresh, 30% spoiled)
  const isSpoiled = Math.random() > 0.7;
  res.json({ 
    success: true, 
    label: isSpoiled ? "spoiled" : "fresh", 
    confidence: isSpoiled ? 0.85 : 0.92 
  });
});

const cron = require('node-cron');

// Scheduled Jobs (node-cron)
// Every 15 minutes, auto-expire cooked food reports older than 3 hours
cron.schedule('*/15 * * * *', () => {
  console.log('[Cron] Running expiry job...');
  const now = Date.now();
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  
  mockReports.forEach((report, index) => {
    if (report.type === 'food' && report.status === 'pending') {
      const isExpired = routerCreationTime - now > THREE_HOURS_MS;
      // In a real app we'd check created_at or expires_at property correctly
      // mockReports[index].status = 'expired';
    }
  });
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
    console.log(`Environment variables loaded: ${!!process.env.FIREBASE_PROJECT_ID}`);
});
