import { Link } from "react-router-dom";
import React from "react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-md"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
