Pages.Professores = {
  render() {
    if (!Auth.require()) return '';
    const profs = Store.professores.getAll();
    const rows = profs.map(p => `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar" style="background:${Utils.avatarColor(p.nome)};color:#fff;font-size:12px">${Utils.initials(p.nome)}</div>
          <div>
            <div style="font-weight:600">${p.nome}</div>
            <div style="color:var(--text-muted);font-size:12px">${p.cpf || ''}</div>
          </div>
        </div>
      </td>
      <td>${p.especialidade || '-'}</td>
      <td>${p.email || '-'}</td>
      <td>${p.celular || '-'}</td>
      <td>${p.curso || '-'}</td>
      <td>${p.admissao || '-'}</td>
      <td><span class="badge ${p.status === 'ativo' ? 'badge-green' : p.status === 'afastado' ? 'badge-yellow' : 'badge-gray'}">${p.status || 'ativo'}</span></td>
      <td>
        <div class="actions-row">
          <button class="btn btn-icon btn-sm" onclick="Pages.Professores.openEdit(${p.id})">${Utils.svgIcon('edit',14)}</button>
          <button class="btn btn-danger btn-sm" onclick="Pages.Professores.remove(${p.id})">${Utils.svgIcon('trash',14)}</button>
        </div>
      </td>
    </tr>`).join('');
    return Layout.wrap('professores', `
      <div class="page-header"><h1>Professores</h1><p>Cadastro e gerenciamento de docentes</p></div>
      <div class="section-hdr" style="margin-bottom:14px">
        <span style="color:var(--text-secondary);font-size:13px">${profs.length} professor(es) cadastrado(s)</span>
        <button class="btn btn-primary" id="novoProfBtn">${Utils.svgIcon('plus',14)} Novo Professor</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Professor</th><th>Especialidade</th><th>E-mail</th><th>Celular</th><th>Curso</th><th>Admissao</th><th>Status</th><th>Acoes</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="8"><div class="empty-state">${Utils.svgIcon('user',32)}<br>Nenhum professor cadastrado.</div></td></tr>`}</tbody>
        </table>
      </div>
    `);
  },

  bind() {
    document.getElementById('novoProfBtn').addEventListener('click', () => Pages.Professores.openForm());
  },

  openForm(prof) {
    const cursos = Store.cursos.getAll();
    Modal.show(`
      <div class="modal-header">
        <h2>${prof ? 'Editar Professor' : 'Novo Professor'}</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>Nome completo *</label>
            <input id="pNome" value="${prof ? prof.nome : ''}" placeholder="Nome do professor" />
          </div>
          <div class="form-group">
            <label>CPF</label>
            <input id="pCpf" value="${prof ? prof.cpf||'' : ''}" placeholder="000.000.000-00" maxlength="14" inputmode="numeric" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Especialidade</label>
            <input id="pEsp" value="${prof ? prof.especialidade||'' : ''}" placeholder="Ex: Libras, Ingles" />
          </div>
          <div class="form-group">
            <label>Curso que leciona</label>
            <select id="pCurso">
              <option value="">Selecione...</option>
              ${cursos.map(c => `<option value="${c.nome}" ${prof && prof.curso === c.nome ? 'selected':''}>${c.nome}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>E-mail</label>
            <input id="pEmail" type="email" value="${prof ? prof.email||'' : ''}" placeholder="email@exemplo.com" />
          </div>
          <div class="form-group">
            <label>Celular</label>
            <input id="pCelular" value="${prof ? prof.celular||'' : ''}" placeholder="(11) 90000-0000" maxlength="15" inputmode="numeric" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Data de Admissao (dd/mm/aa)</label>
            <input id="pAdmissao" value="${prof ? prof.admissao||'' : ''}" placeholder="dd/mm/aa" maxlength="8" inputmode="numeric" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select id="pStatus">
              <option value="ativo"     ${!prof || prof.status === 'ativo'     ? 'selected':''}>Ativo</option>
              <option value="afastado"  ${prof && prof.status === 'afastado'   ? 'selected':''}>Afastado</option>
              <option value="desligado" ${prof && prof.status === 'desligado'  ? 'selected':''}>Desligado</option>
            </select>
          </div>
        </div>
        <div id="profFormMsg"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Professores.save(${prof ? prof.id : 'null'})">${prof ? 'Salvar alteracoes' : 'Cadastrar'}</button>
      </div>
    `);
    Utils.applyMask(document.getElementById('pCpf'),     'cpf');
    Utils.applyMask(document.getElementById('pCelular'), 'phone');
    Utils.applyMask(document.getElementById('pAdmissao'),'date');
  },

  openEdit(id) {
    const p = Store.professores.find(id);
    if (p) Pages.Professores.openForm(p);
  },

  save(id) {
    const nome = document.getElementById('pNome').value.trim();
    if (!nome) {
      document.getElementById('profFormMsg').innerHTML = `<div class="error-msg">O nome e obrigatorio.</div>`; return;
    }
    const admRaw = document.getElementById('pAdmissao').value.trim();
    const data = {
      nome,
      cpf:           document.getElementById('pCpf').value.trim(),
      especialidade: document.getElementById('pEsp').value.trim(),
      curso:         document.getElementById('pCurso').value,
      email:         document.getElementById('pEmail').value.trim(),
      celular:       document.getElementById('pCelular').value.trim(),
      admissao:      Utils.parseDateFromMask(admRaw) || admRaw,
      status:        document.getElementById('pStatus').value
    };
    if (id) {
      const p = Store.professores.find(id);
      Object.assign(p, data);
      Store.professores.update(p);
      Utils.toast('Professor atualizado.');
    } else {
      Store.professores.add(data);
      Utils.toast('Professor cadastrado.');
    }
    Modal.close();
    Router.go('professores');
  },

  remove(id) {
    if (!confirm('Remover este professor?')) return;
    Store.professores.remove(id);
    Utils.toast('Professor removido.', 'error');
    Router.go('professores');
  }
};
