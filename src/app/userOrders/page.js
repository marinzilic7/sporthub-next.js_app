"use client";

import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser || !currentUser.id) {
          throw new Error("User is not logged in");
        }
        const userId = currentUser.id;

        const response = await fetch(`/api/userOrders?userId=${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data.orders); // Adjust based on the API response structure
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Greška prilikom dohvaćanja narudžbi.");
      }
    };

    fetchOrders();
  }, []);
  const getFileNameFromPath = (filePath) => {
    const lastIndex = filePath.lastIndexOf("\\");
    if (lastIndex === -1) {
      return filePath;
    }
    return filePath.substring(lastIndex + 1);
  };

  return (
    <div>
      <Navigation />
      <h3 className="text-center mt-5">Moje narudžbe</h3>
      <div className="container">
        {error && <p className="text-danger text-center">{error}</p>}
        {orders.length > 0 ? (
          <table className="table table-striped mt-4">
            <thead>
              <tr>
                <th>#</th>
                <th>Datum</th>
                <th>Ime i Prezime</th>
                <th>Email</th>
                <th>Adresa</th>
                <th>Grad</th>
                <th>Broj telefona</th>
                <th>Poštanski broj</th>
                <th>Stavke</th> {/* Novi stupac za stavke */}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>{order.fullName}</td>
                  <td>{order.email}</td>
                  <td>{order.address}</td>
                  <td>{order.city}</td>
                  <td>{order.phoneNumber}</td>
                  <td>{order.zip}</td>
                  <td>
                    <ul>
                      {order.itemDetails.map((item, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "10px",
                          }}
                        >
                          <img
                            src={`/uploads/${getFileNameFromPath(
                              item.fajlPath
                            )}`}
                            alt="Slika artikla"
                            style={{
                              width: "80px",
                              height: "80px",
                              marginRight: "10px",
                            }} 
                          />
                          {item.name} - {item.price} € - Količina {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center mt-3">Nemate narudžbi.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserOrders;
