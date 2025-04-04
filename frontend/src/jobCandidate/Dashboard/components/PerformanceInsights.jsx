import React, { useEffect, useState, useRef } from "react";
import { FaEye, FaPaperPlane, FaUserTie, FaChartLine, FaChartBar } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const PerformanceInsights = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(location.state?.user || null);
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
        const encodedEmail = encodeURIComponent(userData?.email);
        
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/personal/statistics?email=${encodedEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        
        // Update statistics state
        setStatistics(data);
        
        // Set message based on interview success rate
        if (data.interviewSuccessRate < 50) {
          setMessage("Consider using our AI chatbots to improve your skills and CV to increase your interview success rate!");
        } else {
          setMessage("Great job! Your interview success rate is above average. Keep up the good work!");
        }

        // Update user data with the latest statistics
        if (userData) {
          const updatedUserData = {
            ...userData,
            numOfApplicationsSent: data.numOfApplicationsSent,
            numOfInterviewsScheduled: data.numOfInterviewsScheduled,
            numOfReviewedApplications: data.numOfReviewedApplications
          };
          
          setUserData(updatedUserData);
          // Update location state with new user data
          navigate(location.pathname, { 
            state: { user: updatedUserData },
            replace: true 
          });
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    if (userData?.email) {
      fetchStatistics();
    }
  }, [userData?.email, location.pathname, navigate]);

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 rounded-t-lg">
        <h2 className="text-lg font-bold text-white">Performance Insights</h2>
      </div>

      <div className="flex flex-col gap-2 p-2">
        {/* Applications Sent */}
        <div className="bg-green-50 rounded-lg p-3 border border-green-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 transition-colors duration-300 group-hover:bg-green-200">
                <FaPaperPlane className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Applications Sent</div>
                <div className="text-xl font-bold text-gray-900">{statistics.numOfApplicationsSent}</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300">
              <FaChartLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interviews Scheduled */}
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 transition-colors duration-300 group-hover:bg-purple-200">
                <FaUserTie className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Interviews Scheduled</div>
                <div className="text-xl font-bold text-gray-900">{statistics.numOfInterviewsScheduled}</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300">
              <FaChartLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Applications Reviewed */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 transition-colors duration-300 group-hover:bg-blue-200">
                <FaEye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Applications Reviewed</div>
                <div className="text-xl font-bold text-gray-900">{statistics.numOfReviewedApplications}</div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300">
              <FaChartLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Interview Success Rate */}
        <div className={`rounded-lg p-3 border transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
          statistics.interviewSuccessRate >= 50 
            ? 'bg-green-50 border-green-100 hover:bg-green-100' 
            : 'bg-yellow-50 border-yellow-100 hover:bg-yellow-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors duration-300 ${
                statistics.interviewSuccessRate >= 50 
                  ? 'bg-green-100 group-hover:bg-green-200' 
                  : 'bg-yellow-100 group-hover:bg-yellow-200'
              }`}>
                <FaChartBar className={`w-5 h-5 ${
                  statistics.interviewSuccessRate >= 50 ? 'text-green-600' : 'text-yellow-600'
                }`} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Interview Success Rate</div>
                <div className="text-xl font-bold text-gray-900">{statistics.interviewSuccessRate.toFixed(1)}%</div>
                {message && (
                  <div className={`text-sm mt-0.5 ${
                    statistics.interviewSuccessRate >= 50 ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-500 transition-colors duration-300">
              <FaChartLine className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
