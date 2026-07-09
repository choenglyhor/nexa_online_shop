import logo from "../assets/LOGO-NexaShop.png";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Column 1 — Logo + tagline */}
        <div>
          <img src={logo} alt="NexaShop" className="h-28 w-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Your one-stop shop for all your needs.<br />
            Quality products at affordable prices.
          </p>
        </div>

        {/* Column 2 — Do You Need Help? */}
        <div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">Do You Need Help?</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Subscribe to our newsletter for latest deals and exclusive offers.
          </p>
          <div className="flex items-start gap-3 mb-4">
            <Phone size={18} className="text-pink-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monday–Friday: 08am–9pm</p>
              <p className="font-bold text-gray-800 dark:text-gray-100 text-base">01234-56789</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
            <p className="text-sm text-gray-500 dark:text-gray-400">NexaShop@gmail.com</p>
          </div>
        </div>

        {/* Column 3 — Customer Service */}
        <div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">Customer Service</h4>
          <ul className="space-y-2 text-sm">
            {["Help Center", "FAQs", "Shipping & Delivery", "Privacy Policy", "Terms & Conditions"].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4 — Get to Know Us */}
        <div>
          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base mb-3">Get to Know Us</h4>
          <ul className="space-y-2 text-sm">
            {["About Us", "Contact", "Customer reviews", "Social Responsibility", "Store Locations"].map((item) => (
              <li key={item}>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Copyright {new Date().getFullYear()} © Shopstore WooCommerce WordPress Theme. Powered by{" "}
            <a href="#" className="text-blue-500 hover:underline">BlackRise</a>
          </p>
          <div className="flex items-center gap-2">
            {["VISA", "MC", "PP"].map((method) => (
              <span key={method} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}