import { LanguageProvider } from "./i18n/LanguageContext";
import { CartProvider } from "./cart/CartContext";
import Cart from "./components/Cart";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Menu from "./components/Menu";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <div className="site-shell relative isolate min-h-screen">
          <div
            aria-hidden="true"
            className="cafe-ambience pointer-events-none fixed inset-0 -z-10"
          >
            <div className="ambience-lamp ambience-lamp-left" />
            <div className="ambience-lamp ambience-lamp-right" />
            <div className="ambience-grid" />
          </div>
          <Navbar />
          <main>
            <Hero />
            <Marquee />
            <Menu />
            <About />
            <Contact />
          </main>
          <Footer />
          <FloatingWhatsApp />
          <Cart />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}
