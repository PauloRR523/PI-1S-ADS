const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem('flow_' + key)) || []; }
    catch { return []; }
  },
  getObj(key) {
    try { return JSON.parse(localStorage.getItem('flow_' + key)) || {}; }
    catch { return {}; }
  },
  set(key, val) {
    localStorage.setItem('flow_' + key, JSON.stringify(val));
  },
  nextId(key) {
    const items = DB.get(key);
    return items.length ? Math.max(...items.map(i => i.id || 0)) + 1 : 1;
  }
};

const Store = {
  users: {
    getAll: () => DB.get('users'),
    save: (list) => DB.set('users', list),
    find: (email) => DB.get('users').find(u => u.email === email),
    add(user) {
      const list = DB.get('users');
      user.id = DB.nextId('users');
      list.push(user);
      DB.set('users', list);
      return user;
    }
  },
  alunos: {
    getAll: () => DB.get('alunos'),
    save: (list) => DB.set('alunos', list),
    find: (id) => DB.get('alunos').find(a => a.id === id),
    add(aluno) {
      const list = DB.get('alunos');
      aluno.id = DB.nextId('alunos');
      aluno.createdAt = new Date().toISOString();
      list.push(aluno);
      DB.set('alunos', list);
      return aluno;
    },
    update(aluno) {
      const list = DB.get('alunos').map(a => a.id === aluno.id ? aluno : a);
      DB.set('alunos', list);
    },
    remove(id) {
      DB.set('alunos', DB.get('alunos').filter(a => a.id !== id));
    }
  },
  professores: {
    getAll: () => DB.get('professores'),
    save: (list) => DB.set('professores', list),
    find: (id) => DB.get('professores').find(p => p.id === id),
    add(prof) {
      const list = DB.get('professores');
      prof.id = DB.nextId('professores');
      prof.createdAt = new Date().toISOString();
      list.push(prof);
      DB.set('professores', list);
      return prof;
    },
    update(prof) {
      const list = DB.get('professores').map(p => p.id === prof.id ? prof : p);
      DB.set('professores', list);
    },
    remove(id) {
      DB.set('professores', DB.get('professores').filter(p => p.id !== id));
    }
  },
  cursos: {
    getAll: () => DB.get('cursos'),
    save: (list) => DB.set('cursos', list),
    find: (id) => DB.get('cursos').find(c => c.id === id),
    add(curso) {
      const list = DB.get('cursos');
      curso.id = DB.nextId('cursos');
      curso.createdAt = new Date().toISOString();
      list.push(curso);
      DB.set('cursos', list);
      return curso;
    },
    update(curso) {
      const list = DB.get('cursos').map(c => c.id === curso.id ? curso : c);
      DB.set('cursos', list);
    },
    remove(id) {
      DB.set('cursos', DB.get('cursos').filter(c => c.id !== id));
    }
  },
  mensalidades: {
    getAll: () => DB.get('mensalidades'),
    save: (list) => DB.set('mensalidades', list),
    find: (id) => DB.get('mensalidades').find(m => m.id === id),
    add(m) {
      const list = DB.get('mensalidades');
      m.id = DB.nextId('mensalidades');
      m.createdAt = new Date().toISOString();
      list.push(m);
      DB.set('mensalidades', list);
      return m;
    },
    update(m) {
      const list = DB.get('mensalidades').map(x => x.id === m.id ? m : x);
      DB.set('mensalidades', list);
    },
    remove(id) {
      DB.set('mensalidades', DB.get('mensalidades').filter(m => m.id !== id));
    }
  },
  materiais: {
    getAll: () => DB.get('materiais'),
    save: (list) => DB.set('materiais', list),
    add(m) {
      const list = DB.get('materiais');
      m.id = DB.nextId('materiais');
      m.createdAt = new Date().toISOString();
      list.push(m);
      DB.set('materiais', list);
      return m;
    },
    update(m) {
      const list = DB.get('materiais').map(x => x.id === m.id ? m : x);
      DB.set('materiais', list);
    },
    remove(id) {
      DB.set('materiais', DB.get('materiais').filter(m => m.id !== id));
    }
  }
};

Store.reposicoes = {
  getAll: () => DB.get('reposicoes'),
  save:   (list) => DB.set('reposicoes', list),
  find:   (id)   => DB.get('reposicoes').find(r => r.id === id),
  add(r) {
    const list = DB.get('reposicoes');
    r.id = DB.nextId('reposicoes');
    r.createdAt = new Date().toISOString();
    list.push(r);
    DB.set('reposicoes', list);
    return r;
  },
  update(r) {
    const list = DB.get('reposicoes').map(x => x.id === r.id ? r : x);
    DB.set('reposicoes', list);
  },
  remove(id) {
    DB.set('reposicoes', DB.get('reposicoes').filter(r => r.id !== id));
  }
};
