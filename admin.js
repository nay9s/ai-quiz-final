"use strict";
const el = (id) => document.getElementById(id);
let data, chapterIndex = 0, questionIndex = 0, dirty = false;
const draftKey = "aiQuizEditorDraft";
const chapter = () => data?.questions.chapters[chapterIndex];
const question = () => chapter()?.questions[questionIndex];
function status(message, error = false) { el("adminStatus").textContent = message; el("adminStatus").dataset.error = String(error); }
function changed() {
  dirty = true;
  el("jsonPreview").value = "";
  try { localStorage.setItem(draftKey, JSON.stringify(data)); el("restoreDraft").disabled = false; status("บันทึกฉบับร่างในเบราว์เซอร์แล้ว — ดาวน์โหลดไฟล์เพื่ออัปเดต GitHub"); }
  catch { status("แก้ไขแล้ว แต่บันทึกฉบับร่างไม่ได้ กรุณาดาวน์โหลดก่อนปิดหน้า", true); }
}
function choices(select, items, selected) {
  select.replaceChildren(...items.map((item, i) => { const option = document.createElement("option"); option.value = i; option.textContent = item; return option; }));
  select.value = String(selected);
}
function render() {
  document.querySelectorAll("button,input,select,textarea").forEach((control) => { if (control.id !== "restoreDraft") control.disabled = false; });
  choices(el("chapterSelect"), data.questions.chapters.map((c) => `${c.title || "บทใหม่"} (${c.questions.length} ข้อ)`), chapterIndex);
  el("chapterId").value = chapter().id;
  el("chapterTitle").value = chapter().title;
  choices(el("questionSelect"), chapter().questions.map((q, i) => `${i + 1}. ${q.question || "คำถามใหม่"}`), questionIndex);
  const q = question();
  el("questionEditor").hidden = !q; el("emptyQuestion").hidden = Boolean(q); el("deleteQuestion").disabled = !q;
  if (!q) return;
  el("questionId").value = q.id; el("questionText").value = q.question; el("questionImage").value = q.image || "";
  el("questionNote").value = q.note || "";
  el("questionType").value = q.type === "open" ? "open" : String(q.options.length);
  for (let i = 0; i < 5; i++) { el(`option${i}`).value = q.options[i] || ""; el(`option${i}`).parentElement.hidden = q.type === "open" || i >= q.options.length; }
  el("correctAnswer").parentElement.hidden = q.type === "open";
  el("correctAnswer").querySelector('[value="E"]').disabled = q.options.length < 5;
  el("correctAnswer").value = data.answers.answers[q.id] || "A";
}
function uniqueId(prefix, ids) { let n = 1; while (ids.has(`${prefix}-${n}`)) n++; return `${prefix}-${n}`; }
function addQuestionTo(c) {
  const id = uniqueId(c.id || "question", new Set(data.questions.chapters.flatMap((item) => item.questions.map((q) => q.id))));
  c.questions.push({ id, question: "", options: ["", "", "", ""] }); data.answers.answers[id] = "A";
}
function checkedData() { return QuizData.validate(data); }
function output(filename) {
  checkedData();
  const json = (value) => JSON.stringify(value, null, 2) + "\n";
  if (filename === "quiz-data.json") return QuizData.serialize(data);
  if (filename === "questions.json") return json(data.questions);
  if (filename === "answers.json") return json(data.answers);
  if (filename === "questions-data.js") return "window.QUIZ_QUESTION_DATA = " + json(data.questions).trimEnd() + ";\n";
  return "window.QUIZ_ANSWER_DATA = " + json(data.answers).trimEnd() + ";\n";
}
function guard(action) { try { action(); } catch (error) { status(error.message, true); } }
for (let i = 0; i < 5; i++) {
  const label = document.createElement("label"); label.textContent = `ตัวเลือก ${String.fromCharCode(65 + i)}`;
  const input = document.createElement("textarea"); input.id = `option${i}`; input.rows = 2;
  input.oninput = () => { question().options[i] = input.value; changed(); };
  label.append(input); el("optionFields").append(label);
}
el("chapterSelect").onchange = () => { chapterIndex = Number(el("chapterSelect").value); questionIndex = 0; render(); };
el("questionSelect").onchange = () => { questionIndex = Number(el("questionSelect").value); render(); };
el("chapterId").oninput = () => { chapter().id = el("chapterId").value; changed(); };
el("chapterTitle").oninput = () => { chapter().title = el("chapterTitle").value; el("chapterSelect").selectedOptions[0].textContent = chapter().title || "บทใหม่"; changed(); };
el("questionId").onchange = () => guard(() => {
  const q = question(), next = el("questionId").value.trim();
  if (!next || data.questions.chapters.some((c) => c.questions.some((other) => other !== q && other.id === next))) { el("questionId").value = q.id; throw new Error("ID คำถามต้องไม่ว่างและไม่ซ้ำ"); }
  const answer = data.answers.answers[q.id]; delete data.answers.answers[q.id]; q.id = next; data.answers.answers[next] = answer; changed();
});
el("questionText").oninput = () => { question().question = el("questionText").value; el("questionSelect").selectedOptions[0].textContent = `${questionIndex + 1}. ${question().question || "คำถามใหม่"}`; changed(); };
el("questionImage").oninput = () => { if (el("questionImage").value.trim()) question().image = el("questionImage").value.trim(); else delete question().image; changed(); };
el("questionNote").oninput = () => { if (el("questionNote").value.trim()) question().note = el("questionNote").value.trim(); else delete question().note; changed(); };
el("questionType").onchange = () => {
  const q = question(), type = el("questionType").value;
  if (type === "open") { q.type = "open"; q.options = []; delete data.answers.answers[q.id]; }
  else {
    delete q.type;
    q.options = Array.from({ length: Number(type) }, (_, i) => q.options[i] || "");
    const answer = data.answers.answers[q.id];
    if (!answer || answer.charCodeAt(0) - 65 >= q.options.length) data.answers.answers[q.id] = "A";
  }
  changed(); render();
};
el("correctAnswer").onchange = () => { data.answers.answers[question().id] = el("correctAnswer").value; changed(); };
el("addChapter").onclick = () => { const c = { id: uniqueId("quiz", new Set(data.questions.chapters.map((item) => item.id))), title: "บทใหม่", questions: [] }; data.questions.chapters.push(c); chapterIndex = data.questions.chapters.length - 1; questionIndex = 0; addQuestionTo(c); changed(); render(); };
el("addQuestion").onclick = () => { addQuestionTo(chapter()); questionIndex = chapter().questions.length - 1; changed(); render(); };
el("deleteQuestion").onclick = () => { if (!question() || !confirm("ลบคำถามนี้จากฉบับร่าง?")) return; delete data.answers.answers[question().id]; chapter().questions.splice(questionIndex, 1); questionIndex = Math.max(0, questionIndex - 1); changed(); render(); };
el("deleteChapter").onclick = () => { if (data.questions.chapters.length === 1) { status("ต้องเหลืออย่างน้อย 1 บท", true); return; } if (!confirm("ลบบทนี้และคำถามทั้งหมดจากฉบับร่าง?")) return; chapter().questions.forEach((q) => delete data.answers.answers[q.id]); data.questions.chapters.splice(chapterIndex, 1); chapterIndex = 0; questionIndex = 0; changed(); render(); };
el("previewJson").onclick = () => guard(() => { el("jsonPreview").value = QuizData.serialize(data); status(`ข้อมูลผ่านการตรวจสอบ: ${data.questions.chapters.length} บท ${data.questions.chapters.reduce((sum, c) => sum + c.questions.length, 0)} ข้อ`); });
el("exportData").onclick = () => guard(() => {
  const filename = el("exportFormat").value, content = output(filename);
  const url = URL.createObjectURL(new Blob([content], { type: filename.endsWith(".json") ? "application/json;charset=utf-8" : "text/javascript;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  status(`ส่งออก ${filename} แล้ว — นำไปแทนที่ไฟล์บน GitHub`);
});
el("importFiles").onchange = async () => {
  try {
    const files = Array.from(el("importFiles").files); if (!files.length) return;
    const parsed = await Promise.all(files.map(async (file) => JSON.parse(await file.text())));
    let candidate;
    if (parsed.length === 1 && parsed[0].questions && parsed[0].answers) candidate = parsed[0];
    else if (parsed.length === 2) candidate = { questions: parsed.find((p) => Array.isArray(p.chapters)), answers: parsed.find((p) => p.answers && !p.questions) };
    else throw new Error("เลือก quiz-data.json 1 ไฟล์ หรือ questions.json และ answers.json 2 ไฟล์พร้อมกัน");
    QuizData.validate(candidate);
    if (dirty && !confirm("นำเข้าข้อมูลแทนที่ฉบับร่างปัจจุบัน?")) return;
    data = QuizData.copy(candidate); chapterIndex = questionIndex = 0; changed(); render();
  } catch (error) { status(`นำเข้าไม่สำเร็จ: ${error.message}`, true); }
  finally { el("importFiles").value = ""; }
};
el("restoreDraft").onclick = () => guard(() => {
  if (dirty && !confirm("เปิดฉบับร่างที่บันทึกไว้แทนข้อมูลปัจจุบัน?")) return;
  const candidate = JSON.parse(localStorage.getItem(draftKey));
  // Drafts may contain incomplete questions; validate their structure before editing.
  if (!candidate?.questions?.chapters?.length || !candidate.answers?.answers || !candidate.questions.chapters.every((c) => typeof c.id === "string" && typeof c.title === "string" && Array.isArray(c.questions) && c.questions.every((q) => typeof q.id === "string" && typeof q.question === "string" && Array.isArray(q.options) && (q.type === "open" ? !q.options.length : [4, 5].includes(q.options.length))))) throw new Error("ฉบับร่างไม่ถูกต้อง กรุณานำเข้า JSON ใหม่");
  data = candidate; chapterIndex = questionIndex = 0; dirty = true; el("jsonPreview").value = ""; render(); status("เปิดฉบับร่างแล้ว — ตรวจสอบก่อนส่งออก");
});
async function loadSource() {
  try { const source = await QuizData.load(); data = source; chapterIndex = questionIndex = 0; dirty = false; el("jsonPreview").value = ""; render(); status("โหลดข้อมูลเว็บไซต์แล้ว เลือกบทและคำถามเพื่อแก้ไข"); }
  catch (error) { status(error.message, true); }
}
el("reloadSource").onclick = () => { if (!dirty || confirm("ทิ้งการแก้ไขบนหน้าจอและโหลดข้อมูลเว็บใหม่?")) loadSource(); };
window.addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } });
try { el("restoreDraft").disabled = !localStorage.getItem(draftKey); } catch {}
// Keep edit controls disabled until a valid source has loaded.
document.querySelectorAll("button,input,select,textarea").forEach((control) => { if (control.id !== "importFiles" && control.id !== "restoreDraft" && control.id !== "reloadSource") control.disabled = true; });
loadSource();
