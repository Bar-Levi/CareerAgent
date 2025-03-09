const checkAndInsertIn = (inputString) => {
    const words = inputString.split(" ");
  
    // If the second word is exactly "in", return true
    if (words[1] === "in") {
      return inputString;
    }
  
    // Otherwise, insert "in" as the second word.
    // If there is at least one word, insert after the first.
    // If no words exist, just add "in".
    if (words.length > 0) {
      words.splice(1, 0, "in");
    } else {
      words.push("in");
    }
  
    return words.join(" ");
  }

  module.exports = {checkAndInsertIn};
  