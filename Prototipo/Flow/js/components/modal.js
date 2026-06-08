const Modal = {
  show(html) {
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop';
    bd.id = 'modalBackdrop';
    bd.innerHTML = `<div class="modal">${html}</div>`;
    document.body.appendChild(bd);
    bd.addEventListener('click', (e) => { if (e.target === bd) Modal.close(); });
    return bd;
  },

  close() {
    const bd = document.getElementById('modalBackdrop');
    if (bd) bd.remove();
  }
};
