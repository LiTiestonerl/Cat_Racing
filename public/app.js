// --- DOM Elements ---
const catBlack = document.getElementById("cat-black");
const catOrange = document.getElementById("cat-orange");
const infoTurn = document.getElementById("info-turn");
const questionContainer = document.getElementById("question-container");
const questionText = document.getElementById("question-text");
const submitAnswer = document.getElementById("submit-answer");
const startBtn = document.getElementById("start-btn");
const raceTrack = document.querySelector(".race-track");
const answersContainer = document.getElementById("answers-container");
const resultContainer = document.getElementById("result-container");
const resultText = document.getElementById("result-text");
const restartBtn = document.getElementById("restart-btn");
const scoreBlackEl = document.getElementById("score-black");
const scoreOrangeEl = document.getElementById("score-orange");

// Thêm phần tử hiển thị đếm ngược (bạn nhớ thêm div này vào HTML trong .question-panel)
// <div id="timer" style="font-size:1.2rem; margin-bottom: 15px; font-weight: 700; color: #f0f0f0;"></div>
const timerElem = document.getElementById("timer");

// --- Constants & Variables ---
const moveStep = 50; // Khoảng cách mèo tiến mỗi câu trả lời đúng
const finishLine = 475; // 600 - 125 (chiều rộng mèo)
const backgrounds = [
  "./assets/bg1/2304x1296.png",
  "./assets/bg2/2304x1296.png",
  "./assets/bg3/2304x1296.png",
  "./assets/bg4/2304x1296.png",
  "./assets/bg5/2304x1296.png",
  "./assets/bg6/2304x1296.png",
  "./assets/bg7/2304x1296.png",
  "./assets/bg8/2304x1296.png",
];

// Danh sách câu hỏi mẫu
const questions = [
  {
    q: "Tham nhũng ảnh hưởng lớn nhất đến điềnhũng ảnh hưởng lớn nhất đến điềnhũng ảnh hưởng lớn nhất đến điềnhũng ảnh hưởng lớn nhất đến điềnhũng ảnh hưởng lớn nhất đến điềnhũng ảnh hưởng lớn nhất đến điều gì trong xã hội?",
    choices: ["Phát triển kinh tế", "Truyền thông", "Giáo dục", "Giải trí"],
    a: "Phát triển kinh tế",
  },
  {
    q: "Triết gia nào nổi tiếng với câu nói 'Quyền lực làm tha hóa con người'?",
    choices: ["Plato", "Aristotle", "Lord Acton", "Nietzsche"],
    a: "Lord Acton",
  },
  {
    q: "Trong triết học, tham nhũng được xem là biểu hiện của:",
    choices: [
      "Tính ích kỷ",
      "Tính bao dung",
      "Tính nhân văn",
      "Tính chính trực",
    ],
    a: "Tính ích kỷ",
  },
  {
    q: "Giải pháp hiệu quả nhất để chống tham nhũng là gì?",
    choices: [
      "Tăng cường minh bạch và giám sát",
      "Giữ bí mật các hoạt động",
      "Tăng thuế cho người dân",
      "Giảm đầu tư vào giáo dục",
    ],
    a: "Tăng cường minh bạch và giám sát",
  },
];

let scores = { black: 0, orange: 0 };
let askedQuestions = new Set();
let selectedAnswer = null;
let currentBgIndex = 0;
let positions = { black: 0, orange: 0 };
let turn = "black"; // 'black' hoặc 'orange'
let currentQuestion = null;

let timerInterval;
const timeLimit = 60; // 60 giây đếm ngược cho mỗi câu hỏi

// --- Hàm hiển thị popup chung ---
function showPopup(message, type = "info", callback) {
  Swal.fire({
    icon: type, // 'success', 'error', 'warning', 'info', 'question'
    title: message,
    confirmButtonText: "OK",
    allowOutsideClick: false,
  }).then(() => {
    if (callback) callback();
  });
}

// --- Hiệu ứng thay đổi background ---
function changeBackground() {
  currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
  raceTrack.style.backgroundImage = `url('${backgrounds[currentBgIndex]}')`;
}
setInterval(changeBackground, 10000);
raceTrack.style.backgroundImage = `url('${backgrounds[0]}')`;

// --- Lấy câu hỏi ngẫu nhiên chưa hỏi ---
function getRandomQuestion() {
  if (askedQuestions.size === questions.length) {
    // Hết câu hỏi
    return null;
  }
  let index;
  do {
    index = Math.floor(Math.random() * questions.length);
  } while (askedQuestions.has(index));
  askedQuestions.add(index);
  return questions[index];
}

// --- Cập nhật thông tin lượt ---
function updateInfo() {
  infoTurn.textContent = `Lượt trả lời: Đội ${
    turn === "black" ? "Mèo Đen Đen Đủi" : "Mèo Cam Tai Tiếng"
  }`;
}

// --- Cập nhật bảng điểm ---
function updateScoreboard() {
  scoreBlackEl.textContent = scores.black;
  scoreOrangeEl.textContent = scores.orange;
}

// --- Dừng đếm ngược ---
function stopTimer() {
  clearInterval(timerInterval);
  if (timerElem) timerElem.textContent = "";
}

// --- Bắt đầu đếm ngược ---
function startTimer(onTimeout) {
  let timeLeft = timeLimit;
  if (timerElem) timerElem.textContent = `Thời gian còn lại: ${timeLeft}s`;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timerElem) timerElem.textContent = `Thời gian còn lại: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      onTimeout();
    }
  }, 1000);
}

// --- Hiển thị câu hỏi ---
function showQuestion() {
  currentQuestion = getRandomQuestion();

  if (!currentQuestion) {
    // Hết câu hỏi, hiện kết quả chung
    showResult();
    return;
  }

  questionText.textContent = currentQuestion.q;

  // Xóa đáp án cũ
  answersContainer.innerHTML = "";
  selectedAnswer = null;
  submitAnswer.disabled = true;

  currentQuestion.choices.forEach((choice) => {
    const div = document.createElement("div");
    div.classList.add("answer-option");
    div.textContent = choice;

    div.onclick = () => {
      const prev = answersContainer.querySelector(".selected");
      if (prev) prev.classList.remove("selected");

      div.classList.add("selected");
      selectedAnswer = choice;
      submitAnswer.disabled = false;
    };

    answersContainer.appendChild(div);
  });

  questionContainer.style.display = "block";
  resultContainer.style.display = "none"; // Ẩn bảng kết quả nếu có

  startTimer(onTimeOut); // Bắt đầu đếm ngược khi câu hỏi hiển thị
}

// --- Xử lý khi hết thời gian ---
function onTimeOut() {
  stopTimer();
  if (selectedAnswer === null) {
    // Người chơi không chọn, coi như sai
    showAnswerResult(false, currentQuestion.a);
  }
}

// --- Hiển thị popup kết quả câu hỏi đúng/sai ---
function showAnswerResult(isCorrect, correctAnswer) {
  stopTimer();

  let title = isCorrect ? "Chính xác! 🎉" : "Sai rồi!";
  let htmlContent = isCorrect
    ? `<p>Chuẩn không cần chỉnh luôn.</p>`
    : `<p>Đáp án đúng là: <strong>${correctAnswer}</strong></p>`;

  Swal.fire({
    title: title,
    html: htmlContent,
    icon: isCorrect ? "success" : "error",
    confirmButtonText: "Tiếp tục",
    width: "400px",
  }).then(() => {
    // Load câu hỏi tiếp theo và reset timer
    loadNextQuestion();
  });
}

// --- Load câu hỏi tiếp theo ---
function loadNextQuestion() {
  selectedAnswer = null;
  showQuestion();
}

// --- Di chuyển mèo và cập nhật điểm ---
function moveCat(cat) {
  positions[cat] += moveStep;
  scores[cat] += 1; // cộng điểm
  updateScoreboard();

  if (positions[cat] > finishLine) positions[cat] = finishLine;

  if (cat === "black") {
    catBlack.style.left = positions[cat] + "px";
  } else {
    catOrange.style.left = positions[cat] + "px";
  }
}

// --- Kiểm tra người thắng cuộc ---
function checkWinner() {
  if (positions.black >= finishLine) {
    showPopup("Mèo Đen tình,.... NHƯNG ĐỎ BẠC!", "success");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    showResult();
    return true;
  }
  if (positions.orange >= finishLine) {
    showPopup("Mèo Cam không tai tiếng,... MÈO DANH TIẾNG!", "success");
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    showResult();
    return true;
  }
  return false;
}

// --- Hiển thị kết quả chung ---
function showResult() {
  questionContainer.style.display = "none";
  resultContainer.style.display = "block";

  let winner = "";
  if (positions.black > positions.orange) winner = "Đội Mèo Đen thắng!";
  else if (positions.orange > positions.black) winner = "Đội Mèo Cam thắng!";
  else winner = "Hai đội hòa nhau!";

  resultText.textContent = `${winner}`;

  Swal.fire({
    title:
      "Cám ơn Thầy Duy và các bạn đã lắng nghe bài thuyết trình của nhóm em",
    html: `
      <p>Một mèo làm chẳng lên non, hai mèo chụm lại nên hòn núi cao</p>   
    `,
    icon: "info",
    showConfirmButton: true,
    confirmButtonText: "Đóng",
    width: "400px",
    didOpen: () => {
      // Bắn pháo hoa 2.5 giây
      const duration = 8500;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 1000,
      };

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: 0.1, y: 0.5 },
          })
        );
        confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: { x: 0.9, y: 0.5 },
          })
        );
      }, 250);
    },
    willClose: () => {
      resetGame();
    },
  });
}

// --- Reset game ---
function resetGame() {
  positions.black = 0;
  positions.orange = 0;
  scores.black = 0;
  scores.orange = 0;
  updateScoreboard();

  catBlack.style.left = "0px";
  catOrange.style.left = "0px";

  questionContainer.style.display = "none";
  startBtn.style.display = "inline-block";
  infoTurn.textContent = "";
  turn = "black";
  if (timerElem) timerElem.textContent = "";
}

// --- Sự kiện khi bấm nút Trả lời ---
submitAnswer.onclick = () => {
  if (!selectedAnswer) return showPopup("Vui lòng chọn đáp án!", "warning");

  stopTimer();

  const isCorrect =
    selectedAnswer.toLowerCase() === currentQuestion.a.toLowerCase();

  if (isCorrect) {
    showPopup("Đúng rồi!, Anh em ta cứ thế thôi hẹ hẹ hẹ hẹ.", "success");
    moveCat(turn);
    if (checkWinner()) {
      return; // kết thúc game nếu có thắng
    }
  } else {
    showPopup("Không sao! Thua keo này ta xài keo dán sắt.", "error");
  }

  // Đổi lượt trả lời sau khi đúng hoặc sai
  turn = turn === "black" ? "orange" : "black";
  updateInfo();
  showQuestion();
};

// --- Sự kiện khi bấm nút Bắt đầu ---
startBtn.onclick = () => {
  startBtn.style.display = "none";
  positions.black = 0;
  positions.orange = 0;
  catBlack.style.left = "0px";
  catOrange.style.left = "0px";
  askedQuestions.clear();
  updateInfo();
  showQuestion();
};

// --- Sự kiện khi bấm nút Chơi lại (nếu dùng) ---
restartBtn.onclick = () => {
  resetGame();
};
