document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.getElementById("form-cadastro");

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
            localStorage.setItem("futhis_sessao", "ativo");

            alert("Cadastro realizado com sucesso! Bem-vindo ao clube.");
            window.location.href = "principal.html";
        });
    }
});
