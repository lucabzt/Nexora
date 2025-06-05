// frontend/magic_patterns/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenIcon, UserIcon, LogOutIcon, PlusIcon, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleMobileNavClick = () => {
    closeMobileMenu();
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center" onClick={handleMobileNavClick}>
            <BookOpenIcon className="mr-2 h-8 w-8 text-teal-500" />
            <span className="text-xl font-bold text-gray-800">Nexora</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/create"
            className="flex items-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Course
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <UserIcon className="h-4 w-4" />
              <span>{user?.username || 'User'}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/create"
              className="flex items-center rounded-md bg-teal-500 px-4 py-3 text-sm font-medium text-white hover:bg-teal-600 w-full"
              onClick={handleMobileNavClick}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Course
            </Link>
            
            <div className="border-t border-gray-200 pt-2">
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMobileNavClick}
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleMobileNavClick();
                  handleLogout();
                }}
                className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown (desktop only) */}
      {dropdownOpen && !mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {/* Overlay to close mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;