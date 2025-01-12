import React, { useEffect } from 'react'

const Chatbot = () => {

  useEffect(() => {
    const BotpressWebchatLoader = document.createElement('script')
    BotpressWebchatLoader.src = process.env.REACT_APP_BOTPRESS_WEBCHAT_URL
    BotpressWebchatLoader.async = true

    const CustomBotScript = document.createElement('script')
    CustomBotScript.src = process.env.REACT_APP_CUSTOM_BOT_SCRIPT_URL
    CustomBotScript.async = true

    document.body.appendChild(BotpressWebchatLoader)
    document.body.appendChild(CustomBotScript)
  }, [])

  return <div id="webchat" />
}

export default Chatbot
