import React from "react";

const Footer = () => {
  return (
    <footer className="bg-primary-800  py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Learning Management System</h3>
            <p className="text-sm text-primary-200 mt-1">
              Empowering education through technology
            </p>
          </div>

          <div className="text-sm text-primary-300">
            &copy; {new Date().getFullYear()} LMS. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
