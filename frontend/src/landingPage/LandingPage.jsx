import React from "react";
import Hero from "./components/Hero";
import Features from "./components/Features";
import DemoSection from "./components/DemoSection";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";
import ParticlesComponent from "./components/ParticleComponent";

const LandingPage = () => {
  return (
    <div>
      <Hero />
      <Features />
      <DemoSection />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default LandingPage;
