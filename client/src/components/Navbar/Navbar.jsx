// src/components/Navbar/Navbar.jsx
import React, { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import SlideButton from "../../components/Buttons/SlideButton";
import pathgenie from "../../assets/pathgeniebanner.png";
import { useNavbarVisibility } from "../../hooks/useNavbarVisibility";
import { navLinks, linkBaseClasses, activeLinkClasses } from "./constants";
import { GrLogin, GrLogout } from "react-icons/gr";

const Navbar = () => {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isNavbarVisible = useNavbarVisibility(800, 43);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error.message);
    } finally {
      setIsSigningOut(false);
    }
  }, [navigate]);

  const AuthButton = () => {
    if (isPending) {
      return <span className="text-[#94a3b8]">Loading...</span>;
    }

    if (session?.user) {
      return (
        <SlideButton
          text="Sign Out"
          onClick={handleSignOut}
          disabled={isSigningOut}
          icon={<GrLogout className="w-5 h-5" />}
          style={{ width: "12rem" }}
        />
      );
    }

    return (
      <SlideButton
        text="Sign In"
        onClick={() => navigate("/login")}
        icon={<GrLogin className="w-5 h-5" />}
        fullWidth={true}
        style={{ width: "12rem" }}
      />
    );
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isNavbarVisible
          ? "transform translate-y-0 opacity-100"
          : "transform -translate-y-full opacity-0"
      }`}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-[rgba(10,10,15,0.8)] backdrop-blur-xl border-b border-[rgba(102,126,234,0.1)]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavLink to="/" className="block">
              <img
                className="h-auto max-w-[130px] sm:max-w-[180px] transition-transform duration-300 hover:scale-105"
                src={pathgenie}
                alt="PathGenie Logo"
              />
            </NavLink>
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[rgba(102,126,234,0.1)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#667eea]"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation Links - Desktop */}
          {session?.user && (
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      isActive 
                        ? "text-white bg-gradient-to-r from-[rgba(102,126,234,0.2)] to-[rgba(118,75,162,0.2)]" 
                        : "text-[#94a3b8] hover:text-white hover:bg-[rgba(102,126,234,0.1)]"
                    }`
                  }
                >
                  {label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-all duration-300 group-hover:w-full"></span>
                </NavLink>
              ))}
            </div>
          )}
          
          {!isMenuOpen && <AuthButton />}
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && session?.user && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[rgba(15,15,25,0.95)] backdrop-blur-xl border-b border-[rgba(102,126,234,0.1)] shadow-2xl">
            <div className="flex flex-col items-center space-y-2 py-6 px-4">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={toggleMenu}
                  className={({ isActive }) =>
                    `w-full text-center py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? "text-white bg-gradient-to-r from-[rgba(102,126,234,0.2)] to-[rgba(118,75,162,0.2)]" 
                        : "text-[#94a3b8] hover:text-white hover:bg-[rgba(102,126,234,0.1)]"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="pt-4 w-full flex justify-center">
                {isPending ? (
                  <span className="text-[#94a3b8]">Loading...</span>
                ) : (
                  <AuthButton />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
