describe("Dashboard", () => {
  it("successfully logs in with correct credentials and saves subjects", () => {
    // Visit the login page
    cy.visit("http://localhost:3000/login.html"); // Update 'your_port_number' with your actual port number
    // Fill in the login form
    cy.get("#username").type("johndoe");
    cy.get("#password").type("password123");
    cy.get("form").submit();

    // Assert that the login is successful
    cy.url().should("include", "/dashboard");

    // Remove two subjects
    cy.get(".remove-subject").eq(1).click();
    cy.get(".remove-subject").eq(2).click();


    
    // Submit the subject form
    cy.get("#subject-form").submit();

    // Assert that the subjects are saved successfully
    cy.url().should("include", "/dashboard"); // Assuming redirect to dashboard after saving subjects

    cy.contains("button", "See Subjects").click();
  });
});
