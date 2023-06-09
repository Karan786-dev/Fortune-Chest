import "../styles/globals.css";
import "../styles/animations.css"
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import store from "../Store";
import Loading from '@/Components/Loading'

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Loading />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false} ssd
        draggable
        theme="light"
      />
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
