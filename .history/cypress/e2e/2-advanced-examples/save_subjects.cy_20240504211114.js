describe("Dashboard", () => {
  it("displays user's welcome message and subjects after successful login", () => {
    // Stub the login request
    cy.intercept("POST", "/login", { statusCode: 200 });

    // Visit the login page
    cy.visit("/login");

    // Fill in the login form
    cy.get("#username").type("username");
    cy.get("#password").type("password");
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
    cy.contains("h1", "Welcome, username!");

    // Assert the pre-filled subject
    cy.get("#subjects-group .input-group input").should(
      "have.value",
      subjects[0]
    );

    // Assert the dynamically added subjects
    subjects.slice(1).forEach((subject) => {
      cy.contains("#subject-form .input-group input", subject);
    });
  });

  it("allows user to remove subjects", () => {
    // Visit the dashboard page
    cy.visit("/dashboard");

    // Click the "Remove" button for the second subject
    cy.get(".remove-subject").eq(1).click();

    // Assert that the second subject is removed
    cy.contains("#subject-form .input-group input", "Advanced Database").should(
      "not.exist"
    );
  });
});
