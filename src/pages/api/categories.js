import clientPromise from "../../bin/mongo";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { categoryName } = req.body;

    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const categoriesCollection = db.collection("categories");

      const result = await categoriesCollection.insertOne({
        name: categoryName,
      });

      res.status(201).json({ message: "Kategorija uspješno dodana", result });
    } catch (error) {
      console.error("Greška prilikom dodavanja kategorije:", error);
      res.status(500).json({ message: "Interna serverska greška" });
    }
  } else if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sporthub");

      const categoriesCollection = db.collection("categories");
      const categories = await categoriesCollection.find({}).toArray();

      res.status(200).json(categories);
    } catch (error) {
      console.error("Greška prilikom dohvata kategorija:", error);
      res.status(500).json({ message: "Interna serverska greška" });
    }
  } else if (req.method === 'DELETE') {
    const { categoryId } = req.query;
    console.log("Deleting category with ID:", categoryId);

    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const categoriesCollection = db.collection("categories");

      const result = await categoriesCollection.deleteOne({
        _id: new ObjectId(categoryId),
      });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Kategorija uspješno izbrisana" });
      } else {
        res.status(404).json({ message: "Kategorija nije pronađena" });
      }
    } catch (error) {
      console.error("Greška prilikom brisanja kategorije:", error);
      res.status(500).json({ message: "Interna serverska greška" });
    }
  } else if (req.method === "PUT") {
    const { categoryId } = req.query;
    const { name } = req.body;

    console.log("Updating category with ID:", categoryId, "to name:", name);

    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const categoriesCollection = db.collection("categories");

      const result = await categoriesCollection.updateOne(
        { _id: new ObjectId(categoryId) },
        { $set: { name: name } }
      );

      if (result.matchedCount === 1) {
        res.status(200).json({ message: "Kategorija uspješno ažurirana" });
      } else {
        res.status(404).json({ message: "Kategorija nije pronađena" });
      }
    } catch (error) {
      console.error("Greška prilikom ažuriranja kategorije:", error);
      res.status(500).json({ message: "Interna serverska greška" });
    }
  } else {
    res.status(405).json({ message: "Metoda nije podržana" });
  }
   
  
}
