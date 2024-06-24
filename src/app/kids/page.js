"use client";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function Kids() {
  const [mens, setMens] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMensItems = async () => {
      try {
        const response = await fetch("/api/kids");
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        setMens(data);
      } catch (error) {
        console.error("Error fetching items:", error);
        setError(error.message);
      }
    };

    fetchMensItems();
  }, []);

  const getFileNameFromPath = (filePath) => {
    const lastIndex = filePath.lastIndexOf("\\"); // Pronalazi posljednji pojavljivanje znaka "\"
    if (lastIndex === -1) {
      return filePath; // Ako ne nađe znak "\\", vraća cijelu putanju
    }
    return filePath.substring(lastIndex + 1); // Vraća samo dio nakon zadnjeg znaka "\\"
  };

  return (
    <div>
      <Navigation />
      <div className="container">
        <div className="d-flex gap-3 mt-5">
        {error ? (
          <p>Error: {error}</p>
        ) : (
          mens.map((item) => (
            <div className="card" style={{ width: "18rem" }} key={item._id}>
              <img
                src={`/uploads/${getFileNameFromPath(item.fajlPath)}`}
                className="card-img-top"
                alt="Slika artikla"
              />
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <hr></hr>
                <p className="card-text">Veličina: {item.size}</p>
                <hr></hr>
                <p className="card-text">Cijena: {item.price}</p>
                <hr></hr>
                <p className="card-text">Kategorija: {item.category_name}</p>
                <hr></hr>
                <p className="card-text">Spol: {item.gender_name}</p>
              
              </div>
            </div>
          ))
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
