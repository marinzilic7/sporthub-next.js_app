import clientPromise from "../../bin/mongo";
const { ObjectId } = require("mongodb");

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sporthub");

      const itemsCollection = db.collection("items");
      const categoriesCollection = db.collection("categories");
      const gendersCollection = db.collection("gender");

     
      const gender = await gendersCollection.findOne({ name: "Žene" });
      if (!gender) {
        return res.status(404).json({ error: "Gender not found" });
      }

      const genderId = "66788c873defe19f570f5046";

      const items = await itemsCollection
        .find({ gender_id: genderId })
        .toArray();

      console.log("Number of items fetched:", items.length);
      console.log("Fetched items:", items);

      console.log(items);
      const categories = await categoriesCollection.find({}).toArray();
      const genders = await gendersCollection.find({}).toArray();

      const itemsWithNames = items.map((item) => {
        const category = categories.find((cat) =>
          cat._id.equals(item.category_id)
        );
        const gender = genders.find((gen) => gen._id.equals(item.gender_id));

        return {
          ...item,
          category_name: category ? category.name : "Unknown",
          gender_name: gender ? gender.name : "Unknown",
        };
      });

      res.status(200).json(itemsWithNames);
    } catch (error) {
      console.error("Error in API route:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
