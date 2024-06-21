// pages/api/register.js

import { hash } from "bcryptjs"; // ili neki drugi način enkripcije lozinke
import clientPromise from "../../bin/mongo";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Molimo popunite sva polja." });
    }

    try {
      const client = await clientPromise;
      const db = client.db("sporthub"); // Promijenite ime vaše baze

      // Provjera postoji li korisnik s istom email adresom
      const existingUser = await db.collection("users").findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Korisnik sa ovim email-om već postoji." });
      }

      // Enkriptiranje lozinke (primjer s bcryptjs)
      const hashedPassword = await hash(password, 10);

      // Spremanje korisnika u bazu
      const result = await db.collection("users").insertOne({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      res
        .status(201)
        .json({ message: "Korisnik uspješno registriran.", result });
    } catch (error) {
      console.error("Greška prilikom registracije korisnika:", error);
      res
        .status(500)
        .json({ error: "Došlo je do greške prilikom registracije korisnika." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Metoda ${req.method} nije dopuštena.`);
  }
}
