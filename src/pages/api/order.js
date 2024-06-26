import { ObjectId } from "mongodb";
import clientPromise from "../../bin/mongo";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId, email, fullName, address, phoneNumber, city, zip } =
      req.body;

    try {
      const client = await clientPromise;
      const db = client.db("sporthub");

  
      const cartCollection = db.collection("cart");
      const ordersCollection = db.collection("orders");

      const cartItems = await cartCollection
        .find({ userId: new ObjectId(userId) })
        .toArray();

    
      const orderItems = cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      const orderData = {
        userId: new ObjectId(userId),
        email,
        fullName,
        address,
        phoneNumber,
        city,
        zip,
        itemId: orderItems,
        orderDate: new Date(),
      };


      const result = await ordersCollection.insertOne(orderData);

   
      await cartCollection.deleteMany({ userId: new ObjectId(userId) });

      res.status(201).json({ message: "Narudžba uspješno poslana", orderData });
    } catch (error) {
      res.status(500).json({
        message: "Došlo je do greške prilikom stvaranja narudžbe",
        error,
      });
    }
  } else if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const ordersCollection = db.collection("orders");

      const orders = await ordersCollection.find({}).toArray();

      res.status(200).json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders", error });
    }
  } else if (req.method === "DELETE") {
    const { orderId } = req.query;

    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const ordersCollection = db.collection("orders");

      const result = await ordersCollection.deleteOne({
        _id: new ObjectId(orderId),
      });

      if (result.deletedCount === 1) {
        res.status(200).json({ message: "Narudzba izbrisana" });
      } else {
        res.status(404).json({ message: "Narudzba nije pronađena" });
      }
    } catch (error) {
      console.error("Greška prilikom brisanja narudzbe:", error);
      res.status(500).json({ message: "Interna serverska greška" });
    }
  } else {
    res.status(405).json({ message: "Metoda nije dopuštena" });
  }
}
