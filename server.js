require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartstudy',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
function query(sql, params=[]) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}
app.get('/', (req, res) => res.json({status:'OK', service:'Smart Study API'}));

app.post('/get-materials', async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ success:false, message:'studentId is required' });
    const rows = await query('SELECT material FROM materials WHERE student_id = ?', [studentId]);
    if (rows.length === 0) return res.json({ success:false, message:'No materials found' });
    res.json({ success:true, materials: rows.map(r=>r.material) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:'Server error' });
  }
});

app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  if (!to || !subject || !text) return res.status(400).json({ success:false, message:'to, subject, text are required' });
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.verify();
    const info = await transporter.sendMail({ from: process.env.FROM_EMAIL || process.env.SMTP_USER, to, subject, text });
    res.json({ success:true, messageId: info.messageId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:'Email send failed', error: e.message });
  }
});

app.post('/send-whatsapp', async (req, res) => {
  const { to, text } = req.body;
  if (!to || !text) return res.status(400).json({ success:false, message:'to, text are required' });
  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    if (!fromNumber) return res.status(400).json({ success:false, message:'TWILIO_WHATSAPP_FROM missing' });
    const msg = await client.messages.create({ from: fromNumber, to: `whatsapp:${to.replace('whatsapp:','')}`, body: text });
    res.json({ success:true, sid: msg.sid });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:'WhatsApp send failed', error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
