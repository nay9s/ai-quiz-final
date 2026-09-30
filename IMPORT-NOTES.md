# ข้อมูล Quiz จากเอกสาร CH6 ถึง CH10

แทนที่ Quiz เดิมทั้งหมดด้วยข้อมูลจาก `Quiz CH6 Introduction to Machine Learning.docx` โดยคงข้อความและลำดับตัวเลือกตามต้นฉบับ รวม 6 บท 55 ข้อ (เลือกตอบ 54 ข้อ และปลายเปิด 1 ข้อ)

| บท | จำนวนข้อ |
| --- | ---: |
| CH6 Introduction to Machine Learning | 9 |
| CH7 Decision Tree | 9 |
| CH8 Artificial Neural Network | 9 |
| CH9 Part 1 CNN | 9 |
| CH9 Part 2 Generative AI | 10 |
| CH10 AI Ethics | 9 |

ข้อสังเกตจากต้นฉบับ:

- Artificial Neural Network ข้อ 9 ไม่มีเครื่องหมายเฉลย ใช้ A: แสดงข้อมูลที่แตกต่าง ตาม [pandas.Series.unique](https://pandas.pydata.org/docs/reference/api/pandas.Series.unique.html)
- CNN ข้อ 3 ไม่มีเครื่องหมายเฉลย ใช้ A: สุ่มปิด neuron เพื่อลด overfitting ตาม [Keras Dropout](https://keras.io/api/layers/regularization_layers/dropout/)
- CNN ข้อ 7 ใช้ภาพ Feature Map ที่ผู้ใช้แนบเพิ่มเติม บันทึกไว้ที่ `assets/cnn-7.png` เฉลย C (−1) ตรงกับผลคำนวณจากภาพ และลบหมายเหตุว่าภาพขาดแล้ว
- Generative AI ข้อ 10 เป็นคำถามปลายเปิด ไม่มีตัวเลือกหรือเฉลย เก็บคำตอบที่พิมพ์และแสดงในผลการทำ แต่ไม่รวมในคะแนน
- AI Ethics ข้อ 8 มี 5 ตัวเลือก คงไว้ครบ A–E

ไฟล์ `quiz-data.json`, `questions.json`, `answers.json`, `questions-data.js` และ `answers-data.js` ใช้ข้อมูลชุดเดียวกัน เว็บที่เปิดผ่าน HTTP/HTTPS อ่าน `quiz-data.json` ส่วนการเปิดจากเครื่องโดยตรงอ่านไฟล์ `.js`

หน้าจัดการรองรับคำถาม 4 หรือ 5 ตัวเลือก และคำถามปลายเปิด เมื่ออัปเดตเฉพาะ `quiz-data.json` บน GitHub Pages ให้ส่งออกไฟล์แยกเพิ่มหากต้องการให้การเปิดเว็บจากเครื่องใช้ข้อมูลชุดเดียวกันด้วย
