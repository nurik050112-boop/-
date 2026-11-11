const TOTAL_QUESTIONS = 20;
const SECONDS_PER_QUESTION = 15;

const chapters = [
  { title: 'Города в руинах', kicker: 'ЭТАП 1', place: 'ЕВРОПА · 1945' },
  { title: 'Планы восстановления', kicker: 'ЭТАП 2', place: 'ПАРИЖ · 1947' },
  { title: 'Промышленный рывок', kicker: 'ЭТАП 3', place: 'ЛОНДОН · 1950-е' },
  { title: 'Новая Европа', kicker: 'ЭТАП 4', place: 'ЕВРОПА · 1963' }
];

const questions = [
  {
    line: '«Я видел разрушенные кварталы. Сначала нужно понять, с каким масштабом бедствия столкнулась Европа.»',
    text: 'Какое последствие войны сразу было заметно во многих европейских городах?',
    options: ['Города и предприятия лежали в руинах', 'Все морские порты исчезли', 'Промышленность сразу стала сильнее американской', 'Границы европейских стран полностью исчезли'],
    correct: 0,
    detail: 'Многие города и заводы были разрушены. Восстановление жилья и производства стало первоочередной задачей.'
  },
  {
    line: '«Из США идёт помощь. В архивах её называют планом, который должен помочь Европе подняться.»',
    text: 'Как называлась американская программа помощи европейским странам?',
    options: ['План Моне', 'План Маршалла', 'План Бреттона', 'План Эрхарда'],
    correct: 1,
    detail: 'План Маршалла был программой экономической помощи США странам Западной Европы после войны.'
  },
  {
    line: '«Помощь должна быть большой, чтобы снова заработали заводы, железные дороги и электростанции.»',
    text: 'Какую сумму помощи Западная Европа получила по плану Маршалла?',
    options: ['Около 1,5 млрд долларов', 'Около 13 млрд долларов', 'Около 30 млрд долларов', 'Около 130 млрд долларов'],
    correct: 1,
    detail: 'В материалах учебника указано около 13 млрд долларов помощи Западной Европе.'
  },
  {
    line: '«А вот экономика США вышла из войны с большими производственными возможностями.»',
    text: 'Почему экономика США укрепилась во время Второй мировой войны?',
    options: ['Боевые действия не разрушили её территорию так, как Европу', 'США полностью остановили промышленное производство', 'В стране отменили национальную валюту', 'Все американские заводы перенесли в Италию'],
    correct: 0,
    detail: 'Территория США не была разрушена боевыми действиями в европейском масштабе, а их промышленность и ресурсы усилились.'
  },
  {
    line: '«В 1944 году мировые лидеры договорились о послевоенных финансовых правилах.»',
    text: 'Какую роль получила валюта США после Бреттон-Вудской конференции 1944 года?',
    options: ['Стала ключевой международной валютой', 'Была заменена французским франком', 'Использовалась только внутри США', 'Перестала обращаться в мировой торговле'],
    correct: 0,
    detail: 'Бреттон-Вудская система закрепила центральную роль доллара в международных расчётах.'
  },
  {
    line: '«Франция готовит план: направить ресурсы туда, где они быстрее запустят производство.»',
    text: 'На что в первую очередь был направлен план Жана Моне во Франции?',
    options: ['На восстановление и модернизацию промышленности', 'На отказ от железных дорог', 'На закрытие крупных предприятий', 'На перенос столицы из Парижа'],
    correct: 0,
    detail: 'План Моне помогал восстанавливать и развивать ключевые отрасли французской промышленности.'
  },
  {
    line: '«В заметках правительства нашлась дата принятия плана Моне.»',
    text: 'В каком году Франция приняла план Моне?',
    options: ['1945', '1947', '1950', '1957'],
    correct: 1,
    detail: 'Первый план модернизации Франции был принят в 1947 году.'
  },
  {
    line: '«На заводах снова полная смена. Проверим, когда производство вернулось к прежнему уровню.»',
    text: 'К какому году промышленное производство Франции превысило довоенный уровень?',
    options: ['К 1946 году', 'К 1948 году', 'К 1954 году', 'К 1960 году'],
    correct: 1,
    detail: 'Согласно учебнику, уже в 1948 году французское промышленное производство превысило довоенный уровень.'
  },
  {
    line: '«На восстановление выделяют инвестиции. Значительную часть направляют в промышленность.»',
    text: 'В какой сектор Франция направляла большую часть инвестиций для восстановления?',
    options: ['В промышленность', 'Только в туризм', 'Только в торговый флот', 'В производство предметов роскоши'],
    correct: 0,
    detail: 'Франция направляла значительную часть инвестиций на восстановление и развитие промышленности.'
  },
  {
    line: '«Восстановление коснулось не только заводов. Постепенно возвращается и сельское хозяйство.»',
    text: 'В каком году сельское хозяйство Франции достигло довоенного уровня?',
    options: ['В 1947 году', 'В 1948 году', 'В 1950 году', 'В 1958 году'],
    correct: 2,
    detail: 'В учебном тексте отмечено, что довоенный уровень сельского хозяйства Франции был достигнут к 1950 году.'
  },
  {
    line: '«В Британии растут отрасли, которым нужны инженеры и новые технологии.»',
    text: 'Какие отрасли помогали развиваться британской промышленности в 1950-е годы?',
    options: ['Энергетика, авиадвигатели, машиностроение и химия', 'Только ручное ткачество', 'Производство гужевого транспорта', 'Добыча серебра и золота'],
    correct: 0,
    detail: 'Среди развивавшихся отраслей учебник называет энергетику, авиадвигатели, машиностроение, атомную и химическую промышленность.'
  },
  {
    line: '«Но не все старые предприятия успевают за конкурентами.»',
    text: 'Что, согласно учебнику, сдерживало развитие британской промышленности?',
    options: ['Отставание от конкурентов и замедление темпов роста', 'Полное отсутствие квалифицированных рабочих', 'Закрытие всех научных центров', 'Отказ страны от международной торговли'],
    correct: 0,
    detail: 'Британская промышленность теряла темпы и не всегда выдерживала конкуренцию с другими странами.'
  },
  {
    line: '«Империя меняется: её колонии одна за другой становятся самостоятельными.»',
    text: 'Что происходило с британскими колониями в начале 1960-х годов?',
    options: ['Они получили независимость', 'Они объединились в одно государство с Британией', 'Они вошли в состав Франции', 'Они стали независимыми от США'],
    correct: 0,
    detail: 'В начале 1960-х годов независимость получили многие британские колонии.'
  },
  {
    line: '«В Западной Германии ищут равновесие между рыночной свободой и социальной защитой.»',
    text: 'Как называлась экономическая модель Западной Германии?',
    options: ['Социальное рыночное хозяйство', 'Полностью централизованная экономика', 'Натуральное хозяйство', 'Военный коммунизм'],
    correct: 0,
    detail: 'Курс ФРГ связывают с социальной рыночной экономикой: конкуренцией и частной инициативой при социальной политике государства.'
  },
  {
    line: '«Новая республика получает правительство и первого канцлера.»',
    text: 'Кто стал первым канцлером Федеративной Республики Германии?',
    options: ['Людвиг Эрхард', 'Конрад Аденауэр', 'Жан Моне', 'Шарль де Голль'],
    correct: 1,
    detail: 'Первым канцлером ФРГ стал Конрад Аденауэр.'
  },
  {
    line: '«Экономический курс ФРГ связан с именем Людвига Эрхарда.»',
    text: 'Какую должность занимал Людвиг Эрхард, проводивший экономические реформы ФРГ?',
    options: ['Министр экономики', 'Президент Франции', 'Канцлер Италии', 'Глава Банка Англии'],
    correct: 0,
    detail: 'Людвиг Эрхард был министром экономики Западной Германии и одним из авторов её экономического курса.'
  },
  {
    line: '«После войны Германия оказалась разделена на два государства.»',
    text: 'В каком году были созданы ФРГ и Германская Демократическая Республика?',
    options: ['В 1945 году', 'В 1947 году', 'В 1949 году', 'В 1955 году'],
    correct: 2,
    detail: 'В 1949 году были провозглашены Федеративная Республика Германии и Германская Демократическая Республика.'
  },
  {
    line: '«На юге Европы тоже начинается быстрый экономический подъём.»',
    text: 'Какую помощь Италия получила по плану Маршалла, согласно учебнику?',
    options: ['Около 500 млн долларов', 'Около 1,5 млрд долларов', 'Около 13 млрд долларов', 'Около 50 млрд долларов'],
    correct: 1,
    detail: 'В тексте указана помощь Италии по плану Маршалла примерно в 1,5 млрд долларов.'
  },
  {
    line: '«Промышленность Италии растёт: появляются крупные компании и новые рабочие места.»',
    text: 'Какую итальянскую компанию учебник называет среди крупных промышленных корпораций?',
    options: ['FIAT', 'Renault', 'Volkswagen', 'British Leyland'],
    correct: 0,
    detail: 'В числе итальянских промышленных групп названы FIAT, Montecatini, Pirelli, Edison и Olivetti. Быстрый рост особенно заметен на севере Италии, тогда как юг развивался медленнее.'
  },
  {
    line: '«Последний шаг — связать экономики стран Европы и открыть общий рынок.»',
    text: 'Как называлось объединение, с которым связан процесс европейской экономической интеграции?',
    options: ['Европейское экономическое сообщество', 'Организация Варшавского договора', 'Бреттон-Вудская конференция', 'Содружество Независимых Государств'],
    correct: 0,
    detail: 'Создание Европейского экономического сообщества стало важным этапом интеграции западноевропейских стран.'
  }
];

const screens = {
  intro: document.getElementById('screen-intro'),
  game: document.getElementById('screen-game'),
  finish: document.getElementById('screen-finish')
};

const startButton = document.getElementById('start-button');
const homeButton = document.getElementById('home-button');
const restartButton = document.getElementById('restart-button');
const continueButton = document.getElementById('continue-button');
const answerList = document.getElementById('answer-list');
const questionText = document.getElementById('question-text');
const timerRing = document.getElementById('timer-ring');
const timerValue = document.getElementById('timer-value');
const feedback = document.getElementById('feedback');
const routeStops = Array.from(document.querySelectorAll('.route-stop'));
const cityBuildings = Array.from(document.querySelectorAll('.city-building'));

let questionIndex = 0;
let score = 0;
let remainingSeconds = SECONDS_PER_QUESTION;
let timerInterval = null;
let isLocked = false;

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove('is-visible'));
  screens[name].classList.add('is-visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function stopTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimer() {
  const fraction = Math.max(0, remainingSeconds / SECONDS_PER_QUESTION);
  const angle = Math.round(fraction * 360);
  timerValue.textContent = String(remainingSeconds);
  timerRing.style.setProperty('--timer-angle', angle + 'deg');
  timerRing.setAttribute('aria-label', 'Осталось ' + remainingSeconds + ' секунд');
  timerRing.classList.toggle('is-low', remainingSeconds <= 5);
}

function updateRoute(chapterIndex) {
  routeStops.forEach((stop, index) => {
    stop.classList.toggle('is-current', index === chapterIndex);
    stop.classList.toggle('is-complete', index < chapterIndex);
  });
  document.getElementById('score-label').textContent = score + ' / ' + TOTAL_QUESTIONS;
}

function updateCity() {
  cityBuildings.forEach((building) => {
    building.classList.toggle('is-restored', score >= Number(building.dataset.restoredAt));
  });
  document.getElementById('city-progress-fill').style.width = (score / TOTAL_QUESTIONS * 100) + '%';
  document.getElementById('city-score').textContent = score + ' / ' + TOTAL_QUESTIONS;
  document.getElementById('city-board').setAttribute('aria-label', 'Панорама восстановления города: ' + score + ' верных ответов из ' + TOTAL_QUESTIONS);

  let state = 'РУИНЫ · 1945';
  if (score >= 20) state = 'ЕВРОПА ВОССТАНОВЛЕНА';
  else if (score >= 15) state = 'ГОРОД ВОЗВРАЩАЕТСЯ';
  else if (score >= 10) state = 'УЛИЦЫ ОЖИВАЮТ';
  else if (score >= 5) state = 'ЗАВОДЫ ЗАПУЩЕНЫ';
  else if (score > 0) state = 'ПЕРВЫЕ ОКНА ГОРЯТ';
  document.getElementById('city-state').textContent = state;
}

function renderQuestion() {
  stopTimer();
  isLocked = false;
  remainingSeconds = SECONDS_PER_QUESTION;

  const question = questions[questionIndex];
  const chapterIndex = Math.floor(questionIndex / 5);
  const chapter = chapters[chapterIndex];

  document.getElementById('chapter-kicker').textContent = chapter.kicker;
  document.getElementById('progress-copy').textContent = 'ВОПРОС ' + (questionIndex + 1) + ' ИЗ ' + TOTAL_QUESTIONS;
  document.getElementById('chapter-label').textContent = chapter.title.toLocaleUpperCase('ru-RU');
  document.getElementById('question-index').textContent = 'ВОПРОС ' + String(questionIndex + 1).padStart(2, '0') + ' / ' + TOTAL_QUESTIONS;
  document.getElementById('scene-year').textContent = chapter.place;
  document.getElementById('story-line').textContent = question.line;
  questionText.textContent = question.text;
  document.getElementById('overall-progress-fill').style.width = ((questionIndex + 1) / TOTAL_QUESTIONS * 100) + '%';
  document.getElementById('score-label').textContent = score + ' / ' + TOTAL_QUESTIONS;
  updateRoute(chapterIndex);
  updateCity();
  updateTimer();

  feedback.hidden = true;
  feedback.classList.remove('is-wrong');
  answerList.replaceChildren();
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    const key = document.createElement('span');
    const text = document.createElement('span');
    button.type = 'button';
    button.className = 'answer';
    button.dataset.index = String(index);
    key.className = 'answer-key';
    key.textContent = String(index + 1);
    text.className = 'answer-text';
    text.textContent = option;
    button.append(key, text);
    button.addEventListener('click', () => chooseAnswer(index));
    answerList.append(button);
  });

  timerInterval = window.setInterval(() => {
    remainingSeconds -= 1;
    updateTimer();
    if (remainingSeconds <= 0) finishQuestion(null, true);
  }, 1000);
}

function chooseAnswer(selectedIndex) {
  if (isLocked) return;
  finishQuestion(selectedIndex, false);
}

function finishQuestion(selectedIndex, timedOut) {
  if (isLocked) return;
  isLocked = true;
  stopTimer();

  const question = questions[questionIndex];
  const answerButtons = Array.from(answerList.querySelectorAll('.answer'));
  answerButtons.forEach((button) => {
    const index = Number(button.dataset.index);
    button.disabled = true;
    if (index === question.correct) button.classList.add('is-correct');
    if (index === selectedIndex && index !== question.correct) button.classList.add('is-wrong');
  });

  const isCorrect = selectedIndex === question.correct;
  if (isCorrect) score += 1;
  document.getElementById('score-label').textContent = score + ' / ' + TOTAL_QUESTIONS;
  updateCity();

  const title = document.getElementById('feedback-title');
  if (timedOut) {
    title.textContent = 'Время вышло';
    feedback.classList.add('is-wrong');
  } else if (isCorrect) {
    title.textContent = 'Верно — город становится ярче';
    feedback.classList.remove('is-wrong');
  } else {
    title.textContent = 'Не совсем. Запомни правильный ответ';
    feedback.classList.add('is-wrong');
  }
  document.getElementById('feedback-detail').textContent = question.detail;
  feedback.hidden = false;
  document.getElementById('continue-label').textContent = questionIndex === TOTAL_QUESTIONS - 1 ? 'К результату' : 'Дальше';
  continueButton.focus({ preventScroll: true });
}

function finishGame() {
  stopTimer();
  showScreen('finish');
  document.getElementById('final-score').textContent = String(score);
  document.getElementById('correct-summary').textContent = String(score);

  let rank;
  let story;
  if (score >= 18) {
    rank = 'Архитектор экономического чуда';
    story = 'Заводы работают, улицы оживают, а страны снова торгуют друг с другом. Лев отправляет в редакцию историю о том, как Европа прошла путь от руин к подъёму.';
  } else if (score >= 14) {
    rank = 'Мастер восстановления';
    story = 'Город постепенно возвращается к жизни. Ты помог Льву собрать большую часть истории послевоенного восстановления.';
  } else if (score >= 9) {
    rank = 'Хранитель истории';
    story = 'Первые кварталы уже восстановлены. Ещё один маршрут по архивам поможет разобраться, как менялась экономика Европы.';
  } else {
    rank = 'Начало большого пути';
    story = 'Европа ждёт новых строителей. Попробуй ещё раз: с каждой миссией план восстановления станет яснее.';
  }
  document.getElementById('final-rank').textContent = rank;
  document.getElementById('finish-story').textContent = story;
}

function startGame() {
  stopTimer();
  questionIndex = 0;
  score = 0;
  showScreen('game');
  renderQuestion();
}

function nextQuestion() {
  if (!isLocked) return;
  if (questionIndex >= TOTAL_QUESTIONS - 1) {
    finishGame();
    return;
  }
  questionIndex += 1;
  renderQuestion();
}

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
continueButton.addEventListener('click', nextQuestion);
homeButton.addEventListener('click', () => {
  stopTimer();
  showScreen('intro');
});

document.addEventListener('keydown', (event) => {
  if (!screens.game.classList.contains('is-visible') || isLocked) return;
  const index = Number(event.key) - 1;
  if (index >= 0 && index < 4) chooseAnswer(index);
});
