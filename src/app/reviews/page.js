"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const params = new URLSearchParams(window.location.search);
      const itemId = params.get("itemId");

      if (!itemId) return;

      try {
        const response = await fetch(`/api/reviews?itemId=${itemId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError(error.message);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div>
      <Navigation />
      <div className="container">
        <h1 className="mt-3 text-center">Recenzije</h1>

        {error ? (
          <p className="alert alert-danger text-center">Error: {error}</p>
        ) : (
          <div>
            {reviews.length === 0 ? (
              <p className="mt-3 alert alert-warning text-center">
                Trenutno nema recenzija za ovaj artikl.
              </p>
            ) : (
              <ul className="list-group">
                {reviews.map((review) => (
                  <li key={review._id} className="list-group-item">
                    <p><strong>Korisnik:</strong> {review.userName}</p>
                    <p><strong>Ocjena:</strong> {review.rating}</p>
                    <p><strong>Tekst:</strong> {review.text}</p>
                    <p><strong>Datum:</strong> {new Date(review.date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
