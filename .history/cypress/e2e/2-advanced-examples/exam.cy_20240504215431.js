describe("Home Test Page", () => {
  it("loads successfully, has subject buttons, and answers questions", () => {
    const subjects = [
      "Data Structure and Algorithms",
      "Advanced Database",
      "Math",
      "Object Oriented Programming",
    ];

    // Check if the subject buttons are present and clickable
    subjects.forEach((subject) => {
      // Visit the home test page
      cy.visit("http://localhost:3000/home_test.html"); // Update 'your_port_number' with your actual port number

      // Check if the page title is correct
      cy.title().should("eq", "Choose a subject to take a test");

      // Check if the subject button is present
      cy.contains("button", subject).should("be.visible");

      // Check if the subject button is clickable
      cy.contains("button", subject).click();

      // Assert that the new URL is correct
      cy.url().should(
        "include",
        `/test.html?subject=${encodeURIComponent(subject)}`
      );

      // Answer the questions
      for (let i = 0; i < 10; i++) {
        cy.get("#answerInput").type(`This is the answer for question ${i + 1}`);
        cy.get("#nextButton").click();
      }

      // Click the submit button
      cy.get("#submitButton").click();

      // Wait for a certain amount of time
      cy.wait(5000); // Adjust this value as needed

      // Check if the URL has changed to results.html
      cy.url().should("include", "/results.html");

      // Click the next button a certain number of times
      for (let i = 0; i < 2; i++) {
        cy.get("#nextButton").click();
        cy.wait(1000); // Adjust this value as needed
      }

      // Add any assertions here to check the result of clicking the button
    });
  });
});
