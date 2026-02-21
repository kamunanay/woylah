import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // 1. Hanya metode POST yang diizinkan
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  try {
    // 2. Validasi token dari query parameter
    const { token } = req.query;
    const validToken = process.env.API_TOKEN;
    if (!token || token !== validToken) {
      // Mengembalikan 404 agar tidak mencolok (seperti halaman tidak ada)
      return res.status(404).json({ error: 'Halaman tidak ditemukan' });
    }

    // 3. Validasi API key dari header
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;
    if (!apiKey || apiKey !== validApiKey) {
      return res.status(401).json({ error: 'API key tidak valid' });
    }

    // 4. Ambil data dari body request
    const { to_email, subject, body, sender_user, sender_pass } = req.body;

    // 5. Validasi field wajib
    if (!to_email || !subject || !body || !sender_user || !sender_pass) {
      return res.status(400).json({
        error: 'Field wajib: to_email, subject, body, sender_user, sender_pass'
      });
    }

    // 6. Buat transporter Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: sender_user,
        pass: sender_pass,
      },
    });

    // 7. Kirim email
    const info = await transporter.sendMail({
      from: `"Bot" <${sender_user}>`,
      to: to_email,
      subject: subject,
      text: body,
    });

    // 8. Respons sukses
    console.log('Email terkirim:', info.messageId);
    return res.status(200).json({ success: true, message: 'Email terkirim' });
  } catch (error) {
    // 9. Tangani error dengan detail (untuk debugging)
    console.error('Gagal kirim email:', error);
    return res.status(500).json({
      error: 'Gagal mengirim email',
      detail: error.message,
      // stack: error.stack // bisa diaktifkan jika perlu
    });
  }
}
