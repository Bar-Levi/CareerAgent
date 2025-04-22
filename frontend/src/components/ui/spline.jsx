import React, { lazy, useState, useEffect } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SplineScene = ({ scene, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Pre-load the scene resource
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = scene;
    return () => {
      preloadImage.onload = null;
    };
  }, [scene]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-t-blue-500 border-blue-200/30 rounded-full animate-spin"></div>
            <p className="text-gray-300 text-sm">Rendering 3D scene...</p>
          </div>
        </div>
      )}
      <Spline
        scene={scene}
        className={`w-full h-full ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ transition: 'opacity 0.3s ease-in-out' }}
        onLoad={() => {
          // Add a small delay to ensure smooth transition
          setTimeout(() => setIsLoaded(true), 300);
        }}
      />
    </div>
  );
};

export { SplineScene }; 