import React from "react";
import Hero from "./components/Hero";
import Features from "./components/Features";
import DemoSection from "./components/DemoSection";
import Testimonials from "./components/Testimonials";
import Botpress from "../botpress/Botpress";

const LandingPage = () => {
  return (
    <div className="w-screen h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth cursor-default">
      <Botpress />
      <section className="w-full h-screen flex-shrink-0 snap-start">
        <Hero />
      </section>
      <section className="w-full h-screen flex-shrink-0 snap-start" id="features-section">
        <Features />
      </section>
      <section className="w-full h-screen flex-shrink-0 snap-start">
        <DemoSection />
      </section>
      <section className="w-full h-screen flex-shrink-0 snap-start">
        <Testimonials />
      </section>
    </div>
  );
};

export default LandingPage;
