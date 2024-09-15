import clientPromise from "../../bin/mongo";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const ordersCollection = db.collection("orders");
      const itemsCollection = db.collection("items");
      const categoriesCollection = db.collection("categories");

      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      const reportType = req.query.type;

      let reportData = { salesByProduct: [], salesByCategory: [] };

      if (reportType === "salesByProduct") {
        reportData.salesByProduct = await ordersCollection
          .aggregate([
            {
              $match: {
                orderDate: { $gte: startDate, $lte: endDate },
                status: "Isporučeno",
              },
            },
            { $unwind: "$itemId" },
            {
              $lookup: {
                from: "items",
                localField: "itemId.itemId",
                foreignField: "_id",
                as: "item",
              },
            },
            { $unwind: "$item" },
            {
              $group: {
                _id: "$item._id",
                itemName: { $first: "$item.name" },
                totalQuantity: { $sum: "$itemId.quantity" },
                totalRevenue: {
                  $sum: { $multiply: ["$itemId.quantity", "$item.price"] },
                },
                orderDate: { $first: "$orderDate" },
              },
            },
            {
              $project: {
                itemId: "$_id",
                itemName: "$itemName",
                totalQuantity: 1,
                totalRevenue: { $round: ["$totalRevenue", 2] },
                orderDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
                },
              },
            },
          ])
          .toArray();
      } else if (reportType === "salesByCategory") {
        reportData.salesByCategory = await ordersCollection
          .aggregate([
            {
              $match: {
                orderDate: { $gte: startDate, $lte: endDate },
                status: "Isporučeno",
              },
            },
            { $unwind: "$itemId" },
            {
              $lookup: {
                from: "items",
                localField: "itemId.itemId",
                foreignField: "_id",
                as: "item",
              },
            },
            { $unwind: "$item" },
            {
              $group: {
                _id: "$item.category_id", // category_id je string
                totalQuantity: { $sum: "$itemId.quantity" },
                totalRevenue: {
                  $sum: { $multiply: ["$itemId.quantity", "$item.price"] },
                },
                orderDate: { $first: "$orderDate" },
              },
            },
            {
              $addFields: {
                categoryObjectId: { $toObjectId: "$_id" }, // Konverzija string category_id u ObjectId
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "categoryObjectId",
                foreignField: "_id",
                as: "category",
              },
            },
            { $unwind: "$category" },
            {
              $project: {
                categoryId: "$_id",
                categoryName: "$category.name",
                totalQuantity: 1,
                totalRevenue: { $round: ["$totalRevenue", 2] },
                orderDate: {
                  $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
                },
              },
            },
          ])
          .toArray();
      } else {
        return res.status(400).json({ error: "Invalid report type" });
      }

      res.status(200).json(reportData);
    } catch (error) {
      console.error("Error in API route:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
