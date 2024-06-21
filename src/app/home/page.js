// pages/index.js
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  return (
    <div>
      <Navigation />
      <div className="d-flex justify-content-center mt-5">
        <div
          id="carouselExampleAutoplaying"
          className="carousel slide w-75"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="https://www.sportvision.ba/files/images/2024/6/10/adidas-desktop-homepage.jpg.webp"
                className="d-block w-100"
                alt="..."
              />
            </div>
            <div className="carousel-item">
              <img
                src="https://www.sportvision.ba/files/images/2024/6/11/SV-Leto-u-pokretu-1580x650-bih.jpg.webp"
                className="d-block w-100"
                alt="..."
              />
            </div>
            <div className="carousel-item">
              <img
                src="https://www.sportvision.ba/files/images/2024/6/21/sv%20ljetni%20mix%20desktop.jpg.webp"
                className="d-block w-100"
                alt="..."
              />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleAutoplaying"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleAutoplaying"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
      <h6 className="text-center mt-5">
        Pastelne boje, lagani materijali i upečatljivi printovi dio su nove
        kolekcije koju ćete obožavati u toplijim danima. Istražite sve modele
        jednim klikom na ponudu.
      </h6>
      <div className="d-flex justify-content-center">
      <button className="btn btn-danger  mt-3">Pogledaj</button>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
