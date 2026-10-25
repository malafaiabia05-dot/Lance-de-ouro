// auth.js - Módulo de Autenticação Reutilizável

function cadastrarUsuario(nome, email, senha) {
    if (!nome || !email || !senha) {
        alert("Por favor, preencha todos os campos!");
        return false;
    }

    const usuario = { nome, email };
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    alert("Perfil criado com sucesso!");
    
    window.location.href = "principal.html";
    return true;
}

function realizarLogin(email, senha) {
    if (!email || !senha) {
        alert("Por favor, preencha o e-mail e a senha.");
        return false;
    }

    const usuario = { email };
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    
    window.location.href = "principal.html";
    return true;
}

function checarSessao() {
    const usuario = localStorage.getItem("usuarioLogado");
    if (!usuario) {
        window.location.href = "login.html";
    }
}

function encerarSessao() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
}
