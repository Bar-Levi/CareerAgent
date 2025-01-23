export const sendMessageToAPI = async ({ userMessage, token, botSettings, conversationId, setIsTyping }) => {
    setIsTyping(true);
    try {
      const response = await fetch(botSettings.apiEndpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: userMessage,
          sessionId: `${conversationId}`,
          type: botSettings.type,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Error sending message:", error);
      return "Sorry, something went wrong!";
    } finally {
      setIsTyping(false);
    }
  };
  
  export const handleSend = async ({
    input,
    setInput,
    setMessages,
    sendMessageToAPI,
    chatId,
    token,
    messages,
    MAX_MESSAGE_COUNT,
    setIsTyping,
    showNotification,
  }) => {
    if (!input.trim()) return;
  
    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    };
  
    if (messages.length < MAX_MESSAGE_COUNT) {
      setMessages((prev) => [...prev, userMessage]);
    }
    setInput("");
  
    try {
      const botReply = await sendMessageToAPI({
        userMessage: input,
        token,
        botSettings: { apiEndpoint: process.env.REACT_APP_BACKEND_URL + "/api/ai/sendToBot", type: "default" },
        conversationId: chatId,
        setIsTyping,
      });
  
      const botMessage = {
        sender: "bot",
        text: botReply,
        timestamp: new Date(),
      };
  
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error handling message:", error);
      showNotification("error", "Failed to send message.");
    }
  };
  