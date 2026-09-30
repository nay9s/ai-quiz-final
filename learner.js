"use strict";

const progressKey = "aiQuizProgressV1";
let quizClockTimer = null;
let blogPositionObserver = null;
let progressSaved = true;
let lastModalFocus = null;

function closeQuizModal() {
  $("#modal").classList.add("hidden");
  if (lastModalFocus?.isConnected) lastModalFocus.focus({ preventScroll: true });
}

function sourceSignature() {
  const text = JSON.stringify([CHAPTERS, ANSWER_KEY]);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) || "null");
    if (!saved || saved.version !== 1 || saved.sourceSignature !== sourceSignature()) return null;
    if (!Array.isArray(saved.questions) || !saved.questions.length || !Array.isArray(saved.answers) || saved.answers.length !== saved.questions.length || !Array.isArray(saved.flags) || saved.flags.length !== saved.questions.length || !Array.isArray(saved.chapterOrder)) return null;
    if (!Number.isInteger(saved.index) || saved.index < 0 || saved.index >= saved.questions.length || !["blog", "paged"].includes(saved.displayMode)) return null;
    if (!Number.isFinite(saved.startedAt) || (saved.deadline != null && !Number.isFinite(saved.deadline))) return null;
    const source = new Map(allQuestionsForReview().map((q) => [q.id, q]));
    const ids = new Set();
    const valid = saved.questions.every((q, i) => {
      const original = source.get(q.id);
      if (!original || ids.has(q.id) || q.question !== original.question || q.chapter !== original.chapter || !Array.isArray(q.options) || JSON.stringify([...q.options].sort()) !== JSON.stringify([...original.options].sort())) return false;
      ids.add(q.id);
      if (q.type !== original.type || (q.type !== "open" && (q.options[q.answer] !== original.options[original.answer] || !Number.isInteger(q.answer)))) return false;
      const selected = saved.answers[i]?.selected;
      return selected == null || (q.type === "open" ? typeof selected === "string" : Number.isInteger(selected) && selected >= 0 && selected < q.options.length);
    });
    if (!valid || saved.chapterOrder.some((title) => !saved.questions.some((q) => q.chapter === title))) return null;
    return saved;
  } catch { return null; }
}

function saveProgress() {
  if (!session || session.result || $("#quiz").classList.contains("hidden")) return;
  const saved = {
    version: 1, sourceSignature: sourceSignature(), questions: session.questions,
    answers: session.answers, flags: session.flags, index: session.index,
    chapterOrder: session.chapterOrder, orderedByChapter: session.orderedByChapter,
    revealBeforeNext: session.revealBeforeNext, displayMode: session.displayMode,
    autoAdvance: session.autoAdvance, startedAt: session.startedAt, deadline: session.deadline
  };
  try { localStorage.setItem(progressKey, JSON.stringify(saved)); progressSaved = true; }
  catch { progressSaved = false; }
  $("#saveStatus").textContent = progressSaved ? "" : "บันทึกบนเครื่องไม่ได้ · อย่าปิดหน้านี้ก่อนส่งคำตอบ";
  $("#saveStatus").classList.toggle("hidden", progressSaved);
}

function removeProgress() { try { localStorage.removeItem(progressKey); } catch {} }

function renderResumeCard() {
  const saved = readProgress();
  $("#resumeCard").classList.toggle("hidden", !saved);
  if (saved) {
    const answered = saved.answers.filter((answer) => answer?.selected != null).length;
    $("#resumeDetail").textContent = `${saved.chapterOrder.join(" · ")} — ตอบแล้ว ${answered}/${saved.questions.length} ข้อ`;
  }
}

function updateHomeSelection() {
  const ids = $$("#chapterGrid input:checked").map((input) => input.value);
  const count = CHAPTERS.filter((c) => ids.includes(c.id)).reduce((sum, c) => sum + c.questions.length, 0);
  $("#selectionSummary").textContent = `${ids.length} บท · ${count} ข้อ`;
  $("#start").disabled = !count;
  $("#start").textContent = count ? `เริ่มทำ ${count} ข้อ` : "เลือกบทเพื่อเริ่ม";
}

function syncStudyModes() {
  $("#practiceMode").setAttribute("aria-pressed", String(quizSettings.revealBeforeNext));
  $("#examMode").setAttribute("aria-pressed", String(!quizSettings.revealBeforeNext));
  $("#examTimeWrap").classList.toggle("hidden", quizSettings.revealBeforeNext);
  $("#modeHelp").textContent = quizSettings.revealBeforeNext ? "เลือกคำตอบแล้วเฉลยทันที" : "ดูเฉลยหลังส่งคำตอบ";
  $("#examTimeHelp").classList.toggle("hidden", quizSettings.revealBeforeNext || $("#examMinutes").value === "0");
}

function chooseStudyMode(practice) {
  saveQuizSettings({ ...quizSettings, revealBeforeNext: practice });
  syncStudyModes();
}

function stopSessionTracking() {
  if (quizClockTimer) clearInterval(quizClockTimer);
  quizClockTimer = null;
  if (blogPositionObserver) blogPositionObserver.disconnect();
  blogPositionObserver = null;
}

function activateSession() {
  stopSessionTracking();
  show("quiz");
  renderQuestion();
  updateLearnerUI();
  saveProgress();
  if (session.deadline) {
    const active = session;
    const tick = () => {
      if (session !== active || session.result) return;
      const seconds = Math.max(0, Math.ceil((session.deadline - Date.now()) / 1000));
      $("#sessionClock").textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
      $("#sessionClock").classList.toggle("time-low", seconds < 60);
      if (!seconds) {
        clearAutoAdvanceTimer();
        $("#modal").classList.add("hidden");
        finish();
        $("#resultMessage").textContent = "ครบเวลาสอบ ส่งคำตอบแล้ว";
        $("#resultMessage").classList.remove("hidden");
      }
    };
    quizClockTimer = setInterval(tick, 1000);
    tick();
  }
}

function resumeQuiz() {
  const saved = readProgress();
  if (!saved) { renderResumeCard(); return; }
  clearAutoAdvanceTimer();
  session = { ...saved, autoAdvanceTimer: null, flags: saved.flags.map(Boolean) };
  session.answers = saved.answers.map((a, i) => a ? { ...a, correct: session.questions[i].type !== "open" && a.selected != null && a.selected === session.questions[i].answer } : null);
  activateSession();
  if (!session.result) {
    if (session.displayMode === "blog") requestAnimationFrame(() => scrollToBlogQuestion(session.index));
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function bookmarkHtml(index) {
  const flagged = Boolean(session.flags?.[index]);
  return `<button class="bookmark-btn ${flagged ? "is-bookmarked" : ""}" data-flag-question="${index}" type="button" aria-pressed="${flagged}" aria-label="${flagged ? "ยกเลิกปักหมุด" : "ปักหมุด"}ข้อ ${index + 1}" title="${flagged ? "ยกเลิกปักหมุด" : "ปักหมุด"}"><svg viewBox="0 0 24 24" fill="${flagged ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg></button>`;
}

function answerIconHtml(index) {
  if (!session.revealBeforeNext || session.questions[index].type === "open") return "";
  const visible = isAnswerVisible(index);
  const label = visible ? "ซ่อนเฉลย" : "ดูเฉลย";
  const icon = visible
    ? '<path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A11 11 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3 3.8M6.2 6.2A20 20 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.8-1.8"/>'
    : '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>';
  return `<button class="answer-icon ${visible ? "is-visible" : ""}" data-answer-detail="${index}" type="button" aria-label="${label}ข้อ ${index + 1}" title="${label}" aria-pressed="${visible}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg></button>`;
}

function isAnswerVisible(index) {
  const answer = session.answers[index] || {};
  return session.revealBeforeNext && (answer.showAnswer ?? Boolean(answer.checked || answer.revealed));
}

function bindAnswerDetails() {
  $$('[data-answer-detail]').forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.answerDetail);
      if (!session?.revealBeforeNext || session.result || session.questions[index]?.type === "open") return;
      clearAutoAdvanceTimer();
      session.answers[index] = { ...(session.answers[index] || { selected: null }), showAnswer: !isAnswerVisible(index) };
      if (session.displayMode === "blog") renderBlogQuestions({ preserveScroll: true });
      else renderPagedQuestion();
      $(`[data-answer-detail="${index}"]`)?.focus({ preventScroll: true });
    };
  });
}

function toggleBookmark(index) {
  if (!session || session.result) return;
  session.flags[index] = !session.flags[index];
  $$(`[data-flag-question="${index}"]`).forEach((button) => {
    button.innerHTML = bookmarkHtml(index).match(/<button[^>]*>([\s\S]*)<\/button>/)[1];
    button.setAttribute("aria-pressed", String(session.flags[index]));
    button.setAttribute("aria-label", `${session.flags[index] ? "ยกเลิกปักหมุด" : "ปักหมุด"}ข้อ ${index + 1}`);
    button.title = session.flags[index] ? "ยกเลิกปักหมุด" : "ปักหมุด";
    button.classList.toggle("is-bookmarked", session.flags[index]);
  });
  bindBookmarks();
  if (session.displayMode === "paged") renderSlots();
  updateLearnerUI(); saveProgress();
}

function bindBookmarks() {
  $$('[data-flag-question]').forEach((button) => button.onclick = () => toggleBookmark(Number(button.dataset.flagQuestion)));
}

function updateLearnerUI() {
  if (!session || session.result) return;
  session.flags ||= Array(session.questions.length).fill(false);
  const answered = session.answers.filter((a) => a?.selected != null).length;
  const remaining = session.questions.length - answered;
  const flagged = session.flags.filter(Boolean).length;
  $("#remainingCount").textContent = `${answered}/${session.questions.length}`;
  $("#remainingCount").setAttribute("aria-label", `ตอบแล้ว ${answered} จาก ${session.questions.length} ข้อ${remaining ? " ไปข้อที่ยังไม่ตอบ" : ""}`);
  $("#remainingCount").disabled = !remaining;
  $("#flaggedNumber").textContent = flagged;
  $("#flaggedCount").setAttribute("aria-label", `ดูข้อที่ปักหมุด ${flagged} ข้อ`);
  $("#flaggedCount").title = `ข้อที่ปักหมุด ${flagged} ข้อ`;
  $("#flaggedCount").disabled = !flagged;
  $("#sessionClock").classList.toggle("hidden", !session.deadline);
  $("#progressBar").style.width = `${answered / session.questions.length * 100}%`;
  $("#quiz .bar").setAttribute("aria-valuenow", String(Math.round(answered / session.questions.length * 100)));
  $("#pagedModeLabel").textContent = session.revealBeforeNext ? "ฝึกทำ" : "สอบ";
  const flag = $("#flagCurrent");
  flag.dataset.flagQuestion = session.index;
  flag.setAttribute("aria-pressed", String(Boolean(session.flags[session.index])));
  flag.setAttribute("aria-label", `${session.flags[session.index] ? "ยกเลิกปักหมุด" : "ปักหมุด"}ข้อ ${session.index + 1}`);
  flag.title = session.flags[session.index] ? "ยกเลิกปักหมุด" : "ปักหมุด";
  flag.classList.toggle("is-bookmarked", Boolean(session.flags[session.index]));
  flag.innerHTML = bookmarkHtml(session.index).match(/<button[^>]*>([\s\S]*)<\/button>/)[1];
  bindBookmarks();
}

function goToUnanswered() {
  if (!session) return;
  const indices = session.questions.map((_, i) => i);
  const target = [...indices.slice(session.index + 1), ...indices.slice(0, session.index + 1)].find((i) => session.answers[i]?.selected == null);
  if (target != null) goTo(target);
}

function openQuestionMap(flaggedOnly = false) {
  if (!session) return;
  const items = session.questions.map((q, i) => ({ q, i })).filter(({ i }) => !flaggedOnly || session.flags[i]);
  openModal(flaggedOnly ? "ข้อที่ปักหมุดไว้" : "ภาพรวมแบบทดสอบ", `<p class="map-help">เลือกข้อเพื่อกลับไปทำ · จุดสีแสดงข้อที่ตอบแล้ว · หมุดแสดงข้อที่อยากทบทวน</p><div class="question-map">${items.map(({ q, i }) => `<button class="map-question ${session.answers[i]?.selected != null ? "is-answered" : ""} ${i === session.index ? "is-current" : ""}" data-map-index="${i}"><b>${i + 1}${session.flags[i] ? " ▧" : ""}</b><span>${escapeHtml(q.chapter)} · ข้อ ${q.sourceNo}</span></button>`).join("")}</div>`);
  $$('[data-map-index]').forEach((button) => button.onclick = () => { closeQuizModal(); goTo(Number(button.dataset.mapIndex)); });
}

function observeBlogPosition() {
  if (blogPositionObserver) blogPositionObserver.disconnect();
  if (!window.IntersectionObserver || session?.displayMode !== "blog") return;
  const active = session;
  const observer = new IntersectionObserver((entries) => {
    if (session !== active || session.result || observer !== blogPositionObserver || $("#quiz").classList.contains("hidden")) return;
    const entry = entries.filter((item) => item.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top - 24) - Math.abs(b.boundingClientRect.top - 24))[0];
    if (!entry) return;
    const index = Number(entry.target.dataset.blogCard);
    if (index !== session.index) { session.index = index; updateBlogProgress(); renderChapterTabs(); saveProgress(); }
  }, { rootMargin: "-24px 0px -45% 0px", threshold: 0 });
  blogPositionObserver = observer;
  $$('[data-blog-card]').forEach((card) => observer.observe(card));
}

function renderLearningResult() {
  stopSessionTracking(); removeProgress(); renderResumeCard();
  const result = session.result;
  const wrong = result.questions.filter((q, i) => q.type !== "open" && result.answers[i]?.selected !== q.answer).length;
  const flagged = session.flags.filter(Boolean).length;
  $("#retryWrong").textContent = `ทบทวนข้อผิดและยังไม่ตอบ (${wrong})`;
  $("#retryWrong").disabled = !wrong;
  $("#retryFlagged").textContent = `ทบทวนข้อที่ปักหมุด (${flagged})`;
  $("#retryFlagged").disabled = !flagged;
  $("#resultMessage").textContent = "";
  $("#resultMessage").classList.add("hidden");
  $("#chapterResults").innerHTML = result.chapters.map((chapter) => {
    const indices = result.questions.map((q, i) => q.chapter === chapter && q.type !== "open" ? i : -1).filter((i) => i >= 0);
    const correct = indices.filter((i) => result.answers[i]?.correct).length;
    return `<div class="chapter-result"><div><b>${escapeHtml(chapter)}</b><span>${indices.length ? `ตอบถูก ${correct}/${indices.length} ข้อ` : "คำถามปลายเปิด ไม่คิดคะแนน"}</span></div><div class="chapter-result-bar"><span style="width:${indices.length ? correct / indices.length * 100 : 0}%"></span></div></div>`;
  }).join("");
  $("#result h2").setAttribute("tabindex", "-1");
  $("#result h2").focus({ preventScroll: true });
}

function retryQuestions(flaggedOnly = false) {
  if (!session?.result) return;
  const questions = session.questions.filter((q, i) => flaggedOnly ? session.flags[i] : q.type !== "open" && session.answers[i]?.selected !== q.answer);
  if (!questions.length) return;
  const chapterOrder = [...new Set(questions.map((q) => q.chapter))];
  questions.sort((a, b) => chapterOrder.indexOf(a.chapter) - chapterOrder.indexOf(b.chapter) || a.sourceNo - b.sourceNo);
  session = { questions: questions.map((q) => ({ ...q, options: [...q.options] })), index: 0, answers: Array(questions.length).fill(null), flags: Array(questions.length).fill(false), chapterOrder, orderedByChapter: true, revealBeforeNext: true, displayMode: session.displayMode, autoAdvance: false, autoAdvanceTimer: null, startedAt: Date.now(), deadline: null };
  activateSession(); window.scrollTo({ top: 0, behavior: "smooth" });
}

function initLearner() {
  const questionNav = $("#quiz .slotWrap");
  if (window.ResizeObserver) new ResizeObserver(updateQuestionNavHeight).observe(questionNav);
  else window.addEventListener("resize", updateQuestionNavHeight);
  $("#examMinutes").onchange = syncStudyModes;
  $("#resumeQuiz").onclick = resumeQuiz;
  $("#discardProgress").onclick = async () => { if (await webConfirm("ลบคำตอบของชุดที่พักไว้และเริ่มใหม่?", "ลบชุดที่พักไว้")) { removeProgress(); renderResumeCard(); } };
  $("#practiceMode").onclick = () => chooseStudyMode(true);
  $("#examMode").onclick = () => chooseStudyMode(false);
  $("#remainingCount").onclick = goToUnanswered;
  $("#flaggedCount").onclick = () => openQuestionMap(true);
  $("#questionMap").onclick = () => openQuestionMap(false);
  $("#retryWrong").onclick = () => retryQuestions(false);
  $("#retryFlagged").onclick = () => retryQuestions(true);
  window.addEventListener("pagehide", saveProgress);
  document.addEventListener("visibilitychange", () => { if (document.hidden) saveProgress(); });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || $("#modal").classList.contains("hidden")) return;
    const items = $$('#modal button:not(:disabled), #modal input:not(:disabled), #modal select:not(:disabled), #modal textarea:not(:disabled), #modal a[href]').filter((item) => item.offsetParent !== null);
    const first = items[0], last = items[items.length - 1];
    if (!first) { event.preventDefault(); $("#modal .modalbox").focus(); }
    else if (event.shiftKey && (document.activeElement === first || !$("#modal").contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !$("#modal").contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  });
  syncStudyModes();
}

function updateQuestionNavHeight() {
  const height = $("#quiz .slotWrap").getBoundingClientRect().height;
  if (height) document.documentElement.style.setProperty("--question-nav-height", `${height}px`);
}
