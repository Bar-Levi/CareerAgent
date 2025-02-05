import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Botpress = () => {
  const navigate = useNavigate();
  const [isBotAvailable, setIsBotAvailable] = useState(true); // Track Botpress availability


  useEffect(() => {
    manageBpHeightFull();
  }, [isBotAvailable]);

  const manageBpHeightFull = () => {
    const bpHeightFullDiv = document.querySelector('[title="Botpress"]');
    if (bpHeightFullDiv) {
      bpHeightFullDiv.remove(); // Directly removes the element
    }
  };

  useEffect(() => {
    let BotpressWebchatLoader; // Declare the script variable

    

    
    
    const showFaqButton = () => {
      // Ensure the FAQ button exists
      let faqButtonContainer = document.getElementById('faq-button-container');
      if (!faqButtonContainer) {
        // Create the button container
        faqButtonContainer = document.createElement('div');
        faqButtonContainer.id = 'faq-button-container';
        faqButtonContainer.style.position = 'fixed';
        faqButtonContainer.style.bottom = '1.5rem'; // Tailwind 'bottom-6'
        faqButtonContainer.style.right = '1.5rem'; // Tailwind 'right-6'
        faqButtonContainer.style.zIndex = isBotAvailable ? '-1' : '9999'; // Adjust layering
        faqButtonContainer.style.visibility = isBotAvailable ? 'hidden' : 'visible'; // Adjust visibility
        faqButtonContainer.style.pointerEvents = isBotAvailable ? 'none' : 'auto'; // Avoid interaction when hidden
        faqButtonContainer.style.transition = 'visibility 0.3s, z-index 0.3s'; // Smooth transitions

        // Create the button element
        const button = document.createElement('button');
        button.innerText = 'FAQ';
        button.style.width = '4rem'; // Tailwind 'w-16'
        button.style.height = '4rem'; // Tailwind 'h-16'
        button.style.backgroundColor = '#dc2626'; // Tailwind 'bg-red-600'
        button.style.color = 'white';
        button.style.borderRadius = '9999px'; // Tailwind 'rounded-full'
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; // Tailwind 'shadow-lg'
        button.style.cursor = 'pointer';
        button.style.outline = 'none';
        button.style.border = 'none';
        button.addEventListener('click', () => navigate('/faq'));

        // Hover effect
        button.addEventListener('mouseover', () => {
          button.style.backgroundColor = '#ef4444'; // Tailwind 'hover:bg-red-500'
        });

        button.addEventListener('mouseout', () => {
          button.style.backgroundColor = '#dc2626'; // Tailwind 'bg-red-600'
        });

        faqButtonContainer.appendChild(button);
        document.body.appendChild(faqButtonContainer);
      } else {
        // Update existing FAQ button visibility
        faqButtonContainer.style.zIndex = isBotAvailable ? '-1' : '9999';
        faqButtonContainer.style.visibility = isBotAvailable ? 'hidden' : 'visible';
        faqButtonContainer.style.pointerEvents = isBotAvailable ? 'none' : 'auto';
      }
    };

    const loadBotpressScript = () => {
      // Create and append the Botpress Webchat script
      BotpressWebchatLoader = document.createElement('script');
      BotpressWebchatLoader.src = process.env.REACT_APP_BOTPRESS_WEBCHAT_URL;
      BotpressWebchatLoader.async = true;

      BotpressWebchatLoader.onload = () => {

        const CustomBotScript = document.createElement('script');
        CustomBotScript.src = process.env.REACT_APP_CUSTOM_BOT_SCRIPT_URL;
        CustomBotScript.async = true;

        CustomBotScript.onload = () => {
          setIsBotAvailable(true); // Bot is successfully loaded
        };

        CustomBotScript.onerror = () => {
          console.error('Failed to load Custom Bot script.');
          setIsBotAvailable(false); // Bot failed to load
          manageBpHeightFull();          
        };

        document.body.appendChild(CustomBotScript);
      };

      BotpressWebchatLoader.onerror = () => {
        console.error('Failed to load Botpress Webchat script.');
        setIsBotAvailable(false); // Bot failed to load
        manageBpHeightFull();
      };

      document.body.appendChild(BotpressWebchatLoader);
    };

    loadBotpressScript();
    showFaqButton(); // Ensure the FAQ button is added and shown/hidden based on availability

    return () => {
      // Cleanup: Remove the script
      if (BotpressWebchatLoader && document.body.contains(BotpressWebchatLoader)) {
        document.body.removeChild(BotpressWebchatLoader);
      }
    };
  }, [navigate, isBotAvailable]);

  return <div id="webchat" />;
};

export default Botpress;
