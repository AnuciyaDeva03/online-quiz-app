class QuizApplication {
    constructor() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.questions = [];
        this.filteredQuestions = [];
        this.timer = null;
        this.timeLeft = 30;
        this.totalTime = 0;
        this.startTime = null;
        this.username = '';
        this.difficulty = 'easy';
        
        // Default questions
        this.defaultQuestions = [
            {
                question: "What is the capital of France?",
                options: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2,
                difficulty: "easy"
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                correct: 1,
                difficulty: "easy"
            },
            {
                question: "What is 2 + 2?",
                options: ["3", "4", "5", "6"],
                correct: 1,
                difficulty: "easy"
            },
            {
                question: "Who painted the Mona Lisa?",
                options: ["Van Gogh", "Picasso", "Da Vinci", "Monet"],
                correct: 2,
                difficulty: "medium"
            },
            {
                question: "What is the largest ocean on Earth?",
                options: ["Atlantic", "Indian", "Arctic", "Pacific"],
                correct: 3,
                difficulty: "medium"
            },
            {
                question: "In which year did World War II end?",
                options: ["1944", "1945", "1946", "1947"],
                correct: 1,
                difficulty: "medium"
            },
            {
                question: "What is the chemical symbol for gold?",
                options: ["Go", "Gd", "Au", "Ag"],
                correct: 2,
                difficulty: "hard"
            },
            {
                question: "Who wrote '1984'?",
                options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "Kurt Vonnegut"],
                correct: 0,
                difficulty: "hard"
            },
            {
                question: "What is the square root of 144?",
                options: ["10", "11", "12", "13"],
                correct: 2,
                difficulty: "hard"
            },
            {
                question: "Which element has the atomic number 1?",
                options: ["Helium", "Hydrogen", "Lithium", "Carbon"],
                correct: 1,
                difficulty: "hard"
            }
        ];
        
        this.loadQuestions();
        this.initializeEventListeners();
    }
    
    loadQuestions() {
        const savedQuestions = localStorage.getItem('quizQuestions');
        if (savedQuestions) {
            this.questions = JSON.parse(savedQuestions);
        } else {
            this.questions = [...this.defaultQuestions];
            this.saveQuestions();
        }
    }
    
    saveQuestions() {
        localStorage.setItem('quizQuestions', JSON.stringify(this.questions));
    }
    
    initializeEventListeners() {
        // Welcome screen
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        
        // Quiz controls
        document.getElementById('prev-btn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('submit-btn').addEventListener('click', () => this.submitQuiz());
        
        // Results screen
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        document.getElementById('share-btn').addEventListener('click', () => this.shareResults());
        
        // Admin panel
        document.getElementById('admin-btn').addEventListener('click', () => this.showAdminPanel());
        document.getElementById('back-to-quiz').addEventListener('click', () => this.showWelcomeScreen());
        document.getElementById('question-form').addEventListener('submit', (e) => this.addQuestion(e));
        
        // Enter key support
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startQuiz();
        });
    }
    
    startQuiz() {
        const usernameInput = document.getElementById('username');
        const difficultySelect = document.getElementById('difficulty');
        
        if (!usernameInput.value.trim()) {
            alert('Please enter your name!');
            return;
        }
        
        this.username = usernameInput.value.trim();
        this.difficulty = difficultySelect.value;
        
        // Filter questions by difficulty
        this.filteredQuestions = this.questions.filter(q => q.difficulty === this.difficulty);
        
        if (this.filteredQuestions.length === 0) {
            alert('No questions available for this difficulty level!');
            return;
        }
        
        // Shuffle questions
        this.filteredQuestions = this.shuffleArray(this.filteredQuestions);
        
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.startTime = new Date();
        
        this.showScreen('quiz-screen');
        this.displayQuestion();
        this.startTimer();
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    displayQuestion() {
        const question = this.filteredQuestions[this.currentQuestionIndex];
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const questionCount = document.getElementById('question-count');
        const progress = document.getElementById('progress');
        
        questionText.textContent = question.question;
        questionCount.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.filteredQuestions.length}`;
        
        // Update progress bar
        const progressPercentage = ((this.currentQuestionIndex + 1) / this.filteredQuestions.length) * 100;
        progress.style.width = `${progressPercentage}%`;
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Create option elements
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.selectOption(index));
            
            // Check if this option was previously selected
            if (this.userAnswers[this.currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Update navigation buttons
        document.getElementById('prev-btn').disabled = this.currentQuestionIndex === 0;
        document.getElementById('next-btn').disabled = this.userAnswers[this.currentQuestionIndex] === undefined;
        
        // Show submit button on last question
        if (this.currentQuestionIndex === this.filteredQuestions.length - 1) {
            document.getElementById('next-btn').style.display = 'none';
            document.getElementById('submit-btn').style.display = 'block';
            document.getElementById('submit-btn').disabled = this.userAnswers[this.currentQuestionIndex] === undefined;
        } else {
            document.getElementById('next-btn').style.display = 'block';
            document.getElementById('submit-btn').style.display = 'none';
        }
        
        // Reset timer
        this.timeLeft = 30;
        this.startTimer();
    }
    
    selectOption(selectedIndex) {
        // Remove previous selection
        document.querySelectorAll('.option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selection to clicked option
        document.querySelectorAll('.option')[selectedIndex].classList.add('selected');
        
        // Store user answer
        this.userAnswers[this.currentQuestionIndex] = selectedIndex;
        
        // Enable navigation buttons
        document.getElementById('next-btn').disabled = false;
        document.getElementById('submit-btn').disabled = false;
    }
    
    startTimer() {
        clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = `${this.timeLeft}s`;
            
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.nextQuestion();
            }
        }, 1000);
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.filteredQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            this.submitQuiz();
        }
    }
    
    submitQuiz() {
        clearInterval(this.timer);
        
        // Calculate score
        this.score = 0;
        this.filteredQuestions.forEach((question, index) => {
            if (this.userAnswers[index] === question.correct) {
                this.score++;
            }
        });
        
        // Calculate total time
        const endTime = new Date();
        this.totalTime = Math.floor((endTime - this.startTime) / 1000);
        
        this.showResults();
    }
    
    showResults() {
        const finalScore = document.getElementById('final-score');
        const playerName = document.getElementById('player-name');
        const correctAnswers = document.getElementById('correct-answers');
        const totalQuestions = document.getElementById('total-questions');
        const timeTaken = document.getElementById('time-taken');
        const performanceMsg = document.getElementById('performance-msg');
        const questionReview = document.getElementById('question-review');
        
        const percentage = Math.round((this.score / this.filteredQuestions.length) * 100);
        
        finalScore.textContent = `${percentage}%`;
        playerName.textContent = this.username;
        correctAnswers.textContent = this.score;
        totalQuestions.textContent = this.filteredQuestions.length;
        timeTaken.textContent = this.totalTime;
        
        // Performance message
        if (percentage >= 90) {
            performanceMsg.textContent = "Excellent! Outstanding performance!";
            performanceMsg.style.color = "#28a745";
        } else if (percentage >= 70) {
            performanceMsg.textContent = "Good job! Well done!";
            performanceMsg.style.color = "#ffc107";
        } else if (percentage >= 50) {
            performanceMsg.textContent = "Not bad! Keep practicing!";
            performanceMsg.style.color = "#fd7e14";
        } else {
            performanceMsg.textContent = "Keep studying and try again!";
            performanceMsg.style.color = "#dc3545";
        }
        
        // Question review
        questionReview.innerHTML = '';
        this.filteredQuestions.forEach((question, index) => {
            const reviewItem = document.createElement('div');
            reviewItem.className = `question-review-item ${this.userAnswers[index] === question.correct ? 'correct' : 'incorrect'}`;
            
            const userAnswerText = this.userAnswers[index] !== undefined ? question.options[this.userAnswers[index]] : 'No answer';
            const correctAnswerText = question.options[question.correct];
            
            reviewItem.innerHTML = `
                <strong>Q${index + 1}: ${question.question}</strong><br>
                Your answer: ${userAnswerText}<br>
                Correct answer: ${correctAnswerText}
            `;
            
            questionReview.appendChild(reviewItem);
        });
        
        this.showScreen('results-screen');
        
        // Save results to localStorage
        this.saveResult();
    }
    
    saveResult() {
        const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
        results.push({
            username: this.username,
            score: this.score,
            total: this.filteredQuestions.length,
            percentage: Math.round((this.score / this.filteredQuestions.length) * 100),
            difficulty: this.difficulty,
            timeTaken: this.totalTime,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem('quizResults', JSON.stringify(results));
    }
    
    restartQuiz() {
        this.showWelcomeScreen();
    }
    
    shareResults() {
        const percentage = Math.round((this.score / this.filteredQuestions.length) * 100);
        const shareText = `I just scored ${percentage}% on the Online Quiz! I got ${this.score} out of ${this.filteredQuestions.length} questions correct in ${this.totalTime} seconds. Can you beat my score?`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quiz Results',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Results copied to clipboard!');
            }).catch(() => {
                alert(`Share your results:\n${shareText}`);
            });
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    showWelcomeScreen() {
        document.getElementById('username').value = '';
        document.getElementById('difficulty').value = 'easy';
        this.showScreen('welcome-screen');
        clearInterval(this.timer);
    }
    
    showAdminPanel() {
        this.showScreen('admin-panel');
        this.displayQuestionsList();
    }
    
    addQuestion(e) {
        e.preventDefault();
        
        const question = document.getElementById('new-question').value.trim();
        const option1 = document.getElementById('option1').value.trim();
        const option2 = document.getElementById('option2').value.trim();
        const option3 = document.getElementById('option3').value.trim();
        const option4 = document.getElementById('option4').value.trim();
        const correct = parseInt(document.getElementById('correct-option').value);
        const difficulty = document.getElementById('question-difficulty').value;
        
        if (!question || !option1 || !option2 || !option3 || !option4 || correct === '') {
            alert('Please fill in all fields!');
            return;
        }
        
        const newQuestion = {
            question: question,
            options: [option1, option2, option3, option4],
            correct: correct,
            difficulty: difficulty
        };
        
        this.questions.push(newQuestion);
        this.saveQuestions();
        
        // Reset form
        document.getElementById('question-form').reset();
        
        // Refresh questions list
        this.displayQuestionsList();
        
        alert('Question added successfully!');
    }
    
    displayQuestionsList() {
        const questionsList = document.getElementById('questions-list');
        questionsList.innerHTML = '';
        
        this.questions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            
            questionItem.innerHTML = `
                <h4>Q${index + 1}: ${question.question}</h4>
                <div class="options-list">
                    ${question.options.map((option, i) => 
                        `<span class="${i === question.correct ? 'correct-answer' : ''}">${i + 1}. ${option}</span>`
                    ).join('<br>')}
                </div>
                <small>Difficulty: ${question.difficulty}</small>
                <button onclick="quiz.deleteQuestion(${index})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin-top: 10px; cursor: pointer;">Delete</button>
            `;
            
            questionsList.appendChild(questionItem);
        });
    }
    
    deleteQuestion(index) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.questions.splice(index, 1);
            this.saveQuestions();
            this.displayQuestionsList();
        }
    }
}

// Initialize the quiz application
const quiz = new QuizApplication();

// Add some additional utility functions
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (document.getElementById('quiz-screen').classList.contains('active')) {
            if (e.key === 'ArrowLeft' && !document.getElementById('prev-btn').disabled) {
                quiz.previousQuestion();
            } else if (e.key === 'ArrowRight' && !document.getElementById('next-btn').disabled) {
                quiz.nextQuestion();
            } else if (e.key === 'Enter' && !document.getElementById('submit-btn').disabled && document.getElementById('submit-btn').style.display !== 'none') {
                quiz.submitQuiz();
            }
            // Number keys for option selection
            else if (e.key >= '1' && e.key <= '4') {
                const optionIndex = parseInt(e.key) - 1;
                const options = document.querySelectorAll('.option');
                if (options[optionIndex]) {
                    options[optionIndex].click();
                }
            }
        }
    });
    
    // Add visual feedback for loading
    const originalStartQuiz = quiz.startQuiz.bind(quiz);
    quiz.startQuiz = function() {
        const startBtn = document.getElementById('start-btn');
        const originalText = startBtn.textContent;
        startBtn.innerHTML = '<span class="loading"></span> Loading...';
        startBtn.disabled = true;
        
        setTimeout(() => {
            originalStartQuiz();
            startBtn.textContent = originalText;
            startBtn.disabled = false;
        }, 1000);
    };
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registration successful');
        }, function(err) {
            console.log('ServiceWorker registration failed');
        });
    });
}
