import React from 'react';
import logo from 'figma:asset/959a9d3635cfe8c94a3f28db7f3ab3925aae9843.png';

export const Footer: React.FC = () => (
  <div className="bg-logo-blue border-t-2 border-logo-blue-light mt-auto">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="FedHub" className="h-8 w-auto" />
          <div className="text-white">
            <p className="text-sm">© 2024 FedHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);