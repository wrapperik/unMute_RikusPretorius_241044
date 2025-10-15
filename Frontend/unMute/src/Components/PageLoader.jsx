import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageLoader({ children }) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Adjust duration as needed

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <span className="loading loading-infinity loading-xl"></span>
      </div>
    );
  }

  return <>{children}</>;
}
