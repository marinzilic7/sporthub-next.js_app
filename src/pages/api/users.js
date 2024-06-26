import clientPromise from "../../bin/mongo";
import { ObjectId } from "mongodb";


export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sporthub"); 

      const usersCollection = db.collection("users"); 
      const users = await usersCollection.find({}).toArray(); 

      res.status(200).json(users);
    } catch (error) {
      console.error("Greška prilikom dohvata korisnika:", error);
      res.status(500).json({ message: "Interna serverska greška" });
    }
  } else if (req.method === "POST") {
    const { userId } = req.query;
    console.log("Deleting user with ID:", userId); 

    try {
      const { userId } = req.body;

      const client = await clientPromise;
      const db = client.db("sporthub");
      const usersCollection = db.collection("users");

      const result = await usersCollection.deleteOne({
        _id: ObjectId.createFromHexString(userId),
      });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Korisnik uspješno izbrisan" });
      } else {
        res.status(404).json({ message: "Korisnik nije pronađen" });
      }
    } catch (error) {
      console.error("Greška prilikom brisanja korisnika:", error);
      res.status(500).json({ message: "Interna serverska greška" });
    }
  } else {
    res
      .status(405)
      .json({ message: "Dozvoljene su samo POST metode na /api/users/delete" });
  }
}
