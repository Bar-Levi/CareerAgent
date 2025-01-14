import React, { useEffect } from 'react';

const Botpress = () => {
  useEffect(() => {
    const BotpressWebchatLoader = document.createElement('script');
    BotpressWebchatLoader.src = process.env.REACT_APP_BOTPRESS_WEBCHAT_URL;
    BotpressWebchatLoader.async = true;

    BotpressWebchatLoader.onload = () => {
      console.log('Botpress Webchat script loaded successfully.');

      const CustomBotScript = document.createElement('script');
      CustomBotScript.src = process.env.REACT_APP_CUSTOM_BOT_SCRIPT_URL;
      CustomBotScript.async = true;

      CustomBotScript.onload = () => {
        console.log('Custom Bot script loaded successfully.');
      };

      CustomBotScript.onerror = () => {
        console.error('Failed to load Custom Bot script.');
      };

      document.body.appendChild(CustomBotScript);
    };

    BotpressWebchatLoader.onerror = () => {
      console.error('Failed to load Botpress Webchat script.');
    };

    document.body.appendChild(BotpressWebchatLoader);
  }, []);

  return <div id="webchat" />;
};

export default Botpress;
