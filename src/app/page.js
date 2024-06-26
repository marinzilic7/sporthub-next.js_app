"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter(); // Ovdje koristimo useRouter unutar funkcionalne komponente

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message);

                // Pohrana sessionToken u cookie
                document.cookie = `sessionToken=${data.sessionToken}; path=/`;

                // Pohrana korisničkih podataka u localStorage
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.user._id,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    email: data.user.email,
                    role:data.user.role
                }));

                router.push('/home'); 
            } else {
                const error = await response.json();
                setError(error.error); 
            }
        } catch (error) {
            console.error('Došlo je do greške prilikom prijave:', error);
            setError('Došlo je do greške prilikom prijave.');
        }
    };

    return (
       <div className='backgroundImg d-flex align-items-center'>
        <div className="container">
            <div className=" d-flex justify-content-center align-items-center">
                <form className=" z-3 bg-light shadow-lg col-12 col-md-6 col-sm-6 col-lg-5 p-4 mt-3" onSubmit={handleSubmit}>
                <h1 className="text-center">Prijava</h1>
                    <div className="mb-3">
                        <label htmlFor="exampleInputEmail1" className="form-label">
                            Email adresa
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="exampleInputPassword1" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="exampleInputPassword1"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn w-100 mt-3 btn-primary">
                        Prijava
                    </button>
                    <p className="text-center mt-3">
                        Nemate račun? <span><a href="/register" className="text-underline">Registriraj se</a></span>
                    </p>
                    <p className="text-center"><a href="/home">Pogledaj kao gost</a></p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {message && <p className="text-center alert alert-info mt-3">{message}</p>}
                </form>
            </div>
        </div>
       </div>
        
    );
}

export default Login;
