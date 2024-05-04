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

    // Define the subjects array
    const subjects = [
      "Data Structure and Algorithms",
      "Advanced Database",
      "Math",
      "Object Oriented Programming",
    ];

    // Assert the welcome message
    cy.contains("h1", "Welcome, johndoe!");

    // Assert the pre-filled subject
    cy.get("#subjects-group .input-group input").should(
      "have.value",
      subjects[0]
    );

    // Assert the dynamically added subjects
    subjects.slice(1).forEach((subject) => {
      cy.contains("#subject-form .input-group input", subject);
    });

    // Stub the save subjects request
    cy.intercept("POST", "/save-subjects", { statusCode: 200 });

    // Remove two subjects
    cy.get("#subjects-group .input-group input").eq(1).clear();
    cy.get("#subjects-group .input-group input").eq(2).clear();

    // Submit the subject form
    cy.get("#subject-form").submit();

    // Assert that the subjects are saved successfully
    cy.url().should("include", "/dashboard"); // Assuming redirect to dashboard after saving subjects
    cy.contains("#subjects-group .input-group input", subjects[0]);
    cy.contains("#subjects-group .input-group input", subjects[3]);
  });
});
