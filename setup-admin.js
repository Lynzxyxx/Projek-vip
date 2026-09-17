// Vercel Serverless Function
// Endpoint: /api/setup-admin  (dipanggil otomatis oleh frontend saat halaman VIP dibuka)
//
// Membuat akun admin dari ADMIN_EMAIL + ADMIN_PASSWORD di Environment Variables.
// Idempoten — kalau admin sudah pernah dibuat, endpoint ini tidak melakukan apa-apa.
// Password TIDAK PERNAH dikirim ke browser — semuanya diproses di server.

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  return initializeApp({ credential: cert(serviceAccount) });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      res.status(200).json({ status: 'skipped', reason: 'ADMIN_EMAIL/ADMIN_PASSWORD belum diisi di env' });
      return;
    }

    const app = getAdminApp();
    const db = getFirestore(app);
    const auth = getAuth(app);

    const adminConfigRef = db.collection('adminConfig').doc('main');
    const adminConfigDoc = await adminConfigRef.get();

    if (adminConfigDoc.exists) {
      res.status(200).json({ status: 'already_exists' });
      return;
    }

    // Cek apakah user dengan email ini sudah ada di Firebase Auth (misal sisa percobaan lama)
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminEmail);
    } catch (e) {
      userRecord = await auth.createUser({ email: adminEmail, password: adminPassword });
    }

    await adminConfigRef.set({ adminUid: userRecord.uid, setAt: FieldValue.serverTimestamp() });
    await db.collection('users').doc(userRecord.uid).set({
      email: adminEmail,
      role: 'admin',
      banned: false,
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true });

    res.status(200).json({ status: 'created', email: adminEmail });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
