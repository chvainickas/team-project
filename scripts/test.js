
document.addEventListener('DOMContentLoaded', function() {
  let currentQuestionIndex = 0;
  let userAnswers = {};

  // Получаем предмет из параметров запроса
  const urlParams = new URLSearchParams(window.location.search);
  const subject = urlParams.get('subject');

  // Загружаем вопросы из JSON файла один раз при загрузке страницы
  let filteredQuestions;

  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      // Фильтруем вопросы по выбранному предмету
      filteredQuestions = data.filter(question => question.subject === subject);
      // Выбираем случайные 10 вопросов
      filteredQuestions = chooseRandomQuestions(filteredQuestions, 10);
      // Отображаем первый вопрос
      displayQuestion(filteredQuestions[currentQuestionIndex]);
    });

  // Функция для выбора случайных вопросов
  function chooseRandomQuestions(questions, count) {
    const randomQuestions = [];
    const totalQuestions = questions.length;
    const selectedIndexes = [];
    for (let i = 0; i < count; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * totalQuestions);
      } while (selectedIndexes.includes(randomIndex));
      selectedIndexes.push(randomIndex);
      randomQuestions.push(questions[randomIndex]);
    }
    return randomQuestions;
  }

  // Функция для отображения текущего вопроса
  function displayQuestion(question) {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '<h3>' + question.question + '</h3>';
  }

  // Обработчик события для кнопки "Next"
  document.getElementById('nextButton').addEventListener('click', loadNextQuestion);

  // Обработчик события для кнопки "Prev"
  document.getElementById('prevButton').addEventListener('click', loadPrevQuestion);

  // Обработчик события для кнопки "Submit"
  document.getElementById('submitButton').addEventListener('click', submitTest);

  // Функция для загрузки следующего вопроса
  function loadNextQuestion() {
    // Увеличиваем индекс текущего вопроса
    currentQuestionIndex++;

    // Проверяем, находится ли индекс в пределах массива вопросов
    if (currentQuestionIndex >= 0 && currentQuestionIndex < filteredQuestions.length) {
      // Отображаем следующий вопрос
      displayQuestion(filteredQuestions[currentQuestionIndex]);
      // Отображаем ответ пользователя, если он есть
      const answerInput = document.getElementById('answerInput');
      answerInput.value = userAnswers[currentQuestionIndex] || '';
    } else {
      // Если индекс выходит за пределы массива, возвращаем его на границу
      currentQuestionIndex = Math.min(Math.max(currentQuestionIndex, 0), filteredQuestions.length - 1);
    }
  }

  // Функция для загрузки предыдущего вопроса
  function loadPrevQuestion() {
    // Уменьшаем индекс текущего вопроса
    currentQuestionIndex--;

    // Проверяем, находится ли индекс в пределах массива вопросов
    if (currentQuestionIndex >= 0 && currentQuestionIndex < filteredQuestions.length) {
      // Отображаем предыдущий вопрос
      displayQuestion(filteredQuestions[currentQuestionIndex]);
      // Отображаем ответ пользователя, если он есть
      const answerInput = document.getElementById('answerInput');
      answerInput.value = userAnswers[currentQuestionIndex] || '';
    } else {
      // Если индекс выходит за пределы массива, возвращаем его на границу
      currentQuestionIndex = Math.min(Math.max(currentQuestionIndex, 0), filteredQuestions.length - 1);
    }
  }

  // Функция для завершения теста и перехода на страницу результатов
  function submitTest() {
    // Сохраняем ответы пользователя в локальное хранилище
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
    // Перенаправляем пользователя на страницу результатов
    window.location.href = 'results.html';
  }
});