import React, { Suspense, lazy, useState, useEffect } from 'react';
import LoadingPage from '../../landingPage/components/LoadingPage';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SplineScene = ({ scene, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenLanding, setHasSeenLanding] = useState(false);

  useEffect(() => {
    // Check if user has seen the landing page before
    const hasSeen = localStorage.getItem('hasSeenLanding');
    if (hasSeen) {
      setHasSeenLanding(true);
      setIsLoading(false);
      return;
    }

    // Simulate minimum loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mark that user has seen the landing page
      localStorage.setItem('hasSeenLanding', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading && !hasSeenLanding) {
    return <LoadingPage />;
  }

  return (
    <Suspense fallback={null}>
      <Spline
        scene={scene}
        className={className}
        onLoad={() => setIsLoading(false)}
      />
    </Suspense>
  );
};

export { SplineScene }; 