import React, { useEffect, useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import { navLinks } from "../constants";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter links based on authentication and page
  const filteredLinks = navLinks.filter((nav) => {
    // 1. Always enforce authentication rules, no matter the page
    if (nav.title === "Login/Register") return !isAuthenticated;
    if (nav.title === "Logout") return isAuthenticated;
    if (nav.title === "Profile") return isAuthenticated; 

    // 2. If we are NOT on the homepage, only show these specific links
    if (!isHomePage) {
      // Make sure these strings EXACTLY match the 'title' properties in your constants file!
      return ["Home", "Profile", "Blog", "Google"].includes(nav.title);
    }

    // 3. If we are on the homepage, show everything else
    return true; 
  });

  return (
    <nav
      className={`
        w-full z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8
        /* 1. MAGIC FIX: Use 'sticky' instead of 'fixed' so it pushes content down */
        sticky top-0
        /* 2. THEME FIX: Frosted glass on all pages, but slightly darker when scrolled */
        ${scrolled || !isHomePage
          ? "bg-[#0b0e14]/90 backdrop-blur-md border-b border-slate-800 shadow-lg"
          : "bg-[#0b0e14]/50 backdrop-blur-sm border-b border-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4">

        {/* Logo - Upgraded to Professional Financial Theme */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
          onClick={() => {
            setActive("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white font-serif font-bold text-xl rounded shadow-md group-hover:bg-indigo-500 transition-colors">
            F
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif font-bold text-lg text-slate-100 tracking-tight leading-none group-hover:text-indigo-300 transition-colors">
              Francis Codes
            </h1>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">
              Business Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-8 items-center">
          {filteredLinks.map((nav) => (
            <li
              key={nav.id}
              className={`text-[12px] uppercase tracking-widest font-bold cursor-pointer transition-colors duration-200 ${
                active === nav.title
                  ? "text-indigo-400"
                  : "text-slate-400 hover:text-slate-100"
              }`}
              onClick={() => setActive(nav.title)}
            >
              {nav.external ? (
                <a href={nav.id} target="_blank" rel="noopener noreferrer">
                  {nav.title}
                </a>
              ) : nav.title === "Logout" ? (
                <button onClick={logout} className="text-left w-full uppercase">
                  {nav.title}
                </button>
              ) : nav.id.startsWith("/") ? (
                <Link to={nav.id}>{nav.title}</Link>
              ) : (
                <a href={`#${nav.id}`}>{nav.title}</a>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center">
          <button
            className="text-slate-300 hover:text-white transition-colors"
            onClick={() => setToggle(!toggle)}
            aria-label="Toggle menu"
          >
            {toggle ? <X size={28} /> : <Menu size={28} />}
          </button>

          <AnimatePresence>
            {toggle && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute top-20 right-4 w-[200px] rounded-xl border border-slate-800 p-6 bg-[#0b0e14]/95 backdrop-blur-xl shadow-2xl z-40"
              >
                <ul className="flex flex-col gap-5">
                  {filteredLinks.map((nav) => (
                    <li
                      key={nav.id}
                      className={`text-[11px] uppercase tracking-widest font-bold cursor-pointer ${
                        active === nav.title ? "text-indigo-400" : "text-slate-400 hover:text-slate-100"
                      }`}
                      onClick={() => {
                        setActive(nav.title);
                        setToggle(false);
                      }}
                    >
                      {nav.external ? (
                        <a href={nav.id} target="_blank" rel="noopener noreferrer">
                          {nav.title}
                        </a>
                      ) : nav.title === "Logout" ? (
                        <button onClick={logout} className="text-left w-full uppercase">
                          {nav.title}
                        </button>
                      ) : nav.id.startsWith("/") ? (
                        <Link to={nav.id}>{nav.title}</Link>
                      ) : (
                        <a href={`#${nav.id}`}>{nav.title}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
