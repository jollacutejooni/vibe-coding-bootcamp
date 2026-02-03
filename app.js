// 일본어 단어 데이터 (일본어, 한국어 뜻)
const VOCAB = [
  { ja: 'ありがとう', ko: '고맙습니다' },
  { ja: 'こんにちは', ko: '안녕하세요' },
  { ja: 'さようなら', ko: '안녕히 가세요' },
  { ja: 'おはよう', ko: '좋은 아침' },
  { ja: 'こんばんは', ko: '안녕하세요 (저녁)' },
  { ja: 'すみません', ko: '죄송합니다' },
  { ja: 'はい', ko: '네' },
  { ja: 'いいえ', ko: '아니요' },
  { ja: '水', ko: '물' },
  { ja: '食べる', ko: '먹다' },
  { ja: '飲む', ko: '마시다' },
  { ja: '行く', ko: '가다' },
  { ja: '来る', ko: '오다' },
  { ja: '見る', ko: '보다' },
  { ja: '聞く', ko: '듣다' },
  { ja: '読む', ko: '읽다' },
  { ja: '書く', ko: '쓰다' },
  { ja: '話す', ko: '말하다' },
  { ja: '勉強', ko: '공부' },
  { ja: '学校', ko: '학교' },
  { ja: '先生', ko: '선생님' },
  { ja: '友達', ko: '친구' },
  { ja: '家族', ko: '가족' },
  { ja: '今日', ko: '오늘' },
  { ja: '明日', ko: '내일' },
  { ja: '昨日', ko: '어제' },
  { ja: '時間', ko: '시간' },
  { ja: '元気', ko: '건강/기운' },
  { ja: '好き', ko: '좋아함' },
  { ja: '大きい', ko: '크다' },
  { ja: '小さい', ko: '작다' },
  { ja: '新しい', ko: '새롭다' },
  { ja: '古い', ko: '오래되다' },
  { ja: '暑い', ko: '덥다' },
  { ja: '寒い', ko: '춥다' },
  { ja: '美味しい', ko: '맛있다' },
  { ja: '駅', ko: '역' },
  { ja: '電車', ko: '전철' },
  { ja: '切符', ko: '표' },
  { ja: 'お金', ko: '돈' },
  { ja: '本', ko: '책' },
  { ja: '手', ko: '손' },
  { ja: '目', ko: '눈' },
  { ja: '名前', ko: '이름' },
  { ja: '国', ko: '나라' },
  { ja: '日本語', ko: '일본어' },
  { ja: '韓国語', ko: '한국어' },
];

const QUIZ_COUNT = 10;

let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let quizMode = 'ja-to-ko';
/** 퀴즈 결과 제출 시 사용할 점수 요약 (showResult에서 설정) */
let lastResultSummary = { scoreText: '', message: '' };

const $ = (id) => document.getElementById(id);
const startScreen = $('start-screen');
const quizScreen = $('quiz-screen');
const resultScreen = $('result-screen');
const startBtn = $('start-btn');
const retryBtn = $('retry-btn');
const quizModeSelect = $('quiz-mode');
const progressText = $('progress-text');
const progressFill = $('progress-fill');
const questionLabel = $('question-label');
const questionWord = $('question-word');
const choicesContainer = $('choices');
const resultTitle = $('result-title');
const resultScore = $('result-score');
const resultMessage = $('result-message');
const scoreEmailForm = $('score-email-form-el');
const scoreNameInput = $('score-name');
const scoreEmailInput = $('score-email');
const scoreEmailStatus = $('score-email-status');
const scoreSubmitBtn = $('score-submit-btn');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, n);
}

function getWrongAnswers(correctKo, count) {
  const others = VOCAB.filter((v) => v.ko !== correctKo).map((v) => v.ko);
  return pickRandom(others, Math.min(count, others.length));
}

function getWrongAnswersJa(correctJa, count) {
  const others = VOCAB.filter((v) => v.ja !== correctJa).map((v) => v.ja);
  return pickRandom(others, Math.min(count, others.length));
}

function showScreen(screen) {
  [startScreen, quizScreen, resultScreen].forEach((s) => s.classList.remove('active'));
  screen.classList.add('active');
}

function startQuiz() {
  quizMode = quizModeSelect.value;
  currentQuiz = pickRandom(VOCAB, QUIZ_COUNT);
  currentIndex = 0;
  score = 0;
  showScreen(quizScreen);
  showQuestion();
}

function showQuestion() {
  const item = currentQuiz[currentIndex];
  const total = currentQuiz.length;
  progressText.textContent = `${currentIndex + 1} / ${total}`;
  progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;

  const isJaToKo = quizMode === 'ja-to-ko';
  const question = isJaToKo ? item.ja : item.ko;
  const correctAnswer = isJaToKo ? item.ko : item.ja;

  questionLabel.textContent = isJaToKo ? '이 단어의 뜻은?' : '이 뜻의 일본어는?';
  questionWord.textContent = question;

  let options;
  if (isJaToKo) {
    const wrong = getWrongAnswers(item.ko, 3);
    options = shuffle([item.ko, ...wrong]);
  } else {
    const wrong = getWrongAnswersJa(item.ja, 3);
    options = shuffle([item.ja, ...wrong]);
  }

  choicesContainer.innerHTML = '';
  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(btn, opt, correctAnswer));
    choicesContainer.appendChild(btn);
  });
}

function handleAnswer(clickedBtn, selected, correct) {
  const buttons = choicesContainer.querySelectorAll('.choice-btn');
  buttons.forEach((b) => {
    b.classList.add('disabled');
    if (b.textContent === correct) b.classList.add('correct');
    else if (b === clickedBtn && selected !== correct) b.classList.add('wrong');
  });

  if (selected === correct) score += 1;

  setTimeout(() => {
    currentIndex += 1;
    if (currentIndex < currentQuiz.length) {
      showQuestion();
    } else {
      showResult();
    }
  }, 800);
}

function showResult() {
  const total = currentQuiz.length;
  const pct = Math.round((score / total) * 100);
  const scoreText = `${score} / ${total} (${pct}%)`;
  let message = '';
  if (pct === 100) message = '완벽해요!';
  else if (pct >= 80) message = '잘했어요!';
  else if (pct >= 60) message = '괜찮아요. 조금만 더 연습해 보세요.';
  else message = '다시 한번 단어를 복습해 보세요.';

  resultScore.textContent = scoreText;
  resultMessage.textContent = message;
  lastResultSummary = { scoreText, message };

  scoreEmailForm.reset();
  scoreEmailStatus.textContent = '';
  scoreEmailStatus.className = 'score-email-status';
  scoreSubmitBtn.disabled = false;
  showScreen(resultScreen);
}

function setScoreEmailStatus(text, isError = false) {
  scoreEmailStatus.textContent = text;
  scoreEmailStatus.className = 'score-email-status ' + (isError ? 'error' : 'success');
}

/**
 * Vercel API + Resend로 성적 메일 발송
 * @param {string} name
 * @param {string} email
 * @param {string} scoreText
 * @param {string} message
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function sendScoreEmail(name, email, scoreText, message) {
  const res = await fetch('/api/send-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, scoreText, message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.error || `요청 실패 (${res.status})` };
  }
  return { ok: true };
}

async function handleScoreEmailSubmit(e) {
  e.preventDefault();
  const name = (scoreNameInput.value || '').trim();
  const email = (scoreEmailInput.value || '').trim();

  if (!name) {
    setScoreEmailStatus('이름을 입력해 주세요.', true);
    scoreNameInput.focus();
    return;
  }
  if (!email) {
    setScoreEmailStatus('이메일을 입력해 주세요.', true);
    scoreEmailInput.focus();
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setScoreEmailStatus('올바른 이메일 주소를 입력해 주세요.', true);
    scoreEmailInput.focus();
    return;
  }

  scoreSubmitBtn.disabled = true;
  setScoreEmailStatus('발송 중…');

  const { scoreText, message } = lastResultSummary;
  const result = await sendScoreEmail(name, email, scoreText, message);

  if (result.ok) {
    setScoreEmailStatus('성적 메일이 발송되었습니다. 받은편지함을 확인해 주세요.');
  } else {
    setScoreEmailStatus(result.error || '발송에 실패했습니다. 잠시 후 다시 시도해 주세요.', true);
    scoreSubmitBtn.disabled = false;
  }
}

startBtn.addEventListener('click', startQuiz);
retryBtn.addEventListener('click', () => {
  showScreen(startScreen);
});
scoreEmailForm.addEventListener('submit', handleScoreEmailSubmit);