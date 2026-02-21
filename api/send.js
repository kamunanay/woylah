import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // 1. Hanya metode POST yang diizinkan
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  // 2. Ambil token dari query parameter (contoh: ?token=...)
  const { token } = req.query;
  const validToken = process.env.API_TOKEN; // dari environment variable Vercel

  // 3. Validasi token
  if (!token || token !== validToken) {
    // Mengembalikan 404 agar tidak mencolok (seperti halaman tidak ada)
    return res.status(404).json({ error: 'Halaman tidak ditemukan' });
  }

  // 4. Ambil API key dari header
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_KEY; // dari environment variable Vercel

  // 5. Validasi API key
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'API key tidak valid' });
  }

  // 6. Ambil data dari body request
  const { to_email, subject, body, sender_user, sender_pass } = req.body;

  // 7. Validasi field wajib
  if (!to_email || !subject || !body || !sender_user || !sender_pass) {
    return res.status(400).json({ 
      error: 'Field wajib: to_email, subject, body, sender_user, sender_pass' 
    });
  }

  // 8. Buat transporter Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: sender_user,
      pass: sender_pass,
    },
  });

  try {
    // 9. Kirim email
    await transporter.sendMail({
      from: `"Bot" <${sender_user}>`,
      to: to_email,
      subject: subject,
      text: body,
    });

    // 10. Respons sukses
    return res.status(200).json({ success: true, message: 'Email terkirim' });
  } catch (error) {
    console.error('Gagal kirim email:', error);
    return res.status(500).json({ error: error.message });
  }
}
