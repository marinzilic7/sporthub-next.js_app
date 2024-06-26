import clientPromise from "../../bin/mongo";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
     
      const client = await clientPromise;
      const db = client.db("sporthub");
      const cartCollection = db.collection("cart");
      const itemsCollection = db.collection("items");
      const categoriesCollection = db.collection("categories");
      const userId = req.query.userId;

 
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

      
      const itemCount = detailedCartItems.length;
      console.log(itemCount)
      res.status(200).json(itemCount);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
