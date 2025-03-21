import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import JobListingCard from '../jobCandidate/SearchJobs/components/JobListingCard';
import JobListingDescription from '../jobCandidate/SearchJobs/components/JobListingDescription';
import CryptoJS from 'crypto-js';

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

  const login = async e => {
    e.preventDefault();
    setLoginError('');
    setLoadingLogin(true);
    try {
      const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.REACT_APP_SECRET_KEY).toString();
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, password: encryptedPassword, role: 'JobSeeker' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      localStorage.setItem('token', json.token);
      setToken(json.token);
    } catch(err) {
      setLoginError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    setLoadingData(true);
    (async () => {
      try {
        const jobRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/joblistings/getJobListing/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!jobRes.ok) throw new Error('Failed to fetch job');
        const { jobListing: listing } = await jobRes.json();
        setJobListing(listing);

        const userRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/user-details?email=${encodeURIComponent(email)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!userRes.ok) {
          const err = await userRes.json();
          throw new Error(err.message);
        }
        setUser(await userRes.json());
      } catch(err) {
        setDataError(err.message);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [token, id, email]);

  if (!token) {
    return (
      <div className="flex flex-col space-y-6 w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md mx-auto mt-16 animate-slide-in">
        <h2 className="text-3xl font-bold text-gray-800 text-center">Please enter your details to continue</h2>
        <form onSubmit={login} className="space-y-4">
          <input type="email" name="email" value={email} readOnly className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-400" />
          <input type="password" placeholder="Password *" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-400" />
          {loginError && <p className="text-red-600 text-center">{loginError}</p>}
          <button type="submit" disabled={loadingLogin} className="w-full py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-lg disabled:opacity-50">
            {loadingLogin ? 'Validating...' : 'Continue'}
          </button>
        </form>
      </div>
    );
  }

  if (loadingData) return <div className="text-center mt-8">Loading…</div>;
  if (dataError) return <div className="text-center mt-8 text-red-600">Error: {dataError}</div>;
  if (!jobListing?._id) return <div className="text-center mt-8">No job listing found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Left side - Job Listing Card */}
        <div className="w-full lg:w-2/5">
          <JobListingCard
            jobListing={jobListing}
            user={user}
            onJobSelect={() => {}}
            setShowModal={() => {}}
            showNotification={() => {}}
            setRenderingConversationKey={() => {}}
            setRenderingConversationData={() => {}}
            showOnlyApply={true}
          />
        </div>

        {/* Right side - Job Description */}
        <div className="w-full lg:w-3/5">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h3>
            <div className="overflow-y-auto max-h-[70vh] pr-2">
              <JobListingDescription jobListing={jobListing} />
            </div>
          </div>
      </div>

      <p className="text-center text-gray-600 text-lg mt-8 max-w-2xl mx-auto">
        If you'd like to chat with the recruiter or talk with our interviewer chatbot for this role, please log in to our site and search for this job role there.
      </p>
    </div>
  );
};

export default JobListingPage;