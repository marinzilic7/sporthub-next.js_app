"use client";

import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


function Home() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message); // Postavite poruku za prikaz na stranici
      } else {
        const error = await response.json();
        alert(error.error); // Prikažite grešku ako postoji problem s registracijom
      }
    } catch (error) {
      console.error('Došlo je do greške prilikom registracije:', error);
      alert('Došlo je do greške prilikom registracije.');
    }
  };

  return (
    <div className="container">
      <h1 className="text-center mt-5">Registracija</h1>
      <div className="mt-3 d-flex justify-content-center">
        <form className="bg-light shadow-lg col-12 col-md-6 col-sm-6 col-lg-5 p-4 mt-3" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="inputFirstName" className="form-label">
              Ime
            </label>
            <input
              type="text"
              className="form-control"
              id="inputFirstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
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
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="inputEmail" className="form-label">
              Email adresa
            </label>
            <input
              type="email"
              className="form-control"
              id="inputEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="inputPassword" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="inputPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn w-100 mt-3 btn-primary">
            Registracija
          </button>
          <p className="text-center mt-3">
            Već imate račun? <span><a href="/" className="text-underline">Prijava</a></span>
          </p>
          <p className="text-center">
            <a href="">Pogledaj kao gost</a>
          </p>
          {message && <p  className="text-center alert alert-info mt-3">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Home;
