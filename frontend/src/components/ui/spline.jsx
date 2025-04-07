import React, { Suspense, lazy, useState, useEffect } from 'react';
import LoadingPage from '../../landingPage/components/LoadingPage';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SplineScene = ({ scene, className }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate minimum loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <Spline
        scene={scene}
        className={className}
        onLoad={() => setIsLoading(false)}
      />
    </Suspense>
  );
};

export { SplineScene }; 