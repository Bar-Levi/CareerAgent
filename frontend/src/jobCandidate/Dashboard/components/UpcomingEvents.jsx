import React from "react";

const UpcomingEvents = () => {
  return (
    <div className="col-span-1 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Upcoming Events/Interviews</h2>
      <ul className="space-y-2">
        <li>
          <p className="font-semibold">Interview with TechCorp</p>
          <p className="text-sm text-gray-500">January 20, 2025 - 10:00 AM</p>
        </li>
        <li>
          <p className="font-semibold">Webinar: Enhancing React Skills</p>
          <p className="text-sm text-gray-500">January 25, 2025 - 2:00 PM</p>
        </li>
      </ul>
    </div>
  );
};

export default UpcomingEvents;
