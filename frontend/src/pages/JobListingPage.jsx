import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { isAuthenticated } from '../utils/auth';
import { parseJobDescription } from '../utils/parseJobDescription';
import Notification from '../components/Notification';


const JobListingPage = () => {
  const { id } = useParams();
  const { search } = useLocation();
  const email = new URLSearchParams(search).get('email') || '';

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [jobListing, setJobListing] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });


  // For handling the apply flow
  const [showModal, setShowModal] = useState(false);
  // Track whether the user has already applied
  const [hasApplied, setHasApplied] = useState(false);

  const login = async e => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);
    try {
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        process.env.REACT_APP_SECRET_KEY
      ).toString();

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: encryptedPassword,
          role: 'JobSeeker'
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      localStorage.setItem('token', json.token);
      setToken(json.token);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  useEffect(() => {
    // If there's no token or token is invalid/expired, do NOT fetch the job
    if (!token || !isAuthenticated(token)) {
      setToken(null); // Clear any invalid token
      localStorage.removeItem('token');
      return;
    }

    setLoadingData(true);

    (async () => {
      try {
        // Fetch job listing
        const jobRes = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/getJobListing/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!jobRes.ok) throw new Error('Failed to fetch job');
        const { jobListing: listing } = await jobRes.json();
        setJobListing(listing);

        // Fetch user details
        const userRes = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(
            email
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!userRes.ok) {
          const err = await userRes.json();
          throw new Error(err.message);
        }
        const userData = await userRes.json();
        setUser(userData);

        // Check if the user has already applied
        // We'll look for the user's ID in the job's applicants array (if it exists)
        if (listing && listing.applicants && Array.isArray(listing.applicants)) {
          const alreadyApplied = listing.applicants.some(
            (app) => app.jobSeekerId === userData._id
          );
          setHasApplied(alreadyApplied);
        }
      } catch (err) {
        setDataError(err.message);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [token, id, email]);

  // If token is null or invalid, show the login form
  if (!token) {
    return (
      <div className="flex flex-col space-y-6 w-full bg-gradient-to-br from-indigo-50 to-blue-50 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md mx-auto mt-16 animate-slide-in border border-indigo-100">
        <h2 className="text-3xl font-bold text-indigo-900 text-center">Enter Details to view this opportunity</h2>
        <form onSubmit={login} className="space-y-4">
          <input
            type="email"
            name="email"
            value={email}
            readOnly
            className="w-full px-4 py-3 bg-white/80 rounded-xl border border-indigo-200 backdrop-blur-sm"
          />
          <input
            type="password"
            placeholder="Password *"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/80 rounded-xl border border-indigo-200 backdrop-blur-sm"
          />
          {loginError && <p className="text-red-600 text-center font-medium">{loginError}</p>}
          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50 transition-all hover:shadow-lg hover:from-indigo-700 hover:to-blue-700"
          >
            {loadingLogin ? 'Validating...' : 'Continue'}
          </button>
        </form>
      </div>
    );
  }

  if (loadingData)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );

  if (dataError)
    return (
      <div className="text-center mt-8 bg-red-50 p-6 rounded-xl border border-red-200 max-w-lg mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-red-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-red-800 font-medium">Error: {dataError}</p>
      </div>
    );

  if (!jobListing?._id)
    return (
      <div className="text-center mt-8 bg-yellow-50 p-6 rounded-xl border border-yellow-200 max-w-lg mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-yellow-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-yellow-800 font-medium">No job listing found</p>
      </div>
    );

  // Helper to format the date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Decide how to color the status pill
  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-400';
      case 'closed':
        return 'bg-red-100 text-red-700 border border-red-400';
      default:
        return 'bg-green-100 text-green-700 border border-green-400';
    }
  };
  
  // extract needed values for apply logic
  const jobId = jobListing._id;
  const jobRole = jobListing.jobRole;
  const recruiterId = jobListing.recruiterId;

  // A job can be applied to only if it's "active"
  const canApply = jobListing.status?.toLowerCase() === 'active';

  const handleApplyNow = async () => {
    // If the user has no CV, show a modal or handle as you like
    if (!user.cv || user.cv === '') {
      setShowModal(true);
      return;
    }

    // If user has already applied, we can block or show a message.
    if (hasApplied) {
      setNotification({ message: 'You have already applied for this job.', type: 'error' });
      return;
    }

    try {
      const applicantResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/applicants`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: user.fullName,
            email: user.email,
            phone: user.phone,
            linkedinUrl: user.linkedinUrl,
            githubUrl: user.githubUrl,
            cv: user.cv,
            isSubscribed: user.isSubscribed,
            profilePic: user.profilePic,
            jobId: jobId,
            recruiterId: recruiterId,
            jobSeekerId: user._id,
            jobTitle: jobRole
          })
        }
      );

      const applicantData = await applicantResponse.json();
      if (applicantResponse.ok) {
        console.log('Applicant created successfully:', applicantData);

        const updateJobResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/joblistings/${jobId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              $push: {
                applicants: {
                  applicantId: applicantData.applicant._id,
                  jobSeekerId: user._id
                }
              }
            })
          }
        );

        if (updateJobResponse.ok) {
          console.log('Job listing updated with new applicant.');
          setHasApplied(true); // Mark user as applied
          setNotification({ message: 'Application successful!', type: 'success' });
        } else {
          setNotification({ message: 'There was a problem updating the job listing.', type: 'error' });
        }
      } else {
        // Possibly handle "already applied" scenario from the backend
        if (applicantData.message && applicantData.message.includes('already applied')) {
          setHasApplied(true);
          setNotification({ message: "You've already applied for this job!", type: 'error' });
        } else {
          setNotification({ message: 'There was a problem submitting your application.', type: 'error' });
        }
      }
    } catch (err) {
      console.log('Error applying:', err);
      setNotification({ message: 'An error occurred while applying. Please try again later.', type: 'error' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
          {notification.message && (
        <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification({ message: '', type: '' })} 
        />
    )}
        {/* Job Header Section */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Company Logo/Image Section */}
            
              {jobListing.company && (
                <div className="mt-6 w-26 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src={jobListing.companyLogo || "https://via.placeholder.com/80"} // Fallback if needed
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            

          {/* Job Title and Meta Section */}
          <div className="w-full md:w-3/4 p-6 space-y-2">
            <div className="flex flex-col-reverse md:flex-row md:items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{jobListing.jobRole}</h1>
              <div className="mb-2 md:mb-0">
              <span
                className={`inline-flex items-center px-3 py-1 text-sm font-medium ${getStatusClasses(
                  jobListing.status
                )} rounded-full`}
              >
                <span className={`w-2 h-2 rounded-full mr-2 bg-current`} />
                {jobListing.status || 'Active'}
              </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center text-gray-700">
              <div className="flex items-center mr-4 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span>{jobListing.company}</span>
              </div>

              <div className="flex items-center mr-4 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{jobListing.location}</span>
              </div>

              <div className="flex items-center mr-4 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span>{jobListing.experienceLevel}</span>
              </div>

              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {jobListing.jobType
                    ? Array.isArray(jobListing.jobType)
                      ? jobListing.jobType.join(', ')
                      : jobListing.jobType
                    : 'Full Time'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center">
              <div className="flex items-center mr-4 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span>Posted on {formatDate(jobListing.createdAt || '3/21/2025')}</span>
              </div>

              {jobListing.closingTime && (
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Closes {formatDate(jobListing.closingTime)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Job Description Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
            </div>
            <div className="p-6 prose max-w-none">
              {parseJobDescription(jobListing.description)}
            </div>
          </div>

          {/* Requirements Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="border-b border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobListing.education && jobListing.education.length > 0 && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                    <p>
                      {Array.isArray(jobListing.education)
                        ? jobListing.education.join(', ')
                        : jobListing.education}
                    </p>
                  </div>
                )}

                {jobListing.workExperience && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience Required</h3>
                    <p>{jobListing.workExperience} years</p>
                  </div>
                )}

                {jobListing.securityClearance && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Security Clearance</h3>
                    <p>{jobListing.securityClearance}</p>
                  </div>
                )}

                {jobListing.languages && jobListing.languages.length > 0 && (
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                    <p>
                      {Array.isArray(jobListing.languages)
                        ? jobListing.languages.join(', ')
                        : jobListing.languages}
                    </p>
                  </div>
                )}
              </div>

              {jobListing.skills && jobListing.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap">
                    {Array.isArray(jobListing.skills)
                      ? jobListing.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-block px-3 py-1 mr-2 mb-2 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full"
                          >
                            {skill}
                          </span>
                        ))
                      : jobListing.skills
                          .split(',')
                          .map((skill) => (
                            <span
                              key={skill}
                              className="inline-block px-3 py-1 mr-2 mb-2 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Apply Card & Company Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Apply Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden sticky top-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Apply for this position</h2>

              <div className="flex flex-col space-y-4">
                {/* If the job isn't active, show a message instead of the apply button */}
                {!canApply ? (
                  <div className="text-red-700 font-medium">
                    This job is not accepting new applications (Status: {jobListing.status}).
                  </div>
                ) : hasApplied ? (
                  <div className="text-green-700 font-medium">
                    You have already applied to this job.
                  </div>
                ) : (
                  <button
                    onClick={handleApplyNow}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all"
                  >
                    Apply Now
                  </button>
                )}
              </div>

              <div className="border-t border-indigo-100 mt-6 pt-6">
                <h3 className="font-medium text-gray-700 mb-2">Job Details</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Experience Level</p>
                      <p className="text-gray-600">{jobListing.experienceLevel}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Job Type</p>
                      <p className="text-gray-600">
                        {jobListing.jobType
                          ? Array.isArray(jobListing.jobType)
                            ? jobListing.jobType.join(', ')
                            : jobListing.jobType
                          : 'Full Time'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{jobListing.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-indigo-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <div>
                      <p className="font-medium">Work Setup</p>
                      <p className="text-gray-600">{jobListing.remote || 'Hybrid'}</p>
                    </div>
                  </div>

                  {jobListing.companySize && (
                    <div className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-indigo-500 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">Company Size</p>
                        <p className="text-gray-600">{jobListing.companySize}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recruiter Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Posted by</h2>

              <div className="flex items-center">
                {jobListing.recruiterProfileImage ? (
                  <img
                    src={jobListing.recruiterProfileImage}
                    alt={jobListing.recruiterName || 'Recruiter'}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {(jobListing.recruiterName || 'R').charAt(0)}
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-900">{jobListing.recruiterName}</p>
                  <p className="text-sm text-gray-600">Talent Acquisition</p>
                </div>
              </div>

              {jobListing.companyWebsite && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={jobListing.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    </svg>
                    Company Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA removed */}

      {/* Modal if CV is missing */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-md text-center">
            <h2 className="text-lg mb-4 font-semibold">No CV found</h2>
            <p className="mb-6">
              Please upload your CV in your profile before applying to a job.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListingPage;
