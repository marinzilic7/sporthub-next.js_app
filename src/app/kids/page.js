"use client";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import Pagination from "react-bootstrap/Pagination";

export default function Kids() {
  const [kids, setKids] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedCategoryRange, setSelectedCategoryRange] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Dodano stanje za filtriranje po nazivu

  useEffect(() => {
    const fetchKidsItems = async () => {
      try {
        const response = await fetch("/api/kids");
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        setKids(data);
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

    fetchKidsItems();
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
        // Korisnik je prijavljen, pohrani artikle u bazu
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
        // Korisnik nije prijavljen, pohrani artikle u localStorage
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

   // Filtriranje po nazivu
   const filterByName = (item) => {
    if (!searchTerm) return true;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  };


  // Paginacija
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = kids
    .filter(filterByPrice)
    .filter(filterByCategory)
    .filter(filterByName)
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
        <h1 className="mt-3 text-center">Ponuda za djecu</h1>

         {/* Input za filtriranje po nazivu */}
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
              <p className="mt-5 alert alert-warning text-center">Nema dostupnih artikala.</p>
            ) : (
              <div className="gap-card">
                {currentItems.map((item) => (
                  <div
                    key={item._id}
                    className="col-lg-2 col-md-4 col-sm-6 mb-4"
                  >
                    <div className="card shadow-lg" style={{ width: '18rem' }}>
                      <img
                        src={`/uploads/${getFileNameFromPath(item.fajlPath)}`}
                        className="card-img-top"
                        alt="Slika artikla"
                      />
                      <div className="card-body">
                        <h5 className="card-title text-center">{item.name}</h5>
                        <hr />
                        <p className="card-text text-center">Veličina: {item.size}</p>
                        <hr />
                        <p className="card-text text-center">{item.gender_name}</p>
                        <hr />
                        <p className="card-text text-center">
                          Kategorija: {item.category_name}
                        </p>
                        <hr />
                        <div className="d-flex justify-content-between align-items-center">
                          <p className="card-text fs-5 mt-3">{item.price} €</p>
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
            )}
          </div>
        )}

        {/* Paginacija */}
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            {Array.from({ length: Math.ceil(kids.filter(filterByPrice).filter(filterByCategory).length / itemsPerPage) }).map(
              (_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === currentPage}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              )
            )}
          </Pagination>
        </div>
      </div>
      <Footer />
    </div>
  );
}