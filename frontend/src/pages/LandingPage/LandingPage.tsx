import React from 'react';
import logo from '../assets/logo.svg'; 

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <img src={logo} alt="APHPA Logo" className="w-32 h-32 mb-8 drop-shadow-md" />
      
      <h1 className="text-5xl font-bold text-gray-900 mb-4">G6 Automated Procurement Auditor</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl">
        Streamline your procurement ledger, detect anomalies, and audit contracts with zero friction.
      </p>
      <div className="space-x-4">
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Login
        </a>
        <a href="/dashboard" className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300">
          View Dashboard
        </a>
      </div>
    </div>
  );
}
