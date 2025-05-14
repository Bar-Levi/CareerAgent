import React from "react";
import { motion } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";

// Updated testimonials data with more professional testimonials
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
    <div className="group relative transition-all duration-500 h-full rounded-xl overflow-hidden bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/30 backdrop-blur-sm shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer">
      {/* Enhanced gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-30 group-hover:opacity-70 transition-opacity duration-500"></div>
      
      {/* Animated decorative element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="p-6 flex flex-col items-center h-full relative z-10">
        {/* Enhanced avatar with hover effect */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-400/20 shadow-md mb-6 group-hover:border-indigo-400/50 group-hover:shadow-indigo-500/20 transition-all duration-500">
          <img
            src={imagePath}
            alt={`Avatar of ${author}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        
        <div className="w-8 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full mb-6 group-hover:w-12 transition-all duration-500"></div>
        
        <p className="text-base text-white/90 text-center mb-4 flex-grow group-hover:text-white transition-colors duration-300">
          "{testimonial}"
        </p>
        
        <div className="mt-auto">
          <span className="block text-sm font-medium text-center text-indigo-300 group-hover:text-indigo-200 transition-colors duration-300">
            {author}
          </span>
        </div>
      </div>
      
      {/* Corner accent */}
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-xl"></div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section
      id="testimonials-section"
      className="relative bg-black min-h-screen flex flex-col overflow-hidden"
    >
      {/* Subtle Particles Background */}
      <div className="absolute inset-0 opacity-30">
        <ParticlesComponent id="particles-testimonials" />
      </div>
      
      {/* Subtle gradient backgrounds */}
      <div className="absolute top-40 left-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-40 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[120px] -z-10"></div>
      
      {/* Header Section - Positioned at the top */}
      <div className="w-full pt-16 sm:pt-20 md:pt-24 px-4 relative z-10">
        <motion.h2
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 via-blue-100 to-gray-200 mb-3 sm:mb-4 md:mb-6 leading-tight tracking-tight font-display text-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
          transition={{ duration: 0.8 }}
        >
          What Our Users Say
        </motion.h2>
        <p className="text-slate-400 max-w-xl mx-auto text-center px-4">
          Don't just take our word for it — hear from some of our satisfied users who found success with our platform.
        </p>
      </div>

      {/* Content Section */}
      <div className="flex-grow flex items-center justify-center w-full">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12 relative z-10">
          {/* Bento Grid Layout for Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
