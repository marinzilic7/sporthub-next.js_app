"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

const Admin = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Neuspješan zahtjev za dohvaćanjem korisnika");
        }
        const data = await response.json();
        setUsers(data); // Postavljamo dohvaćene korisnike u state
      } catch (error) {
        console.error("Greška prilikom dohvata korisnika:", error);
        // Ovdje možete obraditi grešku, npr. prikazati poruku korisniku
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setUsers(users.filter((user) => user._id !== userId));
        alert("Korisnik uspješno izbrisan");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Greška prilikom brisanja korisnika:", error.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`/api/categories?categoryId=${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Prikaz poruke ako je kategorija uspješno izbrisana
        setCategories(categories.filter((category) => category._id !== categoryId));
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Greška prilikom brisanja kategorije:", error.message);
      // Ovdje možete obraditi grešku brisanja kategorije
    }
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error("Neuspješan zahtjev za dohvaćanjem korisnika");
        }
        const data = await response.json();
        setCategories(data); // Postavljamo dohvaćene korisnike u state
      } catch (error) {
        console.error("Greška prilikom dohvata korisnika:", error);
        // Ovdje možete obraditi grešku, npr. prikazati poruku korisniku
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryName }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Response data:", data);
  
      // Provjerite da li je vraćen validan objekt kategorije
      if (data.result && data.result.insertedId) {
        setCategories((prevCategories) => [
          ...prevCategories,
          { _id: data.result.insertedId, name: categoryName }, // Dodajte novu kategoriju u stanje
        ]);
        alert("Kategorija je uspješno dodana");
      } else {
        throw new Error("Podaci o kategoriji nisu pravilno vraćeni");
      }
    } catch (error) {
      console.error("Greška prilikom dodavanja kategorije:", error.message);
      // Ovdje možete obraditi grešku dodavanja kategorije
    }
    setCategoryName(""); // Resetiranje stanja categoryName nakon dodavanja
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Učitavanje podataka o prijavljenom korisniku iz LocalStorage-a
        const storedUserString = localStorage.getItem("currentUser");
        const storedUser = storedUserString
          ? JSON.parse(storedUserString)
          : null;

        // Provjera je li korisnik prijavljen i je li admin
        if (!storedUser || storedUser.role !== "admin") {
          // Ako nije, preusmjeri na početnu stranicu
          router.push("/home");
          alert("Nemate pristup administrativnoj stranici.");
        }
      } catch (error) {
        console.error("Greška pri provjeri pristupa:", error);
        // U ovom slučaju, možete odlučiti što učiniti u slučaju greške (npr. prikazati poruku ili preusmjeriti)
      }
    };

    checkAdminAccess();
  }, [router]);

  return (
    <div>
      <Navigation />
      <div className="container">
        <h1 className="mt-5 text-center mt-5">Administracija</h1>
        <div
          className="accordion accordion-flush shadow-lg mt-5"
          id="accordionFlushExample"
        >
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapseOne"
                aria-expanded="false"
                aria-controls="flush-collapseOne"
              >
                Pregled svih korisnika / manipulacija korisnicima
              </button>
            </h2>
            <div
              id="flush-collapseOne"
              class="accordion-collapse collapse"
              data-bs-parent="#accordionFlushExample"
            >
              <div class="accordion-body">
                <div class="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Ime</th>
                        <th>Prezime</th>
                        <th>Email</th>
                        <th>Uloga</th>
                        <th>Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user._id}</td>
                          <td>{user.firstName}</td>
                          <td>{user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>
                            <button
                              class="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              Izbrisi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapseTwo"
                aria-expanded="false"
                aria-controls="flush-collapseTwo"
              >
                Pregled svih kategorija / manipulacija kategorijama
              </button>
            </h2>
            <div
              id="flush-collapseTwo"
              class="accordion-collapse collapse"
              data-bs-parent="#accordionFlushExample"
            >
              <div class="accordion-body">
                <div class="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Ime</th>
                        <th>Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td>{category._id}</td>
                          <td>{category.name}</td>
                          <td>
                            <button
                              class="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCategory(category._id)}
                            >
                              Izbrisi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <hr />
                <h5 className="text-center mt-3">Dodaj kategoriju</h5>
                <form onSubmit={handleSubmit}>
                  <div class="input-group input-group-sm mb-3 mt-3">
                    <span class="input-group-text" id="inputGroup-sizing-sm">
                      Ime Kategorije
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-sm"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Dodaj kategoriju
                  </button>
                </form>
              </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#flush-collapseThree"
                aria-expanded="false"
                aria-controls="flush-collapseThree"
              >
                Pregled svih artikala / manipulacija artiklima
              </button>
            </h2>
            <div
              id="flush-collapseThree"
              class="accordion-collapse collapse"
              data-bs-parent="#accordionFlushExample"
            >
              <div class="accordion-body">
                Placeholder content for this accordion, which is intended to
                demonstrate the <code>.accordion-flush</code> class. This is the
                third item's accordion body. Nothing more exciting happening
                here in terms of content, but just filling up the space to make
                it look, at least at first glance, a bit more representative of
                how this would look in a real-world application.
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
