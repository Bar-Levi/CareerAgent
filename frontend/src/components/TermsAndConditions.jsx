import React from 'react';

const TermsAndConditions = () => {
    const handleClose = () => {
        window.close(); // Close the browser tab or window
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl bg-white rounded-lg shadow-lg p-8 space-y-6">
                <h1 className="text-4xl font-bold text-gray-800 text-center">Terms and Conditions</h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                    Welcome to <strong>CareerAgent</strong>, and thank you for choosing to join our platform. Please review
                    the following Terms and Conditions carefully before registering or using our services. By creating an
                    account, you confirm that you have read, understood, and agreed to these Terms.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">1. Eligibility</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    1.1. You must be at least 18 years old to register as a recruiter or job seeker.<br />
                    1.2. You agree to provide accurate, current, and complete information during registration.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">2. Account Responsibilities</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    2.1. You are responsible for maintaining the confidentiality of your account credentials and ensuring that no unauthorized person accesses your account.<br />
                    2.2. You agree not to share your login credentials or use another person’s account without permission.<br />
                    2.3. CareerAgent will not be held liable for any unauthorized access or use of your account.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">3. User Conduct</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    3.1. You agree to use the platform in a lawful and respectful manner.<br />
                    3.2. You must not upload or distribute any harmful, misleading, or illegal content.<br />
                    3.3. You agree not to use the platform to discriminate or harass others based on race, gender, religion, or any other characteristic.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">4. Prohibited Activities</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    4.1. Engaging in any activity that disrupts the functionality or security of our platform is strictly prohibited.<br />
                    4.2. You must not engage in data scraping, unauthorized access, or any activity that infringes on the intellectual property of CareerAgent or other users.<br />
                    4.3. The use of fake profiles or impersonation is strictly prohibited.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">5. Data Privacy</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    5.1. By using the platform, you consent to the collection and use of your personal data as outlined in our Privacy Policy.<br />
                    5.2. We are committed to safeguarding your personal data and ensuring its use complies with applicable laws and regulations.<br />
                    5.3. You must not use, distribute, or exploit any information or data obtained from other users of the platform for your personal or professional advantage.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">6. Termination</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    6.1. CareerAgent reserves the right to terminate or suspend your account at any time if you violate these Terms or engage in unauthorized activities.<br />
                    6.2. You may request account deactivation at any time by contacting our support team.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">7. Limitation of Liability</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    7.1. CareerAgent is not liable for any loss or damage arising from your use of the platform.<br />
                    7.2. We do not guarantee continuous or uninterrupted access to the platform and may update or discontinue services at any time.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">8. Amendments</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    8.1. CareerAgent reserves the right to modify these Terms and Conditions at any time.<br />
                    8.2. Users will be notified of significant changes to the Terms, and continued use of the platform will constitute acceptance of the updated Terms.
                </p>

                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                    If you have any questions or concerns about these Terms, please contact us at <a href="mailto:support@careeragent.com" className="text-blue-500 hover:underline">support@careeragent.com</a>.
                </p>

                <div className="text-center">
                    <button
                        onClick={handleClose}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-6 rounded-lg font-bold hover:scale-105 transition-transform duration-200"
                    >
                        Close the Terms and Conditions
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
