describe("Login Form", () => {
  it("successfully logs in with correct credentials", () => {
    cy.visit("http://localhost:3/login"); // Update 'your_port_number' with your actual port number
    cy.get("#username").type("johndoe");
    cy.get("#password").type("password123");
    cy.get("form").submit();

    // Assert that the user is redirected to the dashboard or another expected page after successful login
    // Replace the following line with your specific assertion
    cy.url().should("include", "/dashboard"); // Replace '/dashboard' with the URL of the dashboard page
  });
});
