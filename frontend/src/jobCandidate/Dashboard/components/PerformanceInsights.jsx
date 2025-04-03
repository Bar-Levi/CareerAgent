import React from "react";
import { FaEye, FaPaperPlane, FaUserTie, FaChartLine } from "react-icons/fa";

const PerformanceInsights = () => {
  const metrics = [
    {
      label: "Profile Views",
      value: "120",
      icon: FaEye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      label: "Applications Sent",
      value: "15",
      icon: FaPaperPlane,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      label: "Interview Invites",
      value: "3",
      icon: FaUserTie,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col min-h-0">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 flex-none">
        <h2 className="text-lg font-bold text-white">Performance Insights</h2>
      </div>

      <div className="flex-1 min-h-0">
        <div className="overflow-y-auto h-full">
          <div className="p-4">
            <div className="grid grid-rows-3 gap-2">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${metric.bgColor} ${metric.borderColor} hover:shadow-sm transition-all duration-200`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                        <Icon className={`w-5 h-5 ${metric.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaChartLine className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
