import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const LoadingSpinner = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
      <span className="loader"></span>
    </div>
  </div>
);

const SplineScene = ({ scene, className }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  );
};

export { SplineScene }; 