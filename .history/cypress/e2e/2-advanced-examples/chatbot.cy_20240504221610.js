describe("Dashboard", () => {
  it("successfully logs in with correct credentials and interacts with chat bot", () => {
    // Visit the login page
    cy.visit("http://localhost:3000/login.html"); // Update 'your_port_number' with your actual port number

    // Fill in the login form
    cy.get("#username").type("johndoe");
    cy.get("#password").type("password123");
    cy.get("form").submit();

    // Assert that the login is successful
    cy.url().should("include", "/dashboard");

    // Click the chat bot button
    cy.get("button").contains("Go to Chats").click();

    // Assert that the chat page is loaded
    cy.url().should("include", "/chat");

    // Check that there are exactly 2 subjects in the dropdown
    cy.get("#subject").children().should("have.length", 3); // 3 because one option is "Select a subject"

    // Select a subject from the dropdown
    cy.get("#subject").select("Data Structure and Algorithms"); // Replace with the actual value of the option

    // Check that the selected subject is as expected
    cy.get("#subject").should("have.value", "Data Structure and Algorithms");

    // Ask the bot about the subject
    cy.get("#message").type("What subject are you helping me with?");
    cy.get("#sendbutton").click();

    // Wait for the bot's response
    cy.wait(2000); // Adjust this value as needed

    // Check if the bot's response element exists and contains the expected text
    cy.get("#messages")
      .children()
      .last()
      .invoke("text")
      .then((text) => {
        expect(text.toLowerCase()).to.contain("data structure and algorithms");
      });

    // Add any additional interactions or assertions here
  });
});
