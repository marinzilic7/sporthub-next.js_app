// pages/api/userOrders.js
import clientPromise from "../../bin/mongo";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;

      if (!userId || !ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Valid User ID is required" });
      }

      const client = await clientPromise;
      const db = client.db("sporthub");
      const ordersCollection = db.collection("orders");
      const itemsCollection = db.collection("items");

      // Dohvati narudžbe za korisnika
      const orders = await ordersCollection.find({ userId: new ObjectId(userId) }).toArray();

      // Dohvati detalje o stavkama za svaku narudžbu
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const itemDetails = await Promise.all(
            order.itemId.map(async (item) => {
              if (ObjectId.isValid(item.itemId)) {
                const itemDetail = await itemsCollection.findOne({ _id: new ObjectId(item.itemId) });
                return { ...item, ...itemDetail };
              }
              return null; // Ako itemId nije valjan, vratite null ili prazni objekt
            })
          );
          return {
            ...order,
            itemDetails
          };
        })
      );

      res.status(200).json({ orders: ordersWithItems });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
