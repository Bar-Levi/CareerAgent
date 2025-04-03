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
 * @param {Object} props.options - Custom particle configuration options
 * @returns {JSX.Element} Rendered particle system
 */
const ParticlesComponent = memo(({ id, options: customOptions }) => {
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
          value: "transparent", // Transparent background
        },
      },
      // Frame rate limit for performance optimization
      fpsLimit: 60,
      // Particle appearance and behavior settings
      particles: {
        number: {
          value: 50, 
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: ["#6366f1", "#8b5cf6", "#ec4899"] // Indigo, Purple, Pink gradient
        },
        shape: {
          type: "circle"
        },
        opacity: {
          value: 0.8,
          random: true,
          animation: {
            enable: true,
            speed: 1,
            minimumValue: 0.1,
            sync: false
          }
        },
        size: {
          value: { min: 1, max: 5 },
          random: true
        },
        links: {
          enable: true,
          distance: 150,
          color: "#8b5cf6",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "bounce"
          }
        }
      },
      // Interaction settings
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab"
          },
          onClick: {
            enable: true,
            mode: "push"
          }
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 1
            }
          },
          push: {
            quantity: 4
          }
        }
      },
      // Enable retina display support
      detectRetina: true,
      // Merge with custom options if provided
      ...customOptions,
    }),
    [customOptions], // Include customOptions in dependency array
  );

  // Render the Particles component with configured options
  return <Particles id={id} init={particlesLoaded} options={options} />;
});

export default ParticlesComponent;