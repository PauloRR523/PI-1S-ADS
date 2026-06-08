Pages.Register = {
  render() {
    return `
      <div class="auth-wrapper">
        <div class="auth-box">
          <span class="brand">Flow</span>
          <p class="auth-subtitle">Criar nova conta</p>
          <div id="regMsg"></div>
          <div class="form-group">
            <label>Nome completo</label>
            <input type="text" id="regName" placeholder="Seu nome completo" autocomplete="name" />
          </div>
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" id="regEmail" placeholder="seu@email.com" autocomplete="email" />
          </div>
          <div class="form-group">
            <label>Senha</label>
            <div class="password-wrap">
              <input type="password" id="regPassword" placeholder="Minimo 6 caracteres" autocomplete="new-password" />
              <button type="button" class="toggle-pw" id="togglePwReg">${Utils.svgIcon('eye', 16)}</button>
            </div>
          </div>
          <div class="form-group">
            <label>Confirmar senha</label>
            <div class="password-wrap">
              <input type="password" id="regPassword2" placeholder="Repita a senha" autocomplete="new-password" />
              <button type="button" class="toggle-pw" id="togglePwReg2">${Utils.svgIcon('eye', 16)}</button>
            </div>
          </div>
          <button class="btn btn-primary btn-full" id="regBtn" style="margin-top:4px">Criar conta</button>
          <div class="auth-link">
            Ja tem conta? <a href="#" id="goLogin">Fazer login</a>
          </div>
        </div>
      </div>
    `;
  },

  bind() {
    document.getElementById('goLogin').addEventListener('click', (e) => {
      e.preventDefault();
      Router.go('login');
    });

    const bindToggle = (btnId, inputId) => {
      const inp = document.getElementById(inputId);
      document.getElementById(btnId).addEventListener('click', () => {
        const t = inp.type === 'password' ? 'text' : 'password';
        inp.type = t;
        document.getElementById(btnId).innerHTML = Utils.svgIcon(t === 'password' ? 'eye' : 'eyeOff', 16);
      });
    };
    bindToggle('togglePwReg',  'regPassword');
    bindToggle('togglePwReg2', 'regPassword2');

    const btn = document.getElementById('regBtn');
    btn.addEventListener('click', () => {
      const name  = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const pw    = document.getElementById('regPassword').value;
      const pw2   = document.getElementById('regPassword2').value;
      const msg   = document.getElementById('regMsg');
      msg.innerHTML = '';

      if (!name || !email || !pw || !pw2) {
        msg.innerHTML = `<div class="error-msg">Preencha todos os campos.</div>`; return;
      }
      if (pw.length < 6) {
        msg.innerHTML = `<div class="error-msg">A senha precisa ter no minimo 6 caracteres.</div>`; return;
      }
      if (pw !== pw2) {
        msg.innerHTML = `<div class="error-msg">As senhas nao coincidem.</div>`; return;
      }

      btn.disabled    = true;
      btn.textContent = 'Criando...';

      setTimeout(() => {
        const result = Auth.register(name, email, pw);
        if (result.ok) {
          msg.innerHTML = `<div class="success-msg">Conta criada com sucesso! Faca o login para entrar.</div>`;
          setTimeout(() => Router.go('login'), 1800);
        } else {
          msg.innerHTML   = `<div class="error-msg">${result.error}</div>`;
          btn.disabled    = false;
          btn.textContent = 'Criar conta';
        }
      }, 280);
    });
  }
};
