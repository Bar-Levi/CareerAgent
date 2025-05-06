const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

// Create a transport based on environment
let transporter;

// In test environment, use a mock transport that doesn't connect to any server
if (process.env.NODE_ENV === 'test') {
  console.log('Test environment detected, using mock transport');
  
  // Create a mock transport that doesn't make actual connections
  transporter = {
    sendMail: (mailOptions) => {
      console.log(`[TEST] Email would be sent to: ${mailOptions.to}`);
      return Promise.resolve({ messageId: 'test-message-id' });
    },
    verify: (callback) => {
      callback(null, true);
    },
    close: () => {}
  };
} else {
  // Real SMTP transport for non-test environments
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify the SMTP connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('- SMTP server connection successful');
    }
  });
}

const sendVerificationCode = async (email, username, code) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your CareerAgent Account',
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Verify Your CareerAgent Account</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; color: #333; background-color: #ffffff; line-height: 1.6;">
                    <p>Hello ${username},</p>
                    <p>Thank you for signing up for CareerAgent. Use the verification code below to complete your registration:</p>
                    <!-- Code Box -->
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="
                            display: inline-block;
                            font-size: 24px;
                            font-weight: bold;
                            color: #2c2c54;
                            background-color: #f0f0f0;
                            border: 2px dashed #2c2c54;
                            padding: 10px 20px;
                            border-radius: 8px;
                        ">
                            ${code}
                        </span>
                    </div>
                    <p>This code will expire in 1 minute.</p>
                    <p>If you did not sign up for CareerAgent, please ignore this email.</p>
                    <p style="margin-top: 20px;">Best regards,</p>
                    <p><strong>The CareerAgent Team</strong></p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px; color: #555;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

// Send Password Reset Email
const sendResetPasswordEmail = async (email, username, resetUrl, resetToken) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your Password - CareerAgent Team',
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Reset Your Password</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; color: #333; background-color: #ffffff; line-height: 1.6;">
                    <p>Hello ${username},</p>
                    <p>We received a request to reset your password. Please follow the instructions below:</p>
                    <ol>
                        <li>
                            Copy this reset token:
                            <span style="
                                display: inline-block;
                                font-size: 18px;
                                font-weight: bold;
                                color: #2c2c54;
                                background-color: #f0f0f0;
                                border: 2px dashed #2c2c54;
                                padding: 5px 10px;
                                border-radius: 8px;
                                margin: 10px 0;
                                display: inline-block;
                            ">
                                ${resetToken}
                            </span>
                        </li>
                        <li>
                            Click the link below to reset your password:
                            <br />
                            <a href="${resetUrl}" target="_blank" style="color: #2c2c54; text-decoration: none; font-weight: bold;">Reset Password</a>
                        </li>
                        <li>Enter the reset token and your new password on the reset password page.</li>
                    </ol>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px; color: #555;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

// Generate Reset Token
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

// Send a mail for job notification.
const sendJobNotificationEmail = async (
    email,
    jobListing,
    type = "jobListingMatch"
  ) => {
    try {
      let subject;
      let htmlContent;
  
      // Customize subject and HTML based on 'type'
      if (type === "jobListingDeleted") {
        subject = `Removed Job Listing: ${jobListing.jobRole} at ${jobListing.company}`;
        htmlContent = `
          <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #b33939; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">Job Listing Removed</h1>
            </div>
            <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
              <p>Hello,</p>
              <p>We wanted to let you know that a job listing you were interested in has been removed:</p>
              <p><strong>Job Role:</strong> ${jobListing.jobRole}</p>
              <p><strong>Company:</strong> ${jobListing.company}</p>
              <p><strong>Location:</strong> ${jobListing.location}</p>
              <p>If you had already applied or were considering applying, you may wish to explore other opportunities on our platform.</p>
              <p>We apologize for any inconvenience. Thank you for using CareerAgent.</p>
              <p><strong>The CareerAgent Team</strong></p>
              <p style="font-size: 12px; color: #777;">
                If you wish to unsubscribe from these notifications, please 
                <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #b33939; text-decoration: none;">click here</a>.
              </p>
            </div>
            <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
            </div>
          </div>
        `;
      } else {
        // Default to jobListingMatch
        subject = `New Relevant Job Listing: ${jobListing.jobRole} at ${jobListing.company}`;
        htmlContent = `
          <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 24px;">New Job Listing Alert!</h1>
            </div>
            <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
              <p>Hello,</p>
              <p>A new job listing that might be relevant to you has been posted:</p>
              <p><strong>Job Role:</strong> ${jobListing.jobRole}</p>
              <p><strong>Company:</strong> ${jobListing.company}</p>
              <p><strong>Location:</strong> ${jobListing.location}</p>
              <p>Check it out on our platform and apply if you're interested!</p>
              <p>Best regards,</p>
              <p><strong>The CareerAgent Team</strong></p>
              <p style="font-size: 12px; color: #777;">
                If you wish to unsubscribe from these notifications, please 
                <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #2c2c54; text-decoration: none;">click here</a>.
              </p>
              <p style="font-size: 12px; color: #777;">
                <a href="${process.env.FRONTEND_URL}/joblisting/${jobListing._id}?email=${encodeURIComponent(email)}" target="_blank">View Job Listing for Easy Apply</a>
              </p>
            </div>
            <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
            </div>
          </div>
        `;
      }
  
      const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`[${type}] Job notification email sent to ${email}`);
    } catch (error) {
      console.error(`Error sending ${type} email to ${email}:`, error);
    }
  };  

const sendRejectionEmail = async (email, username, jobListing) => {
    // If a company website is provided, include a suggestion line
    const companyWebsiteLine = jobListing.companyWebsite 
        ? `<p>You might also consider visiting <a href="${jobListing.companyWebsite}" target="_blank" style="color: #0000aa; text-decoration: none; font-weight: bold;">our website</a> to explore new opportunities.</p>` 
        : '';
    
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Application Update for ${jobListing.jobRole} at ${jobListing.company}`,
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #000000; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Application Update</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
                    <p>Hello ${username},</p>
                    <p>
                        Thank you for taking the time to apply for the position of 
                        <strong>${jobListing.jobRole}</strong> at <strong>${jobListing.company}</strong> located in <strong>${jobListing.location}</strong>.
                    </p>
                    <p>
                        After careful consideration, we have decided to move forward with other candidates for this role.
                        We truly appreciate your interest in our team and encourage you to keep an eye on future opportunities
                        that match your skills and experience.
                    </p>
                    ${companyWebsiteLine}
                    <p>
                        We wish you the very best in your job search and future endeavors.
                    </p>
                    <p style="margin-top: 20px;">Best regards,</p>
                    <p><strong>${jobListing.recruiterName} &middot; ${jobListing.company}</strong></p>
                    <p style="font-size: 12px; color: #000000;">
                      If you wish to unsubscribe from these notifications, please 
                      <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #0000aa; text-decoration: none;">click here</a>.
                    </p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px; color: #000000;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

const sendHiredEmail = async (email, username, jobListing) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Congratulations! You're Hired at ${jobListing.company}`,
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #000000; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">🎉 Congratulations! You're Hired!</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
                    <p>Dear ${username},</p>
                    <p>
                        We are delighted to inform you that you have been selected for the position of 
                        <strong>${jobListing.jobRole}</strong> at <strong>${jobListing.company}</strong> in <strong>${jobListing.location}</strong>!
                    </p>
                    <p>
                        Your skills, experience, and enthusiasm throughout the interview process impressed us, 
                        and we believe you will be a valuable addition to our team.
                    </p>
                    <p>
                        The hiring team will contact you shortly with additional details.
                    </p>
                    <p>
                        Welcome to the team! We look forward to working with you.
                    </p>
                    <p>
                        If you have any questions or need further information, please feel free to reach out.
                    </p>
                    <p style="margin-top: 20px;">Best regards,</p>
                    <p><strong>${jobListing.recruiterName} &middot; ${jobListing.company}</strong></p>
                    <p style="font-size: 12px; color: #000000;">
                        If you wish to unsubscribe from these notifications, please 
                        <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #0000aa; text-decoration: none;">click here</a>.
                    </p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px; color: #000000;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

const sendApplicationInReviewEmail = async (email, username, jobListing) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Your Application for ${jobListing.jobRole} at ${jobListing.company} is Under Review`,
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #000000; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Application Status Update</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
                    <p>Dear ${username},</p>
                    <p>
                        We wanted to let you know that your application for the position of 
                        <strong>${jobListing.jobRole}</strong> at <strong>${jobListing.company}</strong> is now under review.
                    </p>
                    <p>
                        Our recruiting team is carefully evaluating your qualifications and experience.
                        We appreciate your patience during this process and will keep you updated on any developments.
                    </p>
                    <p>
                        You can track your application status through your CareerAgent dashboard.
                    </p>
                    <p style="margin-top: 20px;">Best regards,</p>
                    <p><strong>${jobListing.recruiterName} &middot; ${jobListing.company}</strong></p>
                    <p style="font-size: 12px; color: #000000;">
                        If you wish to unsubscribe from these notifications, please 
                        <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #0000aa; text-decoration: none;">click here</a>.
                    </p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px; color: #000000;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

const sendInterviewScheduledEmailToJobSeeker = async (email, username, jobListing, recruiterName, scheduledTime, meetingLink) => {
    // Create Google Calendar link
    const startTime = new Date(scheduledTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration
    const eventTitle = encodeURIComponent(`Interview: ${jobListing.jobRole} at ${jobListing.company}`);
    const eventDescription = encodeURIComponent(`Interview with ${recruiterName} for the ${jobListing.jobRole} position at ${jobListing.company}${meetingLink ? `\n\nMeeting Link: ${meetingLink}` : ''}`);
    const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDescription}&dates=${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Interview Scheduled: ${jobListing.jobRole} at ${jobListing.company}`,
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Interview Scheduled!</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
                    <p>Hello ${username},</p>
                    <p>An interview has been scheduled for you:</p>
                    <p><strong>Position:</strong> ${jobListing.jobRole}</p>
                    <p><strong>Company:</strong> ${jobListing.company}</p>
                    <p><strong>Recruiter:</strong> ${recruiterName}</p>
                    <p><strong>Date & Time:</strong> ${new Date(scheduledTime).toLocaleString()}</p>
                    ${meetingLink ? `
                        <p><strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: #2c2c54; text-decoration: none;">${meetingLink}</a></p>
                        <p>Please add this meeting to your calendar.</p>
                    ` : '<p>Please check your dashboard for the meeting link once it\'s added by the recruiter.</p>'}
                    
                    <!-- Google Calendar Button -->
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${googleCalendarLink}" target="_blank" style="
                            display: inline-block;
                            background-color: #4285f4;
                            color: white;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 4px;
                            font-weight: bold;
                            margin: 10px 0;
                        ">
                            Add to Google Calendar
                        </a>
                    </div>
                    
                    <p>Best regards,</p>
                    <p><strong>The CareerAgent Team</strong></p>
                    <p style="font-size: 12px; color: #777;">
                        If you wish to unsubscribe from these notifications, please 
                        <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #2c2c54; text-decoration: none;">click here</a>.
                    </p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

const sendInterviewScheduledEmailToRecruiter = async (email, recruiterName, jobSeekerName, jobListing, scheduledTime, meetingLink) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Interview Scheduled with ${jobSeekerName}`,
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Interview Scheduled</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
                    <p>Hello ${recruiterName},</p>
                    <p>You have scheduled an interview with:</p>
                    <p><strong>Candidate:</strong> ${jobSeekerName}</p>
                    <p><strong>Position:</strong> ${jobListing.jobRole}</p>
                    <p><strong>Company:</strong> ${jobListing.company}</p>
                    <p><strong>Date & Time:</strong> ${new Date(scheduledTime).toLocaleString()}</p>
                    ${meetingLink ? `
                        <p><strong>Meeting Link:</strong> <a href="${meetingLink}" target="_blank" style="color: #2c2c54; text-decoration: none;">${meetingLink}</a></p>
                    ` : '<p>Please add the meeting link to the interview details in your dashboard.</p>'}
                    <p>Best regards,</p>
                    <p><strong>The CareerAgent Team</strong></p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

const sendContactFormEmail = async (fullName, email, subject, message) => {
    const mailOptions = {
        from: `"CareerAgent Team" <${process.env.EMAIL_USER}>`,
        to: 'careeragentpro@gmail.com',
        subject: `Contact Form: ${subject}`,
        html: `
            <div style="font-family: 'Roboto', Arial, sans-serif; color: #333; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #2c2c54; color: #ffffff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
                </div>
                <!-- Body -->
                <div style="padding: 20px; background-color: #ffffff; line-height: 1.6;">
                    <p><strong>From:</strong> ${fullName} (${email})</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="margin-top: 20px; border-left: 4px solid #2c2c54; padding-left: 15px;">
                        <p><strong>Message:</strong></p>
                        <p>${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">
                        This message was sent via the CareerAgent contact form.
                    </p>
                </div>
                <!-- Footer -->
                <div style="background-color: #f0f0f0; text-align: center; padding: 10px; border-radius: 0 0 10px 10px; font-size: 12px; color: #555;">
                    <p>&copy; ${new Date().getFullYear()} CareerAgent. All rights reserved.</p>
                </div>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendVerificationCode,
    sendResetPasswordEmail,
    generateResetToken,
    sendJobNotificationEmail,
    sendRejectionEmail,
    sendHiredEmail,
    sendApplicationInReviewEmail,
    sendInterviewScheduledEmailToJobSeeker,
    sendInterviewScheduledEmailToRecruiter,
    sendContactFormEmail
};
