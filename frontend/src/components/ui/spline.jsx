import React, { Suspense, lazy } from 'react';

// Lazy load with a custom delay to prevent waterfalls
const Spline = lazy(() => {
  // Add a small delay before loading to prioritize critical content
  return new Promise(resolve => {
    // Use requestIdleCallback or setTimeout as fallback
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => resolve(import('@splinetool/react-spline')));
    } else {
      setTimeout(() => resolve(import('@splinetool/react-spline')), 100);
    }
  });
});

const SplineScene = ({ scene, className }) => {

  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
    </div>}>
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  );
};

export { SplineScene }; 