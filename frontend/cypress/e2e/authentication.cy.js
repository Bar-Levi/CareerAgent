const testPassword = 'TestPassword123';
const testRole = 'JobSeeker';
const testUserEmail = `testuser${Math.floor(Math.random() * 899999) + 100000}@example.com`;
let pinCode; // Declare a variable to store the PIN


describe('Registration and Authentication Flow Tests', () => {
    before(() => {
        cy.visit('/authentication', { force: true }); // Ensure visit handles forced navigation
    });

    it('should complete the registration and navigate to the verification page', () => {

        // Save credentials as aliases for reuse in other tests
        cy.wrap(testUserEmail).as('testUserEmail');
        cy.wrap(testPassword).as('testPassword');
        cy.wrap(testRole).as('testRole');

        // Step 1: Open Registration Form
        cy.get('[data-cy="login-toggle-register"]', { force: true }).click({ force: true });

        // Step 2: Fill Registration Form
        cy.get('[data-cy="registration-fullName"]', { force: true }).type('Test User', { force: true });
        cy.get('[data-cy="registration-email"]', { force: true }).type(testUserEmail, { force: true });
        cy.get('[data-cy="registration-password"]', { force: true }).type(testPassword, { force: true });
        cy.get('[data-cy="registration-confirmPassword"]', { force: true }).type(testPassword, { force: true });
        cy.get('[data-cy="registration-role"]', { force: true }).select(testRole, { force: true });
        cy.get('[data-cy="registration-terms"]', { force: true }).check({ force: true });
        cy.get('[data-cy="registration-submit"]', { force: true }).click({ force: true });

        // Step 3: Optional Details Form (Job Seeker)
        cy.get('[data-cy="submit-optional-details-job-seeker"]', { force: true }).click({ force: true });

        cy.get('#pin-text')  // Target the element storing the PIN
            .invoke('text') // Extract the text content
            .then((pin) => {
                pinCode = pin.trim(); // Save the PIN value to the variable (trim to remove extra spaces)
                cy.wrap(pinCode).as('pinCode'); // Save as an alias for reuse in other steps
            });
        
        // Step 4: Submit the PIN Code Swal Alert
        cy.get('.swal2-confirm', { force: true }).click({ force: true });

        // Validate navigation to /verify
        cy.url({ force: true }).should('include', '/verify');
    });

    describe('Authentication Form Tests', () => {
        beforeEach(() => {
            cy.visit('/authentication'); // Open the LoginForm directly
        });

        it('should unsuccessfully log in with valid credentials for unverified user', function () {

            // Save credentials as aliases for reuse in other tests
            cy.wrap(testUserEmail).as('testUserEmail');
            cy.wrap(testPassword).as('testPassword');
            cy.wrap(testRole).as('testRole');

            cy.get('[data-cy="login-email"]', { force: true }).type(testUserEmail, { force: true });
            cy.get('[data-cy="login-password"]', { force: true }).type(testPassword, { force: true });
            cy.get('[data-cy="login-role"]', { force: true }).select(testRole, { force: true });
    

            cy.get('[data-cy="login-submit"]', { force: true }).click({ force: true });

            // Validate that the user is NOT redirected to the dashboard
            cy.url().should('not.include', '/dashboard');
        });

        it('should display an error message for invalid credentials', () => {
            cy.get('[data-cy="login-email"]', { force: true }).type('invalid@admin.com', { force: true });
            cy.get('[data-cy="login-password"]', { force: true }).type('WrongPassword', { force: true });
            cy.get('[data-cy="login-role"]', { force: true }).select('JobSeeker', { force: true });
            cy.get('[data-cy="login-submit"]', { force: true }).click({ force: true });

            // Assert the error message is shown
            cy.get('body').should('contain.text', 'User not found.');
        });

        it('should toggle to the forgot password form and back', () => {

            cy.wrap(testUserEmail).as('testUserEmail');
            cy.wrap(pinCode).as('pinCode');

            // Open the forgot password form
            cy.get('[data-cy="login-forgot-password-toggle"]', { force: true }).click({ force: true });

            // Assert the forgot password email input exists in the DOM
            cy.get('[data-cy="forgot-password-email"]', { force: true }).should('exist');

            // Assert the forgot password PIN input exists in the DOM
            cy.get('[data-cy="forgot-password-pin"]', { force: true }).should('exist');

            // Fill in the email and PIN fields and submit the forgot password form
            cy.get('[data-cy="forgot-password-email"]', { force: true }).type(testUserEmail, { force: true });
            cy.get('[data-cy="forgot-password-pin"]', { force: true }).type(pinCode, { force: true });
            cy.get('[data-cy="forgot-password-submit"]', { force: true }).click({ force: true });

            // Assert a success message is shown
            cy.get('body', { force: true }).should('contain.text', 'Password reset instructions sent to email.');

            // Close the forgot password form
            cy.get('[data-cy="login-forgot-password-toggle"]', { force: true }).click({ force: true });

            // Assert the login email input is visible again
            cy.get('[data-cy="login-email"]', { force: true }).should('exist').type('working', { force: true });

            // Clear the text from the field
            cy.get('[data-cy="login-email"]', { force: true }).clear({ force: true });
        });
    });
});
