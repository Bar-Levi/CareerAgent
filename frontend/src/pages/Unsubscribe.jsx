import React, { useState } from 'react';
import Notification from '../components/Notification';
import Botpress from '../botpress/Botpress';
import CryptoJS from 'crypto-js';

const Unsubscribe = () => {
  const [formData, setFormData] = useState({ email: '', secretPin: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const showNotification = (type, message) => {
    setMessage({ type, message });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.secretPin) {
      showNotification('error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Encrypt the secret PIN before sending it to the backend
      const encryptedPin = CryptoJS.AES.encrypt(
        formData.secretPin,
        process.env.REACT_APP_SECRET_KEY
      ).toString();

      const payload = { email: formData.email, pin: encryptedPin };

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/mailNotifications/unsubscribe`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showNotification('error', errorData.message);
        setLoading(false);
        return;
      }

      const data = await response.json();
      showNotification('success', `${data.message} You can now close this window.`);
    } catch (error) {
      showNotification('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {message && (
        <Notification
          type={message.type}
          message={message.message}
          onClose={() => setMessage(null)}
        />
      )}
      <Botpress />
      <div className="flex flex-col space-y-6 w-full bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 max-w-md transform hover:scale-105 transition-transform duration-500 animate-slide-in">
        <h2 className="text-3xl font-bold text-gray-800 text-center font-orbitron">
          Unsubscribe from Notifications
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
            required
          />
          <div className="relative">
            <input
              type="text"
              name="secretPin"
              placeholder="Secret PIN *"
              value={formData.secretPin}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg border border-gray-400 placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all duration-300"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-bold rounded-lg focus:ring-2 transition-all duration-200 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:scale-105'
            }`}
          >
            {loading ? 'Processing...' : 'Unsubscribe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Unsubscribe;
