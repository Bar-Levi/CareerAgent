import React, { useState } from "react";

const emojis = ["👍", "❤️", "😂", "😮", "👏"];

const ReactionBar = () => {
  const [reactions, setReactions] = useState({});

  const handleReaction = (emoji) => {
    setReactions({ ...reactions, [emoji]: (reactions[emoji] || 0) + 1 });
  };

  return (
    <div className="flex space-x-2 mt-2">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          className="text-lg focus:outline-none hover:scale-110 transition"
        >
          {emoji} {reactions[emoji] || ""}
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;
