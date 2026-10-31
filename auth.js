document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.getElementById("form-cadastro");
    const formLogin = document.getElementById("form-login");
    const formEsqueci = document.getElementById("form-esqueci");
    const formRedefinir = document.getElementById("form-redefinir");

    function obterPaginaPrincipal() {
        return "principal.html"; 
    }

    if (formCadastro) {
        formCadastro.addEventListener("submit", (event) => {
            const nome = document.getElementById("nome").value.trim();
            const email = document.getElementById("email").value.trim();
            const senha = document.getElementById("senha").value;

            if (senha.length < 6) {
                event.preventDefault();
                alert("Erro: A senha precisa ter no mínimo 6 caracteres! Digite novamente.");
                document.getElementById("senha").value = "";
                document.getElementById("senha").focus();
                return;
            }

            localStorage.setItem("usuario_nome", nome);
            localStorage.setItem("usuario_email", email);
            localStorage.setItem("usuario_senha", senha);
            localStorage.setItem("futhis_sessao", "ativo");

            alert("Cadastro realizado com sucesso! Bem-vindo ao clube.");
            window.location.href = obterPaginaPrincipal();
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", (event) => {
            event.preventDefault();
            
            const emailEl = document.getElementById("login-email") || document.getElementById("email");
            const senhaEl = document.getElementById("login-senha") || document.getElementById("senha");
            const erroEl = document.getElementById("login-erro");

            if (!emailEl || !senhaEl) return;

            const email = emailEl.value.trim();
            const senha = senhaEl.value;

            const emailSalvo = localStorage.getItem("usuario_email");
            const senhaSalva = localStorage.getItem("usuario_senha");

            if (email === emailSalvo && senha === senhaSalva) {
                localStorage.setItem("futhis_sessao", "ativo");
                alert("Login realizado com sucesso!");
                window.location.href = obterPaginaPrincipal();
            } else {
                if (erroEl) { erroEl.textContent = "E-mail ou senha incorretos."; erroEl.hidden = false; }
                alert("Erro: E-mail ou senha incorretos! Certifique-se de usar os mesmos dados do cadastro.");
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
                alert("Erro: Este e-mail não está cadastrado!");
                return;
            }

            localStorage.setItem("codigo_recuperacao", "123456");
            if (msgEl) { msgEl.textContent = "Código enviado!"; msgEl.hidden = false; }
            alert("Código de recuperação simulado: 123456");

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

            if (codigo !== localStorage.getItem("codigo_recuperacao")) {
                alert("Erro: Código incorreto!");
                return;
            }

            if (novaSenha.length < 6) {
                alert("Erro: A nova senha deve ter no mínimo 6 caracteres!");
                return;
            }

            if (novaSenha !== confirmarNova) {
                alert("Erro: As senhas não coincidem!");
                return;
            }

            localStorage.setItem("usuario_senha", novaSenha);
            localStorage.removeItem("codigo_recuperacao");

            alert("Senha alterada com sucesso!");
            window.location.href = "login.html";
        });
    }
});
