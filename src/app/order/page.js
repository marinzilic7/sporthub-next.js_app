"use client";

import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { useState } from "react";

export default function Order() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card"); // Dodano stanje za način plačanja
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userId = currentUser.id;

      const response = await fetch(`/api/order?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
          fullName,
          address,
          phoneNumber,
          city,
          zip,
          paymentMethod,
         
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      alert("Narudžba je uspješno poslana!");

    } catch (error) {
      console.error("Error placing order:", error);
      setError("Greška prilikom potvrde narudžbe.");
    }
  };

  return (
    <div>
      <Navigation />
      <h3 className="text-center mt-3">Upišite vaše informacije za plaćanje</h3>
      <div className="container " style={{ marginBottom: "200px" }}>
        <form className="row g-3 p-3 shadow-lg mt-5" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label htmlFor="inputEmail4" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="inputEmail4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="inputPassword4" className="form-label">Ime i prezime</label>
            <input
              type="text"
              className="form-control"
              id="inputPassword4"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputAddress" className="form-label">Adresa</label>
            <input
              type="text"
              className="form-control"
              id="inputAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            <label htmlFor="inputAddress2" className="form-label">Broj telefona</label>
            <input
              type="text"
              className="form-control"
              id="inputAddress2"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="inputCity" className="form-label">Grad</label>
            <input
              type="text"
              className="form-control"
              id="inputCity"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <label htmlFor="inputZip" className="form-label">Zip</label>
            <input
              type="text"
              className="form-control"
              id="inputZip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              required
            />
          </div>
          <div className="col-12">
            <label htmlFor="paymentMethod" className="form-label">Način placanja</label>
            <select
              id="paymentMethod"
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="card">Karticom</option>
              <option value="company">Poduzećem</option>
            </select>
          </div>

          {paymentMethod === "card" && (
            <div>
              <div className="col-12">
                <label htmlFor="cardNumber" className="form-label">Broj kartice</label>
                <input
                  type="text"
                  className="form-control"
                  id="cardNumber"
                 
                  
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="cardExpiry" className="form-label">Datum isteka</label>
                <input
                  type="text"
                  className="form-control"
                  id="cardExpiry"
                 
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="cardCVC" className="form-label">CVC</label>
                <input
                  type="text"
                  className="form-control"
                  id="cardCVC"
                  
                  required
                />
              </div>
            </div>
          )}

          <div className="col-12">
            {error && <p className="text-danger mt-3">{error}</p>}
            <button type="submit" className="btn btn-primary">Potvrdi</button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
