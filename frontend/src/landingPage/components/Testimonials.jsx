import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ParticlesComponent from "./ParticleComponent";

const Testimonials = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: false,
    adaptiveHeight: true,
  };

  return (
    <section className="relative bg-black bg-cover bg-center h-screen flex items-center justify-center overflow-hidden">
      {/* Particles Background */}
      <ParticlesComponent id="particles-testimonials" />

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center px-4 z-10 relative">
        <h2 className="text-4xl font-bold mb-8 text-white font-display tracking-tight">What Our Users Say</h2>
        <Slider {...settings}>
          <div className="p-6">
            <p className="text-2xl font-light mb-4 text-gray-200 font-modern leading-relaxed">
              "This platform helped find excellent candidates to my team!"
            </p>
            <h4 className="text-xl font-heading font-semibold text-gray-100 tracking-wide">Bar Levi, Senior R&D Team Lead</h4>
          </div>
          <div className="p-6">
            <p className="text-2xl font-light mb-4 text-gray-200 font-modern leading-relaxed">
              "The career bots provided advice that was spot-on!"
            </p>
            <h4 className="text-xl font-heading font-semibold text-gray-100 tracking-wide">Rony Bubnovsky, Mid-Senior Backend Developer</h4>
          </div>
          <div className="p-6">
            <p className="text-2xl font-light mb-4 text-gray-200 font-modern leading-relaxed">
              "Goo-Goo-Gaa-Gaaaa!"
            </p>
            <h4 className="text-xl font-heading font-semibold text-gray-100 tracking-wide">Agam Levi, New-Born Software Developer</h4>
          </div>
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
