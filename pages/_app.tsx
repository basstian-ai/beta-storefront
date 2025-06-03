import "@/styles/globals.css";
import type { AppProps } from "next/app";

// Remove Navbar import as it's now handled by Layout in each page
// import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Navbar is removed from here, Layout component in each page will render it */}
      <Component {...pageProps} />
    </>
  );
}
