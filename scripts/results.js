document.addEventListener('DOMContentLoaded', function() {
  // Получаем данные о тесте и ответах пользователя из локального хранилища
  const testData = JSON.parse(localStorage.getItem('testData'));
  const userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
  
  // Отображаем первый вопрос и ответ пользователя
  displayQuestion(testData, userAnswers, 0);
  
  // Обработчик события для кнопки "Next"
  document.getElementById('nextButton').addEventListener('click', function() {
    // Сохраняем текущий ответ пользователя
    saveUserAnswer();
    // Отображаем следующий вопрос
    displayNextQuestion(testData, userAnswers);
  });
  
  // Обработчик события для кнопки "Previous"
  document.getElementById('prevButton').addEventListener('click', function() {
    // Сохраняем текущий ответ пользователя
    saveUserAnswer();
    // Отображаем предыдущий вопрос
    displayPrevQuestion(testData, userAnswers);
  });
});

// Функция для отображения вопроса и ответа пользователя
function displayQuestion(testData, userAnswers, index) {
  // Получаем элементы DOM
  const questionElement = document.getElementById('question');
  const userAnswerElement = document.getElementById('user-answer');
  const aiFeedbackElement = document.getElementById('ai-feedback');
  
  // Проверяем, есть ли данные о тесте и ответах пользователя
  if (testData && userAnswers) {
    // Проверяем, есть ли ответ пользователя на текущий вопрос
    if (userAnswers[index]) {
      // Отображаем вопрос и ответ пользователя
      questionElement.textContent = "Question: " + testData[index].question;
      userAnswerElement.textContent = "User's Answer: " + userAnswers[index].answer;
      // Здесь можно добавить запрос к ИИ для получения комментария
      aiFeedbackElement.textContent = "AI Feedback: " + "Comment from AI";
    } else {
      // Если ответа пользователя нет, выводим сообщение "No answered"
      questionElement.textContent = "Question: " + testData[index].question;
      userAnswerElement.textContent = "User's Answer: No answered";
      aiFeedbackElement.textContent = "AI Feedback: No answered";
    }
  } else {
    // Если данных нет, выводим сообщение об ошибке
    questionElement.textContent = "Error: No data available";
    userAnswerElement.textContent = "";
    aiFeedbackElement.textContent = "";
  }
}

// Функция для сохранения ответа пользователя
function saveUserAnswer() {
  // Получаем ответ пользователя из поля ввода или другого элемента
  const userAnswer = "User's answer"; // Нужно заменить на реальный код получения ответа
  // Здесь можно сохранить ответ пользователя в локальное хранилище или отправить на сервер
}

// Функция для отображения следующего вопроса
function displayNextQuestion(testData, userAnswers) {
  // Получаем текущий индекс вопроса
  const currentIndex = 0; // Нужно заменить на реальный код получения текущего индекса
  // Отображаем следующий вопрос, увеличивая индекс на 1
  displayQuestion(testData, userAnswers, currentIndex + 1);
}

// Функция для отображения предыдущего вопроса
function displayPrevQuestion(testData, userAnswers) {
  // Получаем текущий индекс вопроса
  const currentIndex = 0; // Нужно заменить на реальный код получения текущего индекса
  // Отображаем предыдущий вопрос, уменьшая индекс на 1
  displayQuestion(testData, userAnswers, currentIndex - 1);
}
