import { Provider } from "react-redux";
import { store } from "../redux/store";
import { Toaster } from "sonner";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
      <Toaster />
    </Provider>
  );
}

export default MyApp;
