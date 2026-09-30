const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

async function acceptWebDialogs(page) {
  const install = () => new MutationObserver(() => document.querySelector('#webDialog[open] #webDialogConfirm')?.click()).observe(document, {childList:true, subtree:true, attributes:true, attributeFilter:['open']});
  await page.addInitScript(install);
  await page.evaluate(install);
}

(async () => {
  const server = http.createServer(async (req, res) => {
    const filename = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!filename.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    try { const body = await fs.readFile(filename); res.setHeader('Content-Type', filename.endsWith('.js') ? 'text/javascript' : filename.endsWith('.json') ? 'application/json' : filename.endsWith('.css') ? 'text/css' : 'text/html'); res.end(body); }
    catch { res.writeHead(404).end(); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    const source = JSON.parse(await fs.readFile(path.join(root, 'quiz-data.json'), 'utf8'));
    assert.deepEqual(source.questions.chapters.map((c) => c.questions.length), [9, 9, 9, 9, 10, 9]);
    assert.equal(Object.keys(source.answers.answers).length, 54);
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(root, 'questions.json'), 'utf8')), source.questions);
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(root, 'answers.json'), 'utf8')), source.answers);
    browser = await chromium.launch({ headless: true, channel: process.env.QUIZ_TEST_BROWSER || 'msedge' });
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base + '/admin.html');
    await page.waitForFunction(() => !document.getElementById('addChapter').disabled);
    await page.selectOption('#chapterSelect', '5'); await page.selectOption('#questionSelect', '7');
    assert.equal(await page.locator('#option4').isVisible(), true);
    await page.selectOption('#correctAnswer', 'E'); await page.click('#previewJson');
    assert.equal(JSON.parse(await page.inputValue('#jsonPreview')).answers.answers['ai-ethics-8'], 'E');
    await page.selectOption('#correctAnswer', 'B');
    await page.selectOption('#chapterSelect', '4'); await page.selectOption('#questionSelect', '9');
    assert.equal(await page.inputValue('#questionType'), 'open');
    assert.equal(await page.locator('#option0').isVisible(), false);
    assert.equal(await page.locator('#correctAnswer').isVisible(), false);
    await page.click('#addChapter');
    await page.fill('#chapterTitle', 'New quiz <test>');
    await page.fill('#questionText', 'Which option? <img src=x onerror=alert(1)>');
    for (let i = 0; i < 4; i++) await page.fill(`#option${i}`, `Option ${i}`);
    await page.selectOption('#correctAnswer', 'C');
    await page.click('#previewJson');
    const bundle = JSON.parse(await page.inputValue('#jsonPreview'));
    assert.equal(bundle.questions.chapters.length, 7);
    const added = bundle.questions.chapters.at(-1).questions[0];
    assert.equal(bundle.answers.answers[added.id], 'C');
    const downloadPromise = page.waitForEvent('download'); await page.click('#exportData');
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'quiz-data.json');
    assert.deepEqual(JSON.parse(await fs.readFile(await download.path(), 'utf8')), bundle);
    await page.fill('#option0', ''); await page.click('#previewJson');
    assert.equal(await page.getAttribute('#adminStatus', 'data-error'), 'true');
    await page.fill('#option0', 'Option 0');
    await page.setInputFiles('#importFiles', {name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{}')});
    assert.match(await page.textContent('#adminStatus'), /นำเข้าไม่สำเร็จ/);
    await acceptWebDialogs(page);
    await page.setInputFiles('#importFiles', {name:'quiz-data.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bundle))});
    await page.waitForFunction(() => document.getElementById('chapterSelect').options.length === 7);
    await page.click('#previewJson'); assert.deepEqual(JSON.parse(await page.inputValue('#jsonPreview')), bundle);
    // Serve exported data to prove the quiz reads the file changed on GitHub.
    await page.route('**/quiz-data.json', (route) => route.fulfill({json:bundle}));
    await page.goto(base + '/index.html');
    await page.waitForFunction(() => document.querySelectorAll('#chapterGrid input').length === 7);
    assert.match(await page.textContent('#chapterGrid'), /New quiz <test>/);
    assert.equal(await page.locator('#chapterGrid test').count(), 0);
    await page.click('#clearAll'); await page.locator('#chapterGrid input').last().check(); await page.click('#examMode'); await page.click('#start');
    const radios = page.locator('#blogQuestions input[type=radio]');
    await radios.first().focus(); await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(() => session.answers[0].selected), 1);
    await page.waitForFunction(() => document.activeElement?.value === '1');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(() => session.answers[0].selected), 2);
    assert.equal(await page.locator('#blogQuestions img[src=x]').count(), 0);
    // Quota failure must still show results.
    await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('QuotaExceededError'); }; });
    await page.click('#next'); await page.waitForFunction(() => !document.getElementById('result').classList.contains('hidden'));
    assert.equal(await page.textContent('#resultScore'), '100%');
    const stable = await page.evaluate(() => {
      const q = session.questions[0]; const item = {responses:[{id:q.id, question:{...q, options:[...q.options]}, selected:2, selectedText:q.options[2]}]};
      ANSWER_KEY[q.id] = 0; return historyReviewData(item).answers[0].correct;
    }); assert.equal(stable, true);
    const mobile = await browser.newPage({viewport:{width:390,height:844}});
    await mobile.goto(base + '/admin.html'); await mobile.waitForFunction(() => !document.getElementById('addChapter').disabled);
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await mobile.screenshot({path:path.join(root, 'tests', 'admin-mobile.png'),fullPage:true});
    // Direct file opening retains legacy JS loading.
    await mobile.goto('file:///' + root.replaceAll('\\', '/') + '/index.html');
    await mobile.waitForFunction(() => document.querySelectorAll('#chapterGrid input').length === 6);
    await mobile.click('#openSettings'); await mobile.locator('.display-mode-segmented label').first().click(); await mobile.click('#closeModal');
    await mobile.click('#examMode'); await mobile.click('#start'); await mobile.locator('#options input').first().focus();
    await mobile.keyboard.press('ArrowRight'); await mobile.waitForFunction(() => document.activeElement?.value === '1'); await mobile.keyboard.press('ArrowRight');
    assert.equal(await mobile.evaluate(() => session.answers[0].selected), 2);
    const mixed = await browser.newPage(); await acceptWebDialogs(mixed);
    await mixed.goto(base + '/index.html'); await mixed.waitForFunction(() => document.querySelectorAll('#chapterGrid input').length === 6);
    await mixed.click('#selectAll'); await mixed.click('#start');
    assert.equal(await mixed.locator('[data-blog-card]').count(), 55);
    assert.equal(await mixed.locator('#blog-question-53 input[type=radio]').count(), 5);
    await mixed.locator('[data-open-question]').fill('สร้างผู้ช่วยสรุปบทเรียน\nและช่วยค้นคว้าข้อมูล');
    assert.match(await mixed.evaluate(() => session.answers[45].selected), /ผู้ช่วยสรุป/);
    await mixed.evaluate(() => {
      session.questions.forEach((q, i) => { if (q.type !== 'open') session.answers[i] = {selected:q.answer}; });
    });
    // Practice mode keeps inline answers behind a review button.
    await mixed.evaluate(() => { session.revealBeforeNext = false; });
    await mixed.click('#next');
    assert.equal(await mixed.textContent('#resultScore'), '100%');
    assert.match(await mixed.textContent('#resultDetail'), /54 ข้อ.*ปลายเปิด 1 ข้อ/);
    assert.match(await mixed.textContent('#resultReview'), /ผู้ช่วยสรุปบทเรียน/);
    await mixed.evaluate(() => { CHAPTERS=[]; ANSWER_KEY={}; });
    await mixed.click('#backHome');
    await mixed.click('#openStats'); await mixed.locator('[data-history-index]').first().click();
    assert.match(await mixed.textContent('#modalContent'), /ผู้ช่วยสรุปบทเรียน/);
    assert.equal(await mixed.locator('#modalContent .reviewItem').count(), 55);
    // Paged open response survives navigation and never offers automatic grading.
    await mixed.click('#closeModal'); await mixed.click('#clearAll');
    // Reload resets the intentionally changed in-memory dataset.
    await mixed.reload(); await mixed.waitForFunction(() => document.querySelectorAll('#chapterGrid input').length === 6);
    await mixed.click('#clearAll'); await mixed.locator('#chapterGrid input').nth(4).check();
    await mixed.click('#openSettings'); await mixed.locator('.display-mode-segmented label').first().click(); await mixed.click('#closeModal'); await mixed.click('#start');
    await mixed.locator('.slot').last().click(); await mixed.locator('.question-card [data-open-question]').fill('ใช้ช่วยเขียนโปรแกรม');
    await mixed.click('#prev'); await mixed.locator('.slot').last().click();
    assert.equal(await mixed.locator('.question-card [data-open-question]').inputValue(), 'ใช้ช่วยเขียนโปรแกรม');
    assert.deepEqual(errors, []);
    console.log('PASS: editor, validation, JSON round trip, export, hosted JSON loading, escaping, keyboard selection, quota failure, history snapshot, mobile layout, file loading');
  } finally { if (browser) await browser.close(); await new Promise((resolve) => server.close(resolve)); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
