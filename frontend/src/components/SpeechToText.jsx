import React, { useState, useEffect } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa"; // Importing icons from React Icons

const SpeechToText = ({ onTextChange }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
            return;
        }
        const speechRecognition = new window.webkitSpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        speechRecognition.lang = "en-US";

        speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onTextChange) onTextChange(transcript);
            setIsListening(false);
        };

        speechRecognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            alert("An error occurred: " + event.error);
            setIsListening(false);
        };

        speechRecognition.onend = () => setIsListening(false);

        setRecognition(speechRecognition);
    }, [onTextChange]);

    const toggleListening = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            recognition.start();
            setIsListening(true);
        }
    };

    return (
        <button
            onClick={toggleListening}
            className={`flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition transform ${
                isListening
                    ? "bg-red-600 hover:bg-red-500 active:scale-95"
                    : "bg-blue-600 hover:bg-blue-500 active:scale-95"
            }`}
            style={{ outline: "none", border: "none" }}
            aria-label={isListening ? "Stop listening" : "Start listening"}
        >
            {isListening ? (
                <>
                    <FaStop size={20} /> Stop Listening
                </>
            ) : (
                <>
                    <FaMicrophone size={20} /> Start Listening
                </>
            )}
        </button>
    );
};

export default SpeechToText;
