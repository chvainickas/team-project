describe("Registration Form", () => {
  it("successfully submits the registration form", () => {
    cy.visit("http://localhost:your_port_number/"); // Replace 'your_port_number' with your actual port number
    cy.get("#firstName").type("John");
    cy.get("#lastName").type("Doe");
    cy.get("#username").type("johndoe");
    cy.get("#password").type("password123");
    cy.get("#email").type("john.doe@example.com");
    cy.get("#courseName").type("Mathematics");
    cy.get("#registrationForm").submit();

    // Assert that the registration was successful (for example, by checking for a success message or redirect)
    // Replace the following line with your specific assertion
    cy.url().should("include", "/success-page"); // Replace '/success-page' with the URL of the page after successful registration
  });
});
