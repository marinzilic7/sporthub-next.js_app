"use client";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Pagination from "react-bootstrap/Pagination";

export default function Mens() {
  const [mens, setMens] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedCategoryRange, setSelectedCategoryRange] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewItemId, setReviewItemId] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(1);

  useEffect(() => {
    const fetchMensItems = async () => {
      try {
        const response = await fetch("/api/womens");
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

    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchMensItems();
    fetchCategories();
  }, []);

  const getFileNameFromPath = (filePath) => {
    const lastIndex = filePath.lastIndexOf("\\");
    if (lastIndex === -1) {
      return filePath;
    }
    return filePath.substring(lastIndex + 1);
  };

  const addToCart = async (itemId) => {
    try {
      const currentUser = localStorage.getItem("currentUser");

      if (currentUser) {
        const userId = JSON.parse(currentUser).id;
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId, userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to add item to cart");
        }

        const data = await response.json();
        alert(data.message);
      } else {
        let cart = JSON.parse(localStorage.getItem("guestCart")) || [];
        const existingItem = cart.find((item) => item.itemId === itemId);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({ itemId, quantity: 1 });
        }

        localStorage.setItem("guestCart", JSON.stringify(cart));
        alert("Artikal je dodan u košaricu.");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const handleReviewSubmit = async () => {
    try {
      const currentUser = localStorage.getItem("currentUser");
      if (!currentUser) {
        alert("Morate biti prijavljeni za dodavanje recenzije.");
        return;
      }

      const userId = JSON.parse(currentUser).id;
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          itemId: reviewItemId,
          text: reviewText,
          rating: reviewRating,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const data = await response.json();
      alert(data.message);
      setReviewItemId(null); // Hide the review form after submission
      setReviewText("");
      setReviewRating(1);
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const filterByPrice = (item) => {
    switch (selectedPriceRange) {
      case "all":
        return true;
      case "under50":
        return item.price < 50;
      case "under100":
        return item.price < 100;
      case "over100":
        return item.price >= 100;
      default:
        return true;
    }
  };

  const filterByCategory = (item) => {
    switch (selectedCategoryRange) {
      case "all":
        return true;
      default:
        return item.category_name === selectedCategoryRange;
    }
  };

  const filterByName = (item) => {
    if (!searchTerm) return true;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mens
    .filter(filterByPrice)
    .filter(filterByCategory)
    .filter(filterByName)
    .slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePriceFilterChange = (e) => {
    setSelectedPriceRange(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategoryRange(e.target.value);
    setCurrentPage(1);
  };
  const handleRatingClick = (rating) => {
    setReviewRating(rating);
  };

  return (
    <div>
      <Navigation />
      <div className="container container-bottom"  style={{ marginBottom: "100px" }}>
        <h1 className="mt-3 text-center">Ponuda za muškarce</h1>

        <div className="text-center mt-3">
          <label className="me-2">Pretraži po nazivu:</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Unesi naziv"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="text-center mt-3">
          <label className="me-2">Filtriraj po cijeni:</label>
          <select
            className="form-select form-select-sm"
            aria-label=".form-select-sm example"
            value={selectedPriceRange}
            onChange={handlePriceFilterChange}
          >
            <option value="all">Svi proizvodi</option>
            <option value="under50">Manje od 50 €</option>
            <option value="under100">Manje od 100 €</option>
            <option value="over100">100 € i više</option>
          </select>
        </div>

        <div className="text-center mt-3">
          <label className="me-2">Filtriraj po kategorijama:</label>
          <select
            className="form-select form-select-sm"
            aria-label=".form-select-sm example"
            value={selectedCategoryRange}
            onChange={handleCategoryFilterChange}
          >
            <option value="all">Svi proizvodi</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <p>Error: {error}</p>
        ) : (
          <div>
            {currentItems.length === 0 ? (
              <p className="mt-3 alert alert-warning text-center">
                Nema dostupnih artikala.
              </p>
            ) : (
              <div>
                {Array.from({
                  length: Math.ceil(currentItems.length / 5),
                }).map((row, index) => (
                  <div className="gap-card" key={index}>
                    {currentItems
                      .slice(index * 5, index * 5 + 5)
                      .map((item) => (
                        <div
                          key={item._id}
                          className="col-lg-2 col-md-4 col-sm-6"
                        >
                          <div
                            className="card shadow-lg"
                            style={{ width: "18rem" }}
                          >
                            <img
                              src={`/uploads/${getFileNameFromPath(
                                item.fajlPath
                              )}`}
                              className="card-img-top"
                              alt="Slika artikla"
                              style={{ height: "200px", objectFit: "cover" }} // Prilagođavanje visine slike
                            />
                            <div className="card-body">
                              <h5 className="card-title text-center">
                                {item.name}
                              </h5>
                              <hr />
                              <p className="card-text text-center">
                                Veličina: {item.size}
                              </p>
                              <hr />
                              <p className="card-text text-center">
                                {item.gender_name}
                              </p>
                              <hr />
                              <p className="card-text text-center">
                                Kategorija: {item.category_name}
                              </p>
                              <hr />
                              <p className="card-text text-center">
                                Cijena: {item.price} €
                              </p>
                              <div className="d-flex justify-content-center">
                                <button
                                  className="btn btn-sm"
                                  onClick={() => addToCart(item._id)}
                                >
                                  <img
                                    src="./cart.png"
                                    className="icon-cart"
                                    alt="Dodaj u košaricu"
                                  />
                                </button>
                              </div>

                              <button
                                className="btn btn-success btn-sm w-100 mt-2"
                                onClick={() => {
                                  setReviewItemId(item._id);
                                }}
                              >
                                Napiši recenziju
                              </button>
                              <button className="btn btn-primary btn-sm w-100 mt-2">
                                <a className="text-light"  href={`/reviews?itemId=${item._id}`}>Prikazi recenzije</a>
                                
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}

            <Pagination className="mt-3">
              {[...Array(Math.ceil(mens.length / itemsPerPage))].map(
                (_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                )
              )}
            </Pagination>
          </div>
        )}

        {reviewItemId && (
          <div className="review-form mt-4"  style={{ marginBottom: "200px" }}>
            <h3>Napiši recenziju</h3>
            <div className="mb-3">
              <label htmlFor="review-text" className="form-label">
                Tekst recenzije
              </label>
              <textarea
                id="review-text"
                className="form-control"
                rows="3"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">Ocjena</label>
              <div className="d-flex">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <span
                    key={rating}
                    className={`star ${rating <= reviewRating ? "filled" : ""}`}
                    onClick={() => handleRatingClick(rating)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleReviewSubmit}>
              Pošalji recenziju
            </button>
            <button
              className="btn btn-secondary ms-2"
              onClick={() => setReviewItemId(null)}
            >
              Odustani
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
