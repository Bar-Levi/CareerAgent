describe('Authentication Tests', () => {
    beforeEach(() => {
      cy.visit('/authentication'); // Navigate to the authentication page
      cy.wait(3000); // Allow animations to finish
    });
  
    // Test for Login Form
    describe('Login Form', () => {
      it('Displays login form correctly', () => {
        // Ensure the login form elements are visible
        cy.get('[data-cy="login-email"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
  
        cy.get('[data-cy="login-password"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none'); // Ensure transform has completed
  
        cy.get('[data-cy="login-submit"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .should('contain', 'Log In')
      });
  
      it('Allows user login', () => {
        // Enter valid credentials and submit
        cy.get('[data-cy="login-email"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .type('admin@admin.com');
  
        cy.get('[data-cy="login-password"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .type('Admin12345');
  
        cy.get('[data-cy="login-submit"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .click();
  
        // Assert redirection to the dashboard
        cy.url().should('include', '/dashboard');
      });
  
      it('Shows error for invalid login', () => {
        // Enter invalid credentials
        cy.get('[data-cy="login-email"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .type('invaliduser@example.com');
  
        cy.get('[data-cy="login-password"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .type('wrongpassword');
  
        cy.get('[data-cy="login-submit"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .click();
  
        // Verify error message
        cy.contains('Invalid login credentials').should('be.visible');
      });
  
      it('Toggles password visibility', () => {
        // Test password visibility toggle
        cy.get('[data-cy="login-password"]')
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .type('Admin12345');
  
        cy.get('[data-cy="toggle-password-visibility"]') // Replace with a suitable selector for toggle
          .should('have.css', 'opacity', '1') // Wait for opacity to be 1
          .and('have.css', 'transform', 'none') // Ensure transform has completed
          .click();
  
        cy.get('[data-cy="login-password"]').should('have.attr', 'type', 'text');
      });
    });
  });
  