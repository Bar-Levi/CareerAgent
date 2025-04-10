import React, { lazy, Suspense } from "react";
import Hero from "./components/Hero";
// Lazy load non-critical components
const Features = lazy(() => import("./components/Features"));
const DemoSection = lazy(() => import("./components/DemoSection"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const Botpress = lazy(() => import("../botpress/Botpress"));

// Simple loading component
const SectionLoader = () => (
  <div className="w-full h-screen flex items-center justify-center bg-black">
    <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
  </div>
);

const LandingPage = () => {
  return (
    <div className="w-screen h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth cursor-default bg-black">
      <Suspense fallback={<SectionLoader />}>
        {/* Consider if Botpress needs visibility or can load lazily in background */}
        <div className="absolute top-4 right-4 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <Botpress />
          </div>
        </div>
      </Suspense>
      <section className="w-full h-screen flex-shrink-0 snap-start">
        <Hero />
      </section>
      <Suspense fallback={<SectionLoader />}>
        <section className="w-full flex-shrink-0 snap-start relative" id="features-section">
          <Features />
        </section>
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <section className="w-full h-screen flex-shrink-0 snap-start">
          <DemoSection />
        </section>
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <section className="w-full h-screen flex-shrink-0 snap-start">
          <Testimonials />
        </section>
      </Suspense>
    </div>
  );
};

export default LandingPage;
