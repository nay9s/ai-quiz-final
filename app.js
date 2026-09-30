"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

let CHAPTERS = [];
let ANSWER_KEY = {};
let session = null;
let quizSettings = {
  order: "ordered",
  shuffleOptions: false,
  revealBeforeNext: true,
  displayMode: "blog",
  autoAdvance: false
};

const icons = {
  next: '<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  check: '<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
};

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function stats() {
  try { return JSON.parse(localStorage.getItem("aiQuizStats") || "[]"); }
  catch { return []; }
}

function saveStats(item) {
  const list = stats();
  list.unshift(item);
  try { localStorage.setItem("aiQuizStats", JSON.stringify(list.slice(0, 100))); }
  catch { alert("แสดงคะแนนได้ แต่บันทึกประวัติไม่ได้ กรุณาตรวจสอบพื้นที่หรือสิทธิ์ของเบราว์เซอร์"); }
  renderStats();
}

function renderStats() {
  const list = stats();
  $("#totalAttempts").textContent = list.length;
  $("#bestScore").textContent = list.length ? `${Math.max(...list.map((x) => x.percent))}%` : "0%";
  $("#avgScore").textContent = list.length ? `${Math.round(list.reduce((sum, x) => sum + x.percent, 0) / list.length)}%` : "0%";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try { localStorage.setItem("aiQuizTheme", theme); } catch {}
  const toggle = $("#themeToggle");
  const isDark = theme === "dark";
  toggle.setAttribute("aria-checked", String(isDark));
  toggle.setAttribute("aria-label", isDark ? "เปิดโหมดสว่าง" : "เปิดดาร์กโหมด");
  toggle.title = isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นดาร์กโหมด";
}

function normalizeAnswer(value) {
  if (typeof value === "number" && Number.isInteger(value)) return value;

  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    if (/^[A-E]$/.test(normalized)) return normalized.charCodeAt(0) - 65;

    const numeric = Number(normalized);
    if (Number.isInteger(numeric)) return numeric;
  }

  if (value && typeof value === "object") {
    return normalizeAnswer(value.choice ?? value.option ?? value.index);
  }

  return -1;
}

function normalizeAnswerKey(rawAnswers) {
  return Object.fromEntries(
    Object.entries(rawAnswers || {}).map(([questionId, value]) => [questionId, normalizeAnswer(value)])
  );
}

async function loadData() {
  $("#chapterGrid").innerHTML = '<div class="loading-card">กำลังโหลดชุดข้อสอบ…</div>';
  $("#start").disabled = true;
  try {
    const data = await QuizData.load();
    const questionData = data.questions;
    const answerData = data.answers;
    CHAPTERS = questionData?.chapters || [];
    ANSWER_KEY = normalizeAnswerKey(answerData?.answers);
    const allQuestions = CHAPTERS.flatMap((chapter) => chapter.questions);
    const invalidAnswers = allQuestions.filter((question) => {
      if (question.type === "open") return false;
      const answer = ANSWER_KEY[question.id];
      return !Number.isInteger(answer) || answer < 0 || answer >= question.options.length;
    });
    if (!allQuestions.length || invalidAnswers.length) {
      throw new Error(`ข้อมูลคำถามหรือเฉลยไม่ครบ: ${invalidAnswers.map((q) => q.id).join(", ")}`);
    }
    renderChapterChoices();
    updateHomeSelection();
    renderResumeCard();
  } catch (error) {
    console.error(error);
    $("#chapterGrid").innerHTML = `<div class="load-error"><b>ไม่สามารถโหลดชุดข้อสอบได้</b>${escapeHtml(error.message)}</div>`;
  }
}

function renderChapterChoices() {
  $("#chapterGrid").innerHTML = "";
  CHAPTERS.forEach((chapter, index) => {
    $("#chapterGrid").insertAdjacentHTML("beforeend", `<label class="chapter"><input type="checkbox" value="${escapeHtml(chapter.id)}" ${index === 0 ? "checked" : ""}><span><b>${escapeHtml(chapter.title)}</b><small>${chapter.questions.length} ข้อ</small></span></label>`);
  });
  $$("#chapterGrid input").forEach((input) => input.onchange = updateHomeSelection);
}

function loadQuizSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem("aiQuizSettings") || "{}");
    const isVersion12OrNewer = Number(stored.version) >= 12;

    quizSettings = {
      order: stored.order === "shuffle" ? "shuffle" : "ordered",
      shuffleOptions: Boolean(stored.shuffleOptions),
      revealBeforeNext: stored.revealBeforeNext !== false,
      // เวอร์ชัน 12 ใช้โหมดเลื่อนต่อเนื่องเป็นค่าเริ่มต้น
      // และย้ายผู้ใช้จากเวอร์ชันเก่ามาใช้ค่าเริ่มต้นใหม่นี้หนึ่งครั้ง
      displayMode: isVersion12OrNewer && stored.displayMode === "paged" ? "paged" : "blog",
      autoAdvance: stored.autoAdvance === true
    };
  } catch {
    quizSettings = {
      order: "ordered",
      shuffleOptions: false,
      revealBeforeNext: true,
      displayMode: "blog",
      autoAdvance: false
    };
  }

  try { localStorage.setItem("aiQuizSettings", JSON.stringify({ ...quizSettings, version: 12 })); } catch {}
  renderSettingsSummary();
}

function saveQuizSettings(nextSettings) {
  quizSettings = {
    order: nextSettings.order === "shuffle" ? "shuffle" : "ordered",
    shuffleOptions: Boolean(nextSettings.shuffleOptions),
    revealBeforeNext: Boolean(nextSettings.revealBeforeNext),
    displayMode: nextSettings.displayMode === "blog" ? "blog" : "paged",
    autoAdvance: Boolean(nextSettings.autoAdvance)
  };
  try { localStorage.setItem("aiQuizSettings", JSON.stringify({ ...quizSettings, version: 12 })); } catch {}
  renderSettingsSummary();
}

function renderSettingsSummary() {
  syncStudyModes();
  const orderText = quizSettings.order === "shuffle" ? "สลับข้อ" : "เรียงทีละบท";
  const displayText = quizSettings.displayMode === "blog" ? "เลื่อนต่อเนื่อง" : "ทีละข้อ";
  const optionSuffix = quizSettings.shuffleOptions ? " · สลับตัวเลือก" : "";
  const answerSuffix = quizSettings.revealBeforeNext ? " · เฉลยทีละข้อ" : " · เฉลยท้ายชุด";
  const autoSuffix = quizSettings.autoAdvance ? " · ไปข้อต่อไปอัตโนมัติ" : "";
  const target = $("#settingsSummary span");
  if (target) target.textContent = `${displayText} · ${orderText}${optionSuffix}${answerSuffix}${autoSuffix}`;
}

function openQuizSettings() {
  openModal("การตั้งค่า Quiz", `<div class="settings-panel">
    <div class="setting-card">
      <h3>รูปแบบการแสดงคำถาม</h3>
      <p>เลือกทำทีละข้อ หรือแสดงคำถามทั้งหมดให้เลื่อนลงเหมือนหน้า Blog</p>
      <div class="segmented display-mode-segmented">
        <label>
          <input type="radio" name="modalDisplayMode" value="paged" ${quizSettings.displayMode === "paged" ? "checked" : ""}>
          <span><b>ทีละข้อ</b><small>กดถัดไปเพื่อไปคำถามต่อไป</small></span>
        </label>
        <label>
          <input type="radio" name="modalDisplayMode" value="blog" ${quizSettings.displayMode === "blog" ? "checked" : ""}>
          <span><b>เลื่อนต่อเนื่อง</b><small>แสดงทุกข้อในหน้าเดียวแบบ Blog</small></span>
        </label>
      </div>
    </div>
    <div class="setting-card">
      <h3>ลำดับคำถาม</h3>
      <p>เลือกว่าจะทำเรียงแยกทีละบท หรือรวมทุกบทแล้วสลับคำถาม</p>
      <div class="segmented">
        <label><input type="radio" name="modalOrder" value="ordered" ${quizSettings.order === "ordered" ? "checked" : ""}><span>เรียงทีละบท</span></label>
        <label><input type="radio" name="modalOrder" value="shuffle" ${quizSettings.order === "shuffle" ? "checked" : ""}><span>สลับข้อ</span></label>
      </div>
    </div>
    <div class="setting-card"><label class="switch-row"><span class="switch-copy"><b>สลับตัวเลือก</b><small>สลับตำแหน่งคำตอบใหม่ทุกครั้งที่เริ่ม Quiz</small></span><span class="switch-control"><input id="modalShuffleOptions" type="checkbox" ${quizSettings.shuffleOptions ? "checked" : ""}><span class="switch-ui"></span></span></label></div>
    <div class="setting-card"><label class="switch-row"><span class="switch-copy"><b>เฉลยก่อนข้อถัดไป</b><small>เปิดเพื่อดูถูก–ผิดทีละข้อ ปิดเพื่อดูเฉลยทั้งหมดหลังสรุปคะแนน</small></span><span class="switch-control"><input id="modalRevealBeforeNext" type="checkbox" ${quizSettings.revealBeforeNext ? "checked" : ""}><span class="switch-ui"></span></span></label></div>
    <div class="setting-card"><label class="switch-row"><span class="switch-copy"><b>ข้อถัดไปอัตโนมัติ</b><small>หลังเลือกคำตอบ โหมดทีละข้อจะไปข้อถัดไป ส่วนโหมด Blog จะเลื่อนไปยังคำถามถัดไป</small></span><span class="switch-control"><input id="modalAutoAdvance" type="checkbox" ${quizSettings.autoAdvance ? "checked" : ""}><span class="switch-ui"></span></span></label></div>
    <div class="settings-actions"><button class="btn" id="cancelSettings" type="button">ยกเลิก</button><button class="btn primary" id="saveSettings" type="button">บันทึกการตั้งค่า</button></div>
  </div>`);
  $("#cancelSettings").onclick = closeQuizModal;
  $("#saveSettings").onclick = () => {
    saveQuizSettings({
      displayMode: $('input[name="modalDisplayMode"]:checked')?.value || "blog",
      order: $('input[name="modalOrder"]:checked')?.value || "ordered",
      shuffleOptions: $("#modalShuffleOptions").checked,
      revealBeforeNext: $("#modalRevealBeforeNext").checked,
      autoAdvance: $("#modalAutoAdvance").checked
    });
    closeQuizModal();
  };
}
function init() {
  let theme = "light";
  try { theme = localStorage.getItem("aiQuizTheme") || "light"; } catch {}
  applyTheme(theme);
  renderStats();
  loadQuizSettings();
  initLearner();
  loadData();
}

function start() {
  const ids = $$("#chapterGrid input:checked").map((input) => input.value);
  if (!ids.length) { alert("กรุณาเลือกอย่างน้อย 1 บท"); return; }
  if (readProgress() && !confirm("เริ่มชุดใหม่และแทนที่แบบทดสอบที่พักไว้?")) return;
  clearAutoAdvanceTimer();
  const selectedChapters = CHAPTERS.filter((chapter) => ids.includes(chapter.id));
  const ordered = quizSettings.order === "ordered";
  let questions = [];

  selectedChapters.forEach((chapter) => {
    chapter.questions.forEach((question, index) => {
      const answer = ANSWER_KEY[question.id];
      questions.push({ ...question, answer, chapter: chapter.title, chapterId: chapter.id, sourceNo: index + 1 });
    });
  });

  if (!ordered) questions = shuffle(questions);
  if (quizSettings.shuffleOptions) {
    questions = questions.map((question) => {
      if (question.type === "open") return question;
      const shuffledOptions = shuffle(question.options.map((text, index) => ({ text, correct: index === question.answer })));
      return {
        ...question,
        options: shuffledOptions.map((item) => item.text),
        answer: shuffledOptions.findIndex((item) => item.correct)
      };
    });
  }

  session = {
    questions,
    index: 0,
    answers: Array(questions.length).fill(null),
    flags: Array(questions.length).fill(false),
    orderedByChapter: ordered,
    chapterOrder: selectedChapters.map((chapter) => chapter.title),
    revealBeforeNext: quizSettings.revealBeforeNext,
    displayMode: quizSettings.displayMode,
    autoAdvance: quizSettings.autoAdvance,
    autoAdvanceTimer: null,
    startedAt: Date.now(),
    deadline: !quizSettings.revealBeforeNext && Number($("#examMinutes").value) > 0 ? Date.now() + Number($("#examMinutes").value) * 60000 : null
  };
  activateSession();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function show(id) {
  $("#homeHeader").classList.toggle("hidden", id !== "home");
  ["home", "quiz", "result"].forEach((sectionId) => $("#" + sectionId).classList.toggle("hidden", sectionId !== id));
}

function chapterGroups() {
  if (!session) return [];
  return session.chapterOrder.map((chapter) => ({
    chapter,
    indices: session.questions.map((question, index) => question.chapter === chapter ? index : -1).filter((index) => index >= 0)
  }));
}

function visibleIndices() {
  if (!session) return [];
  if (!session.orderedByChapter) return session.questions.map((_, index) => index);
  const currentChapter = session.questions[session.index].chapter;
  return session.questions.map((question, index) => question.chapter === currentChapter ? index : -1).filter((index) => index >= 0);
}

function renderChapterTabs() {
  const wrap = $("#chapterTabsWrap");
  const tabs = $("#chapterTabs");
  if (!session?.orderedByChapter || session.chapterOrder.length < 2) {
    wrap.classList.add("hidden");
    tabs.innerHTML = "";
    return;
  }
  wrap.classList.remove("hidden");
  const currentChapter = session.questions[session.index].chapter;
  tabs.innerHTML = chapterGroups().map((group, index) => {
    const answered = group.indices.filter((i) => session.answers[i]?.selected != null).length;
    const complete = answered === group.indices.length;
    const active = group.chapter === currentChapter;
    return `<button class="chapter-tab ${active ? "active" : ""} ${complete ? "complete" : answered ? "partial" : ""}" data-chapter="${index}" title="ไป ${escapeHtml(group.chapter)}"><span class="chapter-tab-dot"></span><span class="chapter-tab-name">${escapeHtml(group.chapter)}</span><span class="chapter-tab-count">${answered}/${group.indices.length}</span></button>`;
  }).join("");
  $$(".chapter-tab").forEach((button) => {
    button.onclick = () => {
      const group = chapterGroups()[Number(button.dataset.chapter)];
      const target = group.indices.find((i) => session.answers[i]?.selected == null) ?? group.indices[0];
      goTo(target);
    };
  });
}

function renderSlots() {
  if (!session) return;
  const indices = visibleIndices();
  const answered = indices.filter((index) => session.answers[index]?.selected != null).length;
  $("#slotHeading").textContent = session.orderedByChapter ? "ข้อในบทนี้" : "ข้อทั้งหมดแบบสลับ";
  $("#slotMeta").textContent = session.orderedByChapter ? "กดเลขข้อเพื่อข้ามหรือย้อนกลับมาแก้" : "เลื่อนซ้าย–ขวาเพื่อเลือกข้อที่ต้องการ";
  $("#answeredCount").textContent = `ตอบแล้ว ${answered}/${indices.length}`;
  $("#slots").innerHTML = indices.map((index, position) => {
    const answer = session.answers[index];
    const question = session.questions[index];
    let className = "slot";
    if (index === session.index) className += " current";
    if (answer?.selected != null) className += " answered";
    if (session.flags?.[index]) className += " flagged";
    if (answer?.checked || answer?.revealed) className += answer.correct ? " correct" : " wrong";
    const label = session.orderedByChapter ? question.sourceNo : position + 1;
    return `<button class="${className}" data-i="${index}" title="ไปข้อ ${label}" aria-label="ไปข้อ ${label}">${label}</button>`;
  }).join("");
  $$(".slot").forEach((button) => button.onclick = () => goTo(Number(button.dataset.i)));
  requestAnimationFrame(() => {
    const box = $("#slots");
    const current = box.querySelector(".current");
    if (current) box.scrollTo({ left: Math.max(0, current.offsetLeft - box.clientWidth / 2 + current.clientWidth / 2), behavior: "smooth" });
  });
}

function clearAutoAdvanceTimer() {
  if (session?.autoAdvanceTimer) {
    clearTimeout(session.autoAdvanceTimer);
    session.autoAdvanceTimer = null;
  }
}

function goTo(index) {
  if (!session) return;
  clearAutoAdvanceTimer();
  session.index = Math.max(0, Math.min(index, session.questions.length - 1));
  if (session.displayMode === "blog") {
    updateBlogProgress();
    renderChapterTabs();
    scrollToBlogQuestion(session.index);
    saveProgress();
    return;
  }
  renderQuestion();
}

function applyQuizDisplayMode() {
  if (!session) return;
  const isBlog = session.displayMode === "blog";
  $("#quiz").classList.toggle("blog-mode", isBlog);
  $("#blogQuestions").classList.toggle("hidden", !isBlog);
  $("#quiz .slotWrap").classList.toggle("hidden", isBlog);
  $("#quiz .question-card").classList.toggle("hidden", isBlog);
}

function renderQuestion() {
  if (!session) return;
  applyQuizDisplayMode();
  if (session.displayMode === "blog") {
    renderBlogQuestions();
    return;
  }
  renderPagedQuestion();
}

function blogAnswerStatus(answerState) {
  if (!answerState || answerState.selected == null) return { label: "ยังไม่ตอบ", className: "unanswered" };
  if (answerState.checked || answerState.revealed) {
    return answerState.correct
      ? { label: "ตอบถูก", className: "correct" }
      : { label: "ตอบผิด", className: "wrong" };
  }
  return { label: "เลือกคำตอบแล้ว", className: "answered" };
}

function blogQuestionHtml(question, index) {
  const answerState = session.answers[index] || {};
  const isChecked = Boolean(answerState.checked || answerState.revealed);
  const status = blogAnswerStatus(answerState);
  const previous = session.questions[index - 1];
  const chapterDivider = session.orderedByChapter && session.chapterOrder.length > 1 && (!previous || previous.chapter !== question.chapter)
    ? `<div class="blog-chapter-divider" id="blog-chapter-${escapeHtml(question.chapterId)}"><span>บทที่ ${session.chapterOrder.indexOf(question.chapter) + 1}</span><h2>${escapeHtml(question.chapter)}</h2></div>`
    : "";
  const image = question.image ? `<img class="qimg" src="${escapeHtml(question.image)}" alt="ภาพประกอบคำถาม">` : "";
  const options = question.options.map((option, optionIndex) => {
    const selected = answerState.selected === optionIndex;
    const correct = isChecked && optionIndex === question.answer;
    const wrong = isChecked && selected && optionIndex !== question.answer;
    return `<label class="option ${selected ? "selected" : ""} ${isChecked ? "checked" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}" data-blog-question="${index}" data-blog-option="${optionIndex}"><input type="radio" name="blog-answer-${index}" value="${optionIndex}" ${selected ? "checked" : ""} ${isChecked ? "disabled" : ""}><span class="optionKey">${String.fromCharCode(65 + optionIndex)}</span><span class="optionText">${escapeHtml(option)}</span><span class="optionMark" aria-hidden="true"></span></label>`;
  }).join("");
  const actions = session.revealBeforeNext && question.type !== "open"
    ? `<div class="blog-card-actions"><button class="btn ghost" type="button" data-blog-reveal="${index}" ${isChecked ? "disabled" : ""}>${isChecked ? "เฉลยแล้ว" : "ดูเฉลย"}</button><button class="btn primary" type="button" data-blog-check="${index}" ${answerState.selected == null || isChecked ? "disabled" : ""}>${isChecked ? "ตรวจแล้ว" : "ตรวจคำตอบ"}</button></div>`
    : "";
  return `${chapterDivider}<article class="blog-question-card" id="blog-question-${index}" data-blog-card="${index}">
    <div class="blog-question-head"><span class="question-kicker">คำถาม ${String(session.orderedByChapter ? question.sourceNo : index + 1).padStart(2, "0")}</span><div class="blog-head-actions">${bookmarkHtml(index)}<span class="blog-answer-status ${status.className}">${status.label}</span></div></div>
    ${session.chapterOrder.length > 1 ? `<div class="blog-question-source">${escapeHtml(question.chapter)}</div>` : ""}
    ${image}
    <h3 class="blog-question-title">${escapeHtml(question.question)}</h3>
    ${question.note ? `<p class="question-note">${escapeHtml(question.note)}</p>` : ""}
    <div class="options blog-options">${question.type === "open" ? openResponseHtml(question, index) : options}</div>
    ${actions}
  </article>`;
}

function updateBlogProgress() {
  if (!session) return;
  const answered = session.answers.filter((answer) => answer?.selected != null).length;
  const checked = session.answers.filter((answer) => answer?.checked || answer?.revealed).length;
  const currentQuestion = session.questions[session.index] || session.questions[0];
  $("#chapterCounter").textContent = session.revealBeforeNext ? "ฝึกทำ" : "สอบ";
  $("#chapterLabel").textContent = currentQuestion ? currentQuestion.chapter : "คำถามทั้งหมด";
  $("#progressText").textContent = `ข้อ ${session.index + 1} / ${session.questions.length}`;
  $("#overallProgress").textContent = session.revealBeforeNext ? `ตรวจแล้ว ${checked} ข้อ` : "เฉลยหลังส่งคำตอบ";
  $("#progressBar").style.width = `${(answered / session.questions.length) * 100}%`;
  $("#next").dataset.mode = "submit";
  $("#next").innerHTML = `ส่งคำตอบ${icons.check}`;
  updateLearnerUI();
}

function bindBlogEvents() {
  bindOpenResponses();
  $$('#blogQuestions input[type="radio"]').forEach((input) => {
    input.onchange = () => {
      const index = Number(input.closest('[data-blog-question]').dataset.blogQuestion);
      const option = Number(input.value);
      toggleOptionAt(index, option);
      requestAnimationFrame(() => $(`#blog-question-${index} input[value="${option}"]`)?.focus({ preventScroll: true }));
    };
  });
  $$('[data-blog-option]').forEach((element) => {
    element.onclick = (event) => {
      event.preventDefault();
      const index = Number(element.dataset.blogQuestion), option = Number(element.dataset.blogOption);
      toggleOptionAt(index, option);
      if (event.detail === 0) requestAnimationFrame(() => $(`#blog-question-${index} input[value="${option}"]`)?.focus({ preventScroll: true }));
    };
  });
  $$('[data-blog-check]').forEach((button) => {
    button.onclick = () => checkAnswerAt(Number(button.dataset.blogCheck), false);
  });
  $$('[data-blog-reveal]').forEach((button) => {
    button.onclick = () => checkAnswerAt(Number(button.dataset.blogReveal), true);
  });
}

function renderBlogQuestions(options = {}) {
  if (!session) return;
  const preserveScroll = options.preserveScroll !== false;
  const scrollY = window.scrollY;
  $("#blogQuestions").innerHTML = session.questions.map(blogQuestionHtml).join("");
  updateBlogProgress();
  renderChapterTabs();
  bindBlogEvents();
  bindBookmarks();
  observeBlogPosition();
  saveProgress();
  if (preserveScroll) requestAnimationFrame(() => window.scrollTo({ top: scrollY }));
}

function scrollToBlogQuestion(index) {
  const target = $("#blog-question-" + index);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function queueAutoAdvance(questionIndex) {
  clearAutoAdvanceTimer();
  if (!session?.autoAdvance || questionIndex >= session.questions.length - 1) return;
  const delay = session.revealBeforeNext ? 900 : 380;
  session.autoAdvanceTimer = setTimeout(() => {
    if (!session) return;
    if (session.displayMode === "blog") {
      session.index = questionIndex + 1;
      updateBlogProgress();
      renderChapterTabs();
      scrollToBlogQuestion(questionIndex + 1);
    } else if (session.index === questionIndex) {
      advanceOrFinish();
    }
    session.autoAdvanceTimer = null;
  }, delay);
}

function nextLabel() {
  const answer = session.answers[session.index] || {};
  const isLast = session.index === session.questions.length - 1;
  const nextIsNewChapter = !isLast && session.orderedByChapter && session.questions[session.index + 1].chapter !== session.questions[session.index].chapter;
  if (session.questions[session.index].type !== "open" && session.revealBeforeNext && answer.selected != null && !answer.checked && !answer.revealed) return { label: "ตรวจคำตอบ", icon: icons.check, mode: "check" };
  if (isLast) return { label: "ส่งคำตอบ", icon: icons.check, mode: "advance" };
  return { label: nextIsNewChapter ? "บทถัดไป" : "ถัดไป", icon: icons.next, mode: "advance" };
}

function renderPagedQuestion() {
  if (!session) return;
  const question = session.questions[session.index];
  const answerState = session.answers[session.index] || {};
  const indices = visibleIndices();
  const localPosition = indices.indexOf(session.index) + 1;
  const chapterPosition = Math.max(0, session.chapterOrder.indexOf(question.chapter)) + 1;

  $("#chapterCounter").textContent = session.orderedByChapter ? (session.chapterOrder.length > 1 ? `บท ${chapterPosition} จาก ${session.chapterOrder.length}` : "บทที่เลือก") : "โหมดสลับข้อ";
  $("#progressText").textContent = session.orderedByChapter ? `ข้อ ${localPosition} / ${indices.length}` : `ข้อ ${session.index + 1} / ${session.questions.length}`;
  $("#overallProgress").textContent = session.orderedByChapter && session.questions.length !== indices.length ? `ความคืบหน้ารวม ${session.index + 1}/${session.questions.length}` : `ตอบแล้ว ${session.answers.filter((item) => item?.selected != null).length}/${session.questions.length}`;
  $("#progressBar").style.width = `${(session.orderedByChapter ? localPosition / indices.length : (session.index + 1) / session.questions.length) * 100}%`;
  $("#chapterLabel").textContent = question.chapter;
  $("#questionKicker").textContent = `คำถาม ${String(session.orderedByChapter ? question.sourceNo : session.index + 1).padStart(2, "0")}`;
  $("#qtitle").textContent = question.question;
  $("#prev").disabled = session.index === 0;

  const next = nextLabel();
  $("#next").dataset.mode = next.mode;
  $("#next").innerHTML = `${next.label}${next.icon}`;

  if (question.image) {
    $("#qimg").src = question.image;
    $("#qimg").classList.remove("hidden");
  } else {
    $("#qimg").classList.add("hidden");
  }

  const isChecked = Boolean(answerState.checked || answerState.revealed);
  const showAnswerButton = $("#showAnswer");
  showAnswerButton.classList.toggle("hidden", !session.revealBeforeNext || question.type === "open");
  showAnswerButton.disabled = isChecked;
  showAnswerButton.textContent = isChecked ? "เฉลยแล้ว" : "ดูเฉลย";
  $("#options").innerHTML = question.options.map((option, index) => {
    const selected = answerState.selected === index;
    const correct = isChecked && index === question.answer;
    const wrong = isChecked && selected && index !== question.answer;
    return `<label class="option ${selected ? "selected" : ""} ${isChecked ? "checked" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}" data-i="${index}"><input type="radio" name="answer" value="${index}" ${selected ? "checked" : ""} ${isChecked ? "disabled" : ""}><span class="optionKey">${String.fromCharCode(65 + index)}</span><span class="optionText">${escapeHtml(option)}</span><span class="optionMark" aria-hidden="true"></span></label>`;
  }).join("");

  if (question.type === "open") $("#options").innerHTML = openResponseHtml(question, session.index);
  if (question.note) $("#options").insertAdjacentHTML("afterbegin", `<p class="question-note">${escapeHtml(question.note)}</p>`);
  bindOpenResponses();
  $$(".option").forEach((optionElement) => {
    optionElement.onclick = (event) => {
      event.preventDefault();
      const option = Number(optionElement.dataset.i);
      toggleOption(option);
      if (event.detail === 0) requestAnimationFrame(() => $(`#options input[value="${option}"]`)?.focus({ preventScroll: true }));
    };
  });
  $$('#options input[type="radio"]').forEach((input) => {
    input.onchange = () => {
      const option = Number(input.value);
      toggleOption(option);
      requestAnimationFrame(() => $(`#options input[value="${option}"]`)?.focus({ preventScroll: true }));
    };
  });

  renderChapterTabs();
  renderSlots();
  updateLearnerUI();
  saveProgress();
}

function toggleOption(optionIndex) {
  toggleOptionAt(session.index, optionIndex);
}

function openResponseHtml(question, index) {
  return `<label class="open-response-label">คำตอบของคุณ (ฝึกเขียน ไม่คิดคะแนน)<textarea class="open-response" data-open-question="${index}" rows="5">${escapeHtml(session.answers[index]?.selected || "")}</textarea></label>`;
}

function bindOpenResponses() {
  $$('[data-open-question]').forEach((input) => {
    input.oninput = () => {
      clearAutoAdvanceTimer();
      const index = Number(input.dataset.openQuestion);
      session.index = index;
      session.answers[index] = { selected: input.value.trim() ? input.value : null, checked: false, revealed: false, correct: false };
      if (session.displayMode === "blog") {
        updateBlogProgress(); renderChapterTabs();
        const status = input.closest('.blog-question-card').querySelector('.blog-answer-status');
        status.textContent = input.value.trim() ? "บันทึกคำตอบแล้ว" : "ยังไม่ตอบ";
        status.className = `blog-answer-status ${input.value.trim() ? "answered" : "unanswered"}`;
      } else { renderSlots(); renderChapterTabs(); }
      updateLearnerUI(); saveProgress();
    };
  });
}

function toggleOptionAt(questionIndex, optionIndex) {
  if (!session) return;
  clearAutoAdvanceTimer();
  const current = session.answers[questionIndex] || {};
  if (current.checked || current.revealed) return;
  const selected = current.selected === optionIndex ? null : optionIndex;
  session.index = questionIndex;
  session.answers[questionIndex] = { selected, checked: false, revealed: false, correct: false };

  if (session.displayMode === "blog") renderBlogQuestions({ preserveScroll: true });
  else renderPagedQuestion();

  if (selected == null || !session.autoAdvance) return;
  if (session.revealBeforeNext) checkAnswerAt(questionIndex, false);
  queueAutoAdvance(questionIndex);
}

function checkAnswerAt(questionIndex, revealOnly = false) {
  if (!session) return false;
  const question = session.questions[questionIndex];
  if (question.type === "open") return false;
  const current = session.answers[questionIndex] || { selected: null };
  if (current.selected == null && !revealOnly) return false;
  session.index = questionIndex;
  session.answers[questionIndex] = {
    ...current,
    checked: true,
    revealed: revealOnly,
    correct: current.selected === question.answer
  };

  if (session.displayMode === "blog") renderBlogQuestions({ preserveScroll: true });
  else renderPagedQuestion();
  return true;
}

function checkCurrentAnswer(revealOnly = false) {
  return checkAnswerAt(session.index, revealOnly);
}
function advanceOrFinish() {
  if (session.index < session.questions.length - 1) {
    session.index += 1;
    renderQuestion();
    return;
  }
  const unanswered = session.answers.filter((answer) => !answer || answer.selected == null).length;
  if (unanswered && !confirm(`ยังไม่ได้ตอบ ${unanswered} ข้อ ต้องการส่งคำตอบเลยหรือไม่?`)) return;
  finish();
}

function handleNext() {
  clearAutoAdvanceTimer();
  if (session.displayMode === "blog") {
    const unanswered = session.answers.filter((answer) => !answer || answer.selected == null).length;
    if (unanswered && !confirm(`ยังไม่ได้ตอบ ${unanswered} ข้อ ต้องการส่งคำตอบเลยหรือไม่?`)) return;
    finish();
    return;
  }
  const answer = session.answers[session.index] || {};
  if (session.questions[session.index].type !== "open" && session.revealBeforeNext && answer.selected != null && !answer.checked && !answer.revealed) {
    checkCurrentAnswer(false);
    return;
  }
  advanceOrFinish();
}

function finish() {
  clearAutoAdvanceTimer();
  const correct = session.answers.reduce((count, answer, index) => count + (answer?.selected != null && answer.selected === session.questions[index].answer ? 1 : 0), 0);
  const total = session.questions.filter((q) => q.type !== "open").length;
  const openCount = session.questions.length - total;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  session.answers = session.answers.map((answer, index) => answer ? { ...answer, correct: answer.selected === session.questions[index].answer } : { selected: null, checked: false, revealed: false, correct: false });
  session.result = {
    correct,
    total,
    percent,
    date: new Date().toISOString(),
    chapters: [...new Set(session.questions.map((question) => question.chapter))],
    flags: [...session.flags],
    questions: session.questions,
    answers: session.answers
  };
  if (total) saveStats({
    correct,
    total,
    percent,
    date: session.result.date,
    chapters: session.result.chapters,
    responses: session.questions.map((question, index) => {
      const selected = session.answers[index]?.selected;
      return {
        id: question.id,
        selectedText: question.type === "open" ? selected : (selected == null ? null : question.options[selected]),
        question: { ...question, options: [...question.options] },
        selected: selected == null ? null : selected
      };
    })
  });
  $("#resultScore").textContent = total ? `${percent}%` : "ไม่คิดคะแนน";
  $("#resultDetail").textContent = `ตอบถูก ${correct} จาก ${total} ข้อ${openCount ? ` · คำถามปลายเปิด ${openCount} ข้อ ไม่รวมในคะแนน` : ""}`;
  const resultReview = $("#resultReview");
  const reviewButton = $("#reviewThis");
  if (session.revealBeforeNext) {
    resultReview.classList.add("hidden");
    resultReview.innerHTML = "";
    reviewButton.classList.remove("hidden");
  } else {
    reviewButton.classList.add("hidden");
    resultReview.innerHTML = `<div class="result-review-head"><span>เฉลยและคำตอบทั้งหมด</span><small>${session.questions.length} ข้อ</small></div><div class="result-review-list">${reviewHtml(session.result.questions, session.result.answers)}</div>`;
    resultReview.classList.remove("hidden");
  }
  show("result");
  renderLearningResult();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exitQuiz() {
  clearAutoAdvanceTimer();
  if (!session) { show("home"); return; }
  saveProgress();
  if (!progressSaved) { alert("บันทึกความคืบหน้าไม่ได้ กรุณาทำต่อและส่งคำตอบก่อนออก เพื่อไม่ให้คำตอบหาย"); return; }
  stopSessionTracking();
  session = null;
  show("home");
  renderResumeCard();
  renderStats();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openModal(title, content) {
  if ($("#modal").classList.contains("hidden")) lastModalFocus = document.activeElement;
  $("#modalTitle").textContent = title;
  $("#modalContent").innerHTML = content;
  $("#modal").classList.remove("hidden");
  $("#closeModal").focus({ preventScroll: true });
}

function reviewHtml(questions, answers = []) {
  return questions.map((question, index) => {
    const answerState = answers[index] || { selected: null, correct: false };
    if (question.type === "open") return `<article class="reviewItem"><div class="pill">${escapeHtml(question.chapter)} · ข้อ ${question.sourceNo} · ปลายเปิด ไม่คิดคะแนน</div><h3>${escapeHtml(question.question)}</h3><p class="open-response-review">${answerState.selected == null ? "ไม่ได้ตอบ" : escapeHtml(answerState.selected)}</p></article>`;
    const status = answerState.selected == null ? "ไม่ได้ตอบ" : (answerState.correct ? "ตอบถูก" : "ตอบผิด");
    const statusClass = answerState.selected == null ? "unanswered" : (answerState.correct ? "correct" : "wrong");
    const options = question.options.map((option, optionIndex) => {
      const isCorrect = optionIndex === question.answer;
      const isWrongSelection = answerState.selected === optionIndex && !isCorrect;
      const isSelectedCorrect = answerState.selected === optionIndex && isCorrect;
      const className = isCorrect ? "review-option correct" : (isWrongSelection ? "review-option wrong" : "review-option");
      const marker = isCorrect ? "✓" : (isWrongSelection ? "×" : String.fromCharCode(65 + optionIndex));
      const note = isCorrect ? "คำตอบที่ถูก" : (isWrongSelection ? "คำตอบของคุณ" : (isSelectedCorrect ? "คำตอบของคุณ" : ""));
      return `<div class="${className}"><span class="review-option-key">${marker}</span><span class="review-option-text">${escapeHtml(option)}</span>${note ? `<small>${note}</small>` : ""}</div>`;
    }).join("");
    return `<article class="reviewItem"><div class="review-item-top"><div class="pill">${escapeHtml(question.chapter)} · ข้อ ${question.sourceNo}</div><span class="review-status ${statusClass}">${status}</span></div><h3>${escapeHtml(question.question)}</h3>${question.image ? `<img class="qimg" src="${escapeHtml(question.image)}">` : ""}<div class="review-options">${options}</div></article>`;
  }).join("");
}

function allQuestionsForReview() {
  const all = [];
  CHAPTERS.forEach((chapter) => chapter.questions.forEach((question, index) => all.push({ ...question, answer: ANSWER_KEY[question.id], chapter: chapter.title, sourceNo: index + 1 })));
  return all;
}

function historyReviewData(item) {
  if (!Array.isArray(item.responses)) return null;
  const questionMap = new Map(allQuestionsForReview().map((question) => [question.id, question]));
  const questions = [];
  const answers = [];

  item.responses.forEach((response) => {
    const question = response.question || questionMap.get(response.id);
    if (!question) return;
    const selected = response.question ? response.selected : (response.selectedText == null ? null : question.options.findIndex((option) => option === response.selectedText));
    const normalizedSelected = question.type === "open" ? (selected ?? null) : (selected >= 0 ? selected : null);
    questions.push(question);
    answers.push({
      selected: normalizedSelected,
      correct: question.type !== "open" && normalizedSelected != null && normalizedSelected === question.answer
    });
  });

  return { questions, answers };
}

function openHistoryDetail(index) {
  const item = stats()[index];
  const detail = item ? historyReviewData(item) : null;
  if (!item || !detail) return;
  openModal(`ผลการทำ ${item.percent}%`, `<div class="history-detail-summary"><div><b>${item.correct}/${item.total} ข้อ</b><span>ตอบถูก</span></div><div><b>${item.total - item.correct}</b><span>ตอบผิดหรือไม่ได้ตอบ</span></div><div><b>${new Date(item.date).toLocaleDateString("th-TH")}</b><span>${new Date(item.date).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</span></div></div><div class="result-review-list">${reviewHtml(detail.questions, detail.answers)}</div>`);
}

function openHistory() {
  const list = stats();
  const content = list.length ? `<div class="history">${list.map((item, index) => {
    const hasDetail = Array.isArray(item.responses);
    const wrong = Math.max(0, item.total - item.correct);
    return `<button class="historyItem ${hasDetail ? "has-detail" : "legacy"}" type="button" data-history-index="${index}" ${hasDetail ? "" : "disabled"}>
      <span class="history-score"><b>${item.percent}%</b><small>${item.correct}/${item.total} ข้อ</small></span>
      <span class="history-copy"><b>${escapeHtml(item.chapters.join(", "))}</b><small>${hasDetail ? `ผิดหรือไม่ได้ตอบ ${wrong} ข้อ · กดเพื่อดูเฉลย` : "รายการเก่าไม่มีรายละเอียดคำตอบ"}</small></span>
      <span class="history-date">${new Date(item.date).toLocaleString("th-TH")}</span>
      ${hasDetail ? '<svg class="history-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>' : ""}
    </button>`;
  }).join("")}</div>` : '<div class="empty">ยังไม่มีประวัติคะแนน</div>';
  openModal("ประวัติคะแนน", content);
  $$("[data-history-index]").forEach((button) => {
    button.onclick = () => openHistoryDetail(Number(button.dataset.historyIndex));
  });
}

$("#themeToggle").onclick = () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
$("#openSettings").onclick = openQuizSettings;
$("#start").onclick = start;
$("#selectAll").onclick = () => { $$("#chapterGrid input").forEach((input) => input.checked = true); updateHomeSelection(); };
$("#clearAll").onclick = () => { $$("#chapterGrid input").forEach((input) => input.checked = false); updateHomeSelection(); };
$("#prev").onclick = () => { if (session?.index > 0) goTo(session.index - 1); };
$("#next").onclick = handleNext;
$("#showAnswer").onclick = () => checkCurrentAnswer(true);
$("#quit").onclick = exitQuiz;
$("#backHome").onclick = () => { clearAutoAdvanceTimer(); session = null; show("home"); renderStats(); window.scrollTo({ top: 0, behavior: "smooth" }); };
$("#reviewThis").onclick = () => openModal("เฉลยชุดล่าสุด", reviewHtml(session.result.questions, session.result.answers));
$("#openStats").onclick = openHistory;
$("#closeModal").onclick = closeQuizModal;
$("#modal").onclick = (event) => { if (event.target.id === "modal") closeQuizModal(); };
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !$("#modal").classList.contains("hidden")) closeQuizModal(); });

init();
