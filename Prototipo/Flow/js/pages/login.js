const Pages = {};

Pages.Login = {
  render() {
    return `
      <div class="auth-wrapper">
        <div class="auth-box">
          <span class="brand">Flow</span>
          <p class="auth-subtitle">Sistema de Gestao Escolar</p>
          <div id="loginMsg"></div>
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" id="loginEmail" placeholder="seu@email.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label>Senha</label>
            <div class="password-wrap">
              <input type="password" id="loginPassword" placeholder="Sua senha" autocomplete="current-password" />
              <button type="button" class="toggle-pw" id="togglePw">${Utils.svgIcon('eye', 16)}</button>
            </div>
          </div>
          <button class="btn btn-primary btn-full" id="loginBtn" style="margin-top:4px">Entrar</button>
          <div class="demo-hint" style="background:var(--accent-soft);border:1px solid rgba(91,141,238,0.2);border-radius:9px;padding:10px 14px;font-size:12px;color:var(--accent);margin-bottom:16px;text-align:center">Acesso demo <div class="auth-link">mdash; <strong>demo@flow.edu</strong> / <strong>demo1234</strong></div>
          <div class="auth-link">
            Nao tem conta? <a href="#" id="goRegister">Criar conta</a>
          </div>
        </div>
      </div>
    `;
  },

  bind() {
    document.getElementById('goRegister').addEventListener('click', (e) => {
      e.preventDefault();
      Router.go('register');
    });

    const pwInput = document.getElementById('loginPassword');
    document.getElementById('togglePw').addEventListener('click', () => {
      const type = pwInput.type === 'password' ? 'text' : 'password';
      pwInput.type = type;
      document.getElementById('togglePw').innerHTML = Utils.svgIcon(type === 'password' ? 'eye' : 'eyeOff', 16);
    });

    const btn = document.getElementById('loginBtn');
    const submit = () => {
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const msg      = document.getElementById('loginMsg');
      msg.innerHTML  = '';
      if (!email || !password) {
        msg.innerHTML = `<div class="error-msg">Preencha todos os campos.</div>`;
        return;
      }
      btn.disabled    = true;
      btn.textContent = 'Entrando...';
      setTimeout(() => {
        const result = Auth.login(email, password);
        if (result.ok) {
          Router.go('dashboard');
        } else {
          msg.innerHTML   = `<div class="error-msg">${result.error}</div>`;
          btn.disabled    = false;
          btn.textContent = 'Entrar';
        }
      }, 280);
    };

    btn.addEventListener('click', submit);
    [document.getElementById('loginEmail'), document.getElementById('loginPassword')].forEach(inp => {
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    });
  }
};
