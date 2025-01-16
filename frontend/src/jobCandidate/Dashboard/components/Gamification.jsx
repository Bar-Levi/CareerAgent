import React from "react";

const Gamification = () => {
  return (
    <div className="col-span-1 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4">Gamification</h2>
      <p>Badges Earned:</p>
      <div className="mt-4 flex space-x-4">
        <div className="bg-yellow-300 text-white rounded-full w-16 h-16 flex items-center justify-center">
          🏅
        </div>
        <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
          🎖️
        </div>
        <div className="bg-green-400 text-white rounded-full w-16 h-16 flex items-center justify-center">
          🥇
        </div>
      </div>
    </div>
  );
};

export default Gamification;
