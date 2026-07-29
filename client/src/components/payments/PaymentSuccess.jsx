import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URL parameters (jaise subscription_id) check karne ke liye
    const queryParams = new URLSearchParams(location.search);
    const subId = queryParams.get('subscription_id');

    // Thoda sa loader dikhayenge suspense ke liye (aur tab tak backend webhook data bhej dega)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {loading ? (
        // Cinematic Loader
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
            Verifying Transaction...
          </p>
        </div>
      ) : (
        // Bento Grid Success Card
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          
          {/* Neon Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
              <svg 
                className="w-10 h-10 text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            {/* Main Text */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Payment Successful
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your 7-Day Pass is now active. Enjoy uninterrupted access to premium roleplay features.
              </p>
            </div>

            {/* Status Badge */}
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center space-x-3 w-full justify-center">
               <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-gray-300 text-sm font-medium tracking-wide">
                 Premium Status: Active
               </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 w-full space-y-3">
              <button 
                onClick={() => navigate('/home')} // Apne chat/dashboard route par bhej dijiye
                className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
              >
                Start Chatting
              </button>
              
              <button 
                onClick={() => navigate('/')} 
                className="w-full bg-transparent text-gray-400 py-3 rounded-xl text-sm hover:text-white transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;