"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function Order_comp() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/order");

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders");
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId, status) => {
    if (status === "in_progress") {
      alert("Ne možete izbrisati narudžbu koja je u tijeku.");
      return;
    }

    if (confirm("Jeste li sigurni da želite izbrisati ovu narudžbu?")) {
      try {
        const response = await fetch(`/api/order?orderId=${orderId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete order");
        }

        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      } catch (error) {
        console.error("Error deleting order:", error);
        setError("Failed to delete order");
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId) => {
    if (confirm("Narudžba je dostavljena?")) {
      try {
        const response = await fetch("/api/order", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            status: "completed",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order status");
        }

        const updatedOrder = await response.json();
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: "Isporučeno" } : order
          )
        );
      } catch (error) {
        console.error("Error updating order status:", error);
        setError("Failed to update order status");
      }
    }
  };

  return (
    <div className="accordion-item">
      <hr />
      <h2 className="accordion-header">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#flush-collapseFive"
          aria-expanded="false"
          aria-controls="flush-collapseFive"
        >
          Sve narudžbe/ praćenje narudžbi
        </button>
      </h2>
      <div
        id="flush-collapseFive"
        className="accordion-collapse collapse"
        data-bs-parent="#accordionFlushExample"
      >
        {error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID narudžbe</th>
                  <th>Korisnik</th>
                  <th>Email</th>
                  <th>Adresa</th>
                  <th>Telefon</th>
                  <th>Grad</th>
                  <th>Zip</th>
                  <th>Datum narudžbe</th>
                  <th>Status</th>
                  <th>Uredi</th>
                  <th>Izbriši</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.fullName}</td>
                    <td>{order.email}</td>
                    <td>{order.address}</td>
                    <td>{order.phoneNumber}</td>
                    <td>{order.city}</td>
                    <td>{order.zip}</td>
                    <td>{formatDate(order.orderDate)}</td>
                    <td>{order.status}</td>
                    <td>
                      
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleUpdateOrderStatus(order._id)}
                        >
                          Uredi
                        </button>
                    
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteOrder(order._id, order.status)}
                        disabled={order.status === "Isporučeno"}
                      >
                        Izbriši
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString) {
  try {
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid date");
    }
    return format(parsedDate, "dd.MM.yyyy HH:mm");
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Invalid Date";
  }
}
