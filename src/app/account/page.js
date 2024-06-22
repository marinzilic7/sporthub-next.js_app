"use client";
import { useEffect, useState } from "react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

const Account = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "", // Ne preporučuje se dohvaćanje lozinke iz sigurnosnih razloga
  });

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserString = localStorage.getItem("currentUser");
        console.log("Stored user string:", storedUserString);

        if (storedUserString) {
          try {
            const storedUser = JSON.parse(storedUserString);
            console.log("Parsed stored user:", storedUser);
            const userId = storedUser?.id;
            console.log("User ID:", userId);

            if (userId) {
              const response = await fetch(`/api/user?userId=${userId}`);
              const data = await response.json();
              console.log("Fetched user data:", data);

              setUserData({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: "***********", // Nemojte dohvatiti lozinku, ili je obradite sigurno
              });
            } else {
              console.error("User ID is not defined.");
            }
          } catch (parseError) {
            console.error("Error parsing stored user:", parseError);
          }
        } else {
          console.error("No user found in Local Storage.");
        }
      } catch (error) {
        console.error("Greška pri dohvaćanju podataka korisnika:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChangePassword = async () => {
    try {
      const storedUserString = localStorage.getItem("currentUser");
      const storedUser = JSON.parse(storedUserString);
      const userId = storedUser?.id;

      const response = await fetch(`/api/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newPassword }),
      });

      if (response.ok) {
        alert("Lozinka je uspješno promijenjena!");
        setNewPassword(""); // Opcionalno, možete očistiti polje za unos nove lozinke
      } else {
        console.error("Neuspješna promjena lozinke:", response.statusText);
      }
    } catch (error) {
      console.error("Greška prilikom promjene lozinke:", error);
    }
  };

  return (
    <div>
      <Navigation />
      <h3 className="text-center mt-5">Podaci vašeg računa</h3>
      <div className="container">
        <div className="d-flex justify-content-center">
          <form className="bg-light z-3 shadow-lg col-12 col-md-6 col-sm-6 col-lg-5 p-4 mt-3">
            <h1 className="text-center">Profil</h1>
            <div className="mb-3">
              <label htmlFor="inputFirstName" className="form-label">
                Ime
              </label>
              <input
                type="text"
                className="form-control"
                id="inputFirstName"
                disabled
                value={userData.firstName}
                onChange={(e) =>
                  setUserData({ ...userData, firstName: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="inputLastName" className="form-label">
                Prezime
              </label>
              <input
                type="text"
                className="form-control"
                id="inputLastName"
                disabled
                value={userData.lastName}
                onChange={(e) =>
                  setUserData({ ...userData, lastName: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="inputEmail" className="form-label">
                Email adresa
              </label>
              <input
                type="email"
                disabled
                className="form-control"
                id="inputEmail"
                value={userData.email}
                onChange={(e) =>
                  setUserData({ ...userData, email: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="inputPassword" className="form-label">
                Lozinka
              </label>
              <input
                type="password"
                className="form-control"
                id="inputPassword"
                disabled
                value={userData.password}
                onChange={(e) =>
                  setUserData({ ...userData, password: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              className="btn btn-primary mt-3 w-100"
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
              data-bs-whatever="@mdo"
            >
              Promijeni lozinku
            </button>
          </form>
        </div>
      </div>

      {/* MODAL */}
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Promjena lozinke
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="recipient-name" className="col-form-label">
                    Unesite vašu novu lozinku
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="recipient-name"
                    placeholder="Nova lozinka"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleChangePassword}
                >
                  Potvrdi
                </button>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary w-100"
                data-bs-dismiss="modal"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;