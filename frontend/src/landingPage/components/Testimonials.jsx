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
    <section className="relative bg-gray-600 bg-cover bg-center h-screen flex items-center justify-center overflow-hidden">
      {/* Particles Background */}
      <ParticlesComponent id="particles-testimonials" />

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center px-4 z-10 relative">
        <h2 className="text-3xl font-bold mb-8 text-white">What Our Users Say</h2>
        <Slider {...settings}>
          <div className="p-6">
            <p className="text-xl font-light mb-4 text-gray-200">
              "This platform helped find excellent candidates to my team!"
            </p>
            <h4 className="text-lg font-bold text-gray-100">Bar Levi, Senior R&D Team Lead</h4>
          </div>
          <div className="p-6">
            <p className="text-xl font-light mb-4 text-gray-200">
              "The career bots provided advice that was spot-on!"
            </p>
            <h4 className="text-lg font-bold text-gray-100">Rony Bubnovsky, Junior Backend Developer</h4>
          </div>
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
