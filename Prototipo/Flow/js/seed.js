const Seed = {
  run() {
    if (localStorage.getItem('flow_seeded')) return;

    const cursos = [
      { nome: 'Libras Basico',        modalidade: 'Presencial', valor: 180, descricao: 'Introducao a Lingua Brasileira de Sinais' },
      { nome: 'Libras Intermediario', modalidade: 'Presencial', valor: 200, descricao: 'Aprofundamento em Libras' },
      { nome: 'Libras Avancado',      modalidade: 'Presencial', valor: 220, descricao: 'Fluencia e interpretacao em Libras' },
      { nome: 'Ingles Basico',        modalidade: 'Presencial', valor: 190, descricao: 'Introducao ao idioma ingles' },
      { nome: 'Ingles Intermediario', modalidade: 'Hibrido',    valor: 210, descricao: 'Conversacao e gramatica avancada' },
      { nome: 'Ingles Avancado',      modalidade: 'Online',     valor: 230, descricao: 'Fluencia e preparacao para certificacoes' },
    ];
    cursos.forEach(c => {
      c.createdAt = new Date().toISOString();
      const list = DB.get('cursos');
      c.id = list.length ? Math.max(...list.map(i => i.id || 0)) + 1 : 1;
      list.push(c);
      DB.set('cursos', list);
    });

    const cursosIds = DB.get('cursos');
    const idPorNome = name => {
      const c = cursosIds.find(c => c.nome === name);
      return c ? String(c.id) : '';
    };

    const professores = [
      { nome: 'Ana Paula Ribeiro',   cpf: '321.654.987-00', especialidade: 'Libras',  curso: 'Libras Basico',        email: 'ana.ribeiro@flow.edu',  celular: '(11) 98001-1100', admissao: '15/03/22', status: 'ativo' },
      { nome: 'Carlos Eduardo Lima', cpf: '456.789.123-11', especialidade: 'Libras',  curso: 'Libras Intermediario', email: 'carlos.lima@flow.edu',   celular: '(11) 97002-2200', admissao: '02/08/21', status: 'ativo' },
      { nome: 'Fernanda Costa',      cpf: '789.012.345-22', especialidade: 'Ingles',  curso: 'Ingles Basico',        email: 'fernanda.costa@flow.edu', celular: '(11) 96003-3300', admissao: '10/01/23', status: 'ativo' },
      { nome: 'Rodrigo Alves',       cpf: '147.258.369-33', especialidade: 'Ingles',  curso: 'Ingles Avancado',      email: 'rodrigo.alves@flow.edu', celular: '(11) 95004-4400', admissao: '20/06/20', status: 'afastado' },
    ];
    professores.forEach(p => {
      p.createdAt = new Date().toISOString();
      const list = DB.get('professores');
      p.id = list.length ? Math.max(...list.map(i => i.id || 0)) + 1 : 1;
      list.push(p);
      DB.set('professores', list);
    });

    const hoje = new Date();
    const mes  = hoje.getMonth() + 1;
    const ano  = hoje.getFullYear();
    const yy   = String(ano).slice(2);
    const mm   = String(mes).padStart(2,'0');

    const alunos = [
      { nome: 'Maria Joana Ferreira',   cpf: '111.222.333-44', dataNasc: '15/06/95', email: 'maria.joana@email.com',   celular: '(11) 91111-1111', endereco: 'Rua das Flores, 10',     curso: idPorNome('Libras Intermediario'), tipo: 'Grupo', estilo: 'Presencial', pagamento: 'Pix',              valorMensalidade: 200, diaVencimento: 5,  status: 'ativo' },
      { nome: 'Gabriel Souza',          cpf: '222.333.444-55', dataNasc: '21/06/98', email: 'gabriel.souza@email.com',  celular: '(11) 92222-2222', endereco: 'Av. Brasil, 200',        curso: idPorNome('Ingles Basico'),        tipo: 'VIP',   estilo: 'Presencial', pagamento: 'Pix',              valorMensalidade: 190, diaVencimento: 10, status: 'ativo' },
      { nome: 'Isabelli Maria Cardoso', cpf: '333.444.555-66', dataNasc: '03/03/00', email: 'isabelli.m@email.com',    celular: '(11) 93333-3333', endereco: 'Rua Ipiranga, 55',       curso: idPorNome('Ingles Basico'),        tipo: 'Grupo', estilo: 'Presencial', pagamento: 'Boleto',           valorMensalidade: 190, diaVencimento: 10, status: 'ativo' },
      { nome: 'Lucas Henrique Teixeira',cpf: '444.555.666-77', dataNasc: '07/11/97', email: 'lucas.h@email.com',       celular: '(11) 94444-4444', endereco: 'Rua Nova, 300',          curso: idPorNome('Libras Basico'),        tipo: 'Grupo', estilo: 'Presencial', pagamento: 'Pix',              valorMensalidade: 180, diaVencimento: 15, status: 'ativo' },
      { nome: 'Camila Oliveira Santos', cpf: '555.666.777-88', dataNasc: '29/08/01', email: 'camila.os@email.com',     celular: '(21) 95555-5555', endereco: 'Rua das Acaias, 8',      curso: idPorNome('Ingles Intermediario'), tipo: 'VIP',   estilo: 'Hibrido',    pagamento: 'Cartao de Credito', valorMensalidade: 210, diaVencimento: 20, status: 'ativo' },
      { nome: 'Rafael Moraes Junior',   cpf: '666.777.888-99', dataNasc: '14/01/96', email: 'rafael.mj@email.com',     celular: '(11) 96666-6666', endereco: 'Av. Paulista, 1500',     curso: idPorNome('Ingles Avancado'),      tipo: 'VIP',   estilo: 'Online',     pagamento: 'Pix',              valorMensalidade: 230, diaVencimento: 5,  status: 'ativo' },
      { nome: 'Beatriz Lima Nunes',     cpf: '777.888.999-00', dataNasc: '30/05/99', email: 'beatriz.ln@email.com',    celular: '(11) 97777-7777', endereco: 'Rua do Comercio, 42',    curso: idPorNome('Libras Avancado'),      tipo: 'Grupo', estilo: 'Presencial', pagamento: 'Pix',              valorMensalidade: 220, diaVencimento: 10, status: 'ativo' },
      { nome: 'Thiago Pereira Costa',   cpf: '888.999.000-11', dataNasc: '19/09/93', email: 'thiago.pc@email.com',     celular: '(11) 98888-8888', endereco: 'Rua Alegre, 77',         curso: idPorNome('Libras Basico'),        tipo: 'Grupo', estilo: 'Presencial', pagamento: 'Dinheiro',         valorMensalidade: 180, diaVencimento: 15, status: 'ativo' },
      { nome: 'Julia Rodrigues Melo',   cpf: '999.000.111-22', dataNasc: '11/06/02', email: 'julia.rm@email.com',      celular: '(31) 99999-9999', endereco: 'Av. Central, 300',       curso: idPorNome('Ingles Basico'),        tipo: 'Grupo', estilo: 'Presencial', pagamento: 'Pix',              valorMensalidade: 190, diaVencimento: 20, status: 'ativo' },
      { nome: 'Pedro Augusto Farias',   cpf: '100.200.300-44', dataNasc: '05/12/94', email: 'pedro.af@email.com',      celular: '(11) 90000-0101', endereco: 'Rua Sao Jose, 15',       curso: idPorNome('Ingles Intermediario'), tipo: 'VIP',   estilo: 'Online',     pagamento: 'Cartao de Credito', valorMensalidade: 210, diaVencimento: 10, status: 'ativo' },
      { nome: 'Leticia Campos Rocha',   cpf: '200.300.400-55', dataNasc: '22/04/00', email: 'leticia.cr@email.com',    celular: '(11) 91122-3344', endereco: 'Rua Verde, 200',         curso: idPorNome('Libras Intermediario'), tipo: 'Grupo', estilo: 'Presencial', pagamento: 'Pix',              valorMensalidade: 200, diaVencimento: 5,  status: 'trancado' },
      { nome: 'Fernando Almeida Cruz',  cpf: '300.400.500-66', dataNasc: '18/07/91', email: 'fernando.ac@email.com',   celular: '(11) 92233-4455', endereco: 'Av. Norte, 88',          curso: idPorNome('Ingles Avancado'),      tipo: 'VIP',   estilo: 'Presencial', pagamento: 'Boleto',           valorMensalidade: 230, diaVencimento: 15, status: 'ativo' },
    ];

    const addedAlunos = [];
    alunos.forEach(a => {
      a.createdAt = new Date().toISOString();
      const list = DB.get('alunos');
      a.id = list.length ? Math.max(...list.map(i => i.id || 0)) + 1 : 1;
      list.push(a);
      DB.set('alunos', list);
      addedAlunos.push(a);
    });

    const mensalidadesList = DB.get('mensalidades');
    let mId = mensalidadesList.length ? Math.max(...mensalidadesList.map(i => i.id || 0)) + 1 : 1;

    addedAlunos.filter(a => a.status === 'ativo' && a.valorMensalidade).forEach(a => {
      const dia  = a.diaVencimento || 10;
      const venc = `${String(dia).padStart(2,'0')}/${mm}/${yy}`;
      const list = DB.get('mensalidades');
      list.push({
        id: mId++, alunoId: a.id, alunoNome: a.nome,
        valor: a.valorMensalidade, vencimento: venc,
        mes, ano, status: 'pendente', tipo: 'mensalidade',
        createdAt: new Date().toISOString()
      });
      DB.set('mensalidades', list);
    });

    const mesPassado  = mes === 1 ? 12 : mes - 1;
    const anoPassado  = mes === 1 ? ano - 1 : ano;
    const yyP         = String(anoPassado).slice(2);
    const mmP         = String(mesPassado).padStart(2,'0');

    const pagos = [
      addedAlunos[0], addedAlunos[1], addedAlunos[2],
      addedAlunos[5], addedAlunos[6], addedAlunos[9],
    ];
    pagos.forEach(a => {
      if (!a) return;
      const dia  = a.diaVencimento || 10;
      const venc = `${String(dia).padStart(2,'0')}/${mmP}/${yyP}`;
      const list = DB.get('mensalidades');
      list.push({
        id: mId++, alunoId: a.id, alunoNome: a.nome,
        valor: a.valorMensalidade, vencimento: venc,
        mes: mesPassado, ano: anoPassado,
        status: 'pago',
        dataPagamento: `${String(dia + 2 > 28 ? 1 : dia + 2).padStart(2,'0')}/${mmP}/${yyP}`,
        formaPagamento: 'Pix',
        tipo: 'mensalidade',
        createdAt: new Date().toISOString()
      });
      DB.set('mensalidades', list);
    });

    const vencidoAluno = addedAlunos[3];
    if (vencidoAluno) {
      const diaV   = vencidoAluno.diaVencimento || 10;
      const mesV   = mes === 1 ? 12 : mes - 1;
      const anoV   = mes === 1 ? ano - 1 : ano;
      const yyV    = String(anoV).slice(2);
      const mmV    = String(mesV).padStart(2,'0');
      const vencV  = `${String(diaV).padStart(2,'0')}/${mmV}/${yyV}`;
      const list   = DB.get('mensalidades');
      list.push({
        id: mId++, alunoId: vencidoAluno.id, alunoNome: vencidoAluno.nome,
        valor: vencidoAluno.valorMensalidade, vencimento: vencV,
        mes: mesV, ano: anoV, status: 'pendente', tipo: 'mensalidade',
        createdAt: new Date().toISOString()
      });
      DB.set('mensalidades', list);
    }

    const matList = DB.get('materiais');
    [
      { descricao: 'Apostila Libras Vol. 1',       curso: 'Libras Basico',   semestre: `1/${ano}`, valor: 45.00, fornecedor: 'Editora Inclusao' },
      { descricao: 'Kit de Flashcards em Libras',  curso: 'Libras Basico',   semestre: `1/${ano}`, valor: 30.00, fornecedor: 'Grafica Central' },
      { descricao: 'Apostila Ingles Starter Pack', curso: 'Ingles Basico',   semestre: `1/${ano}`, valor: 55.00, fornecedor: 'Oxford Distribuidora' },
      { descricao: 'Workbook Ingles Intermediario',curso: 'Ingles Intermediario', semestre: `2/${ano}`, valor: 70.00, fornecedor: 'Oxford Distribuidora' },
    ].forEach(m => {
      m.id = matList.length ? Math.max(...matList.map(i => i.id || 0)) + 1 : 1;
      m.createdAt = new Date().toISOString();
      matList.push(m);
      DB.set('materiais', matList);
    });

    localStorage.setItem('flow_seeded', '1');
  }
};

const SeedUser = {
  run() {
    if (localStorage.getItem('flow_demo_user')) return;
    const email = 'demo@flow.edu';
    if (!Store.users.find(email)) {
      Store.users.add({ name: 'Administrador', email, password: btoa('demo1234') });
    }
    localStorage.setItem('flow_demo_user', '1');
  }
};
