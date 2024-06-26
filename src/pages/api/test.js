import clientPromise from '../../bin/mongo';


export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('sporthub'); 

    const data = await db.collection('sporthub').find({}).toArray(); 

    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
