const Auth = {
  SESSION_KEY: 'flow_session',

  login(email, password) {
    const user = Store.users.find(email);
    if (!user) return { ok: false, error: 'Usuário não encontrado.' };
    if (user.password !== btoa(password)) return { ok: false, error: 'Senha incorreta.' };
    sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
    return { ok: true, user };
  },

  register(name, email, password) {
    if (Store.users.find(email)) return { ok: false, error: 'E-mail já cadastrado.' };
    const user = Store.users.add({ name, email, password: btoa(password) });
    return { ok: true, user };
  },

  logout() {
    sessionStorage.removeItem(Auth.SESSION_KEY);
    Router.go('login');
  },

  current() {
    try { return JSON.parse(sessionStorage.getItem(Auth.SESSION_KEY)); }
    catch { return null; }
  },

  require() {
    if (!Auth.current()) { Router.go('login'); return false; }
    return true;
  }
};
