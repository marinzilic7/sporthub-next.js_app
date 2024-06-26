import clientPromise from "../../bin/mongo";
import { IncomingForm } from "formidable";
import { promises as fsPromises } from "fs";
import path from "path";
import { ObjectId } from "mongodb";
import bodyParser from "body-parser";

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), "/public/uploads"),
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
};

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("sporthub");
  if (req.method === "POST") {
    try {
      const { fields, files } = await parseForm(req);

      const { name, size, price, category_id, gender_id, user_id } = fields;
      const image = files.image;

      if (Array.isArray(image) && image.length > 0) {
        const firstImage = image[0];
        if (firstImage.filepath) {
          console.log("PUTANJA SLIKE:", firstImage.filepath);

          const imageData = await fsPromises.readFile(firstImage.filepath);
          const fajlPath = firstImage.filepath;
          const encodedImage = imageData.toString("base64");

          const newItem = {
            name: fields.name[0],
            size: fields.size[0],
            price: parseFloat(price),
            category_id: fields.category_id[0],
            gender_id: fields.gender_id[0],
            fajlPath: firstImage.filepath,
          };

          const result = await db.collection("items").insertOne(newItem);

          if (result.insertedId) {
            const addedItem = await db
              .collection("items")
              .findOne({ _id: result.insertedId });

            const category = await db
              .collection("categories")
              .findOne({ _id: addedItem.category_id });
            const gender = await db
              .collection("genders")
              .findOne({ _id: addedItem.gender_id });

            addedItem.category_name = category ? category.name : "Unknown";
            addedItem.gender_name = gender ? gender.name : "Unknown";

            res.status(201).json(addedItem);
          } else {
            res.status(500).json({ message: "Failed to add item" });
          }
        } else {
          console.log("Nije pronađena putanja slike u prvom elementu niza.");
        }
      } else if (image && image.filepath) {
      } else {
        console.log("Nije pronađena putanja slike.");
        return res.status(400).json({ message: "Missing image file" });
      }
    } catch (error) {
      console.error("Error handling POST request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "GET") {
    try {
      const items = await db.collection("items").find({}).toArray();

      // Dohvati kategorije i spolove
      const categories = await db.collection("categories").find({}).toArray();
      const genders = await db.collection("gender").find({}).toArray();

      // Kreiraj mape za brzi pristup imenima
      const categoryMap = categories.reduce((map, category) => {
        map[category._id] = category.name;
        return map;
      }, {});

      const genderMap = genders.reduce((map, gender) => {
        map[gender._id] = gender.name;
        return map;
      }, {});

      // Zamijeni ID-eve imenima
      const itemsWithNames = items.map((item) => ({
        ...item,
        category_name: categoryMap[item.category_id] || "Unknown",
        gender_name: genderMap[item.gender_id] || "Unknown",
      }));

      res.status(200).json(itemsWithNames);
    } catch (error) {
      console.error("Error handling GET request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "DELETE") {
    const { itemId } = req.query;
    console.log("Deleting item with ID:", itemId);

    try {
      const client = await clientPromise;
      const db = client.db("sporthub");
      const itemsCollection = db.collection("items");

      const result = await itemsCollection.deleteOne({
        _id: new ObjectId(itemId),
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
    const { itemId } = req.query;

   
    bodyParser.json()(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "Invalid JSON" });
      }

      const { name, size, price, category_id, gender_id } = req.body;
      console.log("OVO JE IME", name);

      try {
        const itemsCollection = db.collection("items");

        const updatedItem = await itemsCollection.findOneAndUpdate(
          { _id: new ObjectId(itemId) },
          {
            $set: {
              name,
              size,
              price,
              category_id: new ObjectId(category_id),
              gender_id: new ObjectId(gender_id),
            },
          },
          { returnOriginal: false }
        );

        res.status(200).json(updatedItem.value);
      } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
  }
}
