import clientPromise from "../../bin/mongo";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const cartCollection = db.collection("cart");
      const itemsCollection = db.collection("items");
      const { itemId, userId } = req.body;

      const item = await itemsCollection.findOne({ _id: new ObjectId(itemId) });

      console.log(userId, itemId);
      if (!itemId || !userId) {
        return res.status(400).json({ message: "Missing itemId or userId" });
      }

      let cartItem = await cartCollection.findOne({
        userId: new ObjectId(userId),
        itemId: new ObjectId(itemId),
      });

      if (cartItem) {
        if (item.amount < cartItem.quantity + 1) {
          return res.status(400).json({ message: "Nema na stanju ovog artikla vise" });
        }
        await cartCollection.updateOne(
          { _id: cartItem._id },
          { $inc: { quantity: 1 } }
        );
      } else {
        if (item.amount < 1) {
          return res.status(400).json({ message: "Not enough stock available" });
        }
        await cartCollection.insertOne({
          userId: new ObjectId(userId),
          itemId: new ObjectId(itemId),
          quantity: 1,
        });
      }

      res.status(200).json({ message: "Artikl je uspješno dodan u košaricu" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Došlo je do greške", error: error.message });
    }
  } else if (req.method === "GET") {
    if (req.method === "POST") {
      try {
        const client = await clientPromise;
        const db = client.db("sporthub");
        const itemsCollection = db.collection("items");
        const cartCollection = db.collection("cart");
        const { itemId, userId } = req.body;

        if (!itemId || !userId) {
          return res.status(400).json({ message: "Missing itemId or userId" });
        }

        // Dohvati podatke o artiklu
        const item = await itemsCollection.findOne({
          _id: new ObjectId(itemId),
        });
        if (!item) {
          return res.status(404).json({ message: "Artikl nije pronađen" });
        }

        let cartItem = await cartCollection.findOne({
          userId: new ObjectId(userId),
          itemId: new ObjectId(itemId),
        });

        if (cartItem) {
          await cartCollection.updateOne(
            { _id: cartItem._id },
            { $inc: { quantity: 1 } }
          );
        } else {
          await cartCollection.insertOne({
            userId: new ObjectId(userId),
            itemId: new ObjectId(itemId),
            quantity: 1,
          });
        }

        res
          .status(200)
          .json({ message: "Artikl je uspješno dodan u košaricu", item });
      } catch (error) {
        res
          .status(500)
          .json({ message: "Došlo je do greške", error: error.message });
      }
    } else if (req.method === "GET") {
      try {
        const client = await clientPromise;
        const db = client.db("sporthub");
        const cartCollection = db.collection("cart");
        const itemsCollection = db.collection("items");
        const categoriesCollection = db.collection("categories");
        const userId = req.query.userId;
  
        console.log("Ovo je userId", userId);
  
        const cartItems = await cartCollection
          .find({ userId: new ObjectId(userId) })
          .toArray();
  
        const itemIds = cartItems.map((item) => new ObjectId(item.itemId));
        const items = await itemsCollection
          .find({ _id: { $in: itemIds } })
          .toArray();
  
         

        const categoryIds = items.map((item) => item.category_id);
        const categories = await categoriesCollection
          .find({ _id: { $in: categoryIds.map((id) => new ObjectId(id)) } })
          .toArray();
  
        const detailedCartItems = cartItems.map((cartItem) => {
          const item = items.find((item) => item._id.equals(cartItem.itemId));
          const category = categories.find((cat) =>
            cat._id.equals(new ObjectId(item.category_id))
          );
          return {
            ...cartItem,
            name: item.name,
            price: item.price,
            category: category ? category.name : "Nepoznata kategorija",
            size: item.size,
            fajlPath: item.fajlPath,
          };
        });
  
        res.status(200).json(detailedCartItems);
      } catch (error) {
        res
          .status(500)
          .json({ message: "Došlo je do greške", error: error.message });
      }
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } else if (req.method === "DELETE") {
    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const cartCollection = db.collection("cart");
      const { itemId, userId } = req.query;

      if (!itemId || !userId) {
        return res.status(400).json({ message: "Missing itemId or userId" });
      }

      const result = await cartCollection.deleteOne({
        userId: new ObjectId(userId),
        _id: new ObjectId(itemId),
      });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "Artikl nije pronađen u košarici" });
      }

      res
        .status(200)
        .json({ message: "Artikl je uspješno izbrisan iz košarice" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Došlo je do greške", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
