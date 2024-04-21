function startTest(subject) {
  // Перенаправление на страницу теста с выбранным предметом
  window.location.href = "test.html?subject=" + encodeURIComponent(subject);
}
function saveChat(message, response) {
  const chatId = "some unique ID"; // Replace this with a unique ID for each chat session

  $.post(
    "/saveChat",
    {
      chatId: chatId,
      message: message,
      response: response,
    },
    function (data, status) {
      console.log("Chat saved successfully.");
    }
  );
}

function saveResults(results) {
  $.post(
    "/saveResults",
    {
      results: results,
    },
    function (data, status) {
      console.log("Results saved successfully.");
    }
  );
}
