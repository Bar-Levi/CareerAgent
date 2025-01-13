import React, { useState } from "react";
import { FaSync, FaBan } from "react-icons/fa"; // Small package for icons

const ProfileSyncedToggle = () => {
  const [isSynched, setIsSynched] = useState(true);

  const handleToggle = () => {
    setIsSynched((prevState) => !prevState);
  };

  return (
    <div
      className="flex items-center justify-center w-40"
      style={{ minWidth: "150px" }} // Ensure fixed width for the toggle container
    >
      <button
        onClick={handleToggle}
        className={`flex items-center px-4 py-2 rounded-full border-2 transition-colors ${
          isSynched ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"
        }`}
      >
        {isSynched ? (
          <FaSync className="text-white mr-2" />
        ) : (
          <FaBan className="text-white mr-2" />
        )}
        <span className="text-white font-medium">
          {isSynched ? "Synced" : "Not Synced"}
        </span>
      </button>
    </div>
  );
};

const HeaderWithToggle = ({ conversationTitle }) => {
  return (
    <div className="bg-brand-primary text-white flex items-center justify-between py-3 px-4 font-bold">
      {/* Fixed Title Section */}
      <div className="text-center flex-grow">{conversationTitle}</div>

      {/* Profile Synced Toggle */}
      <ProfileSyncedToggle />
    </div>
  );
};

export default HeaderWithToggle;
