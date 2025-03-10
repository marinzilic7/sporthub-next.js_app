"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        const userId = currentUser ? currentUser.id : null;
  
        if (userId) {
          // Ako je korisnik prijavljen, dohvati artikle iz baze podataka
          setCurrentUser(currentUser);
          const response = await fetch(`/api/cart?userId=${currentUser.id}`);
          if (!response.ok) {
            throw new Error("Kosarica je prazna zbog nedostupnosti artikala");
          }
          const data = await response.json();
          setCartItems(data);
          const total = data.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          );
          setTotalPrice(total);
        } else {
          // Ako korisnik nije prijavljen, koristi localStorage
          const guestCartItems = JSON.parse(localStorage.getItem("guestCart")) || [];
  
          if (guestCartItems.length === 0) {
            setCartItems([]);
            setTotalPrice(0);
            return;
          }
  
          // Dohvati itemIds iz guestCartItems
          const itemIds = guestCartItems.map(item => item.itemId);
  
          // Izradi URL za dohvaćanje artikala
          const response = await fetch(`/api/items?itemIds=${itemIds.join(",")}`);
          if (!response.ok) {
            throw new Error("Ne mogu dohvatiti artikle.");
          }
          const itemsData = await response.json();
  
          // Spoji podatke iz localStorage s dohvaćenim podacima
          const fetchedItems = guestCartItems.map(guestItem => {
            const itemData = itemsData.find(item => item._id === guestItem.itemId);
            return {
              ...itemData, // Podaci o artiklu iz baze
              quantity: guestItem.quantity // Količina iz localStorage-a
            };
          });
  
          setCartItems(fetchedItems);
  
          // Izračunaj ukupnu cijenu
          const total = fetchedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
          setTotalPrice(total);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setError("Došlo je do pogreške prilikom dohvaćanja košarice.");
      }
    };
    fetchCartItems();
  }, []);
  const getFileNameFromPath = (filePath) => {
    const lastIndex = filePath.lastIndexOf("\\"); // Pronalazi posljednji pojavljivanje znaka "\"
    if (lastIndex === -1) {
      return filePath; // Ako ne nađe znak "\\", vraća cijelu putanju
    }
    return filePath.substring(lastIndex + 1); // Vraća samo dio nakon zadnjeg znaka "\\"
  };

  const removeFromCart = async (itemId) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
   

    if (currentUser) {
      // Korisnik je prijavljen
      const userId = currentUser.id;
      const response = await fetch(`/api/cart?userId=${userId}&itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      setCartItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemId)
      );
      const total = cartItems.reduce(
        (acc, item) =>
          acc + (item._id !== itemId ? item.price * item.quantity : 0),
        0
      );
      setTotalPrice(total);
    } else {
      // Korisnik nije prijavljen
      const guestCartItems = JSON.parse(localStorage.getItem("guestCart")) || [];
      const updatedGuestCartItems = guestCartItems.filter((item) => item.itemId !== itemId);
      localStorage.setItem("guestCart", JSON.stringify(updatedGuestCartItems));
    }

    // Ažuriraj stanje cartItems
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item._id !== itemId);
      const total = updatedItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      setTotalPrice(total);
      return updatedItems;
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    alert("Error removing item from cart");
  }
};

  return (
    <div>
      <Navigation />
      <div className="container">
        <h1 className="mt-3 text-center">Košarica</h1>
        {error ? (
          <p>Error: {error}</p>
        ) : cartItems.length === 0 ? (
          <p className="alert alert-warning text-center mt-3">
            U košarici nemate niti jedan artikl.
          </p>
        ) : (
          <>
            <div className="d-flex gap-3 mt-5">
              {cartItems.map((item) => (
                <div
                  className="card shadow-lg mb-3"
                  style={{ width: "18rem" }}
                  key={item._id}
                >
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
                    <p className="card-text">Kategorija: {item.category}</p>
                    <hr></hr>
                    <p className="card-text">Količina: {item.quantity}</p>

                    <hr></hr>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="card-text mt-3">Cijena: {item.price} €</p>
                      <button className="btn btn-sm"  onClick={() => removeFromCart(item._id)}>
                        {" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="25"
                          fill="currentColor"
                          class="bi bi-x-circle-fill text-danger"
                          viewBox="0 0 16 16"
                        >
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-end d-flex justify-content-end align-items-center gap-2">
              <h5 className="mt-2">Ukupna cijena: {totalPrice.toFixed(2)} €</h5>
              {currentUser ? (
                <button className="btn btn-success btn-sm">
                  <a href="/order" className="text-decoration-none text-light">Naruči</a>
                </button>
              ) : (
                <p className="text-danger fw-bold mt-2">Morate se prijaviti kako biste mogli naručiti.</p>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
