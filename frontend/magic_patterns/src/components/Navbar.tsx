import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon } from 'lucide-react';
const Navbar = () => {
  return <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <BookOpenIcon className="mr-2 h-8 w-8 text-teal-500" />
            <span className="text-xl font-bold text-gray-800">Nexora</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/create" className="rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600">
            Create Course
          </Link>
          <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Sign In
          </button>
        </div>
      </div>
    </nav>;
};
export default Navbar;