// pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;