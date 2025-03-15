const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
const JobSeeker = require('../models/jobSeekerModel');
const Recruiter = require('../models/recruiterModel');

const unsubscribeUser = async (req, res) => {
  try {
    // Extract email and AES encoded pin from the request body
    const { email, pin } = req.body;
    if (!email || !pin) {
      return res.status(400).json({ message: "Email and pin are required." });
    }
    
    // Check if user exists in JobSeeker or Recruiter model
    let user = await JobSeeker.findOne({ email });
    if (!user) {
      user = await Recruiter.findOne({ email });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Check if the user is already unsubscribed
    if (user.isSubscribed === false) {
      return res.status(200).json({ message: "You are already unsubscribed." });
    }
    
    // Decrypt the AES encoded pin using CryptoJS and validate its format
    const decryptedPin = CryptoJS.AES.decrypt(pin, process.env.SECRET_KEY).toString(CryptoJS.enc.Utf8);
    if (!/^\d{6}$/.test(decryptedPin)) {
     return res.status(400).json({ message: 'PIN must be a 6-digit number.' });
    }
    
    // Compare the decrypted pin with the stored hashed pin using bcrypt
    const isMatch = await bcrypt.compare(decryptedPin, user.pin);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid pin." });
    }

    // Update the user's isSubscribed field to false
    user.isSubscribed = false;
    await user.save();
    
    res.status(201).json({ message: "Successfully unsubscribed." });
  } catch (error) {
    console.error("Error in unsubscribeUser controller:", error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = unsubscribeUser;
