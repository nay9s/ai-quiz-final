"""Import this course's CH6–CH10 Word quiz without changing option order."""
import argparse
import json
import re
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET

HEADINGS = {
    "Quiz CH6 Introduction to Machine Learning": "machine-learning",
    "Chapter-7-Decision Tree": "decision-tree",
    "บทที่ 8 Artificial Neural Network": "neural-network",
    "บทที่ 9 Part 1 CNN": "cnn",
    "CH9 Part 2 Generative AI": "generative-ai",
    "CH10: AI Ethics": "ai-ethics",
}
INFERRED = {
    "neural-network-9": ("A", "ต้นฉบับไม่ได้ระบุเฉลย จึงใช้เฉลยที่ตรวจสอบจากเอกสาร pandas.Series.unique()", "https://pandas.pydata.org/docs/reference/api/pandas.Series.unique.html"),
    "cnn-3": ("A", "ต้นฉบับไม่ได้ระบุเฉลย จึงใช้เฉลยที่ตรวจสอบจากเอกสาร Keras Dropout", "https://keras.io/api/layers/regularization_layers/dropout/"),
}

def extract(source):
    with ZipFile(source) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        paragraphs = ["".join(t.text or "" for t in p.findall(".//w:t", ns)).strip() for p in root.findall(".//w:body//w:p", ns)]
        media = [name for name in archive.namelist() if name.startswith("word/media/")]
    chapters, answers = [], {}
    chapter = question = None
    marked, explicit = [], None

    def finish_question():
        nonlocal marked, explicit
        if question is None:
            return
        if not question["options"]:
            question["type"] = "open"
        else:
            assert len(question["options"]) in (4, 5), question["id"]
            if marked:
                assert len(marked) == 1, question["id"]
                answer = marked[0]
                if explicit is not None:
                    assert question["options"][answer] == explicit, (question["id"], explicit)
                answers[question["id"]] = chr(65 + answer)
            elif explicit is not None:
                assert question["options"].count(explicit) == 1, question["id"]
                answers[question["id"]] = chr(65 + question["options"].index(explicit))
            else:
                answer, note, url = INFERRED[question["id"]]
                answers[question["id"]] = answer
                question["note"] = note
                question["answerSource"] = "inferred"
                question["answerReference"] = url
        marked, explicit = [], None

    for text in paragraphs:
        if not text:
            continue
        if text in HEADINGS:
            finish_question()
            chapter = {"id": HEADINGS[text], "title": text, "questions": []}
            chapters.append(chapter)
            question = None
        elif match := re.match(r"^(\d+)[.\s]\s*(.+)$", text):
            finish_question()
            assert chapter is not None
            question = {"id": f"{chapter['id']}-{match[1]}", "question": match[2], "options": []}
            chapter["questions"].append(question)
        elif match := re.match(r"^([กขคงจ])\.\s*(.+)$", text):
            assert question is not None
            assert "กขคงจ".index(match[1]) == len(question["options"]), question["id"]
            option = match[2]
            if option.endswith("✓"):
                marked.append(len(question["options"]))
                option = option[:-1].rstrip()
            question["options"].append(option)
        elif text.startswith("เฉลย:"):
            assert question is not None
            explicit = text.split(":", 1)[1].strip()
        else:
            raise ValueError(f"Unexpected document text: {text}")
    finish_question()
    assert len(chapters) == 6
    assert [len(c["questions"]) for c in chapters] == [9, 9, 9, 9, 10, 9]
    assert len(answers) == 54
    assert not media, "Recheck document figures before importing"
    cnn7 = next(q for c in chapters for q in c["questions"] if q["id"] == "cnn-7")
    cnn7["note"] = "คำถามนี้อ้างถึงภาพ Feature Map แต่ไฟล์ Word ที่ได้รับไม่มีภาพประกอบ"
    return {"questions": {"version": 4, "chapters": chapters}, "answers": {"version": 4, "format": "A–E ตามลำดับตัวเลือก; คำถามปลายเปิดไม่มีเฉลยและไม่คิดคะแนน", "answers": answers}}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    data = extract(args.source)
    if (args.output_dir / "assets" / "cnn-7.png").is_file():
        question = next(q for c in data["questions"]["chapters"] for q in c["questions"] if q["id"] == "cnn-7")
        question["image"] = "assets/cnn-7.png"
        question.pop("note", None)
    outputs = {"quiz-data.json": json.dumps(data, ensure_ascii=False, indent=2) + "\n"}
    for section, global_name in [("questions", "QUIZ_QUESTION_DATA"), ("answers", "QUIZ_ANSWER_DATA")]:
        serialized = json.dumps(data[section], ensure_ascii=False, indent=2)
        outputs[f"{section}.json"] = serialized + "\n"
        outputs[f"{section}-data.js"] = f"window.{global_name} = {serialized};\n"
    for filename, content in outputs.items():
        (args.output_dir / filename).write_text(content, encoding="utf-8")
    print("Imported 6 chapters: 54 choice questions and 1 open-ended question; wrote 5 synchronized data files.")

if __name__ == "__main__":
    main()
