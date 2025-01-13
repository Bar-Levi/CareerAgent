import React, { useState } from "react";

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState({
    "Login & Registration": [
      { question: "How do I register on the platform as a Job Candidate?", answer: "As a Job Candidate, you can register by filling out the registration form with your full name, email, and password. Optionally, you can upload your CV, LinkedIn URL, GitHub URL, phone number, and profile picture to enhance your profile." },
      { question: "How do I register on the platform as a Recruiter?", answer: "As a Recruiter, you can register by providing company-related details such as your full name, email, password, company name, company size, and an optional company website or recruiter profile picture." },
      { question: "What are the password requirements for registration?", answer: "Your password must be at least 8 characters long, include uppercase and lowercase letters, a number, and a special character." },
      { question: "What happens after I register?", answer: "Once you register, you will receive a PIN code and a  verification email. You must verify your email to activate your account. Unverified accounts will have limited access." },
      { question: "What is the PIN code I receive after registration?", answer: "The PIN code is a unique 6-digit code provided during registration. It is essential to save this code as it is required for future sensitive actions like resetting your password." },
      { question: "What should I do if I lose my PIN code?", answer: "If you cannot find your PIN code, please contact us at our email: careeragentpro@gmail.com. We will securely generate a new PIN code for you." },
      { question: "How do I recover my password if I forget it?", answer: "Click on the 'Forgot Password' button on the login page. Enter your email and secret PIN code, and you'll receive a password reset link via email, which you can use to create a new password." },
      { question: "Is Two-Factor Authentication (2FA) available?", answer: "Yes, Two-Factor Authentication (2FA) is available during registration via email verification to add an extra layer of security. However, 2FA is not required during login to ensure user convenience." },
      { question: "Can I change my registered email address?", answer: "No, you cannot change your registered email address. If you need assistance, please contact support at careeragentpro@gmail.com." },
      { question: "How do I update my profile details?", answer: "You can update your personal details, including your profile picture, LinkedIn URL, and GitHub URL inside your profile page." },
    ],
    "Job Search": [
      { question: "Can I filter jobs on the platform?", answer: "Yes, you can filter jobs by location, industry, specific roles, or a combination of these to refine your search results." },
      { question: "What if I don’t find any jobs matching my filters?", answer: "You’ll receive a notification if no matching jobs are found. You can modify your search criteria or update your profile for better recommendations." },
      { question: "How are job results sorted?", answer: "Job results are sorted from the most relevant to the least relevant, based on your filters and resume details." },
      { question: "Can I save jobs that I’m interested in?", answer: "Yes, you can save jobs by clicking the 'Save Job' button on the job post. Saved jobs will appear in your dashboard." },
      { question: "How do I apply for a job?", answer: "You can apply for a job by clicking the 'Apply' button on the job post and submitting your application." },
      { question: "Can I upload a new resume for job applications?", answer: "Yes, you can upload a new resume by visiting your dashboard and selecting the 'Upload Resume' option." },
    ],
    "Chatbots": [
      { question: "What chatbots are available on the platform?", answer: "The platform offers two chatbots: Interview Preparation Chatbot and Career Path Advisor Chatbot." },
      { question: "Can I view my chatbot conversation history?", answer: "Yes, free users can view the last 10 conversations with each chatbot. Premium users have unlimited access to their chatbot conversation history without any restrictions." },
      { question: "Are there message limits in chatbot conversations?", answer: "Yes, free users are limited to 100 messages per conversation to maintain performance. Premium users can enjoy unlimited messages in their chatbot conversations." },
      { question: "How do I start a conversation with a chatbot?", answer: "Click on the respective chatbot's button on the chatbot page to initiate a conversation." },
      { question: "Can the chatbots help me with specific job applications?", answer: "Yes, the Interview Preparation Chatbot can access the job details and help you prepare for the interview, while the Career Path Advisor Chatbot can guide you on the subjects you need to learn before the interview based on your profile and interests. Free users will need to manually enter the job details when starting a chatbot session. Premium users will have a convenient 'Start a Chat with a Career Advisor' & 'Start a Chat with an Interviewer' buttons on each job post, which automatically provides the job details to the chatbot and initiates the conversation." },
      { question: "What happens if I lose internet connection during a chatbot session?", answer: "Your session will be saved automatically, and you can resume the conversation once the connection is restored." },
      { question: "Are the chatbots’ responses tailored to my profile?", answer: "On the premium version, chatbots provide personalized responses by automatically accessing your profile using the 'Sync Profile' toggle. Free users, however, need to manually input their details during each chatbot session." },
    ],
    "Security": [
      { question: "What happens if I exceed login attempts?", answer: "You are limited to 7 login attempts. After that, you will be required to verify your identity using a 6-digit PIN provided during registration." },
      { question: "Are my personal data and conversations secure?", answer: "Yes, the platform uses industry-standard encryption protocols and JWT-based authentication to ensure data security." },
      { question: "How is my data used on the platform?", answer: "Your data is used to enhance your experience, such as personalized job recommendations and chatbot interactions. It is never shared with third parties without your consent." },
      { question: "Can I delete my account?", answer: "Yes, you can request account deletion through your dashboard under 'Account Settings'." },
      { question: "What measures are in place to prevent unauthorized access?", answer: "We use encryption, limited login attempts, Two-Factor Authentication (2FA), middleware, JWT tokens, and regular security updates to prevent unauthorized access and ensure the safety of user data." },
    ],
    "General": [
      { question: "What browsers are supported by the platform?", answer: "The platform works on all modern browsers, including Chrome, Firefox, Safari, and Edge." },
      { question: "Is there a mobile app?", answer: "Currently, there isn't a mobile app available. Any future plans for a mobile app will be announced on our platform." },
      { question: "How do I contact support?", answer: "You can get assistance from the chatbot located at the bottom-right corner of the website for general inquiries. For a personalized response, you can contact support via email at careeragentpro@gmail.com." },
    ],
    "Premium Features vs Free Features": [
        { question: "What is the difference in chatbot usage for free and premium users?", answer: "Free users need to manually input job details or profile information during chatbot sessions. Premium users can use the 'Sync Profile' toggle to allow chatbots to automatically access their profile data for personalized responses." },
        { question: "Are there limits to chatbot conversation history?", answer: "Yes, free users can view the last 10 conversations per chatbot. Premium users have unlimited access to their chatbot conversation history." },
        { question: "Are there message limits in chatbot conversations?", answer: "Free users are limited to 100 messages per chatbot session to maintain performance. Premium users enjoy unlimited messages in chatbot conversations." },
        { question: "Can chatbots automatically use job data for applications?", answer: "Free users must manually enter job details during chatbot sessions. Premium users have a 'Start a Chat with...' button on each job post, which automatically shares the job data with the chatbot and starts the conversation." },
        { question: "Are there additional benefits for premium users?", answer: "Yes, premium users have features such as unlimited chatbot history, no message limits and automated profile and job data syncing." },
    ],
  });
  

  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const toggleAnswer = (subject, index) => {
    setFaqs((prevFaqs) => ({
      ...prevFaqs,
      [subject]: prevFaqs[subject].map((faq, i) =>
        i === index ? { ...faq, open: !faq.open } : faq
      ),
    }));
  };

  const filteredFaqs = Object.keys(faqs).reduce((acc, subject) => {
    const filtered = faqs[subject].filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery)
    );
    if (filtered.length > 0) {
      acc[subject] = filtered;
    }
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-brand-primary p-5 font-sans">
      <header className="w-fit bg-gray-800 text-brand-accent py-4 text-center border-b border-gray-700">
        <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
      </header>

      <div className="my-6 text-center">
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-4/5 p-2 text-brand-bg-brand-primary text-lg text-brand-primary bg-gray-200 rounded border border-gray-400 focus:outline-none focus:ring focus:ring-brand-accent"
        />
      </div>

      <div>
        {Object.keys(filteredFaqs).map((subject) => (
          <div key={subject} className="mb-8">
            <h2 className="text-xl font-bold text-brand-accent mb-4">{subject}</h2>
            {filteredFaqs[subject].map((faq, index) => (
              <div
                key={index}
                className="border border-gray-700 rounded bg-gray-800 p-4 mb-4"
              >
                <h3
                  onClick={() => toggleAnswer(subject, index)}
                  className="text-lg font-semibold cursor-pointer text-brand-accent"
                >
                  {faq.question}
                </h3>
                {faq.open && <p className="mt-2 text-gray-300">{faq.answer}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
