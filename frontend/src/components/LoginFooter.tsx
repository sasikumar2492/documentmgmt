import React from 'react';

export const LoginFooter: React.FC = () => (
  <div className="ai-header-gradient border-t-2 border-navy-blue-dark relative z-40">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className="text-white text-sm relative z-10">
          © 2024 FedHub Document Management System. All rights reserved.
        </div>
        <div className="flex space-x-6 text-sm relative z-10">
          <a href="#" className="text-white hover:text-light-blue-light transition-colors duration-300">Privacy Policy</a>
          <a href="#" className="text-white hover:text-light-blue-light transition-colors duration-300">Terms of Service</a>
          <a href="#" className="text-white hover:text-light-blue-light transition-colors duration-300">Support</a>
        </div>
      </div>
    </div>
  </div>
);