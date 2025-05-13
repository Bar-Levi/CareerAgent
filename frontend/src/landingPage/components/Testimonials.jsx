import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import NavigationArrow from "./NavigationArrow";
import ParticlesComponent from "./ParticleComponent";

// Keep the original testimonials data
const testimonials = [
  {
    id: 1,
    testimonial: "This platform helped find excellent candidates to my team!",
    author: "Bar Levi, Senior R&D Team Lead"
  },
  {
    id: 2,
    testimonial: "The career bots provided advice that was spot-on!",
    author: "Rony Bubnovsky, Mid-Senior Backend Developer"
  },
  {
    id: 3,
    testimonial: "Goo-Goo-Gaa-Gaaaa!",
    author: "Agam Levi, New-Born Software Developer"
  },
  {
    id: 4,
    testimonial: "The site was super helpful for finding skilled Docker experts for my team!",
    author: "Rom Ihia, Senior Docker Expert & Recruiter"
  }
];

const TestimonialCard = ({ id, testimonial, author }) => {
  const getImagePath = () => {
    try {
      return require(`../assets/testimonials/${id}.jpg`);
    } catch (e) {
      try {
        return require(`../assets/testimonials/${id}.png`);
      } catch (e) {
        return `https://i.pravatar.cc/128?img=${id}`;
      }
    }
  };

  const imagePath = getImagePath();

  return (
    <div className="relative h-full w-full p-6 md:p-8 pt-24 rounded-2xl backdrop-blur-md bg-slate-900/60 border border-slate-700/50 shadow-2xl transition-all duration-300 flex flex-col items-center justify-between gap-4">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 ring-4 ring-indigo-500/30 rounded-full overflow-hidden shadow-xl">
        <img
          src={imagePath}
          alt={`Avatar of ${author}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex items-center justify-center mt-10">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-indigo-500/20" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 8c-2.209 0-4 1.791-4 4v10c0 2.209 1.791 4 4 4h10c2.209 0 4-1.791 4-4v-10c0-2.209-1.791-4-4-4h-10zM8 14c0-1.104 0.896-2 2-2h1c0.552 0 1-0.448 1-1s-0.448-1-1-1h-1c-2.209 0-4 1.791-4 4v2c0 0.552 0.448 1 1 1s1-0.448 1-1v-2zM18 14c0-1.104 0.896-2 2-2h1c0.552 0 1-0.448 1-1s-0.448-1-1-1h-1c-2.209 0-4 1.791-4 4v2c0 0.552 0.448 1 1 1s1-0.448 1-1v-2z"></path>
        </svg>
      </div>
      
      <p className="text-center text-sm sm:text-base md:text-lg lg:text-xl font-light italic text-white leading-relaxed min-h-[80px] sm:min-h-[100px]">
        "{testimonial}"
      </p>
      
      <div className="w-full flex flex-col items-center mt-2">
        <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mb-2 rounded-full"></div>
        <span className="text-xs sm:text-sm md:text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
          {author}
        </span>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section
      id="testimonials-section"
      className="relative bg-black bg-cover bg-center min-h-screen py-20 sm:py-24 md:py-32 px-4 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Particles Background */}
      <ParticlesComponent id="particles-testimonials" />
      
      {/* Gradient orbs in background */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] -z-10"></div>
      
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-10 md:mb-16 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-display tracking-tight text-center px-4"
      >
        What Our Users Say
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="w-full max-w-6xl mx-auto flex justify-center items-center"
      >
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
            renderBullet: function (index, className) {
              return `<span class="${className} w-2 h-2 sm:w-3 sm:h-3 bg-indigo-500 opacity-70"></span>`;
            }
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          className="testimonial-swiper"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="swiper-slide-testimonial">
              <TestimonialCard {...testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>
        
        <div className="swiper-button-prev custom-swiper-button-prev"></div>
        <div className="swiper-button-next custom-swiper-button-next"></div>
      </motion.div>

      <NavigationArrow 
        targetId="demo-section" 
        direction="up"
        className="z-[100] mt-10 backdrop-blur-sm bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors" 
      />
      
      <style jsx="true">{`
        .testimonial-swiper {
          width: 100%;
          max-width: 1200px;
          padding: 50px 0;
          margin: 0 auto;
          overflow: visible;
        }
        
        .swiper-slide-testimonial {
          width: 280px;
          height: 400px;
          background: transparent;
          filter: blur(1px);
          opacity: 0.5;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
        }
        
        .swiper-slide-active {
          filter: blur(0);
          opacity: 1;
          transform: scale(1.05);
        }
        
        .swiper-pagination {
          position: relative;
          margin-top: 30px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        
        .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-bullet-active {
          width: 12px;
          height: 12px;
          background: linear-gradient(to right, #6366f1, #a855f7);
        }
        
        .custom-swiper-button-prev,
        .custom-swiper-button-next {
          color: white;
          background: rgba(0, 0, 0, 0.5);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .custom-swiper-button-prev:hover,
        .custom-swiper-button-next:hover {
          background: rgba(99, 102, 241, 0.5);
        }
        
        .custom-swiper-button-prev::after,
        .custom-swiper-button-next::after {
          font-size: 16px;
        }
        
        @media (min-width: 640px) {
          .swiper-slide-testimonial {
            width: 320px;
            height: 420px;
          }
          
          .custom-swiper-button-prev,
          .custom-swiper-button-next {
            width: 45px;
            height: 45px;
          }
          
          .custom-swiper-button-prev::after,
          .custom-swiper-button-next::after {
            font-size: 18px;
          }
        }
        
        @media (min-width: 768px) {
          .swiper-slide-testimonial {
            width: 350px;
            height: 450px;
          }
          
          .custom-swiper-button-prev,
          .custom-swiper-button-next {
            width: 50px;
            height: 50px;
          }
          
          .custom-swiper-button-prev::after,
          .custom-swiper-button-next::after {
            font-size: 20px;
          }
        }
        
        @media (max-width: 640px) {
          .swiper-button-prev,
          .swiper-button-next {
            transform: scale(0.8);
          }
        }
        
        @media (max-width: 480px) {
          .testimonial-swiper {
            padding: 40px 0;
          }
          
          .swiper-slide-testimonial {
            width: 260px;
            height: 380px;
          }
        }
      `}</style>
    </section>
  );
};

export default Testimonials;
