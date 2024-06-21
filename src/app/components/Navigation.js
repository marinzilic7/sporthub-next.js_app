
"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
function Navigation() {
    const [currentUser, setCurrentUser] = useState(null); // Stanje za pohranu informacija o prijavljenom korisniku
    const router = useRouter(); // Ovdje koristimo useRouter unutar funkcionalne komponente
    useEffect(() => {
        // Povlačenje korisničkih podataka iz localStorage-a
        const storedUser = localStorage.getItem('currentUser'); 
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        // Brisanje sessionToken iz cookie-a i korisničkih podataka iz localStorage-a
        document.cookie = 'sessionToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        localStorage.removeItem('currentUser');
        
        // Preusmjeravanje na početnu stranicu nakon odjave
        router.push('/');
    };

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-primary">
                <div className="container">
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
                                <a className="nav-link text-light active" aria-current="page" href="#">
                                    Početna
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-light" href="#">
                                    Muškarci
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-light" href="#">
                                    Žene
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link text-light" href="#">
                                    Djeca
                                </a>
                            </li>
                           
                        </ul>
                        <form className="d-flex">
                            <input
                                className="form-control me-2"
                                type="search"
                                placeholder="Pretraži..."
                                aria-label="Search"
                            />
                            <button className="btn btn-outline-light " type="submit">
                                Pretraži
                            </button>
                        </form>
                        {currentUser && ( // Provjera da li postoji prijavljeni korisnik
                            <div className="d-flex align-items-center">
                                <span className="text-light mx-2">{currentUser.firstName}</span> {/* Prikaz imena korisnika */}
                                {/* Dodajte ikonu korisnika ili neki drugi prikaz */}
                            </div>
                        )}
                        
                        <ul className="navbar-nav">
                        <li className="nav-item">
                                <a className="nav-link text-light" href="#" onClick={handleLogout}>
                                    Odjava
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navigation;