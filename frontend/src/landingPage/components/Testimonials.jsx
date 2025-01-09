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
              "This platform helped me nail my first interview!"
            </p>
            <h4 className="text-lg font-bold text-gray-100">Jane Doe, Software Engineer</h4>
          </div>
          <div className="p-6">
            <p className="text-xl font-light mb-4 text-gray-200">
              "The career bots provided advice that was spot-on!"
            </p>
            <h4 className="text-lg font-bold text-gray-100">John Smith, Data Analyst</h4>
          </div>
        </Slider>
      </div>
    </section>
  );
};

export default Testimonials;
