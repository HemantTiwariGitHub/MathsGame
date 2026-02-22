const TOPICS = [
  "addition-single", "addition-double-no-carry", "addition-double-carry",
  "sub-single", "sub-double-no-borrow", "sub-double-borrow",
  "missing-number", "sequence", "before-after-between",
  "comparison", "number-names", "time", "word-problem"
];

const topicLabels = {
  "addition-single": "Addition (Single Digit)",
  "addition-double-no-carry": "Addition (Double No Carry)",
  "addition-double-carry": "Addition (Double With Carry)",
  "sub-single": "Subtraction (Single Digit)",
  "sub-double-no-borrow": "Subtraction (Double No Borrow)",
  "sub-double-borrow": "Subtraction (Double With Borrow)",
  "missing-number": "Missing Number",
  "sequence": "Number Sequence",
  "before-after-between": "Before/After/Between",
  "comparison": "Comparison",
  "number-names": "Number Names",
  "time": "Time Reading",
  "word-problem": "Word Problems"
};

const state = {
  score: 0, streak: 0, correctCount: 0,
  mode: null, learnMode: false, timed: false,
  level: 1, range: 99,
  selectedTopics: [...TOPICS],
  currentQuestion: null, questionIndex: 0, totalQuestions: 0,
  timer: null, timeLeft: 0
};

const numberNames = (() => {
  const ones = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const map = {};
  for (let i = 1; i <= 100; i++) {
    if (i < 20) map[i] = ones[i];
    else if (i === 100) map[i] = "One Hundred";
    else {
      const t = Math.floor(i / 10), o = i % 10;
      map[i] = o ? `${tens[t]} ${ones[o]}` : tens[t];
    }
  }
  return map;
})();

const els = {
  score: byId("scoreValue"), streak: byId("streakValue"), badge: byId("badgeValue"), timer: byId("timerValue"),
  prompt: byId("questionPrompt"), answerZone: byId("answerZone"), feedback: byId("feedback"),
  progressLabel: byId("progressLabel"), progressFill: byId("progressBarFill"),
  nextBtn: byId("nextBtn"), learnSteps: byId("learnSteps"), learnSection: byId("learnStepsSection"),
  title: byId("questionTitle"), clock: byId("clockContainer"), matching: byId("matchingContainer"),
  pv: byId("placeValueHelper")
};

init();

function init() {
  renderTopicChecks();
  document.querySelectorAll(".mode-btn").forEach(btn => btn.addEventListener("click", () => startMode(btn.dataset.mode)));
  byId("learnModeToggle").addEventListener("change", e => state.learnMode = e.target.checked);
  byId("timedToggle").addEventListener("change", e => state.timed = e.target.checked);
  byId("levelSelect").addEventListener("change", e => state.level = +e.target.value);
  byId("rangeSelect").addEventListener("change", e => state.range = +e.target.value);
  byId("toggleParentPanel").addEventListener("click", () => byId("parentOptions").classList.toggle("hidden"));
  byId("printWorksheetBtn").addEventListener("click", printWorksheet);
  els.nextBtn.addEventListener("click", nextQuestion);
  updateHUD();
}

function startMode(mode) {
  state.mode = mode;
  if (mode === "exam") state.totalQuestions = 20;
  else if (mode === "mission") state.totalQuestions = 10;
  else if (mode === "timed") { state.totalQuestions = 15; state.timed = true; byId("timedToggle").checked = true; }
  else state.totalQuestions = 12;
  state.questionIndex = 0;
  state.score = 0; state.streak = 0; state.correctCount = 0;
  els.title.textContent = `Mode: ${mode.toUpperCase()}`;
  nextQuestion();
}

function nextQuestion() {
  if (state.questionIndex >= state.totalQuestions) return endMode();
  state.questionIndex++;
  const topic = pickTopic();
  state.currentQuestion = generateQuestion(topic, state.level, { range: state.range });
  renderQuestion(state.currentQuestion);
  if (state.timed) startTimer(20);
  else stopTimer();
  updateHUD();
}

function generateQuestion(topic, level, settings) {
  const max = settings.range;
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const twoDigit = () => rand(10, Math.max(20, max));

  if (topic === "addition-single") {
    const a = rand(0, 9), b = rand(0, 9);
    return { topic, prompt: `${a} + ${b} = ?`, answer: a + b, a, b };
  }
  if (topic === "addition-double-no-carry") {
    let a, b;
    do { a = twoDigit(); b = twoDigit(); } while ((a % 10) + (b % 10) >= 10 || a + b > max);
    return { topic, prompt: `${a} + ${b} = ?`, answer: a + b, a, b, carry: false };
  }
  if (topic === "addition-double-carry") {
    let a, b;
    do { a = twoDigit(); b = twoDigit(); } while ((a % 10) + (b % 10) < 10 || a + b > 99);
    return { topic, prompt: `${a} + ${b} = ?`, answer: a + b, a, b, carry: true };
  }
  if (topic === "sub-single") {
    let a = rand(0, 9), b = rand(0, 9); if (b > a) [a, b] = [b, a];
    return { topic, prompt: `${a} - ${b} = ?`, answer: a - b, a, b };
  }
  if (topic === "sub-double-no-borrow") {
    let a, b;
    do { a = twoDigit(); b = rand(10, a); } while ((a % 10) < (b % 10));
    return { topic, prompt: `${a} - ${b} = ?`, answer: a - b, a, b, borrow: false };
  }
  if (topic === "sub-double-borrow") {
    let a, b;
    do { a = twoDigit(); b = rand(10, a - 1); } while (!((a % 10) < (b % 10)));
    return { topic, prompt: `${a} - ${b} = ?`, answer: a - b, a, b, borrow: true };
  }
  if (topic === "missing-number") {
    if (Math.random() < 0.5) {
      const x = rand(0, 20), b = rand(0, 20);
      return { topic, prompt: `__ + ${b} = ${x + b}`, answer: x };
    }
    const a = rand(5, 20), x = rand(0, a);
    return { topic, prompt: `${a} - __ = ${a - x}`, answer: x };
  }
  if (topic === "sequence") {
    const start = rand(1, max - 4), step = rand(1, 2), miss = rand(1, 3);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const answer = seq[miss]; seq[miss] = "__";
    return { topic, prompt: `Fill the missing number: ${seq.join(", ")}`, answer };
  }
  if (topic === "before-after-between") {
    const n = rand(2, max - 2), type = rand(0, 2);
    if (type === 0) return { topic, prompt: `What comes after ${n}?`, answer: n + 1 };
    if (type === 1) return { topic, prompt: `What comes before ${n}?`, answer: n - 1 };
    return { topic, prompt: `What comes between ${n} and ${n + 2}?`, answer: n + 1 };
  }
  if (topic === "comparison") {
    const a = rand(0, max), b = rand(0, max);
    if (Math.random() < 0.5) {
      const answer = a === b ? "=" : a > b ? ">" : "<";
      return { topic, prompt: `Choose <, >, = : ${a} __ ${b}`, answer, options: ["<", ">", "="] };
    }
    return { topic, prompt: `Which is greater: ${a} or ${b}?`, answer: Math.max(a, b), options: [a, b] };
  }
  if (topic === "number-names") {
    const n = rand(1, 99);
    if (Math.random() < 0.5) return { topic, prompt: `Write number name for ${n}`, answer: numberNames[n].toLowerCase(), type: "name" };
    const m = rand(1, 99);
    return { topic, prompt: `Match "${numberNames[m]}" → ?`, answer: m, options: shuffle([m, rand(1, 99), rand(1, 99)]) };
  }
  if (topic === "time") {
    const hour = rand(1, 12), half = Math.random() < 0.5;
    const answer = half ? `${hour}:30` : `${hour}:00`;
    return { topic, prompt: "What time is it?", answer, hour, minute: half ? 30 : 0 };
  }

  const stories = [
    { t: "Riya has {a} apples. She gets {b} more. How many now?", op: "+" },
    { t: "Aarav has {a} balloons. {b} fly away. How many left?", op: "-" },
    { t: "Mia had {a} pencils and bought {b} more. Total pencils?", op: "+" },
    { t: "Kabir had {a} candies and ate {b}. Candies left?", op: "-" }
  ];
  const s = stories[rand(0, stories.length - 1)];
  let a = rand(5, 20), b = rand(1, 9);
  if (s.op === "-") b = rand(1, a - 1);
  return { topic: "word-problem", prompt: s.t.replace("{a}", a).replace("{b}", b), answer: s.op === "+" ? a + b : a - b };
}

function renderQuestion(q) {
  clearUI();
  els.prompt.textContent = q.prompt;
  renderPlaceValueHelper(q);
  if (q.topic === "time") renderClock(q.hour, q.minute);

  if (q.options) {
    q.options.forEach(op => {
      const btn = makeButton(op, "answer-btn", () => submitAnswer(String(op)));
      els.answerZone.appendChild(btn);
    });
  } else {
    const input = document.createElement("input");
    input.type = "text"; input.placeholder = "Type answer";
    input.addEventListener("keydown", e => { if (e.key === "Enter") submitAnswer(input.value); });
    const check = makeButton("Check", "answer-btn", () => submitAnswer(input.value));
    els.answerZone.append(input, check);
  }
  if (state.learnMode && (q.carry || q.borrow)) renderLearnSteps(q);
}

function submitAnswer(userAnswer) {
  const correct = checkAnswer(userAnswer);
  showFeedback(correct);
  if (correct) {
    state.score += 10;
    state.streak++;
    state.correctCount++;
    playTone(700, 0.08);
  } else {
    state.streak = 0;
    playTone(220, 0.15);
  }
  updateRewards();
  updateHUD();
  els.nextBtn.classList.remove("hidden");
}

function checkAnswer(userAnswer) {
  const a = state.currentQuestion.answer;
  const ua = String(userAnswer).trim().toLowerCase();
  if (typeof a === "number") return Number(ua) === a;
  return ua === String(a).toLowerCase();
}

function showFeedback(correct) {
  els.feedback.className = `feedback ${correct ? "success" : "error"}`;
  els.feedback.textContent = correct ? ["Great job!", "Awesome!", "You are a Maths Champion!"][Math.floor(Math.random()*3)] : `Try again! Correct answer: ${state.currentQuestion.answer}`;
}

function updateRewards() {
  const c = state.correctCount;
  byId("badgeBronze").classList.toggle("active", c >= 5);
  byId("badgeSilver").classList.toggle("active", c >= 10);
  byId("badgeGold").classList.toggle("active", c >= 20);
  if (c >= 20) { els.badge.textContent = "Gold Trophy"; runConfetti(); }
  else if (c >= 10) els.badge.textContent = "Silver Star";
  else if (c >= 5) els.badge.textContent = "Bronze Star";
  else els.badge.textContent = "Starter";
}

function renderLearnSteps(q) {
  els.learnSection.classList.remove("hidden");
  els.learnSteps.innerHTML = "";
  const steps = [];
  if (q.carry) {
    const o = (q.a % 10) + (q.b % 10), tens = Math.floor(q.a / 10) + Math.floor(q.b / 10);
    steps.push(`T O\n ${Math.floor(q.a/10)} ${q.a%10}\n+${Math.floor(q.b/10)} ${q.b%10}`);
    steps.push(`Add ones: ${q.a%10} + ${q.b%10} = ${o}. We have ${o} ones.`);
    steps.push(`Keep ${o % 10} in Ones, carry 1 ten above Tens column.`);
    steps.push(`Now tens: ${tens} + 1 (carry) = ${tens + 1}. Answer is ${q.answer}.`);
  }
  if (q.borrow) {
    steps.push(`T O\n ${Math.floor(q.a/10)} ${q.a%10}\n-${Math.floor(q.b/10)} ${q.b%10}`);
    steps.push("We need more ones, so we borrow 1 ten.");
    steps.push(`Cross out tens: ${Math.floor(q.a/10)} becomes ${Math.floor(q.a/10)-1}, ones become ${(q.a%10)+10}.`);
    steps.push(`Now subtract ones and tens to get ${q.answer}.`);
  }
  steps.forEach((text, i) => setTimeout(() => {
    const div = document.createElement("div"); div.className = "step"; div.textContent = text;
    els.learnSteps.appendChild(div);
  }, i * 300));
}

function renderPlaceValueHelper(q) {
  if (!(q.a >= 10 && q.b >= 0)) return;
  const ta = Math.floor(q.a / 10), oa = q.a % 10;
  const tb = Math.floor(q.b / 10), ob = q.b % 10;
  els.pv.innerHTML = `<div class="pv-box">Number 1<br>Tens: ${ta} | Ones: ${oa}</div><div class="pv-box">Number 2<br>Tens: ${tb} | Ones: ${ob}</div>`;
}

function renderClock(hour, minute) {
  const minAngle = minute * 6;
  const hrAngle = (hour % 12) * 30 + minute * 0.5;
  const hand = (len, angle, w, c) => {
    const rad = (angle - 90) * Math.PI / 180;
    return `<line x1="100" y1="100" x2="${100 + Math.cos(rad)*len}" y2="${100 + Math.sin(rad)*len}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  };
  els.clock.innerHTML = `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="#fff" stroke="#333" stroke-width="4"/>${[...Array(12)].map((_,i)=>`<text x="${100+Math.cos((i*30-60)*Math.PI/180)*72}" y="${106+Math.sin((i*30-60)*Math.PI/180)*72}" font-size="12" text-anchor="middle">${i+1}</text>`).join("")}${hand(45,hrAngle,6,"#4f7cff")}${hand(65,minAngle,4,"#ff4d6d")}<circle cx="100" cy="100" r="5" fill="#333"/></svg>`;
}

function startTimer(seconds) {
  stopTimer();
  state.timeLeft = seconds;
  els.timer.textContent = `${state.timeLeft}s`;
  state.timer = setInterval(() => {
    state.timeLeft--; els.timer.textContent = `${state.timeLeft}s`;
    if (state.timeLeft <= 0) { stopTimer(); showFeedback(false); els.nextBtn.classList.remove("hidden"); }
  }, 1000);
}
function stopTimer() { if (state.timer) clearInterval(state.timer); state.timer = null; els.timer.textContent = state.timed ? `${state.timeLeft || 0}s` : "--"; }

function updateHUD() {
  els.score.textContent = state.score;
  els.streak.textContent = state.streak;
  els.progressLabel.textContent = `Question ${Math.min(state.questionIndex, state.totalQuestions)}/${state.totalQuestions}`;
  els.progressFill.style.width = `${state.totalQuestions ? (state.questionIndex / state.totalQuestions) * 100 : 0}%`;
}

function endMode() {
  stopTimer();
  els.prompt.textContent = "🎉 Level complete! You did amazing!";
  els.answerZone.innerHTML = "";
  els.feedback.textContent = `Final Score: ${state.score}`;
  runConfetti();
}

function printWorksheet() {
  const area = byId("worksheetPrint");
  const qs = Array.from({ length: 20 }, () => generateQuestion(pickTopic(), state.level, { range: state.range }));
  area.innerHTML = `<h1>Maths Worksheet</h1><p>Level ${state.level} | Range up to ${state.range}</p><ol>${qs.map(q => `<li>${q.prompt} ________</li>`).join("")}</ol>`;
  window.print();
}

function renderTopicChecks() {
  const grid = byId("topicGrid");
  grid.innerHTML = "";
  TOPICS.forEach(t => {
    const id = `topic-${t}`;
    const wrap = document.createElement("label");
    wrap.innerHTML = `<input type="checkbox" id="${id}" checked> ${topicLabels[t]}`;
    wrap.querySelector("input").addEventListener("change", collectTopics);
    grid.appendChild(wrap);
  });
}
function collectTopics() {
  state.selectedTopics = TOPICS.filter(t => byId(`topic-${t}`).checked);
  if (!state.selectedTopics.length) state.selectedTopics = [...TOPICS];
}

function pickTopic() {
  collectTopics();
  if (state.mode === "mission") {
    if (state.level === 1) return weightedPick(["addition-single", "addition-double-no-carry", "sub-single", "sub-double-no-borrow", "sequence", "before-after-between", "number-names", "time"]);
    if (state.level === 2) return weightedPick(["addition-double-carry", "sub-double-borrow", ...state.selectedTopics]);
    return weightedPick(["word-problem", "addition-double-carry", "sub-double-borrow", "comparison", ...state.selectedTopics]);
  }
  if (state.mode === "practice") return weightedPick(state.selectedTopics);
  if (state.mode === "exam") return weightedPick(TOPICS);
  return weightedPick(["addition-double-carry", "sub-double-borrow", "word-problem", "comparison", "time", "missing-number"]);
}

function weightedPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clearUI() {
  els.feedback.textContent = ""; els.feedback.className = "feedback";
  els.answerZone.innerHTML = ""; els.clock.innerHTML = ""; els.matching.innerHTML = "";
  els.nextBtn.classList.add("hidden"); els.pv.innerHTML = "";
  els.learnSteps.innerHTML = ""; els.learnSection.classList.add("hidden");
}
function playTone(freq, dur) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.frequency.value = freq; osc.type = "triangle";
  gain.gain.value = 0.05;
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + dur);
}
function runConfetti() {
  const c = byId("confettiCanvas"), ctx = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const parts = Array.from({ length: 140 }, () => ({ x: Math.random()*c.width, y: -20, s: 4+Math.random()*6, v: 2+Math.random()*3, c: `hsl(${Math.random()*360},90%,60%)` }));
  let t = 0;
  (function anim() {
    ctx.clearRect(0,0,c.width,c.height);
    parts.forEach(p => { p.y += p.v; p.x += Math.sin((p.y+p.s)/20); ctx.fillStyle = p.c; ctx.fillRect(p.x,p.y,p.s,p.s); });
    if (t++ < 130) requestAnimationFrame(anim); else ctx.clearRect(0,0,c.width,c.height);
  })();
}

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function makeButton(text, cls, onClick){ const b=document.createElement("button"); b.textContent=text; b.className=cls; b.onclick=onClick; return b; }
function byId(id){ return document.getElementById(id); }
