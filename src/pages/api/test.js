import clientPromise from '../../bin/mongo';


export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('sporthub'); // Zamenite sa vašom bazom

    const data = await db.collection('sporthub').find({}).toArray(); // Zamenite sa vašom kolekcijom

    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
