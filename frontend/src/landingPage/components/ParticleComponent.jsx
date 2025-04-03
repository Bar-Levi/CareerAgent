/**
 * 
 * This component creates an interactive particle animation using the tsparticles library.
 * It renders a dynamic background of particles that respond to user interactions like clicks and hovers.
 * 
 * Features:
 * - Interactive particle system
 * - Customizable particle behavior
 * - Responsive to user interactions
 * - Optimized performance with memoization
 */

import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useMemo, useState, memo } from "react";
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.

/**
 * ParticleComponent - A React component that renders an interactive particle system
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the particle container
 * @returns {JSX.Element} Rendered particle system
 */
const ParticlesComponent = memo((props) => {
  // State to track if the particle engine has been initialized
  const [init, setInit] = useState(false);

  // Initialize the particle engine when the component mounts
  useEffect(() => {
    // Initialize the particle engine with slim configuration
    initParticlesEngine(async (engine) => {
      // Load the slim version of tsparticles for better performance
      await loadSlim(engine);
    }).then(() => {
      // Set initialization state to true once complete
      setInit(true);
    });
  }, []); // Empty dependency array ensures this runs only once

  // Callback function that runs when particles are loaded
  const particlesLoaded = (container) => {
    // Log the container instance for debugging purposes
    console.log(container);
  };

  // Memoized configuration object for the particle system
  const options = useMemo(
    () => ({
      // Background configuration
      background: {
        color: {
          value: "brand-primary", // Background color using brand primary color
        },
      },
      // Frame rate limit for performance optimization
      fpsLimit: 60,
      // Interaction settings
      interactivity: {
        events: {
          // Click interaction settings
          onClick: {
            enable: true,
            mode: ["attract", "grab"], // Particles will attract and grab on click
          },
          // Hover interaction settings
          onHover: {
            enable: true,
            mode: 'grab', // Particles will grab on hover
          },
        },
        modes: {
          // Push mode configuration
          push: {
            distance: 200, // Maximum distance for push effect
            duration: 15, // Duration of push effect
          },
          // Grab mode configuration
          grab: {
            distance: 150, // Maximum distance for grab effect
          },
        },
      },
      // Particle appearance and behavior settings
      particles: {
        // Particle color settings
        color: {
          value: "#FFFFFF", // White color for particles
        },
        // Particle link settings
        links: {
          color: "#FFFFFF", // White color for links
          distance: 150, // Maximum distance for links
          enable: true, // Enable links between particles
          opacity: 0.2, // Link opacity
          width: 2, // Link width
        },
        // Particle movement settings
        move: {
          direction: "none", // No specific direction
          enable: true, // Enable particle movement
          outModes: {
            default: "bounce", // Particles bounce at boundaries
          },
          random: true, // Enable random movement
          speed: 1, // Movement speed
          straight: false, // Disable straight-line movement
        },
        // Particle count settings
        number: {
          density: {
            enable: true, // Enable density-based distribution
          },
          value: 50, // Total number of particles
        },
        // Particle opacity settings
        opacity: {
          value: 1.0, // Full opacity
        },
        // Particle shape settings
        shape: {
          type: "circle", // Circular particles
        },
        // Particle size settings
        size: {
          value: { min: 1, max: 3 }, // Random size between 1 and 3
        },
      },
      // Enable retina display support
      detectRetina: true,
    }),
    [], // Empty dependency array ensures options are created only once
  );

  // Render the Particles component with configured options
  return <Particles id={props.id} init={particlesLoaded} options={options} />;
});

export default ParticlesComponent;