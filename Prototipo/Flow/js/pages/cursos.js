Pages.Cursos = {
  render() {
    if (!Auth.require()) return '';
    const cursos = Store.cursos.getAll();
    const alunos = Store.alunos.getAll();

    const cards = cursos.map(c => {
      const turma = alunos.filter(a => String(a.curso) === String(c.id) && a.status === 'ativo');
      return `
        <div class="card" style="margin-bottom:14px">
          <div class="section-hdr">
            <div>
              <div style="font-family:'Nunito',sans-serif;font-weight:800;font-size:1rem;color:var(--text-primary)">${c.nome}</div>
              <div style="color:var(--text-muted);font-size:12px;margin-top:3px">
                ${c.modalidade || 'Presencial'} &bull; ${Utils.formatCurrency(c.valor)}/mes
                ${c.descricao ? ' &bull; ' + c.descricao : ''}
              </div>
            </div>
            <div class="actions-row">
              <span class="badge badge-blue">${turma.length} aluno(s)</span>
              <button class="btn btn-ghost btn-sm" onclick="Pages.Cursos.verTurma(${c.id})">${Utils.svgIcon('users',14)} Turma</button>
              <button class="btn btn-icon btn-sm" onclick="Pages.Cursos.openEdit(${c.id})">${Utils.svgIcon('edit',14)}</button>
              <button class="btn btn-danger btn-sm" onclick="Pages.Cursos.remove(${c.id})">${Utils.svgIcon('trash',14)}</button>
            </div>
          </div>
        </div>`;
    }).join('');

    return Layout.wrap('cursos', `
      <div class="page-header"><h1>Cursos</h1><p>Gerenciamento dos cursos oferecidos</p></div>
      <div class="section-hdr" style="margin-bottom:20px">
        <span style="color:var(--text-secondary);font-size:13px">${cursos.length} curso(s) cadastrado(s)</span>
        <button class="btn btn-primary" id="novoCursoBtn">${Utils.svgIcon('plus',14)} Novo Curso</button>
      </div>
      ${cards || `<div class="empty-state">${Utils.svgIcon('book',36)}<br>Nenhum curso cadastrado.</div>`}
    `);
  },

  bind() {
    document.getElementById('novoCursoBtn').addEventListener('click', () => Pages.Cursos.openForm());
  },

  openForm(curso) {
    Modal.show(`
      <div class="modal-header">
        <h2>${curso ? 'Editar Curso' : 'Novo Curso'}</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nome do Curso *</label>
          <input id="cNome" value="${curso ? curso.nome : ''}" placeholder="Ex: Libras Basico" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Modalidade</label>
            <select id="cModal">
              <option value="Presencial" ${!curso || curso.modalidade === 'Presencial' ? 'selected':''}>Presencial</option>
              <option value="Online"     ${curso && curso.modalidade === 'Online'     ? 'selected':''}>Online</option>
              <option value="Hibrido"    ${curso && curso.modalidade === 'Hibrido'    ? 'selected':''}>Hibrido</option>
            </select>
          </div>
          <div class="form-group">
            <label>Valor da Mensalidade (R$)</label>
            <input id="cValor" type="number" step="0.01" value="${curso ? curso.valor||'' : ''}" placeholder="0,00" />
          </div>
        </div>
        <div class="form-group">
          <label>Descricao</label>
          <textarea id="cDesc" rows="2" placeholder="Descricao opcional...">${curso ? curso.descricao||'' : ''}</textarea>
        </div>
        <div id="cursoFormMsg"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Cursos.save(${curso ? curso.id : 'null'})">${curso ? 'Salvar alteracoes' : 'Criar Curso'}</button>
      </div>
    `);
  },

  openEdit(id) {
    const c = Store.cursos.find(id);
    if (c) Pages.Cursos.openForm(c);
  },

  save(id) {
    const nome = document.getElementById('cNome').value.trim();
    if (!nome) {
      document.getElementById('cursoFormMsg').innerHTML = `<div class="error-msg">O nome e obrigatorio.</div>`; return;
    }
    const data = {
      nome,
      modalidade: document.getElementById('cModal').value,
      valor:      parseFloat(document.getElementById('cValor').value) || 0,
      descricao:  document.getElementById('cDesc').value.trim()
    };
    if (id) {
      const c = Store.cursos.find(id);
      Object.assign(c, data);
      Store.cursos.update(c);
      Utils.toast('Curso atualizado.');
    } else {
      Store.cursos.add(data);
      Utils.toast('Curso criado com sucesso.');
    }
    Modal.close();
    Router.go('cursos');
  },

  verTurma(cursoId) {
    const curso  = Store.cursos.find(cursoId);
    const alunos = Store.alunos.getAll().filter(a => String(a.curso) === String(cursoId) && a.status === 'ativo');
    Modal.show(`
      <div class="modal-header">
        <h2>Turma &mdash; ${curso ? curso.nome : ''}</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <p style="color:var(--text-muted);font-size:13px;margin-bottom:16px">${alunos.length} aluno(s) ativo(s) neste curso</p>
        ${alunos.length ? alunos.map(a => `
          <div class="student-row">
            <div class="avatar" style="background:${Utils.avatarColor(a.nome)};color:#fff;font-size:12px">${Utils.initials(a.nome)}</div>
            <div class="info">
              <strong>${a.nome}</strong>
              <span>${a.tipo || ''} &bull; ${a.estilo || ''} &bull; ${a.pagamento || ''}</span>
            </div>
            <span class="badge badge-green">Ativo</span>
          </div>`).join('')
          : '<p style="color:var(--text-muted);font-size:13px">Nenhum aluno ativo neste curso.</p>'}
      </div>
    `);
  },

  remove(id) {
    if (!confirm('Remover este curso?')) return;
    Store.cursos.remove(id);
    Utils.toast('Curso removido.', 'error');
    Router.go('cursos');
  }
};
