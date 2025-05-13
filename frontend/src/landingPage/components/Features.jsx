import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticlesComponent from "./ParticleComponent";

// Memoize ParticlesComponent to prevent re-renders
const MemoizedParticles = React.memo(ParticlesComponent);

// Video data using YouTube IDs
const featuresData = [
  {
    id: 1,
    title: "Customized Chatbots",
    videoId: "dceoQF2Esi8",
    fallbackUrl: "https://youtu.be/dceoQF2Esi8",
    description: "Experience two powerful AI-driven tools: an Interviewer chatbot to simulate real-world interview scenarios and a Career Advisor chatbot to guide your career journey."
  },
  {
    id: 2,
    title: "CV Scanning",
    videoId: "V-rC_rOkvC0",
    fallbackUrl: "https://youtu.be/V-rC_rOkvC0",
    description: "Effortlessly extract key details from your CV with AI-powered scanning. Say goodbye to manual data entry and streamline your workflow in seconds."
  },
  {
    id: 3,
    title: "Recruiter-Candidate Chat",
    videoId: "B3DoO4LlEN4",
    fallbackUrl: "https://youtu.be/B3DoO4LlEN4",
    description: "Enable direct communication between recruiters and candidates for specific job positions, making the hiring process faster and more personalized."
  }
];

// YouTube API loader
const loadYouTubeAPI = () => {
  if (window.YT) return Promise.resolve(window.YT);
  
  return new Promise((resolve) => {
    // Create script tag
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // When YouTube API is ready, resolve promise
    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT);
    };
  });
};

// Memoized YouTube player component
const CarouselVideo = memo(({ videoId, isActive, onLoadedData, onVideoEnded }) => {
  const playerContainerRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  useEffect(() => {
    let player = null;

    const setupPlayer = async () => {
      try {
        // Load YouTube API
        const YT = await loadYouTubeAPI();
        
        // Create player instance
        player = new YT.Player(playerContainerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: isActive ? 1 : 0,
            mute: 1,
            controls: 0,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            playsinline: 1,
            loop: 0
          },
          events: {
            onReady: (event) => {
              setIsPlayerReady(true);
              playerRef.current = event.target;
              if (isActive && event.target.playVideo) {
                event.target.playVideo();
              }
              if (onLoadedData) onLoadedData();
            },
            onStateChange: (event) => {
              // When video ends
              if (event.data === YT.PlayerState.ENDED) {
                if (onVideoEnded) onVideoEnded();
              }
            },
            onError: (event) => {
              console.error("YouTube player error:", event.data);
            }
          }
        });
      } catch (error) {
        console.error("Error setting up YouTube player:", error);
      }
    };

    if (playerContainerRef.current && !playerRef.current) {
      setupPlayer();
    }

    // Control playback based on isActive
    if (playerRef.current && isPlayerReady) {
      if (isActive) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }

    // Clean up
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId, isActive, onLoadedData, onVideoEnded, isPlayerReady]);

  return (
    <div className="w-full h-full">
      <div ref={playerContainerRef} className="w-full h-full"></div>
    </div>
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
          videoId={featuresData[currentIndex].videoId}
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
      className="relative w-full py-16 md:py-24 bg-black min-h-screen overflow-hidden flex flex-col"
    >
      {/* Particles Background */}
      <MemoizedParticles id="particles-features" />
      
      {/* Title with animation - reduced bottom margin */}
      <div className="container mx-auto px-4 mb-8 md:mb-10 relative z-10">
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
          <p className="text-gray-400 text-lg mt-3 max-w-2xl mx-auto">
            Discover the capabilities that make our platform stand out from the competition
          </p>
        </motion.div>
      </div>
      
      {/* Carousel Container */}
      <div className="container mx-auto px-4 relative z-10 flex-grow">
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
        </div>
      </div>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <FullscreenVideoModal 
            videoId={activeVideo.videoId}
            title={activeVideo.title}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const FullscreenVideoModal = ({ videoId, title, onClose }) => {
  const playerContainerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    let player = null;

    const setupPlayer = async () => {
      try {
        // Load YouTube API
        const YT = await loadYouTubeAPI();
        
        // Create player instance
        player = new YT.Player(playerContainerRef.current, {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            playsinline: 1
          },
          events: {
            onReady: (event) => {
              event.target.playVideo();
              setIsLoaded(true);
            },
            onError: (event) => {
              console.error("YouTube player error:", event.data);
            }
          }
        });
      } catch (error) {
        console.error("Error setting up YouTube player:", error);
      }
    };

    if (playerContainerRef.current) {
      setupPlayer();
    }
    
    document.body.style.overflow = 'hidden';
    
    // Clean up
    return () => {
      document.body.style.overflow = 'auto';
      if (player) {
        player.destroy();
      }
    };
  }, [videoId]);

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
          <div ref={playerContainerRef} className="w-full h-full"></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Features;

