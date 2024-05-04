describe("Home Test Page", () => {
  it("loads successfully and has subject buttons", () => {
    // Visit the home test page
    cy.visit("http://localhost:3000/home_test.html"); // Update 'your_port_number' with your actual port number

    // Check if the page title is correct
    cy.title().should("eq", "Choose a subject to take a test");

    // Check if the subject buttons are present
    const subjects = [
      "Data Structure and Algorithms",
      "Advanced Database",
      "Math",
      "Object Oriented Programming",
    ];
    subjects.forEach((subject) => {
      cy.contains("button", subject).should("be.visible");
    });

    // Check if the subject buttons are clickable
    subjects.forEach((subject) => {
      cy.contains("button", subject).click();
      // Add any assertions here to check the result of clicking the button
    });
  });
});
