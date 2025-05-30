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

const moveStep = 50; // Khoảng cách mèo tiến mỗi câu trả lời đúng
const finishLine = 475; // 600 - 125 (chiều rộng mèo)
const backgrounds = [
  "/assets/bg1/2304x1296.png",
  "/assets/bg2/2304x1296.png",
  "/assets/bg3/2304x1296.png",
  "/assets/bg4/2304x1296.png",
  "/assets/bg5/2304x1296.png",
  "/assets/bg6/2304x1296.png",
  "/assets/bg7/2304x1296.png",
  "/assets/bg8/2304x1296.png",
];

// Danh sách câu hỏi mẫu
const questions = [
  {
    q: "Tham nhũng ảnh hưởng lớn nhất đến điều gì trong xã hội?",
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

let askedQuestions = new Set();
let selectedAnswer = null;
let currentBgIndex = 0;
let positions = {
  black: 0,
  orange: 0,
};
let turn = "black"; // 'black' hoặc 'orange'
let currentQuestion = null;

function changeBackground() {
  currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
  raceTrack.style.backgroundImage = `url('${backgrounds[currentBgIndex]}')`;
}
// Đổi background mỗi 10 giây
setInterval(changeBackground, 10000);
// Khởi tạo background ban đầu
raceTrack.style.backgroundImage = `url('${backgrounds[0]}')`;

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

function updateInfo() {
  infoTurn.textContent = `Lượt trả lời: Đội ${
    turn === "black" ? "Mèo Đen Đen Đủi" : "Mèo Cam Tai Tiếng"
  }`;
}

function showQuestion() {
  currentQuestion = getRandomQuestion();

  if (!currentQuestion) {
    // Hết câu hỏi rồi
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
}

function showResult() {
  questionContainer.style.display = "none";
  resultContainer.style.display = "block";

  let winner = "";
  if (positions.black > positions.orange) winner = "Đội Mèo Đen thắng!";
  else if (positions.orange > positions.black) winner = "Đội Mèo Cam thắng!";
  else winner = "Hai đội hòa nhau!";

  resultText.textContent = `Kết thúc trò chơi! ${winner}`;
}

function moveCat(cat) {
  positions[cat] += moveStep;
  if (positions[cat] > finishLine) positions[cat] = finishLine;
  if (cat === "black") {
    catBlack.style.left = positions[cat] + "px";
  } else {
    catOrange.style.left = positions[cat] + "px";
  }
}

function checkWinner() {
  if (positions.black >= finishLine) {
    alert("Mèo Đen thắng!");
    showResult();
    return true;
  }
  if (positions.orange >= finishLine) {
    alert("Mèo Cam thắng!");
    showResult();
    return true;
  }
  return false;
}

function resetGame() {
  positions.black = 0;
  positions.orange = 0;
  catBlack.style.left = "0px";
  catOrange.style.left = "0px";
  questionContainer.style.display = "none";
  resultContainer.style.display = "none";
  startBtn.style.display = "inline-block";
  infoTurn.textContent = "";
  askedQuestions.clear();
  turn = "black";
}

submitAnswer.onclick = () => {
  if (!selectedAnswer) return alert("Vui lòng chọn đáp án!");

  if (selectedAnswer.toLowerCase() === currentQuestion.a.toLowerCase()) {
    alert("Đúng rồi! Mèo tiến lên.");
    moveCat(turn);
    if (checkWinner()) {
      return; // kết thúc game nếu có thắng
    }
  } else {
    alert("Sai rồi!");
    // Không cho đội trả lời tiếp dù sai
  }

  // Đổi lượt trả lời sau khi đúng hoặc sai
  turn = turn === "black" ? "orange" : "black";
  updateInfo();
  showQuestion();
};

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

restartBtn.onclick = () => {
  resetGame();
};
