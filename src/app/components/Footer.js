"use client";
import "bootstrap/dist/css/bootstrap.min.css";



 function Footer() {
    return(
        <footer className="bg-dark text-white text-center fixed-bottom p-3 mt-5">
            <p className="mb-0">SportHub &copy; {new Date().getFullYear()}</p>
        </footer>
    )
}
 

export default Footer;
