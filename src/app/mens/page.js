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

  useEffect(() => {
    const fetchMensItems = async () => {
      try {
        const response = await fetch("/api/mens");
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
        const response = await fetch("/api/categories"); // Prilagodite putanju prema vašem API-ju za kategorije
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Postavite state greške ako je potrebno
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
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userId = currentUser.id;

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
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("Za dodavanje artikla u košaricu potrebno se prijaviti.");
    }
  };

  // Filtriranje po cijeni
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

  // Filtriranje po kategoriji
  const filterByCategory = (item) => {
    switch (selectedCategoryRange) {
      case "all":
        return true;
      default:
        return item.category_name === selectedCategoryRange;
    }
  };

  // Paginacija
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mens
    .filter(filterByPrice)
    .filter(filterByCategory)
    .slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePriceFilterChange = (e) => {
    setSelectedPriceRange(e.target.value);
    setCurrentPage(1); // Resetiranje stranice na 1 kada se promijeni filter
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategoryRange(e.target.value);
    setCurrentPage(1); // Resetiranje stranice na 1 kada se promijeni filter
  };

  return (
    <div>
      <Navigation />
      <div className="container container-bottom">
        <h1 className="mt-3 text-center">Ponuda za muškarce</h1>

        {/* Dropdown za filtriranje po cijeni */}
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

        {/* Dropdown za filtriranje po kategorijama */}
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
              <p className="mt-3 alert alert-warning text-center">Nema dostupnih artikala.</p>
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
                              <div className="d-flex justify-content-between align-items-center">
                                <p className="card-text fs-5 mt-3">
                                  {item.price} €
                                </p>
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
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paginacija */}
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            {Array.from({
              length: Math.ceil(
                mens.filter(filterByPrice).filter(filterByCategory).length /
                  itemsPerPage
              ),
            }).map((_, index) => (
              <Pagination.Item
                key={index}
                active={index + 1 === currentPage}
                onClick={() => paginate(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      </div>
      <Footer />
    </div>
  );
}
