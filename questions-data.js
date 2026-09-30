window.QUIZ_QUESTION_DATA = {
  "version": 4,
  "chapters": [
    {
      "id": "machine-learning",
      "title": "Quiz CH6 Introduction to Machine Learning",
      "questions": [
        {
          "id": "machine-learning-1",
          "question": "Supervised learning จำเป็นต้องมีองค์ประกอบใด",
          "options": [
            "labeled data",
            "ถูกทุกข้อ",
            "input data",
            "output data"
          ]
        },
        {
          "id": "machine-learning-2",
          "question": "การ Validation ควรทำในการเรียนรู้แบบใด",
          "options": [
            "ควรทำทั้งคู่",
            "ไม่ควรทำทั้งคู่",
            "Supervised learning",
            "Unsupervised learning"
          ]
        },
        {
          "id": "machine-learning-3",
          "question": "ข้อใดให้ความหมายของ Overfit ได้ดีที่สุด",
          "options": [
            "โมเดลที่ได้นำไปใช้จริงไม่ได้",
            "เกิดขึ้นกับโมเดลที่เรียนรู้จากข้อมูลเพียง 1 iteration",
            "โมเดลที่ได้เรียนรู้ได้ดี",
            "ข้อมูลมีปริมาณเยอะเกินไป"
          ]
        },
        {
          "id": "machine-learning-4",
          "question": "ข้อใด ไม่ใช่ วิธีการเรียนรู้ของ Machine learning ในปัจจุบัน",
          "options": [
            "Unsupervised learning",
            "Semisupervised learning",
            "Supervised learning",
            "Resupervised learning"
          ]
        },
        {
          "id": "machine-learning-5",
          "question": "ข้อใดกล่าวถูกต้องเกี่ยวกับ Machine learning ได้ถูกต้อง",
          "options": [
            "ทุกสิ่งที่เป็นเครื่องมือ เช่น สว่านไฟฟ้า",
            "ต้องมีการเรียนรู้จากข้อมูลเพื่อนำไปใช้ตัดสินใจกับข้อมูลที่ไม่เคยเห็น",
            "บางส่วนของ Machine learning ไม่เกี่ยวข้องกับ AI",
            "Adversarial Search จัดอยู่ในกลุ่มของ Machine Learning"
          ]
        },
        {
          "id": "machine-learning-6",
          "question": "Unsupervised learning ไม่ จำเป็นต้องมีองค์ประกอบใด",
          "options": [
            "labeled data",
            "input data",
            "output data",
            "ถูกทุกข้อ"
          ]
        },
        {
          "id": "machine-learning-7",
          "question": "ข้อใดไม่ใช่ การประยุกต์ใช้ Machine learning ในการแก้ปัญหา",
          "options": [
            "แก้ปัญหา Sudoku",
            "ทำนายราคาบ้าน",
            "คาดการณ์น้ำท่วม",
            "พยากรณ์ราคาหุ้น"
          ]
        },
        {
          "id": "machine-learning-8",
          "question": "ระบบอีเมลตรวจพบว่าอีเมลฉบับหนึ่งเป็น Spam และจริง ๆ แล้วอีเมลฉบับนั้นก็เป็น Spam ค่าที่ได้เรียกว่าอะไร",
          "options": [
            "False Positive (FP)",
            "True Negative (TN)",
            "False Negative (FN)",
            "True Positive (TP)"
          ]
        },
        {
          "id": "machine-learning-9",
          "question": "กำหนดให้ Positive class (Active class) = “เป็นโรค” และ Negative class = “ไม่เป็นโรค” ในชุดข้อมูลมีคน ไม่เป็นโรค 990 คน และ เป็นโรค 10 คน โมเดลทำนายทุกคนว่า “ไม่เป็นโรค” ทั้งหมด ข้อใดอธิบายสถานการณ์นี้ได้ถูกต้องที่สุด?",
          "options": [
            "TN สูง และ Accuracy สูง",
            "TP สูง แต่ Accuracy ต่ำ",
            "TN สูง แต่ Sensitivity ต่ำ",
            "TP สูง และ Sensitivity สูง"
          ]
        }
      ]
    },
    {
      "id": "decision-tree",
      "title": "Chapter-7-Decision Tree",
      "questions": [
        {
          "id": "decision-tree-1",
          "question": "Decision Tree มี Time Complexity ในการตัดสินใจ กรณี Average Case เท่ากับเท่าไหร่",
          "options": [
            "O(log n)",
            "O(n log n)",
            "O(n)",
            "O(n^2) ยกกำลังสอง"
          ]
        },
        {
          "id": "decision-tree-2",
          "question": "คำสั่ง fit หมายถึงอะไร ในกรณี DecisionTreeClassifier",
          "options": [
            "สร้างโมเดล DecisionTreeClassifier",
            "พยากรณ์ผลลัพธ์ของโมเดลขากข้อมูล Validation",
            "Train โมเดลจากข้อมูล Training",
            "แบ่งข้อมูล Training และ Validation"
          ]
        },
        {
          "id": "decision-tree-3",
          "question": "Criterion Function หมายถึงสิ่งใดใน Decision Tree",
          "options": [
            "Gradient Descent",
            "Activation Function",
            "Transfer Function",
            "Optimization Function"
          ]
        },
        {
          "id": "decision-tree-4",
          "question": "จุดเด่นของ Decision Tree คือ",
          "options": [
            "มีความสามารถ Generalization ที่สูง",
            "ทุกข้อเป็นจุดเด่นของ Decision Tree",
            "การจำแนกข้อมูลแบบ Nonlinear ได้ดี",
            "เกิด Overfit ได้ยาก"
          ]
        },
        {
          "id": "decision-tree-5",
          "question": "ข้อจำกัดด้านความไม่เสถียรของโมเดล Decision Tree คือ",
          "options": [
            "กรณีข้อมูล train ในแต่ละคลาสมีจำนวนไม่เท่ากัน โมเดล Decision Tree จะให้ความสำคัญกับคลาสที่มีจำนวนข้อมูลเยอะกว่า",
            "กรณีมี noise เยอะ โมเดล Decision Tree จะเกิด overfit",
            "ถูกทุกข้อ",
            "ไม่เสถียร โมเดลมีการอัพเดทตลอด หาก node ที่ใช้ในการ train ทำให้เกิด error"
          ]
        },
        {
          "id": "decision-tree-6",
          "question": "การใช้งานคำสั่ง DecisionTreeClassifier เพื่อสร้างโมเดล Decision Tree การกำหนด maxdepth มีผลอย่างไรต่อการโมเดล",
          "options": [
            "ความถูกต้องของการ validation แปรผกผันกับจำนวน maxdepth",
            "เกิด overfit ง่ายขึ้น",
            "ความถูกต้องของการ validation แปรผันตรงกับจำนวน maxdepth",
            "กำหนดจำนวน Class ตามจำนวนของ maxdepth"
          ]
        },
        {
          "id": "decision-tree-7",
          "question": "Decision Tree มีลักษณะโครงสร้างข้อมูลเป็นลักษณะใด",
          "options": [
            "Tree",
            "Tuple",
            "Graph",
            "Set"
          ]
        },
        {
          "id": "decision-tree-8",
          "question": "คำสั่งใด ใช้ในการแสดงภาพโครงสร้างของโมเดล Decision Tree กำหนดให้ model = DecisionTreeClassifier",
          "options": [
            "plot(mode)",
            "plot_tree(mode)",
            "model.plot_tree()",
            "model.plot()"
          ]
        },
        {
          "id": "decision-tree-9",
          "question": "Decision Tree มี Time Complexity ในการตัดสินใจ กรณี Worst Case เท่ากับเท่าไหร่",
          "options": [
            "O(n)",
            "O(log n)",
            "O(n^2) ยกกำลังสอง",
            "O(n log n)"
          ]
        }
      ]
    },
    {
      "id": "neural-network",
      "title": "บทที่ 8 Artificial Neural Network",
      "questions": [
        {
          "id": "neural-network-1",
          "question": "Function ใด มีลักษณะการจำแนกข้อมูล (Classification) แตกต่างจากข้ออื่น",
          "options": [
            "Linear function",
            "ReLU function",
            "Softmax function",
            "Sigmoid function"
          ]
        },
        {
          "id": "neural-network-2",
          "question": "Artificial Neural Network มีหลักการทำงานเลียนแบบสิ่งใด",
          "options": [
            "ธรรมชาติ",
            "คณิตศาสตร์",
            "จิตใจมนุษย์",
            "สมองมนุษย์"
          ]
        },
        {
          "id": "neural-network-3",
          "question": "Transfer Function ทำหน้าที่ใด ใน Artificial Neural Network",
          "options": [
            "เพิ่มหรือลดค่าความคาดเคลื่อนของผลลัพธ์สุดท้าย ในปริมาณที่ยอมรับได้",
            "คำนวณผลรวมระหว่าง input และ weight",
            "เป็นตัวแปรที่ใช้ในการคูณกับ input แต่ละตัว",
            "ตัดสินใจว่า input นั้น ๆ ควรจะอยู่ใน class ใด"
          ]
        },
        {
          "id": "neural-network-4",
          "question": "Bias ทำหน้าที่ใด ใน Artificial Neural Network",
          "options": [
            "เพิ่มหรือลดค่าความคาดเคลื่อนของผลลัพธ์สุดท้าย ในปริมาณที่ยอมรับได้",
            "ตัดสินใจว่า input นั้น ๆ ควรจะอยู่ใน class ใด",
            "คำนวณผลรวมระหว่าง input และ weight",
            "เป็นตัวแปรที่ใช้ในการคูณกับ input แต่ละตัว"
          ]
        },
        {
          "id": "neural-network-5",
          "question": "คำสั่ง np.random.shuffle(x) มีจุดประสงค์เพื่อจัดการข้อมูล x อย่างไร",
          "options": [
            "สุ่มข้อมูลเท่ากับจำนวนของ x โดยเลือกจากค่าที่อยู่ใน x แต่ละค่า",
            "สุ่มข้อมูลจำนวนเต็มจาก 1 ถึง จำนวนของ x เท่ากับ x จำนวน",
            "เลือกเล่นเพลงแบบสุ่มจาก playlist",
            "สลับลำดับข้อมูลของ x แบบสุ่ม"
          ]
        },
        {
          "id": "neural-network-6",
          "question": "Activation Function ทำหน้าที่ใด ใน Artificial Neural Network",
          "options": [
            "คำนวณผลรวมระหว่าง input และ weight",
            "ตัดสินใจว่า input นั้น ๆ ควรจะอยู่ใน class ใด",
            "เป็นตัวแปรที่ใช้ในการคูณกับ input แต่ละตัว",
            "เพิ่มหรือลดค่าความคาดเคลื่อนของผลลัพธ์สุดท้าย ในปริมาณที่ยอมรับได้"
          ]
        },
        {
          "id": "neural-network-7",
          "question": "ในการใช้ matplotlib ใช้คำสั่ง plot ภายในฟังก์ชัน มีการส่งตัวแปร marker หากกำหนดให้ค่า marker=\"s\" จะทำให้การแสดงผลกราฟมีลักษณะเป็นอย่างไร",
          "options": [
            "แทนที่ข้อมูลด้วยวงกลม",
            "แทนที่ข้อมูลด้วยดาว",
            "แทนที่ข้อมูลด้วยสีเหลี่ยม",
            "แทนที่ข้อมูลด้วยจุด"
          ]
        },
        {
          "id": "neural-network-8",
          "question": "Function ใด มีลักษณะของฟังก์ชันคล้ายกับ Softmax function มากที่สุด",
          "options": [
            "Sigmoid function",
            "ReLU function",
            "Linear function",
            "LeakyReLU function"
          ]
        },
        {
          "id": "neural-network-9",
          "question": "กำหนดให้ x เป็นข้อมูลจาก dataframe หากเรียกใช้คำสั่ง x.unique() ผลลัพธ์ที่ได้คือข้อใด",
          "options": [
            "แสดงข้อมูล x เฉพาะข้อมูลที่แตกต่าง",
            "แสดงข้อมูล x เฉพาะ dimension สุดท้าย",
            "แสดงข้อมูล x เฉพาะ dimension แรก",
            "แสดงข้อมูล x ทั้งหมด"
          ],
          "note": "ต้นฉบับไม่ได้ระบุเฉลย จึงใช้เฉลยที่ตรวจสอบจากเอกสาร pandas.Series.unique()",
          "answerSource": "inferred",
          "answerReference": "https://pandas.pydata.org/docs/reference/api/pandas.Series.unique.html"
        }
      ]
    },
    {
      "id": "cnn",
      "title": "บทที่ 9 Part 1 CNN",
      "questions": [
        {
          "id": "cnn-1",
          "question": "Transfer Learning ในบริบทของ CNN หมายถึงอะไร",
          "options": [
            "การนำ model ที่ฝึกบน dataset ใหญ่ (เช่น ImageNet) มาปรับใช้กับงานใหม่",
            "การ transfer gradient จาก layer ท้ายไปยัง layer ต้น",
            "การแปลง model ให้รองรับภาษาอื่น",
            "การย้ายไฟล์ model ไปยัง server ใหม่"
          ]
        },
        {
          "id": "cnn-2",
          "question": "Max Pooling Layer มีจุดประสงค์หลักคืออะไร",
          "options": [
            "ลดขนาด feature map และเก็บค่าที่โดดเด่นที่สุดในแต่ละ region",
            "เพิ่มความละเอียดของ feature map",
            "แปลง pixel ให้เป็นค่า binary 0 หรือ 1",
            "เพิ่มจำนวน parameter ใน network"
          ]
        },
        {
          "id": "cnn-3",
          "question": "Dropout Layer ช่วยแก้ปัญหาใดระหว่างการ train",
          "options": [
            "สุ่มปิด neuron บางส่วนเพื่อป้องกัน overfitting",
            "เพิ่มขนาด feature map ให้ใหญ่ขึ้น",
            "ลดจำนวน epoch ที่ต้องการ train",
            "เร่งความเร็วใน inference โดยลด computation"
          ],
          "note": "ต้นฉบับไม่ได้ระบุเฉลย จึงใช้เฉลยที่ตรวจสอบจากเอกสาร Keras Dropout",
          "answerSource": "inferred",
          "answerReference": "https://keras.io/api/layers/regularization_layers/dropout/"
        },
        {
          "id": "cnn-4",
          "question": "Fully Connected Layer ที่ท้าย CNN ทำหน้าที่ใด",
          "options": [
            "ปรับค่า pixel ให้อยู่ในช่วง 0–1",
            "แมป feature ที่สกัดได้ไปยัง output class (classification)",
            "ลดความซับซ้อนของ feature map ด้วย convolution",
            "สกัด edge และ texture จากภาพต้นฉบับ"
          ]
        },
        {
          "id": "cnn-5",
          "question": "ถ้าต้องการให้ CNN จำแนกภาพ 10 class (เช่น ตัวเลข 0–9) Output layer ควรมีโครงสร้างอย่างไร",
          "options": [
            "100 neurons พร้อม Tanh activation",
            "10 neurons พร้อม ReLU activation",
            "10 neurons พร้อม Softmax activation",
            "1 neuron พร้อม Sigmoid activation"
          ]
        },
        {
          "id": "cnn-6",
          "question": "Overfitting ใน CNN มักเกิดจากสาเหตุใด",
          "options": [
            "Model มี parameter น้อยเกินไปสำหรับข้อมูล",
            "จำนวน epoch น้อยเกินไป",
            "Model ซับซ้อนเกินไปจนจำ noise ใน training data",
            "Learning rate ต่ำเกินไปจนไม่ converge"
          ]
        },
        {
          "id": "cnn-7",
          "question": "ค่าในการคูณ Feature Map นี้มีค่าเท่ากับเท่าไหร่",
          "options": [
            "0",
            "-6",
            "-1",
            "1"
          ],
          "image": "assets/cnn-7.png"
        },
        {
          "id": "cnn-8",
          "question": "Batch Normalization ส่งผลอย่างไรต่อการ train CNN",
          "options": [
            "เพิ่ม accuracy ของ test set โดยตรงโดยไม่ต้องปรับ hyperparameter",
            "แทนที่ activation function ทั้งหมด",
            "ลด parameter ใน model ลงกว่าครึ่ง",
            "ทำให้ training เสถียรขึ้นและสามารถใช้ learning rate สูงขึ้นได้"
          ]
        },
        {
          "id": "cnn-9",
          "question": "ข้อใดอธิบาย Convolution Layer ใน CNN ได้ถูกต้องที่สุด",
          "options": [
            "เชื่อม neuron ทุกตัวใน layer ก่อนหน้าเข้ากับ layer ถัดไป",
            "ลด dimension ของข้อมูลโดยการเฉลี่ยค่า pixel",
            "เลื่อน filter ขนาดเล็กผ่านภาพเพื่อสกัด local feature",
            "แปลง feature map ให้เป็น probability ของแต่ละ class"
          ]
        }
      ]
    },
    {
      "id": "generative-ai",
      "title": "CH9 Part 2 Generative AI",
      "questions": [
        {
          "id": "generative-ai-1",
          "question": "Chain-of-Thought (CoT) Prompting ช่วยลดปัญหาใดของ LLM ได้ดีที่สุด",
          "options": [
            "ลด cost ต่อ request",
            "ลด latency ของ API response",
            "ลด Hallucination โดยให้ model แสดงขั้นตอนการคิดก่อนสรุป",
            "ลดขนาดของ model ที่ต้องโหลดเข้า memory"
          ]
        },
        {
          "id": "generative-ai-2",
          "question": "Large Language Model (LLM) ทำงานโดยหลักการใด",
          "options": [
            "ค้นหาคำตอบจาก database ที่จัดเก็บไว้ล่วงหน้า",
            "แปลงเสียงพูดเป็นข้อความโดยใช้ Fourier Transform",
            "ทำนาย token ถัดไปที่เหมาะสมที่สุดจาก context ก่อนหน้า",
            "จดจำ pattern ของภาพและแมปเป็นข้อความ"
          ]
        },
        {
          "id": "generative-ai-3",
          "question": "Hallucination ใน LLM หมายถึงอะไร",
          "options": [
            "Model ใช้ภาษาไม่เหมาะสมกับ context",
            "Model สร้างข้อมูลที่ผิดหรือไม่มีอยู่จริงขึ้นมาอย่างมั่นใจ",
            "Model ปฏิเสธที่จะตอบคำถามที่ sensitive",
            "Model ตอบช้าผิดปกติเนื่องจาก overload"
          ]
        },
        {
          "id": "generative-ai-4",
          "question": "ข้อใดคือชื่อของ Algorithm ที่เป็นรากฐานของ LLMs",
          "options": [
            "GAN Model",
            "Diffusion Model",
            "Transformer Model",
            "VAE Model"
          ]
        },
        {
          "id": "generative-ai-5",
          "question": "Temperature parameter ที่ค่า 0.0 ใน LLM จะให้ผลลัพธ์แบบใด",
          "options": [
            "ผลลัพธ์ที่แน่นอนและทำซ้ำได้ (deterministic)",
            "ผลลัพธ์เป็นภาษาไทยเสมอ",
            "Model ปฏิเสธที่จะตอบคำถาม",
            "ผลลัพธ์สร้างสรรค์และหลากหลายมากที่สุด"
          ]
        },
        {
          "id": "generative-ai-6",
          "question": "Few-shot Prompting แตกต่างจาก Zero-shot Prompting อย่างไร",
          "options": [
            "Few-shot ให้ตัวอย่าง Input→Output ก่อนถามคำถามจริง ส่วน Zero-shot ไม่มีตัวอย่าง",
            "Few-shot ใช้ JSON format เสมอ ส่วน Zero-shot ใช้ plain text",
            "Few-shot ใช้ model ขนาดใหญ่กว่า Zero-shot เสมอ",
            "Few-shot ส่ง prompt หลายครั้ง ส่วน Zero-shot ส่งครั้งเดียว"
          ]
        },
        {
          "id": "generative-ai-7",
          "question": "ใน Chat Completion API ของ OpenRouter บทบาท \"system\" role มีหน้าที่อะไร",
          "options": [
            "บันทึก log การสนทนาทั้งหมดลง database",
            "กำหนดบุคลิก กฎการตอบ และข้อจำกัดของ AI agent",
            "ควบคุม rate limit และ quota ของ API key",
            "แสดงผลลัพธ์สุดท้ายของ AI ให้ user เห็น"
          ]
        },
        {
          "id": "generative-ai-8",
          "question": "เหตุใดจึงควรเก็บ OpenRouter API Key ไว้ใน .env file แทนการ hard-code ใน .py",
          "options": [
            "เพราะ Python ไม่สามารถอ่านค่า string ที่ยาวเกิน 50 ตัวอักษรได้",
            "เพราะ .env file ทำให้ไฟล์ .py มีขนาดเล็กลง",
            "เพราะ .env file ทำให้ Python รันเร็วขึ้น",
            "เพราะ hard-code ทำให้ key ถูก commit ลง Git และอาจรั่วไหลได้"
          ]
        },
        {
          "id": "generative-ai-9",
          "question": "AGENTS.md pattern มีข้อดีอะไรในการพัฒนา AI Agent",
          "options": [
            "ทำให้ Python code ทำงานเร็วขึ้นโดยไม่ต้องเรียก API",
            "เข้ารหัส API key ให้ปลอดภัยอัตโนมัติ",
            "แยก configuration ของ AI (บุคลิก กฎ format) ออกจาก code ทำให้แก้ไขได้โดยไม่ต้องแตะ Python",
            "บีบอัด prompt ให้สั้นลงเพื่อลด token cost"
          ]
        },
        {
          "id": "generative-ai-10",
          "question": "นิสิตสามารถนำความรู้จากการเรียนเรื่อง Generative AI ไปประยุกต์ใช้กับอะไรได้บ้าง",
          "options": [],
          "type": "open"
        }
      ]
    },
    {
      "id": "ai-ethics",
      "title": "CH10: AI Ethics",
      "questions": [
        {
          "id": "ai-ethics-1",
          "question": "เหตุใดจึงต้องคำนึงถึงจริยธรรมในการนำปัญญาประดิษฐ์มาใช้งาน",
          "options": [
            "เพราะการตัดสินใจของระบบอาจกระทบต่อสิทธิ โอกาส และความเป็นอยู่ของบุคคล โดยเฉพาะกลุ่มเปราะบาง",
            "เพราะกฎหมายกำหนดให้ระบบปัญญาประดิษฐ์ทุกระบบต้องผ่านการรับรองก่อนนำไปใช้งาน",
            "เพราะระบบปัญญาประดิษฐ์มีต้นทุนการพัฒนาสูง จึงต้องใช้ให้คุ้มค่าที่สุด",
            "เพราะระบบปัญญาประดิษฐ์ยังมีความแม่นยำต่ำกว่ามนุษย์ในทุกประเภทงาน"
          ]
        },
        {
          "id": "ai-ethics-2",
          "question": "ข้อใดกล่าวถูกต้องเกี่ยวกับหลักการจริยธรรมปัญญาประดิษฐ์ 10 มิติ ตามแนวทางของ UNESCO",
          "options": [
            "มิติที่ 1 และมิติที่ 10 ใช้ในขั้นกำหนดขอบเขตการประเมิน ส่วนอีก 8 มิติใช้ในขั้นประเมินตามหลักการและวิเคราะห์ผลกระทบ",
            "หลักการนี้มีผลบังคับใช้ทางกฎหมายโดยตรงกับประเทศสมาชิกทั้ง 194 ประเทศ",
            "หลักการนี้ครอบคลุมเฉพาะประเด็นทางเทคนิคของแบบจำลอง ไม่รวมด้านสังคมและสิ่งแวดล้อม",
            "ทั้ง 10 มิติถูกนำไปใช้ในขั้นตอนเดียวกันของกระบวนการประเมิน"
          ]
        },
        {
          "id": "ai-ethics-3",
          "question": "เมื่อองค์กรนำระบบปัญญาประดิษฐ์มาใช้ตัดสินใจในเรื่องที่กระทบต่อสิทธิของบุคคล กลุ่มใดต้องได้รับแจ้งว่ามีการใช้ปัญญาประดิษฐ์เป็นลำดับแรก",
          "options": [
            "หน่วยงานกำกับดูแลระดับประเทศ",
            "ผู้ได้รับผลกระทบจากการตัดสินใจของระบบ",
            "ทีมพัฒนาแบบจำลองภายในองค์กร",
            "ผู้ถือหุ้นและนักลงทุนขององค์กร"
          ]
        },
        {
          "id": "ai-ethics-4",
          "question": "ระบบปัญญาประดิษฐ์สำหรับคัดเลือกผู้สมัครงานถูกฝึกด้วยข้อมูลการรับสมัครย้อนหลัง 10 ปี ซึ่งผู้ได้รับคัดเลือกส่วนใหญ่เป็นเพศชาย ทำให้ระบบให้คะแนนผู้สมัครเพศหญิงต่ำกว่า ความลำเอียงในกรณีนี้ตรงกับข้อใดมากที่สุด",
          "options": [
            "ลำเอียงจากการเก็บข้อมูล (Collection Bias)",
            "ลำเอียงจากข้อมูลสะท้อนกลับ (Feedback Bias)",
            "ลำเอียงจากขั้นตอนวิธี (Algorithm Bias)",
            "ลำเอียงจากข้อมูล (Data Bias)"
          ]
        },
        {
          "id": "ai-ethics-5",
          "question": "หน่วยงานใดจัดทำคู่มือการประเมินผลกระทบทางจริยธรรมปัญญาประดิษฐ์ฉบับภาษาไทย เพื่อให้องค์กรไทยนำหลักการของ UNESCO ไปปฏิบัติได้จริง",
          "options": [
            "สถาบันมาตรฐานและเทคโนโลยีแห่งชาติสหรัฐอเมริกา (NIST)",
            "สำนักงานพัฒนาธุรกรรมทางอิเล็กทรอนิกส์ (สพธอ.) ร่วมกับศูนย์ธรรมาภิบาลปัญญาประดิษฐ์ (AIGPC)",
            "องค์การระหว่างประเทศว่าด้วยการมาตรฐาน (ISO/IEC)",
            "องค์การการศึกษา วิทยาศาสตร์ และวัฒนธรรมแห่งสหประชาชาติ (UNESCO)"
          ]
        },
        {
          "id": "ai-ethics-6",
          "question": "ข้อใดเรียงลำดับขั้นตอนของกระบวนการประเมินผลกระทบทางจริยธรรมปัญญาประดิษฐ์ (EIA) ได้ถูกต้อง",
          "options": [
            "การกำหนดขอบเขตการประเมิน → การวิเคราะห์ผลกระทบ → การประเมินตามหลักการด้านจริยธรรม",
            "การวิเคราะห์ผลกระทบ → การกำหนดขอบเขตการประเมิน → การประเมินตามหลักการด้านจริยธรรม",
            "การประเมินตามหลักการด้านจริยธรรม → การวิเคราะห์ผลกระทบ → การกำหนดขอบเขตการประเมิน",
            "การกำหนดขอบเขตการประเมิน → การประเมินตามหลักการด้านจริยธรรม → การวิเคราะห์ผลกระทบ"
          ]
        },
        {
          "id": "ai-ethics-7",
          "question": "เมื่อระบบปัญญาประดิษฐ์ตัดสินใจผิดพลาดจนเกิดความเสียหาย ข้อใดอธิบายการกำหนดความรับผิดชอบได้ถูกต้องที่สุด",
          "options": [
            "ผู้ใช้งานต้องรับผิดชอบเสมอ เพราะเป็นผู้ตัดสินใจขั้นสุดท้าย",
            "ผู้พัฒนาแบบจำลองต้องรับผิดชอบแต่เพียงผู้เดียว เพราะเป็นผู้สร้างระบบขึ้นมา",
            "ความรับผิดชอบต้องผูกพันกับมนุษย์เสมอ และต้องกำหนดขอบเขตของแต่ละฝ่ายให้ชัดเจนตั้งแต่เริ่มโครงการ",
            "ระบบปัญญาประดิษฐ์เป็นผู้รับผิดชอบ เพราะเป็นผู้ตัดสินใจโดยตรง"
          ]
        },
        {
          "id": "ai-ethics-8",
          "question": "ข้อใดเป็นแนวปฏิบัติที่ช่วยให้การพัฒนาปัญญาประดิษฐ์มีความยั่งยืน",
          "options": [
            "เพิ่มจำนวนรอบการฝึกให้มากที่สุดเท่าที่ทรัพยากรจะอำนวย",
            "ใช้การเรียนรู้แบบถ่ายโอน (Transfer Learning) และลดขนาดแบบจำลองด้วย Quantization หรือ Pruning",
            "จัดเก็บข้อมูลฝึกไว้ทั้งหมดโดยไม่ลบ เพื่อให้ฝึกซ้ำได้ตลอดเวลา",
            "เลือกใช้แบบจำลองขนาดใหญ่ที่สุดเสมอ เพื่อให้ได้ความแม่นยำสูงสุด",
            "ฝึกแบบจำลองใหม่ตั้งแต่ต้นทุกครั้ง เพื่อให้ได้ผลลัพธ์ที่เหมาะกับงานมากที่สุด"
          ]
        },
        {
          "id": "ai-ethics-9",
          "question": "ข้อใดกล่าว \"ไม่ถูกต้อง\" เกี่ยวกับการนำหลักการจริยธรรมปัญญาประดิษฐ์ไปปฏิบัติ",
          "options": [
            "ความยั่งยืนครอบคลุมทั้งการใช้พลังงานของระบบและผลกระทบต่อโครงสร้างการจ้างงาน",
            "ความโปร่งใสคือการเปิดเผยว่าระบบทำงานอย่างไร ส่วนความสามารถในการอธิบายคือการอธิบายเหตุผลของผลลัพธ์ในกรณีเฉพาะ",
            "ความรับผิดชอบต่อผลการตัดสินใจของระบบต้องผูกพันกับมนุษย์เสมอ",
            "เมื่อแบบจำลองมีค่าความแม่นยำโดยรวมสูงแล้ว ถือว่าระบบมีความเป็นธรรมเพียงพอ"
          ]
        }
      ]
    }
  ]
};
