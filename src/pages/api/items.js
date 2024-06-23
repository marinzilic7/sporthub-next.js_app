import clientPromise from "../../bin/mongo";
import { IncomingForm } from "formidable";
import { promises as fsPromises } from "fs";
import path from "path";

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

        

      // Provjeravamo je li image definiran i je li niz
      if (Array.isArray(image) && image.length > 0) {
        const firstImage = image[0];
        if (firstImage.filepath) {
          console.log("PUTANJA SLIKE:", firstImage.filepath);

          // Čitanje sadržaja slike i pretvaranje u base64
          const imageData = await fsPromises.readFile(firstImage.filepath);
         const fajlPath = firstImage.filepath;
          const encodedImage = imageData.toString("base64");
           
          // Priprema novog artikla za unos u bazu
          const newItem = {
            name: fields.name[0], // Uzeti prvi element iz niza name
            size: fields.size[0], // Uzeti prvi element iz niza size
            price: parseFloat(price),
            category_id: fields.category_id[0], // Uzeti prvi element iz niza category_id
            gender_id: fields.gender_id[0], // Uzeti prvi element iz niza gender_id
            fajlPath: firstImage.filepath, // Postaviti filepath kao string
          };

          // Unos novog artikla u bazu
          const result = await db.collection("items").insertOne(newItem);

          if (result.insertedId) {
            res.status(201).json({ message: "Item added successfully" });
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
      res.status(200).json(items);
    } catch (error) {
      console.error("Error handling GET request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}