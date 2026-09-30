"use strict";
window.QuizData = (() => {
  const copy = (value) => JSON.parse(JSON.stringify(value));
  function validate(data) {
    if (!data || !Array.isArray(data.questions?.chapters) || !data.answers?.answers || typeof data.answers.answers !== "object") throw new Error("ต้องมี questions.chapters และ answers.answers");
    if (!data.questions.chapters.length) throw new Error("ต้องมีอย่างน้อย 1 บท");
    const chapterIds = new Set(), chapterTitles = new Set(), questionIds = new Set();
    const nonempty = (value) => typeof value === "string" && value.trim().length > 0;
    for (const chapter of data.questions.chapters) {
      if (!nonempty(chapter.id) || !nonempty(chapter.title) || chapterIds.has(chapter.id)) throw new Error("ID บทต้องไม่ซ้ำและต้องมีชื่อบท");
      chapterIds.add(chapter.id);
      if (chapterTitles.has(chapter.title)) throw new Error("ชื่อบทต้องไม่ซ้ำ เพื่อแยกความคืบหน้าของแต่ละบท");
      chapterTitles.add(chapter.title);
      if (!Array.isArray(chapter.questions) || !chapter.questions.length) throw new Error(`บท ${chapter.title} ต้องมีคำถามอย่างน้อย 1 ข้อ`);
      for (const q of chapter.questions) {
        if (!nonempty(q.id) || questionIds.has(q.id) || !nonempty(q.question)) throw new Error("ID คำถามต้องไม่ซ้ำและต้องมีข้อความคำถาม");
        questionIds.add(q.id);
        if (q.type != null && !["choice", "open"].includes(q.type)) throw new Error(`ประเภทคำถาม ${q.id} ไม่ถูกต้อง`);
        if (q.type === "open") {
          if (!Array.isArray(q.options) || q.options.length) throw new Error(`คำถามปลายเปิด ${q.id} ต้องไม่มีตัวเลือก`);
        } else {
          if (!Array.isArray(q.options) || ![4, 5].includes(q.options.length) || !q.options.every(nonempty)) throw new Error(`คำถาม ${q.id} ต้องมีตัวเลือกครบ 4 หรือ 5 ตัวเลือก`);
          const answer = data.answers.answers[q.id];
          if (typeof answer !== "string" || !/^[A-E]$/.test(answer) || answer.charCodeAt(0) - 65 >= q.options.length) throw new Error(`คำถาม ${q.id} ต้องเลือกเฉลยที่ตรงกับตัวเลือก`);
        }
        if (q.note != null && typeof q.note !== "string") throw new Error(`หมายเหตุ ${q.id} ต้องเป็นข้อความ`);
        if (q.image && (typeof q.image !== "string" || !/^assets\/[\w\-./ ]+$/i.test(q.image) || q.image.includes(".."))) throw new Error(`รูป ${q.id} ต้องใช้ path ภายใน assets/`);
      }
    }
    return data;
  }
  async function load() {
    if (/^https?:$/.test(location.protocol)) {
      const response = await fetch("quiz-data.json", { cache: "no-store" });
      if (response.ok) return copy(validate(await response.json()));
      if (response.status !== 404) throw new Error(`โหลด quiz-data.json ไม่สำเร็จ (${response.status})`);
    }
    return copy(validate({ questions: window.QUIZ_QUESTION_DATA, answers: window.QUIZ_ANSWER_DATA }));
  }
  function serialize(data) { return JSON.stringify(validate(data), null, 2) + "\n"; }
  return { copy, validate, load, serialize };
})();
