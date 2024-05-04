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

    // Stub the save subjects request
    cy.intercept("POST", "/save-subjects", { statusCode: 200 });

    // Fill in and submit the subject form
    cy.get("#subjects-group .input-group input").type("New Subject");
    cy.get("#subject-form").submit();

    // Assert that the subjects are saved successfully
    cy.url().should("include", "/dashboard"); // Assuming redirect to dashboard after saving subjects
    cy.contains("#subjects-group .input-group input", "New Subject");
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
