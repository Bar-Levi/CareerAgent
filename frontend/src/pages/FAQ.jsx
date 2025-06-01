import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavigationBar from "../components/NavigationBar/NavigationBar";
import Botpress from "../botpress/Botpress";
import { FiMoon, FiSun } from "react-icons/fi";
import FAQ_DATA from "../utils/faqData";

// Sub-component for individual FAQ item
const FAQItem = ({ faq, onToggle, darkMode }) => (
  <div className={`border rounded p-4 mb-4 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
    <h3
      onClick={onToggle}
      className={`text-lg font-semibold cursor-pointer ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
    >
      {faq.question}
    </h3>
    {faq.open && <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{faq.answer}</p>}
  </div>
);

const FAQ = () => {
  // If you use React Router's useLocation to get user info or state, uncomment:
  const { state } = useLocation();
  
  // Check if user came directly to the page (no state)
  const isDirectNavigation = !state;

  // 1) We store a version of FAQ data that includes a unique `id` for each item.
  const [faqs, setFaqs] = useState({});
  // 2) Filtered FAQ data after searching
  const [filteredFaqs, setFilteredFaqs] = useState({});
  // 3) Search input
  const [searchQuery, setSearchQuery] = useState("");
  // 4) Dark mode state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("careeragent_darkmode") === "true" || false
  );

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("careeragent_darkmode", newMode.toString());
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  // On mount, transform the data to add a unique ID to each FAQ item
  useEffect(() => {
    const faqWithIds = {};

    Object.keys(FAQ_DATA).forEach((subject) => {
      faqWithIds[subject] = FAQ_DATA[subject].map((item, index) => {
        // Generate a unique ID, e.g. subject + index
        const id = `${subject}-${index}`;
        return { ...item, id };
      });
    });

    setFaqs(faqWithIds);
    setFilteredFaqs(faqWithIds);
  }, []);

  // Toggling an item by ID
  const toggleAnswer = (id) => {
    // We find which subject array contains this item, then toggle `open`
    setFaqs((prevFaqs) => {
      const newFaqs = { ...prevFaqs };

      Object.keys(newFaqs).forEach((subject) => {
        newFaqs[subject] = newFaqs[subject].map((faq) =>
          faq.id === id ? { ...faq, open: !faq.open } : faq
        );
      });

      return newFaqs;
    });
  };

  // Handle user typing in the search bar
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // Filter logic: whenever `searchQuery` or `faqs` changes
  useEffect(() => {
    const newFiltered = {};

    Object.keys(faqs).forEach((subject) => {
      // Filter items if question or answer matches search
      const filteredItems = faqs[subject].filter((faq) => {
        const combinedText =
          faq.question.toLowerCase() + " " + faq.answer.toLowerCase();
        return combinedText.includes(searchQuery);
      });
      if (filteredItems.length > 0) {
        newFiltered[subject] = filteredItems;
      }
    });

    setFilteredFaqs(newFiltered);
  }, [searchQuery, faqs]);

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      {/* Optional Navigation & Botpress */}
      <NavigationBar userType={state?.user?.role} showOnlyDashboard={isDirectNavigation} />
      <Botpress />
  
      {/* Page Header */}
      <header className="my-6 text-center relative">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} py-6 rounded-lg shadow-lg`}>
          <h1 className="text-3xl font-bold tracking-wide">
            Frequently Asked Questions
          </h1>
          
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`absolute right-4 top-4 p-2 rounded-full transition-all duration-300 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-700" />}
          </button>
        </div>
        {/* Search Bar */}
        <div className="mt-6 flex justify-center">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={handleSearch}
            className={`w-11/12 max-w-lg px-6 py-3 text-lg rounded-full shadow-md focus:outline-none focus:ring-2 transition ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-400 placeholder-gray-400'
                : 'bg-white border border-gray-300 text-gray-800 focus:ring-blue-500'
            }`}
          />
        </div>
      </header>
  
      {/* FAQ Sections */}
      <div className="mx-auto px-4" style={{ maxWidth: "1000px" }}>
        {Object.keys(filteredFaqs).map((subject) => (
          <div key={subject} className="mb-8">
            {/* Subject Title */}
            <h2 className={`text-xl font-bold mb-4 sticky top-0 py-2 z-10 text-center ${
              darkMode ? 'bg-gray-900 text-blue-400' : 'bg-gray-50 text-blue-600'
            }`}>
              <span className={`px-3 py-3 rounded-md ${
                darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {subject}
              </span>
            </h2>
  
            {/* Render each FAQItem with darkMode prop */}
            {filteredFaqs[subject].map((faq) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                onToggle={() => toggleAnswer(faq.id)}
                darkMode={darkMode}
              />
            ))}
          </div>
        ))}
        
        {/* No results message */}
        {Object.keys(filteredFaqs).length === 0 && searchQuery && (
          <div className={`p-8 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
            <p className="text-xl font-semibold">No results found for "{searchQuery}"</p>
            <p className="mt-2">Please try a different search term or browse the categories.</p>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default FAQ;
