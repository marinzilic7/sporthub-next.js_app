import clientPromise from '../../bin/mongo';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // GET metoda za dohvaćanje podataka korisnika
    const { userId } = req.query;
    console.log("Ovo je userId", userId)

    try {
      const client = await clientPromise;
      const db = client.db('sporthub'); // Koristi ispravno ime baze podataka ako je različito od zadane

      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ _id: ObjectId.createFromHexString(userId) });

      if (!user) {
        return res.status(404).json({ message: 'Korisnik nije pronađen' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Greška prilikom dohvata podataka korisnika:', error);
      res.status(500).json({ message: 'Interna serverska greška' });
    }
  } else if (req.method === 'POST') {
  
    const { userId, newPassword } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db('sporthub'); 

      const usersCollection = db.collection('users');

      
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Neispravan format ID-a korisnika' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

     
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: hashedPassword } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: 'Korisnik nije pronađen ili lozinka nije promijenjena' });
      }

      res.status(200).json({ message: 'Lozinka uspješno promijenjena' });
    } catch (error) {
      console.error('Greška prilikom promjene lozinke:', error);
      res.status(500).json({ message: 'Interna serverska greška' });
    }
  } else {
    res.status(405).json({ message: 'Dozvoljeni su samo GET i POST zahtjevi' });
  }
}
