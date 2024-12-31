describe('Authentication Form Tests', () => {
    beforeEach(() => {
        cy.visit('/'); // Open the LoginForm directly
    });

    it('should successfully log in with valid credentials', () => {
        // Use `force: true` for rotated elements
        cy.get('[data-cy="login-email"]', { force: true }).type('admin@admin.com', { force: true });
        cy.get('[data-cy="login-password"]', { force: true }).type('Admin12345', { force: true });
        cy.get('[data-cy="login-role"]', { force: true }).select('jobseeker', { force: true });
        cy.get('[data-cy="login-submit"]', { force: true }).click({ force: true });

        // Validate that the user is redirected to the dashboard
        cy.url().should('include', '/dashboard');
    });

    it('should display an error message for invalid credentials', () => {
        cy.get('[data-cy="login-email"]', { force: true }).type('invalid@admin.com', { force: true });
        cy.get('[data-cy="login-password"]', { force: true }).type('WrongPassword', { force: true });
        cy.get('[data-cy="login-role"]', { force: true }).select('jobseeker', { force: true });
        cy.get('[data-cy="login-submit"]', { force: true }).click({ force: true });

        // Assert the error message is shown
        cy.get('body').should('contain.text', 'User not found.');
    });

    it('should toggle to the forgot password form and back', () => {
        // Open the forgot password form
        cy.get('[data-cy="login-forgot-password-toggle"]', { force: true }).click({ force: true });
    
        // Assert the forgot password email input exists in the DOM
        cy.get('[data-cy="forgot-password-email"]', { force: true }).should('exist');
    
        // Assert the forgot password PIN input exists in the DOM
        cy.get('[data-cy="forgot-password-pin"]', { force: true }).should('exist');
    
        // Fill in the email and PIN fields and submit the forgot password form
        cy.get('[data-cy="forgot-password-email"]', { force: true }).type('admin@admin.com', { force: true });
        cy.get('[data-cy="forgot-password-pin"]', { force: true }).type('965860', { force: true });
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
