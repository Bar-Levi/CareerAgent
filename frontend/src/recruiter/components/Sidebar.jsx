import React from "react";

const Sidebar = ({
  attentionItems = [],
  upcomingInterviews = [],
}) => {
  return (
    <div className="space-y-6">
      {/* ⚠️ Attention Needed Section */}
      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-2">
          ⚠️ Attention Needed
        </h3>
        {attentionItems.length === 0 ? (
          <p className="text-gray-400 text-sm">All clear for now!</p>
        ) : (
          <ul className="space-y-2 text-sm text-gray-700">
            {attentionItems.map((item, idx) => (
              <li key={idx} className="p-2 bg-red-50 rounded">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 📅 Upcoming Interviews Section */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-2">
          📅 Upcoming Interviews
        </h3>
        {upcomingInterviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No interviews scheduled.</p>
        ) : (
          <ul className="space-y-2 text-sm text-gray-700">
            {upcomingInterviews.map((interview, idx) => (
              <li
                key={idx}
                className="p-2 border rounded flex flex-col bg-white shadow-sm"
              >
                <span className="font-medium">{interview.candidate}</span>
                <span className="text-xs text-gray-500">
                  {interview.jobTitle} – {interview.dateTime}
                </span>
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-1"
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
