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
                    2.3. CareerAgent will not be held liable for any unauthorized access or use of your account.<br />
                    2.4. Upon registration, a unique 6-digit PIN code will be shown to you. You must save this PIN securely, as it will not be displayed again.<br />
                    2.5. This PIN is required for sensitive operations, such as resetting your password or login attempts.<br />
                    2.6. In case you lose your PIN, you must contact CareerAgent. After a validation process, we will generate a new PIN for you.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">3. User Conduct</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    3.1. You agree to use the platform in a lawful and respectful manner.<br />
                    3.2. You must not upload or distribute any harmful, misleading, or illegal content.<br />
                    3.3. You agree not to use the platform to discriminate or harass others based on race, gender, religion, or any other characteristic.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">4. Privacy and Data Usage</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    4.1. By using CareerAgent, you consent to the collection, processing, and use of your data in accordance with our Privacy Policy.<br />
                    4.2. We implement industry-standard security measures to protect your personal information from unauthorized access or misuse.<br />
                    4.3. Content uploaded to the platform, such as images or documents, may be processed to enable platform functionality. Avoid uploading sensitive personal information.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">5. Content Accessibility</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    5.1. Uploaded content may be publicly accessible depending on your settings.<br />
                    5.2. You are responsible for ensuring that any content uploaded complies with applicable laws and does not infringe on third-party rights.<br />
                    5.3. CareerAgent reserves the right to remove content deemed harmful, inappropriate, or in violation of these Terms.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">6. Data Retention and Deletion</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    6.1. We retain your data only as long as necessary to provide the services or comply with legal obligations.<br />
                    6.2. Upon account termination, your data will be deleted, except where retention is required for compliance with legal or financial obligations.<br />
                    6.3. Aggregated, non-identifiable data may be retained for analytical purposes.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">7. Termination</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    7.1. CareerAgent reserves the right to terminate or suspend your account at any time if you violate these Terms or engage in unauthorized activities.<br />
                    7.2. You may request account deactivation at any time by contacting our support team.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">8. Amendments</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    8.1. CareerAgent reserves the right to modify these Terms and Conditions at any time.<br />
                    8.2. Users will be notified of significant changes to the Terms, and continued use of the platform will constitute acceptance of the updated Terms.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800">9. Feedback on Missing Job Roles or Fields</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                    9.1. If you notice that a specific job role or other relevant field is missing in the job search, please contact us.<br />
                    9.2. We will review your request promptly and strive to improve the platform to meet user needs.
                </p>

                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                    If you have any questions or concerns about these Terms, please contact us at <a href="mailto:careeragentrb@gmail.com?subject=Questions%20about%20Terms%20and%20Conditions" className="text-blue-500 hover:underline">careeragentrb@gmail.com</a>.
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
