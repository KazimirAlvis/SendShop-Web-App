// pages/api/store-info.js
import { dbAdmin } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  try {
    const doc = await dbAdmin.collection('sellers').doc('demo-seller').get();

    if (!doc.exists) {
      // Add default data on first visit
      await dbAdmin.collection('sellers').doc('demo-seller').set({
        storeName: 'My Demo Store',
      });
      return res.status(200).json({ storeName: 'My Demo Store' });
    }

    const data = doc.data();
    return res.status(200).json({ storeName: data.storeName });
  } catch (error) {
    console.error('Firestore error:', error);
    return res.status(500).json({ error: 'Failed to load store info' });
  }
}
