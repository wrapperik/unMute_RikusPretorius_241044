import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ["Home", "About", "Services", "Blog", "Contact"];

  return (
    <nav className="bg-milk fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-black">unMute</h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="text-gray-700 hover:text-orange-500 transition-colors"
              >
                {item}
              </a>
            ))}
            <Link to="/signup" className="bg-black text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex text-black items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-4 pt-4 pb-2 space-y-2">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="block text-gray-700 hover:text-indigo-600 transition-colors"
              >
                {item}
              </a>
            ))}
            <Link to="/signup" className="w-full bg-desert-clay text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}