document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.getElementById("form-cadastro");
    const formLogin = document.getElementById("form-login");
    const formEsqueci = document.getElementById("form-esqueci");
    const formRedefinir = document.getElementById("form-redefinir");

    if (formCadastro) {
        formCadastro.addEventListener("submit", (event) => {
            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value;
            const confirmar = document.getElementById("confirmar-senha").value;
            const erroEl = document.getElementById("cadastro-erro");

            if (senha.length < 6) {
                event.preventDefault();
                if (erroEl) { erroEl.textContent = "A senha precisa ter no mínimo 6 caracteres."; erroEl.hidden = false; }
                alert("Erro: A senha precisa ter no mínimo 6 caracteres!");
                return;
            }

            if (senha !== confirmar) {
                event.preventDefault();
                if (erroEl) { erroEl.textContent = "As senhas não coincidem."; erroEl.hidden = false; }
                alert("Erro: As senhas não coincidem! Repita a confirmação.");
                document.getElementById("confirmar-senha").value = "";
                document.getElementById("confirmar-senha").focus();
                return;
            }

            localStorage.setItem("usuario_nome", nome);
            localStorage.setItem("usuario_email", email);
            localStorage.setItem("usuario_senha", senha);
            localStorage.setItem("futhis_sessao", "ativo");

            alert("Cadastro realizado com sucesso! Bem-vindo ao clube.");
            window.location.href = "principal.html";
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", (event) => {
            event.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const senha = document.getElementById("login-senha").value;
            const erroEl = document.getElementById("login-erro");

            const emailSalvo = localStorage.getItem("usuario_email");
            const senhaSalva = localStorage.getItem("usuario_senha");

            if (email === emailSalvo && senha === senhaSalva) {
                localStorage.setItem("futhis_sessao", "ativo");
                alert("Login realizado com sucesso!");
                window.location.href = "principal.html";
            } else {
                if (erroEl) { erroEl.textContent = "E-mail ou senha incorretos."; erroEl.hidden = false; }
                alert("Erro: E-mail ou senha incorretos! Tente novamente.");
            }
        });
    }

    if (formEsqueci) {
        formEsqueci.addEventListener("submit", (event) => {
            event.preventDefault();
            const email = document.getElementById("esqueci-email").value.trim();
            const msgEl = document.getElementById("esqueci-msg");
            const emailSalvo = localStorage.getItem("usuario_email");

            if (email !== emailSalvo) {
                alert("Erro: Este e-mail não está cadastrado no sistema!");
                return;
            }

            localStorage.setItem("codigo_recuperacao", "123456");

            if (msgEl) { msgEl.textContent = "Código enviado para o seu e-mail!"; msgEl.hidden = false; }
            alert("Código de recuperação simulado enviado! Use o código: 123456");

            document.getElementById("etapa-email").hidden = true;
            document.getElementById("etapa-codigo").hidden = false;
        });
    }

    if (formRedefinir) {
        formRedefinir.addEventListener("submit", (event) => {
            event.preventDefault();
            const codigo = document.getElementById("codigo").value.trim();
            const novaSenha = document.getElementById("nova-senha").value;
            const confirmarNova = document.getElementById("confirmar-nova-senha").value;
            const msgEl = document.getElementById("redefinir-msg");

            const codigoSalvo = localStorage.getItem("codigo_recuperacao");

            if (codigo !== codigoSalvo) {
                if (msgEl) { msgEl.textContent = "Código inválido."; msgEl.hidden = false; }
                alert("Erro: Código de verificação incorreto!");
                return;
            }

            if (novaSenha.length < 6) {
                alert("Erro: A nova senha precisa ter no mínimo 6 caracteres!");
                return;
            }

            if (novaSenha !== confirmarNova) {
                if (msgEl) { msgEl.textContent = "As senhas não coincidem."; msgEl.hidden = false; }
                alert("Erro: As senhas não coincidem! Redigite a confirmação.");
                document.getElementById("confirmar-nova-senha").value = "";
                return;
            }

            localStorage.setItem("usuario_senha", novaSenha);
            localStorage.removeItem("codigo_recuperacao");

            alert("Senha alterada com sucesso! Faça login com suas novas credenciais.");
            window.location.href = "login.html";
        });
    }
});
