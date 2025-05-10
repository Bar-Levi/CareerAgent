import React, { useEffect, useState } from "react";
import { FaEye, FaPaperPlane, FaUserTie, FaChartLine, FaChartBar } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const PerformanceInsights = () => {
  const location = useLocation();
  const [statistics, setStatistics] = useState({
    numOfApplicationsSent: 0,
    numOfInterviewsScheduled: 0,
    numOfReviewedApplications: 0,
    interviewSuccessRate: 0
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('token');
        const userEmail = location.state?.user?.email;
        
        if (!userEmail) {
          throw new Error('User email not found');
        }

        const encodedEmail = encodeURIComponent(userEmail);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/personal/statistics?email=${encodedEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        setStatistics(data);
        
        // Set message based on interview success rate
        if (data.interviewSuccessRate < 50) {
          setMessage("Consider using our AI chatbots to improve your skills and CV to increase your interview success rate!");
        } else {
          setMessage("Great job! Your interview success rate is above average. Keep up the good work!");
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="bg-white rounded-b-lg shadow-lg h-full flex flex-col overflow-hidden max-h-full">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 flex-none">
        <h2 className="text-lg font-bold text-white">Performance Insights</h2>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Applications Sent */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-green-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 transition-colors duration-300">
                  <FaPaperPlane className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Applications Sent</div>
                  <div className="text-2xl font-bold text-gray-900">{statistics.numOfApplicationsSent}</div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300">
                <FaChartLine className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Track all job applications you've submitted
            </div>
          </div>

          {/* Interviews Scheduled */}
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-purple-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 transition-colors duration-300">
                  <FaUserTie className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Interviews Scheduled</div>
                  <div className="text-2xl font-bold text-gray-900">{statistics.numOfInterviewsScheduled}</div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300">
                <FaChartLine className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Upcoming and completed interview sessions
            </div>
          </div>

          {/* Interview Success Rate - Moved to third position */}
          <div className={`rounded-lg p-3 border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
            statistics.interviewSuccessRate >= 50 
              ? 'bg-green-50 border-green-100 hover:bg-green-100' 
              : 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${
                  statistics.interviewSuccessRate >= 50 
                    ? 'bg-green-100' 
                    : 'bg-yellow-100'
                }`}>
                  <FaChartBar className={`w-5 h-5 ${
                    statistics.interviewSuccessRate >= 50 ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Interview Success Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{statistics.interviewSuccessRate.toFixed(1)}%</div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300">
                <FaChartLine className="w-5 h-5" />
              </button>
            </div>
            {message && (
              <div className={`mt-2 text-sm ${
                statistics.interviewSuccessRate >= 50 ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Applications Reviewed - Moved to fourth position */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-blue-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 transition-colors duration-300">
                  <FaEye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Applications Reviewed</div>
                  <div className="text-2xl font-bold text-gray-900">{statistics.numOfReviewedApplications}</div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300">
                <FaChartLine className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Applications reviewed by Recruiters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
