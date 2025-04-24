import React from "react";

const Sidebar = ({
  attentionItems = [],
  upcomingInterviews = [],
  darkMode = false,
}) => {
  return (
    <div className="space-y-6">
      {/* ⚠️ Attention Needed Section */}
      <div>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-2`}>
          ⚠️ Attention Needed
        </h3>
        {attentionItems.length === 0 ? (
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} text-sm`}>All clear for now!</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {attentionItems.map((item, idx) => (
              <li key={idx} className={`p-2 ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-gray-700'} rounded`}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📅 Upcoming Interviews Section */}
      <div>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
          📅 Upcoming Interviews
        </h3>
        {upcomingInterviews.length === 0 ? (
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-400'} text-sm`}>No interviews scheduled.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {upcomingInterviews.map((interview, idx) => (
              <li
                key={idx}
                className={`p-2 border rounded flex flex-col ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-700 shadow-sm'
                }`}
              >
                <span className="mb-1 font-medium">{interview.candidate}</span>
                <span className={`mb-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {interview.jobTitle}
                </span>
                <b className={`mb-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {interview.dateTime}
                </b>
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} hover:underline mt-1`}
                >
                  Join Meeting
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
