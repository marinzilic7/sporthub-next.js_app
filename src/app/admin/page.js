"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { bottom } from "@popperjs/core";
import { Familjen_Grotesk } from "next/font/google";
import useSWR from 'swr';
const Admin = () => {
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error, mutate } = useSWR('/api/items', fetcher);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [genders, setGenders] = useState([]);

  const [itemName, setItemName] = useState("");
  const [itemSize, setItemSize] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCategoryForItem, setSelectedCategoryForItem] = useState("");

  // const [selectedUser, setSelectedUser] = useState("");
  const [itemImage, setItemImage] = useState(null);

  //UREDIVANJE ARTIKLA
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemSize, setEditItemSize] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const [editItemCategoryId, setEditItemCategoryId] = useState("");
  const [editItemGenderId, setEditItemGenderId] = useState("");

  const [items, setItems] = useState([]);

  const [newItem, setNewItem] = useState({
    name: "",
    size: "",
    price: "",
    category_id: "",
    gender_id: "",
  });

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
        setCategories(
          categories.filter((category) => category._id !== categoryId)
        );
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

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    new bootstrap.Modal(document.getElementById("editCategoryModal")).show();
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    // Update category logic here
    // Example:
    try {
      const response = await fetch(
        `/api/categories?categoryId=${selectedCategory._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newCategoryName }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category._id === selectedCategory._id
            ? { ...category, name: newCategoryName }
            : category
        )
      );

      alert("Kategorija je uspješno ažurirana");
      const editModal = bootstrap.Modal.getInstance(
        document.getElementById("editCategoryModal")
      );
      editModal.hide();
    } catch (error) {
      console.error("Greška prilikom ažuriranja kategorije:", error.message);
    }
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

  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const response = await fetch("/api/gender");
        if (!response.ok) {
          throw new Error("Neuspješan zahtjev za dohvaćanjem spola");
        }
        const data = await response.json();
        setGenders(data); // Postavljamo dohvaćene korisnike u state
      } catch (error) {
        console.error("Greška prilikom dohvata spola:", error);
        // Ovdje možete obraditi grešku, npr. prikazati poruku korisniku
      }
    };

    fetchGenders();
  }, []);

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", itemName);
    formData.append("size", itemSize);
    formData.append("price", itemPrice);
    formData.append("category_id", selectedCategoryForItem);
    formData.append("gender_id", selectedGender);
    // formData.append("user_id", selectedUser);
    formData.append("image", itemImage);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newItem = await response.json();
        const categoryName =
          categories.find((category) => category._id === newItem.category_id)
            ?.name || "Unknown";
        const genderName =
          genders.find((gender) => gender._id === newItem.gender_id)?.name ||
          "Unknown";

        // Dodaj nova polja u novi artikl
        newItem.category_name = categoryName;
        newItem.gender_name = genderName;

        setItems((prevItems) => [...prevItems, newItem]);

        alert("Artikl je uspješno dodan");
      } else {
        throw new Error("Greška prilikom dodavanja artikla");
      }
    } catch (error) {
      console.error("Greška prilikom dodavanja artikla:", error.message);
    }

    // Reset form fields
    setItemName("");
    setItemSize("");
    setItemPrice("");
    setSelectedCategoryForItem("");
    setSelectedGender("");
    // setSelectedUser("");
    setItemImage(null);
  };

  const handleItem = async (itemId) => {
    try {
      const response = await fetch(`/api/items?itemId=${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setItems(items.filter((item) => item._id !== itemId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      console.error("Greška prilikom brisanja kategorije:", error.message);
    }
  };

  useEffect(() => {
    fetch("/api/items")
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditItemName(item.name); // Postavljamo početno ime artikla u formu
    setEditItemSize(item.size);
    setEditItemPrice(item.price);
    setEditItemCategoryId(item.category_id);
    setEditItemGenderId(item.gender_id);

    new bootstrap.Modal(document.getElementById("editModalItem")).show();
  };
  const handleSaveName = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/items?itemId=${editingItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editItemName,
          size: editItemSize,
          price: editItemPrice,
          category_id: editItemCategoryId,
          gender_id: editItemGenderId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

     

      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === editingItem._id
            ? {
                ...item,
                name: editItemName,
                size: editItemSize,
                price: editItemPrice,
                category_id: editItemCategoryId,
                gender_id: editItemGenderId,
                
              }
            : item
        )
      );

      alert("Ime artikla uspješno ažurirano");
      location.reload()
      const editModal = bootstrap.Modal.getInstance(
        document.getElementById("editModalItem")
      );
      editModal.hide();
     
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="container">
        <h1 className="mt-5 text-center mt-5">Administracija</h1>
        <div
          className="accordion accordion-flush shadow-lg mt-5"
          id="accordionFlushExample"
        >
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
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
              className="accordion-collapse collapse"
              data-bs-parent="#accordionFlushExample"
            >
              <div className="accordion-body">
                <div className="table-responsive">
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
                              className="btn btn-sm btn-outline-danger"
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
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
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
              className="accordion-collapse collapse"
              data-bs-parent="#accordionFlushExample"
            >
              <div className="accordion-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Ime</th>
                        <th>Izbrisi</th>
                        <th>Uredi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category._id}>
                          <td>{category._id}</td>
                          <td>{category.name}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteCategory(category._id)}
                            >
                              Izbrisi
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditCategory(category)}
                            >
                              Uredi
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
                  <div className="input-group input-group-sm mb-3 mt-3">
                    <span
                      className="input-group-text"
                      id="inputGroup-sizing-sm"
                    >
                      Ime Kategorije
                    </span>
                    <input
                      type="text"
                      className="form-control"
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
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
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
              className="accordion-collapse collapse"
              data-bs-parent="#accordionFlushExample"
            >
              <div className="accordion-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Ime</th>
                        <th scope="col">Cijena</th>
                        <th scope="col">Veličina</th>
                        <th scope="col">Kategorija</th>
                        <th scope="col">Spol</th>
                        <th scope="col">Izbrisi</th>
                        <th scope="col">Uredi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item._id}>
                          <th scope="row">{item._id}</th>
                          <td>{item.name}</td>
                          <td>{item.price}</td>
                          <td>{item.size}</td>
                          <td>{item.category_name}</td>
                          <td>{item.gender_name}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger "
                              onClick={() => handleItem(item._id)}
                            >
                              Izbrisi
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditItem(item)}
                            >
                              Uredi
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  className="accordion accordion-flush"
                  id="accordionFlushExample"
                >
                  <div className="accordion-item">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#flush-collapseFour"
                        aria-expanded="false"
                        aria-controls="flush-collapseFour"
                      >
                        Dodaj artikl
                      </button>
                    </h2>
                    <div
                      id="flush-collapseFour"
                      className="accordion-collapse collapse"
                      data-bs-parent="#accordionFlushExample"
                    >
                      <div className="accordion-body">
                        <form onSubmit={handleItemSubmit}>
                          <div className="input-group input-group-sm mb-3 mt-3">
                            <span
                              className="input-group-text"
                              id="inputGroup-sizing-sm"
                            >
                              Ime artikla
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              aria-label="Sizing example input"
                              aria-describedby="inputGroup-sizing-sm"
                              value={itemName}
                              onChange={(e) => setItemName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="input-group input-group-sm mb-3 mt-3">
                            <span
                              className="input-group-text"
                              id="inputGroup-sizing-sm"
                            >
                              Veličina artikla
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              aria-label="Sizing example input"
                              aria-describedby="inputGroup-sizing-sm"
                              value={itemSize}
                              onChange={(e) => setItemSize(e.target.value)}
                              required
                            />
                          </div>
                          <div className="input-group input-group-sm mb-3 mt-3">
                            <span
                              className="input-group-text"
                              id="inputGroup-sizing-sm"
                            >
                              Cijena artikla
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              aria-label="Sizing example input"
                              aria-describedby="inputGroup-sizing-sm"
                              value={itemPrice}
                              onChange={(e) => setItemPrice(e.target.value)}
                              required
                            />
                          </div>
                          <div className="input-group input-group-sm mb-3 mt-3">
                            <span
                              className="input-group-text"
                              id="inputGroup-sizing-sm"
                            >
                              Kategorija
                            </span>
                            <select
                              className="form-select form-select-sm"
                              aria-label=".form-select-sm example"
                              value={selectedCategoryForItem}
                              onChange={(e) =>
                                setSelectedCategoryForItem(e.target.value)
                              }
                            >
                              {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="input-group input-group-sm mb-3 mt-3">
                            <span
                              className="input-group-text"
                              id="inputGroup-sizing-sm"
                            >
                              Namjenjeno za
                            </span>
                            <select
                              className="form-select form-select-sm"
                              aria-label=".form-select-sm example"
                              value={selectedGender}
                              onChange={(e) =>
                                setSelectedGender(e.target.value)
                              }
                            >
                              {genders.map((gender) => (
                                <option key={gender._id} value={gender._id}>
                                  {gender.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="input-group input-group-sm mb-3 mt-3">
                            <span
                              className="input-group-text"
                              id="inputGroup-sizing-sm"
                            >
                              Slika
                            </span>
                            <div>
                              <input
                                className="form-control form-control-sm"
                                id="itemImage"
                                onChange={(e) =>
                                  setItemImage(e.target.files[0])
                                }
                                type="file"
                                required
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                          >
                            Dodaj artikl
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Category Modal */}
      <div
        className="modal fade"
        id="editCategoryModal"
        tabIndex="-1"
        aria-labelledby="editCategoryModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editCategoryModalLabel">
                Uredi Kategoriju
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateCategory}>
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label">
                    Ime Kategorije
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Spremi promjene
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL ZA EDIT ARTIKALA */}

      <div
        className="modal fade"
        id="editModalItem"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Uredi artikl
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveName}>
                <div className="mb-3">
                  <label htmlFor="editItemName" className="col-form-label">
                    Ime artikla:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editItemName"
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editItemSize" className="col-form-label">
                    Veličina:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="editItemSize"
                    value={editItemSize}
                    onChange={(e) => setEditItemSize(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editItemPrice" className="col-form-label">
                    Cijena:
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="editItemPrice"
                    value={editItemPrice}
                    onChange={(e) => setEditItemPrice(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label
                    htmlFor="editItemCategoryId"
                    className="col-form-label"
                  >
                    Kategorija ID:
                  </label>
                  <select
                    className="form-control"
                    id="editItemCategoryId"
                    value={editItemCategoryId}
                    onChange={(e) => setEditItemCategoryId(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="editItemGenderId" className="col-form-label">
                    Spol ID:
                  </label>
                  <select
                    className="form-control"
                    id="editItemGenderId"
                    value={editItemGenderId}
                    onChange={(e) => setEditItemGenderId(e.target.value)}
                  >
                    {genders.map((gender) => (
                      <option key={gender._id} value={gender._id}>
                        {gender.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary">
                  Spremi promjene
                </button>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
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

export default Admin;
