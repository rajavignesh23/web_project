const time = 10; 
let intervalId;

document.addEventListener('DOMContentLoaded', function() {
  const quizContainer = document.getElementById('quiz-container');
  const submitBtnContainer = document.getElementById('submitbtn');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const resultContainer = document.getElementById('result');
  
  let currentPage = 0;
  const questionsPerPage = 5;
  let selectedAnswers = [];
  let quizData = [];
  
  function initializeTimer() {
    let endTime = localStorage.getItem('endTime');
    if (!endTime) {
      endTime = Date.now() + time * 60 * 1000;
      localStorage.setItem('endTime', endTime);
    }
  }

  function updateTimer() {
    const endTime = localStorage.getItem('endTime');
    if (endTime) {
      const currentTime = Date.now();
      const remainingTime = endTime - currentTime;

      if (remainingTime >= 0) {
        const minutes = Math.floor((remainingTime / 1000) / 60);
        let seconds = Math.floor((remainingTime / 1000) % 60);
        seconds = seconds < 10 ? '0' + seconds : seconds;
        document.getElementById('cd').innerHTML = `${minutes}:${seconds}`;
      } else {
        clearInterval(intervalId);
        document.getElementById('cd').innerHTML = '0:00';
        alert('Time up! ');
        submitQuiz(); 
      }
    }
  }

  fetch('quizData.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      quizData = data;
      renderPage(currentPage);
    })
    .catch(error => {
      console.error('Error fetching quiz data:', error);
    });

  function renderPage(page) {
    quizContainer.innerHTML = '';
    const startIndex = page * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, quizData.length);

    for (let i = startIndex; i < endIndex; i++) {
      const question = quizData[i];
      const questionElement = document.createElement('div');
      questionElement.classList.add('question');
      questionElement.innerHTML = `
        <h2>${i + 1}. ${question.question}</h2>
        <div class="options">
          ${question.options.map((option, optionIndex) => `
            <div>
              <input type="radio" id="option${i}-${optionIndex}" name="question${i}" value="${optionIndex}" ${selectedAnswers[i] === optionIndex ? 'checked' : ''}>
              <label for="option${i}-${optionIndex}">${option}</label>
            </div>
          `).join('')}
        </div>
      `;
      quizContainer.appendChild(questionElement);
    }

    prevBtn.style.display = (page === 0) ? 'none' : 'inline-block';

    if (page === Math.ceil(quizData.length / questionsPerPage) - 1) {
      nextBtn.style.display = 'none';
      submitBtnContainer.innerHTML = `<button id="submit">Submit</button>`;
      document.getElementById('submit').addEventListener('click', submitQuiz);
    } else {
      nextBtn.style.display = 'inline-block';
      submitBtnContainer.innerHTML = '';
    }
  }

  function collectAnswers() {
    const inputs = document.querySelectorAll('input[type="radio"]:checked');
    inputs.forEach(input => {
      const questionIndex = parseInt(input.name.replace('question', ''));
      const optionIndex = parseInt(input.value);
      selectedAnswers[questionIndex] = optionIndex;
    });
  }

  function validateAllAnswers() {
    const container = document.getElementById('quiz-container');
    const head = document.getElementById("heading");
    head.innerHTML = 'QUIZ RESULTS';
    container.innerHTML = '';
    let score = 0;

    quizData.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer !== null && selectedAnswer !== undefined) {
        if (selectedAnswer === question.correct) {
          container.innerHTML += `<p class="correct">Question ${index + 1}: Correct!</p>`;
          score++;
        } else {
          container.innerHTML += `<p class="incorrect">Question ${index + 1}: Incorrect. Correct answer: ${question.options[question.correct]}</p>`;
        }
      } else {
        container.innerHTML += `<p class="not-selected">Question ${index + 1}: No answer selected.</p>`;
      }
    });

    container.innerHTML += `<p>Your score is ${score} out of ${quizData.length}</p>`;
    localStorage.removeItem('endTime');

    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtnContainer.style.display = 'none';
  }

  function submitQuiz() {
    collectAnswers();
    validateAllAnswers();
  }

  function prevPage() {
    if (currentPage > 0) {
      collectAnswers();
      currentPage--;
      renderPage(currentPage);
    }
  }

  function nextPage() {
    if (currentPage < Math.ceil(quizData.length / questionsPerPage) - 1) {
      collectAnswers();
      currentPage++;
      renderPage(currentPage);
    }
  }

  document.getElementById('prev').addEventListener('click', prevPage);
  document.getElementById('next').addEventListener('click', nextPage);

  initializeTimer();
  intervalId = setInterval(updateTimer, 1000);
});
