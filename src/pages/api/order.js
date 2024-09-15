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
      const itemsCollection = db.collection("items");

      // Pronađi stavke iz košarice korisnika
      const cartItems = await cartCollection
        .find({ userId: new ObjectId(userId) })
        .toArray();

      // Mapiraj stavke narudžbe
      const orderItems = cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      // Kreiraj podatke narudžbe
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
        status: "U tijeku",
      };

      // Ubaci narudžbu u kolekciju narudžbi
      const result = await ordersCollection.insertOne(orderData);

      // Prođi kroz svaki artikl u narudžbi i ažuriraj stanje
      for (let item of cartItems) {
        const productId = new ObjectId(item.itemId);
        const quantity = item.quantity;
      
        console.log(`Ažuriranje proizvoda s ID-em ${productId}: smanjenje količine za ${quantity}`);
      
        const updateResult = await itemsCollection.updateOne(
          { _id: productId, amount: { $gt: 0 } },
          { $inc: { amount: -quantity } }
        );
      
        console.log(`Update result: ${JSON.stringify(updateResult)}`);
        if (updateResult.modifiedCount === 0) {
          console.error(`Stavka s ID-em ${productId} nije ažurirana. Možda količina nije dovoljna ili stavka ne postoji.`);
        }
      }

      // Izbriši stavke iz košarice nakon što je narudžba potvrđena
      await cartCollection.deleteMany({ userId: new ObjectId(userId) });

      // Pošalji uspješan odgovor
      res.status(201).json({ message: "Narudžba uspješno poslana", orderData });
    } catch (error) {
      res.status(500).json({
        message: "Došlo je do greške prilikom stvaranja narudžbe",
        error: error.message,
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
    
  } else if (req.method === "PATCH") {
    try {
      const { orderId, status } = req.body;
      if (!orderId || !status) {
        return res.status(400).json({ error: "Order ID and status are required" });
      }

      const client = await clientPromise;
      const db = client.db("sporthub");
      const ordersCollection = db.collection("orders");

      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status: status } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "Order not found or status unchanged" });
      }

      res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Metoda nije dopuštena" });
  }
}
