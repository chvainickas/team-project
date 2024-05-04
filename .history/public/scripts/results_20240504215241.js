document.addEventListener('DOMContentLoaded', function () {
  // Парсим userAnswers и selectedQuestions, переданные с test.html
  const userAnswers = JSON.parse(localStorage.getItem('userAnswers'));
  const selectedQuestions = JSON.parse(localStorage.getItem('selectedQuestions'));

  console.log('userAnswers:', userAnswers);
  console.log('selectedQuestions:', selectedQuestions);

  // Загружаем вопросы из questions.json
  fetch('questions.json')
    .then(response => response.json())
    .then(data => {
      console.log('Loaded questions:', data);

      let currentQuestionIndex = 0; // Индекс текущего вопроса
      displayQuestionAndAnswer(data, userAnswers, selectedQuestions, currentQuestionIndex);

      // Обработчик события для кнопки "Next"
      document.getElementById('nextButton').addEventListener('click', function () {
        const questionCount = Object.keys(selectedQuestions).length;
        if (currentQuestionIndex < questionCount - 1) {
          currentQuestionIndex++;
          displayQuestionAndAnswer(data, userAnswers, selectedQuestions, currentQuestionIndex);
        }
      });

      // Обработчик события для кнопки "Prev"
      document.getElementById('prevButton').addEventListener('click', function () {
        if (currentQuestionIndex > 0) {
          currentQuestionIndex--;
          displayQuestionAndAnswer(data, userAnswers, selectedQuestions, currentQuestionIndex);
        }
      });
    })
    .catch(error => {
      console.error('Error fetching questions:', error);
      displayQuestionNotFound();
    });

  // Функция для отображения вопроса, ответа пользователя и комментария от ИИ
  async function displayQuestionAndAnswer(data, userAnswers, selectedQuestions, index) {
    const questionContainer = document.getElementById('question-container');
    const questionId = selectedQuestions[index];
    const question = data.find(q => q.id === questionId);

    if (question) {
      const answer = userAnswers[index] || '';
      const comment = await getResponse("Question: " + question.question + "\n " + "Answer: " + answer);
      questionContainer.innerHTML = `
          <h3>${question.question}</h3>
          <h3>Answer:</h3>
          <p>${answer}</p>
          <h3>AI Comment:</h3>
          <p>${comment}</p>
          `;
    } else {
      displayQuestionNotFound();
    }
  }

  // Функция для отображения сообщения о том, что вопрос не найден
  function displayQuestionNotFound() {
    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = '<p>Question not found</p>';
  }

  // Функция для отправки запроса к GPT и получения комментария
  async function getResponse(message) {
    const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    const API_KEY = "sk-proj-AsMf10CHSf3Rwb9FTBmjT3BlbkFJSaDwiClnfcEnMvmZBFVy"; // replace with your OpenAI API key

    try {
      const response = await fetch(
        OPENAI_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "Answer like a thoughtful and kind teacher! Review student's answer on the question, explain what if the answer correct or not and why.",
              },
              {
                role: "user",
                content: message,
              },
            ],
          })
        }
      );

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
});
