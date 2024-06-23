import clientPromise from "../../bin/mongo";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  
  if (req.method === "GET") {
    try {
        const client = await clientPromise;
        const db = client.db("sporthub");
  
        const genderCollection = db.collection("gender");
        const genders = await genderCollection.find({}).toArray();
  
        res.status(200).json(genders);
      } catch (error) {
        console.error("Greška prilikom dohvata kategorija:", error);
        res.status(500).json({ message: "Interna serverska greška" });
      }
  }
}
