Pages.Mensalidades = {
  tabAtual:   'todas',
  TAXA_JUROS: parseFloat(localStorage.getItem('flow_taxaJuros')) || 0.1,

  gerarParaAluno(aluno) {
    if (!aluno || !aluno.id) return;
    const hoje = new Date();
    const mes  = hoje.getMonth() + 1;
    const ano  = hoje.getFullYear();
    const dia  = aluno.diaVencimento || 10;
    const venc = `${String(dia).padStart(2,'0')}/${String(mes).padStart(2,'0')}/${String(ano).slice(2)}`;
    const jaExiste = Store.mensalidades.getAll().find(
      m => m.alunoId === aluno.id && m.mes === mes && m.ano === ano && m.tipo === 'mensalidade'
    );
    if (!jaExiste && aluno.valorMensalidade) {
      Store.mensalidades.add({
        alunoId: aluno.id, alunoNome: aluno.nome,
        valor: aluno.valorMensalidade, vencimento: venc,
        mes, ano, status: 'pendente', tipo: 'mensalidade'
      });
    }
  },

  calcJuros(m) {
    if (m.status === 'pago') return 0;
    const venc = Utils.parseDate(m.vencimento);
    if (!venc) return 0;
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    if (hoje <= venc) return 0;
    const diffDays = Math.floor((hoje - venc) / (1000 * 60 * 60 * 24));
    return parseFloat((m.valor * (Pages.Mensalidades.TAXA_JUROS / 100) * diffDays).toFixed(2));
  },

  statusInfo(m) {
    if (m.status === 'pago')          return { badge:'badge-green',  label:'Pago' };
    if (m.status === 'parcial')       return { badge:'badge-blue',   label:'Parcial' };
    const venc = Utils.parseDate(m.vencimento);
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    if (venc && hoje > venc)          return { badge:'badge-red',    label:'Vencido' };
    return                                   { badge:'badge-yellow', label:'Pendente' };
  },

  render() {
    if (!Auth.require()) return '';
    const ativos   = Store.alunos.getAll().filter(a => a.status === 'ativo');
    const hoje     = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    ativos.forEach(a => {
      const jaExiste = Store.mensalidades.getAll().find(
        m => m.alunoId === a.id && m.mes === mesAtual && m.ano === anoAtual && m.tipo === 'mensalidade'
      );
      if (!jaExiste && a.valorMensalidade) Pages.Mensalidades.gerarParaAluno(a);
    });

    const todas    = Store.mensalidades.getAll();
    const tab      = Pages.Mensalidades.tabAtual;
    const hojeFlat = new Date(); hojeFlat.setHours(0,0,0,0);

    const filtered = todas.filter(m => {
      if (tab === 'pendentes') return m.status !== 'pago';
      if (tab === 'pagas')     return m.status === 'pago';
      if (tab === 'parciais')  return m.status === 'parcial';
      if (tab === 'vencidas') {
        const v = Utils.parseDate(m.vencimento);
        return m.status !== 'pago' && v && hojeFlat > v;
      }
      return true;
    });

    const totalAberto  = todas.filter(m => m.status !== 'pago').reduce((s,m) => s + (m.valor - (m.valorPago||0)), 0);
    const totalJuros   = todas.filter(m => m.status !== 'pago').reduce((s,m) => s + Pages.Mensalidades.calcJuros(m), 0);
    const recebidoMes  = todas.filter(m => (m.status === 'pago'||m.status==='parcial') && m.mes === mesAtual && m.ano === anoAtual).reduce((s,m) => s + (m.valorPago||m.valor), 0);
    const taxaAtual    = Pages.Mensalidades.TAXA_JUROS;

    const rows = filtered.map(m => {
      const juros     = Pages.Mensalidades.calcJuros(m);
      const totalDev  = m.valor + juros;
      const valorPago = m.valorPago || 0;
      const si        = Pages.Mensalidades.statusInfo(m);
      return `<tr>
        <td style="font-weight:600">${m.alunoNome || ''}</td>
        <td>${String(m.mes).padStart(2,'0')}/${m.ano}</td>
        <td>${Utils.formatCurrency(m.valor)}</td>
        <td>${juros > 0 ? `<span style="color:var(--red);font-weight:600">${Utils.formatCurrency(juros)}</span>` : '<span style="color:var(--text-muted)">-</span>'}</td>
        <td style="font-weight:700">${Utils.formatCurrency(totalDev)}</td>
        <td>${valorPago > 0 ? `<span style="color:var(--accent);font-weight:600">${Utils.formatCurrency(valorPago)}</span>` : '<span style="color:var(--text-muted)">-</span>'}</td>
        <td>${m.vencimento || '-'}</td>
        <td><span class="badge ${si.badge}">${si.label}</span></td>
        <td>${m.dataPagamento || '<span style="color:var(--text-muted)">-</span>'}</td>
        <td>
          <div class="actions-row">
            ${m.status !== 'pago'
              ? `<button class="btn btn-primary btn-sm" onclick="Pages.Mensalidades.abrirPagamento(${m.id})">Registrar</button>`
              : `<span style="color:var(--green);font-size:12px;font-weight:600">${Utils.svgIcon('check',13)} Pago</span>`}
            <button class="btn btn-danger btn-sm" onclick="Pages.Mensalidades.remove(${m.id})">${Utils.svgIcon('trash',13)}</button>
          </div>
        </td>
      </tr>`;
    }).join('');

    return Layout.wrap('mensalidades', `
      <div class="page-header"><h1>Mensalidades</h1><p>Controle financeiro e registro de pagamentos</p></div>

      <div class="finance-row">
        <div class="finance-chip"><div class="label">Saldo em Aberto</div><div class="value" style="color:var(--red)">${Utils.formatCurrency(totalAberto)}</div></div>
        <div class="finance-chip"><div class="label">Juros Acumulados</div><div class="value" style="color:var(--yellow)">${Utils.formatCurrency(totalJuros)}</div></div>
        <div class="finance-chip"><div class="label">Recebido este Mes</div><div class="value positive">${Utils.formatCurrency(recebidoMes)}</div></div>
        <div class="finance-chip"><div class="label">Total de Registros</div><div class="value neutral">${todas.length}</div></div>
      </div>

      <div class="card" style="margin-bottom:16px;padding:14px 18px">
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:8px">
            <label style="margin:0;white-space:nowrap">Taxa de Juros por Atraso (% ao dia):</label>
            <input id="taxaJurosInput" type="number" step="0.01" min="0" value="${taxaAtual}"
              style="width:90px;padding:6px 10px;font-size:13px" />
          </div>
          <button class="btn btn-primary btn-sm" onclick="Pages.Mensalidades.salvarTaxa()">Salvar Taxa</button>
          <span style="color:var(--text-muted);font-size:12px">Aplicada automaticamente sobre os dias de atraso de cada cobranca em aberto.</span>
        </div>
      </div>

      <div class="section-hdr" style="margin-bottom:0;flex-wrap:wrap;gap:10px">
        <div class="tabs" style="border:none;margin:0;flex-wrap:wrap">
          ${[['todas','Todas'],['pendentes','Pendentes'],['parciais','Parciais'],['vencidas','Vencidas'],['pagas','Pagas']].map(([id,label]) =>
            `<button class="tab ${tab===id?'active':''}" onclick="Pages.Mensalidades.setTab('${id}')">${label}</button>`
          ).join('')}
        </div>
        <button class="btn btn-primary" id="novaCobrancaBtn">${Utils.svgIcon('plus',14)} Lancar Mensalidade</button>
      </div>

      <div class="table-wrap" style="margin-top:14px">
        <table>
          <thead><tr>
            <th>Aluno</th><th>Mes/Ano</th><th>Valor</th><th>Juros</th><th>Total</th><th>Pago Ate Agora</th><th>Vencimento</th><th>Status</th><th>Pago em</th><th>Acoes</th>
          </tr></thead>
          <tbody>${rows || `<tr><td colspan="10"><div class="empty-state">Nenhum registro encontrado.</div></td></tr>`}</tbody>
        </table>
      </div>
    `);
  },

  bind() {
    const btn = document.getElementById('novaCobrancaBtn');
    if (btn) btn.addEventListener('click', () => Pages.Mensalidades.abrirNovaCobranca());
  },

  setTab(tab) { Pages.Mensalidades.tabAtual = tab; Router.go('mensalidades'); },

  salvarTaxa() {
    const taxa = parseFloat(document.getElementById('taxaJurosInput').value);
    if (isNaN(taxa) || taxa < 0) { Utils.toast('Informe uma taxa valida.', 'error'); return; }
    localStorage.setItem('flow_taxaJuros', taxa);
    Pages.Mensalidades.TAXA_JUROS = taxa;
    Utils.toast(`Taxa atualizada para ${taxa}% ao dia.`);
    Router.go('mensalidades');
  },

  abrirPagamento(id) {
    const m     = Store.mensalidades.find(id);
    if (!m) return;
    const juros      = Pages.Mensalidades.calcJuros(m);
    const totalDev   = m.valor + juros;
    const valorPagoAntes = m.valorPago || 0;
    const saldoRestante  = Math.max(0, totalDev - valorPagoAntes);
    const hoje  = new Date();
    const hojeStr = `${String(hoje.getDate()).padStart(2,'0')}/${String(hoje.getMonth()+1).padStart(2,'0')}/${String(hoje.getFullYear()).slice(2)}`;

    Modal.show(`
      <div class="modal-header">
        <h2>Registrar Pagamento</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:4px">Aluno: <strong>${m.alunoNome}</strong></p>
        <p style="color:var(--text-muted);font-size:12px;margin-bottom:16px">
          Ref.: ${String(m.mes).padStart(2,'0')}/${m.ano} &bull; Venc.: ${m.vencimento}
        </p>
        <div class="finance-row" style="margin-bottom:16px">
          <div class="finance-chip"><div class="label">Valor Original</div><div class="value neutral">${Utils.formatCurrency(m.valor)}</div></div>
          ${juros > 0 ? `<div class="finance-chip"><div class="label">Juros (${Pages.Mensalidades.TAXA_JUROS}%/dia)</div><div class="value" style="color:var(--red)">${Utils.formatCurrency(juros)}</div></div>` : ''}
          <div class="finance-chip"><div class="label">Total a Receber</div><div class="value positive">${Utils.formatCurrency(totalDev)}</div></div>
          ${valorPagoAntes > 0 ? `<div class="finance-chip"><div class="label">Ja Pago</div><div class="value" style="color:var(--accent)">${Utils.formatCurrency(valorPagoAntes)}</div></div>` : ''}
          <div class="finance-chip"><div class="label">Saldo Restante</div><div class="value" style="color:var(--red)">${Utils.formatCurrency(saldoRestante)}</div></div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Valor Pago Agora (R$) *</label>
            <input id="pagValorPago" type="number" step="0.01" value="${saldoRestante.toFixed(2)}" min="0.01" />
            <p style="font-size:11px;color:var(--text-muted);margin-top:4px">Se menor que o saldo, a cobranca ficara como "Parcial".</p>
          </div>
          <div class="form-group">
            <label>Forma de Pagamento</label>
            <select id="pagForma">
              ${['Pix','Boleto','Cartao de Credito','Dinheiro'].map(f => `<option value="${f}">${f}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Data do Pagamento (dd/mm/aa)</label>
          <input id="pagData" value="${hojeStr}" placeholder="dd/mm/aa" maxlength="8" inputmode="numeric" />
        </div>
        <div id="pagMsg"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Mensalidades.confirmarPagamento(${id}, ${totalDev.toFixed(2)}, ${valorPagoAntes.toFixed(2)})">Confirmar</button>
      </div>
    `);
    Utils.applyMask(document.getElementById('pagData'), 'date');
  },

  confirmarPagamento(id, totalDev, valorPagoAntes) {
    const m = Store.mensalidades.find(id);
    if (!m) return;
    const valorAgora = parseFloat(document.getElementById('pagValorPago').value) || 0;
    if (valorAgora <= 0) {
      document.getElementById('pagMsg').innerHTML = `<div class="error-msg">Informe um valor valido.</div>`; return;
    }
    const dataRaw   = document.getElementById('pagData').value.trim();
    const totalPago = valorPagoAntes + valorAgora;

    m.valorPago      = parseFloat(totalPago.toFixed(2));
    m.dataPagamento  = Utils.parseDateFromMask(dataRaw) || dataRaw;
    m.formaPagamento = document.getElementById('pagForma').value;

    if (totalPago >= totalDev - 0.01) {
      m.status         = 'pago';
      m.jurosAplicados = Pages.Mensalidades.calcJuros(m);
    } else {
      m.status = 'parcial';
    }

    Store.mensalidades.update(m);
    Utils.toast(m.status === 'pago' ? 'Pagamento total registrado.' : `Pagamento parcial registrado. Saldo: ${Utils.formatCurrency(totalDev - totalPago)}`);
    Modal.close();
    Router.go('mensalidades');
  },

  abrirNovaCobranca() {
    const ativos  = Store.alunos.getAll().filter(a => a.status === 'ativo');
    const hoje    = new Date();
    const hojeStr = `${String(hoje.getDate()).padStart(2,'0')}/${String(hoje.getMonth()+1).padStart(2,'0')}/${String(hoje.getFullYear()).slice(2)}`;

    Modal.show(`
      <div class="modal-header">
        <h2>Lancar Mensalidade</h2>
        <button class="modal-close" onclick="Modal.close()">${Utils.svgIcon('x',16)}</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Aluno *</label>
          <select id="ncAluno">
            <option value="">Selecione um aluno...</option>
            ${ativos.map(a => `<option value="${a.id}" data-valor="${a.valorMensalidade||0}">${a.nome}</option>`).join('')}
          </select>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Valor (R$) *</label><input id="ncValor" type="number" step="0.01" placeholder="0,00" /></div>
          <div class="form-group"><label>Tipo</label><select id="ncTipo">
            <option value="mensalidade">Mensalidade</option>
            <option value="reposicao">Reposicao de aula</option>
            <option value="material">Material didatico</option>
            <option value="taxa">Taxa extra</option>
          </select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Vencimento (dd/mm/aa)</label><input id="ncVenc" value="${hojeStr}" placeholder="dd/mm/aa" maxlength="8" inputmode="numeric" /></div>
          <div class="form-group"><label>Descricao</label><input id="ncDesc" placeholder="Referencia ou observacao..." /></div>
        </div>
        <div id="ncMsg"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" onclick="Pages.Mensalidades.salvarCobranca()">Criar Cobranca</button>
      </div>
    `);
    Utils.applyMask(document.getElementById('ncVenc'), 'date');
    document.getElementById('ncAluno').addEventListener('change', function() {
      const opt = this.options[this.selectedIndex];
      if (opt && opt.dataset.valor) document.getElementById('ncValor').value = opt.dataset.valor;
    });
  },

  salvarCobranca() {
    const alunoId = parseInt(document.getElementById('ncAluno').value);
    const valor   = parseFloat(document.getElementById('ncValor').value) || 0;
    if (!alunoId || !valor) {
      document.getElementById('ncMsg').innerHTML = `<div class="error-msg">Selecione o aluno e informe o valor.</div>`; return;
    }
    const aluno   = Store.alunos.find(alunoId);
    const vencRaw = document.getElementById('ncVenc').value.trim();
    const d       = new Date();
    Store.mensalidades.add({
      alunoId, alunoNome: aluno ? aluno.nome : '',
      valor, vencimento: Utils.parseDateFromMask(vencRaw) || vencRaw,
      mes: d.getMonth()+1, ano: d.getFullYear(),
      status: 'pendente', tipo: document.getElementById('ncTipo').value,
      descricao: document.getElementById('ncDesc').value.trim()
    });
    Utils.toast('Cobranca criada com sucesso.');
    Modal.close();
    Router.go('mensalidades');
  },

  remove(id) {
    if (!confirm('Remover esta cobranca?')) return;
    Store.mensalidades.remove(id);
    Utils.toast('Cobranca removida.', 'error');
    Router.go('mensalidades');
  }
};
