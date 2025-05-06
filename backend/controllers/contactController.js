const { sendContactFormEmail } = require('../utils/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Send email using the email service
    await sendContactFormEmail(fullName, email, subject, message);

    res.status(200).json({ success: true, message: 'Your message has been sent successfully' });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Failed to send your message. Please try again later.' });
  }
};

module.exports = {
  submitContactForm
}; 