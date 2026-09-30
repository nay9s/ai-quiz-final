"use strict";

(() => {
  const dialog = document.createElement("dialog");
  dialog.id = "webDialog";
  dialog.className = "web-dialog";
  dialog.setAttribute("aria-labelledby", "webDialogTitle");
  dialog.setAttribute("aria-describedby", "webDialogMessage");
  dialog.innerHTML = '<h2 id="webDialogTitle"></h2><p id="webDialogMessage"></p><div class="web-dialog-actions"><button type="button" class="btn" id="webDialogCancel">ยกเลิก</button><button type="button" class="btn primary" id="webDialogConfirm">ยืนยัน</button></div>';
  document.body.append(dialog);
  const title = dialog.querySelector("h2");
  const message = dialog.querySelector("p");
  const cancel = dialog.querySelector("#webDialogCancel");
  const confirm = dialog.querySelector("#webDialogConfirm");
  const queue = [];
  let active = null;
  function showNext() {
    if (active || !queue.length) return;
    active = queue.shift();
    active.focus = document.activeElement;
    title.textContent = active.confirmation ? "ยืนยัน" : "แจ้งเตือน";
    message.textContent = active.message;
    cancel.hidden = !active.confirmation;
    confirm.textContent = active.confirmation ? active.label : "ปิด";
    dialog.showModal();
    (active.confirmation ? cancel : confirm).focus();
  }
  function finish(accepted) {
    if (!active) return;
    const request = active;
    active = null;
    dialog.close();
    if (request.focus?.isConnected) request.focus.focus({ preventScroll: true });
    request.resolve(accepted);
    showNext();
  }
  cancel.onclick = () => finish(false);
  confirm.onclick = () => finish(true);
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); finish(false); });
  dialog.addEventListener("keydown", (event) => event.stopPropagation());
  function request(message, confirmation, label = "ยืนยัน") {
    return new Promise((resolve) => { queue.push({ message, confirmation, label, resolve }); showNext(); });
  }
  window.webConfirm = (message, label) => request(message, true, label);
  window.webAlert = (message) => request(message, false);
})();
