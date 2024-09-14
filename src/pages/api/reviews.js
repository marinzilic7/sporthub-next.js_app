import clientPromise from "../../bin/mongo";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const reviewsCollection = db.collection("reviews");

      const { userId, itemId, text, rating } = req.body;

      if (!userId || !itemId || !text || !rating) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const newReview = {
        userId: new ObjectId(userId),
        itemId: new ObjectId(itemId),
        text,
        rating,
        date: new Date(),
      };

      await reviewsCollection.insertOne(newReview);

      res.status(201).json({ message: "Recenzija dodana" });
    } catch (error) {
      console.error("Error adding review:", error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === "GET") {
    try {
        const { itemId } = req.query;
        if (!itemId) {
          return res.status(400).json({ error: "Item ID is required" });
        }
  
        const client = await clientPromise;
        const db = client.db("sporthub");
        const reviewsCollection = db.collection("reviews");
        const usersCollection = db.collection("users"); // Kolekcija korisnika
  
        const reviews = await reviewsCollection
          .find({ itemId: new ObjectId(itemId) })
          .toArray();
  
        // Dodajte korisničke informacije u recenzije
        const reviewsWithUserDetails = await Promise.all(
          reviews.map(async (review) => {
            const user = await usersCollection.findOne({ _id: new ObjectId(review.userId) });
            return {
              ...review,
              userName: user ? user.firstName : "Unknown User", // Pretpostavljam da korisnik ima polje `name`
            };
          })
        );
  
        res.status(200).json(reviewsWithUserDetails);
      } catch (error) {
        console.error("Error fetching reviews for item:", error);
        res.status(500).json({ error: error.message });
      }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
