// pages/api/login.js
import { compare } from 'bcryptjs';
import clientPromise from '../../bin/mongo';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Molimo popunite sva polja.' });
    }

    try {
      const client = await clientPromise;
      const db = client.db('sporthub'); // Zamijenite s vašom bazom
      const collection = db.collection('users'); // Zamijenite s vašom kolekcijom

      const user = await collection.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: 'Korisnik nije pronađen.' });
      }

      const passwordMatch = await compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Pogrešna lozinka.' });
      }

      res.status(200).json({ message: 'Uspješna prijava.', user });
    } catch (error) {
      console.error('Došlo je do greške prilikom prijave:', error);
      res.status(500).json({ error: 'Došlo je do greške prilikom prijave.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
