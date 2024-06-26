"use client";
import "bootstrap/dist/css/bootstrap.min.css";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
function Navigation() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      const userObject = JSON.parse(storedUser);
      const userId = userObject.id;
      setCurrentUser(userObject);

      // Dohvat broja artikala u košarici
      const fetchCartItemCount = async () => {
        try {
          const response = await fetch(`/api/numCart?userId=${userId}`);
          const data = await response.json();
          setCartItemCount(data);
          console.log(data);
        } catch (error) {
          console.error("Error fetching cart item count:", error);
        }
      };

      fetchCartItemCount();
    } else {
      setCartItemCount(0);
    }
  }, []);
  const handleLogout = () => {
    document.cookie =
      "sessionToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand text-light" href="#">
            SportHub
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a
                  className="nav-link text-light active"
                  aria-current="page"
                  href="/home"
                >
                  Početna
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light" href="/mens">
                  Muškarci
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light" href="/womens">
                  Žene
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light" href="/kids">
                  Djeca
                </a>
              </li>
            </ul>

            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a href="/cart" className="nav-link text-light">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    fill="currentColor"
                    className="bi bi-cart2 text-light me-4"
                    viewBox="0 0 16 16"
                  >
                    <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l1.25 5h8.22l1.25-5zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="badge bg-danger position-absolute top-0 badgeCount">
                      {cartItemCount}
                    </span>
                  )}
                </a>
              </li>

              {currentUser ? (
                <div className="btn-group dropstart">
                  <button
                    type="button"
                    className="btn bg-primary text-light dropdown-toggle custom-btn"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <span className="text-light">{currentUser.firstName}</span>
                  </button>
                  <ul className="dropdown-menu custom-dropdown">
                    <li className="nav-item">
                      <a className="nav-link" href="#" onClick={handleLogout}>
                        Odjava
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/account">
                        Profil
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="/admin">
                        Administracija
                      </a>
                    </li>
                  </ul>
                </div>
              ) : (
                <li className="nav-item d-flex">
                  <a className="nav-link text-light" href="/register">
                    Registracija{" "}
                  </a>
                  <a className="nav-link text-light" href="/">
                    Prijava
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navigation;
