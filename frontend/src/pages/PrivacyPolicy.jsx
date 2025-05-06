import React from "react";
import { FaShieldAlt, FaUserShield, FaDatabase, FaCookieBite, FaGlobeAmericas, FaUserLock } from "react-icons/fa";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-8">
          <div className="flex items-center">
            <FaShieldAlt className="text-white h-10 w-10" />
            <h1 className="ml-3 text-3xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="mt-2 text-blue-100">Last Updated: June 1, 2025</p>
        </div>
        
        <div className="py-8 px-8">
          <p className="text-gray-600 mb-8">
            At CareerAgent, we value your privacy and are committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
          </p>
          
          <div className="space-y-10">
            {/* Section: Information We Collect */}
            <section>
              <div className="flex items-center mb-4">
                <FaUserShield className="h-6 w-6 text-blue-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-800">Information We Collect</h2>
              </div>
              <div className="pl-9">
                <p className="text-gray-600 mb-3">
                  We collect information that you provide directly to us when you:
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-2">
                  <li>Create an account or update your profile</li>
                  <li>Upload your resume or CV</li>
                  <li>Apply for jobs through our platform</li>
                  <li>Communicate with our chatbots or other users</li>
                  <li>Submit feedback or contact our support team</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  This information may include your name, email address, phone number, employment history, education, and other information relevant to job applications.
                </p>
              </div>
            </section>
            
            {/* Section: How We Use Your Information */}
            <section>
              <div className="flex items-center mb-4">
                <FaDatabase className="h-6 w-6 text-blue-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-800">How We Use Your Information</h2>
              </div>
              <div className="pl-9 text-gray-600 space-y-3">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process job applications and connect job seekers with recruiters</li>
                  <li>Personalize your experience and content</li>
                  <li>Communicate with you about our services, updates, and job opportunities</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Protect against fraudulent or unauthorized activity</li>
                </ul>
              </div>
            </section>
            
            {/* Section: Cookies */}
            <section>
              <div className="flex items-center mb-4">
                <FaCookieBite className="h-6 w-6 text-blue-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-800">Cookies and Tracking Technologies</h2>
              </div>
              <div className="pl-9 text-gray-600">
                <p className="mb-3">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information.
                  Cookies are files with a small amount of data which may include an anonymous unique identifier.
                </p>
                <p>
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
              </div>
            </section>
            
            {/* Section: Data Sharing */}
            <section>
              <div className="flex items-center mb-4">
                <FaGlobeAmericas className="h-6 w-6 text-blue-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-800">Sharing Your Information</h2>
              </div>
              <div className="pl-9 text-gray-600">
                <p className="mb-3">We may share your personal information with:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Recruiters and employers when you apply for jobs</li>
                  <li>Service providers who perform services on our behalf</li>
                  <li>Professional advisors such as lawyers, auditors, and insurers</li>
                  <li>Government authorities when required by law</li>
                </ul>
                <p className="mt-3">
                  We do not sell your personal information to third parties.
                </p>
              </div>
            </section>
            
            {/* Section: Your Rights */}
            <section>
              <div className="flex items-center mb-4">
                <FaUserLock className="h-6 w-6 text-blue-600" />
                <h2 className="ml-3 text-xl font-semibold text-gray-800">Your Privacy Rights</h2>
              </div>
              <div className="pl-9 text-gray-600">
                <p className="mb-3">Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of your personal information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to processing of your personal information</li>
                  <li>Request restriction of processing your personal information</li>
                  <li>Request transfer of your personal information</li>
                  <li>Withdraw consent where we rely on consent to process your information</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, please contact us at careeragentpro@gmail.com.
                </p>
              </div>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at:{" "}
              <a href="mailto:careeragentpro@gmail.com" className="text-blue-600 hover:underline">
                careeragentpro@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 