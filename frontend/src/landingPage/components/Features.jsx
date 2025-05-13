import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";
import NavigationArrow from "./NavigationArrow";

// Import videos directly using webpack
import chatbotsVideo from "../assets/videos/chatbots.mp4";
import cvVideo from "../assets/videos/cv.mp4";
import chatVideo from "../assets/videos/chat.mp4";

// Memoize ParticlesComponent to prevent re-renders
const MemoizedParticles = React.memo(ParticlesComponent);

// Video data
const featuresData = [
  {
    id: 1,
    title: "Customized Chatbots",
    video: chatbotsVideo,
    fallbackUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description: "Experience two powerful AI-driven tools: an Interviewer chatbot to simulate real-world interview scenarios and a Career Advisor chatbot to guide your career journey."
  },
  {
    id: 2,
    title: "CV Scanning",
    video: cvVideo,
    fallbackUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    description: "Effortlessly extract key details from your CV with AI-powered scanning. Say goodbye to manual data entry and streamline your workflow in seconds."
  },
  {
    id: 3,
    title: "Recruiter-Candidate Chat",
    video: chatVideo,
    fallbackUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description: "Enable direct communication between recruiters and candidates for specific job positions, making the hiring process faster and more personalized."
  }
];

// Memoized video player component to prevent re-renders
const CarouselVideo = memo(({ videoSrc, fallbackUrl, isActive, onLoadedData, onVideoEnded }) => {
  const videoRef = useRef(null);
  const playAttemptRef = useRef(null);
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Clear any pending play attempts
    if (playAttemptRef.current) {
      clearTimeout(playAttemptRef.current);
      playAttemptRef.current = null;
    }
    
    // Handle play/pause based on active state
    if (isActive) {
      // Only load the video if it hasn't been loaded before
      if (!hasLoadedRef.current) {
        video.load(); // Reset video state
        hasLoadedRef.current = true;
      }
      
      // Add a small delay before playing to avoid race conditions
      playAttemptRef.current = setTimeout(() => {
        // Check if video is still mounted and active before playing
        if (videoRef.current && document.body.contains(videoRef.current)) {
          // Only play if video is paused to avoid restarting on hover
          if (video.paused) {
            const playPromise = video.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                // Only log errors that aren't abort errors from normal operation
                if (error.name !== 'AbortError') {
                  console.error("Video play error:", error);
                }
                
                // If format not supported, try the fallback URL directly
                if (error.name === 'NotSupportedError') {
                  video.src = fallbackUrl;
                  video.load();
                  // Try again after loading the fallback
                  setTimeout(() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(e => {
                        if (e.name !== 'AbortError') {
                          console.error("Fallback video play error:", e);
                        }
                      });
                    }
                  }, 100);
                }
              });
            }
          }
        }
      }, 100);
    } else {
      // Only pause if the video is actually playing to avoid unnecessary operations
      if (!video.paused) {
        video.pause();
      }
    }

    // Add event listener for video ended
    const handleEnded = () => {
      if (isActive && onVideoEnded) {
        onVideoEnded();
      }
    };

    video.addEventListener('ended', handleEnded);
    
    return () => {
      // Remove event listener
      video.removeEventListener('ended', handleEnded);

      // Clean up
      if (playAttemptRef.current) {
        clearTimeout(playAttemptRef.current);
        playAttemptRef.current = null;
      }
      
      if (video) {
        video.pause();
        video.removeAttribute('src'); // Safer than setting to empty string
        video.load();
      }
    };
  }, [videoSrc, fallbackUrl, isActive, onVideoEnded]);
  
  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Apply playback rate to smooth playback
    video.playbackRate = 1.0;
  }, []);
  
  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      playsInline
      muted
      preload="auto"
      onLoadedData={onLoadedData}
      onCanPlay={handleCanPlay}
      style={{
        willChange: 'transform', // Hint for browser optimization
        transform: 'translateZ(0)', // Hardware acceleration hint
      }}
    >
      {/* Use type attribute to help browser identify formats */}
      <source src={videoSrc} type="video/mp4" />
      <source src={fallbackUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
});

const Features = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const carouselRef = useRef(null);
  
  // Add stable reference for hover state to prevent unnecessary rerenders
  const isHoveringRef = useRef(isHovering);
  
  // Update ref when state changes
  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);
  
  const nextSlide = useCallback(() => {
    setIsVideoLoaded(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuresData.length);
  }, []);

  const prevSlide = useCallback(() => {
    setIsVideoLoaded(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + featuresData.length) % featuresData.length);
  }, []);

  // Handle video ended event to advance to next slide
  const handleVideoEnded = useCallback(() => {
    // Only auto-advance if not hovering
    if (!isHoveringRef.current) {
      nextSlide();
    }
  }, [nextSlide]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) setActiveVideo(null);
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleVideoLoad = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  // Memoize the carousel content to prevent unnecessary re-renders
  const carouselContent = React.useMemo(() => (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-xl"
    >
      {/* Loading Spinner */}
      {!isVideoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* Video */}
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={() => setActiveVideo(featuresData[currentIndex])}
      >
        <CarouselVideo
          videoSrc={featuresData[currentIndex].video}
          fallbackUrl={featuresData[currentIndex].fallbackUrl}
          isActive={true}
          onLoadedData={handleVideoLoad}
          onVideoEnded={handleVideoEnded}
        />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {featuresData[currentIndex].title}
            </h3>
            <p className={`text-gray-200 text-base md:text-lg max-w-3xl transition-all duration-300 ${isHovering ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              {featuresData[currentIndex].description}
            </p>
          </div>
        </div>

        {/* Play Button Overlay - Only visible on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-3 flex items-center gap-2 transform transition-all duration-300 hover:scale-110 hover:bg-black/70">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
            <span className="text-white font-medium">View Full Screen</span>
          </div>
        </div>
      </div>
    </motion.div>
  ), [currentIndex, isVideoLoaded, handleVideoLoad, handleVideoEnded, isHovering]);

  return (
    <section
      id="features-section"
      className="relative w-full py-16 md:py-24 bg-black min-h-screen overflow-hidden"
    >
      {/* Particles Background */}
      <MemoizedParticles id="particles-features" />
      
      {/* Title with animation */}
      <div className="container mx-auto px-4 mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display tracking-tight pb-2">
            Key Features
          </h2>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
            Discover the capabilities that make our platform stand out from the competition
          </p>
        </motion.div>
      </div>
      
      {/* Carousel Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div 
          ref={carouselRef}
          className="relative max-w-5xl mx-auto"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Main Carousel */}
          <AnimatePresence mode="wait">
            {carouselContent}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Goals Navigation Arrow (replacing dots) */}
          <div className="flex justify-center mt-6">
            <NavigationArrow 
              targetId="goals-section" 
              direction="down"
              className="z-[100] backdrop-blur-sm bg-black/30 p-3 rounded-full hover:bg-black/50 transition-colors" 
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <FullscreenVideoModal 
            video={activeVideo.video} 
            fallbackUrl={activeVideo.fallbackUrl}
            title={activeVideo.title}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </AnimatePresence>

      {/* Navigation Arrows */}
      <NavigationArrow 
        targetId="hero-section" 
        direction="up"
        className="z-[100] backdrop-blur-sm bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors absolute top-4 right-4" 
      />
    </section>
  );
};

const FullscreenVideoModal = ({ video, fallbackUrl, title, onClose }) => {
  const videoRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const playAttemptRef = useRef(null);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Apply performance optimizations
    videoElement.style.transform = 'translateZ(0)';
    videoElement.playsInline = true;
    
    // Load video
    videoElement.load();
    
    // Clear any pending play attempts
    if (playAttemptRef.current) {
      clearTimeout(playAttemptRef.current);
      playAttemptRef.current = null;
    }
    
    // Only play when loaded
    if (isLoaded) {
      // Add delay to avoid race conditions
      playAttemptRef.current = setTimeout(() => {
        if (videoRef.current && document.body.contains(videoRef.current)) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              // Only log non-abort errors
              if (err.name !== 'AbortError') {
                console.log("Video play error:", err);
              }
              
              // Handle format not supported error
              if (err.name === 'NotSupportedError') {
                videoElement.src = fallbackUrl;
                videoElement.load();
                // Try again with fallback
                setTimeout(() => {
                  if (videoRef.current) {
                    videoRef.current.play().catch(e => {
                      if (e.name !== 'AbortError') {
                        console.error("Fallback video play error:", e);
                      }
                    });
                  }
                }, 100);
              } else {
                // Try again after a short delay for other errors
                setTimeout(() => {
                  if (videoRef.current && isLoaded) {
                    videoRef.current.play().catch(e => {
                      if (e.name !== 'AbortError') {
                        console.error("Retry play error:", e);
                      }
                    });
                  }
                }, 300);
              }
            });
          }
        }
      }, 100);
    }
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
      
      // Clean up play attempts
      if (playAttemptRef.current) {
        clearTimeout(playAttemptRef.current);
        playAttemptRef.current = null;
      }
      
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute('src');
        videoElement.load();
      }
    };
  }, [isLoaded, fallbackUrl]);

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="relative w-full max-w-5xl max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        <div className="w-full h-full aspect-video">
          <video
            ref={videoRef}
            className={`w-full h-full object-contain ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            playsInline
            controls
            preload="auto"
            onLoadedData={handleLoadedData}
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            <source src={video} type="video/mp4" />
            <source src={fallbackUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Features;
