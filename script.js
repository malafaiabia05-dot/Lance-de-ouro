let nameInput = document.querySelector('.name-input');
let greetButton = document.querySelector('.greet');
let nextButton = document.querySelector('.next');
let slides = document.querySelectorAll('.slide');
let currentSlide = 0;
// Função simples para salvar um item
function salvarItem(idConteudo) {
    let salvos = JSON.parse(localStorage.getItem('futhis_salvos')) || [];
    if (!salvos.includes(idConteudo)) {
        salvos.push(idConteudo);
        localStorage.setItem('futhis_salvos', JSON.stringify(salvos));
        alert('Adicionado aos seus itens salvos!');
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.querySelector("form");
    const inputPerfilNome = document.getElementById("perfil-nome");
    const inputPerfilEmail = document.getElementById("perfil-email");
    const inputPerfilTime = document.getElementById("perfil-time");
    const btnAtualizarPerfil = document.getElementById("btn-atualizar-perfil");

    if (formCadastro && window.location.pathname.includes("conta.html")) {
        formCadastro.addEventListener("submit", (e) => {
            const nomeDigitado = document.getElementById("nome").value;
            const emailDigitado = document.getElementById("email").value;

            localStorage.setItem("usuario_nome", nomeDigitado);
            localStorage.setItem("usuario_email", emailDigitado);
            localStorage.setItem("usuario_time", ""); 
        });
    }

    if (inputPerfilNome && inputPerfilEmail) {
        const nomeSalvo = localStorage.getItem("usuario_nome") || "Nome do Torcedor";
        const emailSalvo = localStorage.getItem("usuario_email") || "seuemail@futhis.com";
        const timeSalvo = localStorage.getItem("usuario_time") || "";

        inputPerfilNome.value = nomeSalvo;
        inputPerfilEmail.value = emailSalvo;
        inputPerfilTime.value = timeSalvo;
    }

    if (btnAtualizarPerfil) {
        btnAtualizarPerfil.addEventListener("click", () => {
            if (inputPerfilNome.value.trim() === "" || inputPerfilEmail.value.trim() === "") {
                alert("Os campos de Nome e E-mail não podem ficar vazios.");
                return;
            }

            localStorage.setItem("usuario_nome", inputPerfilNome.value);
            localStorage.setItem("usuario_email", inputPerfilEmail.value);
            localStorage.setItem("usuario_time", inputPerfilTime.value);
            
            alert("Perfil de torcedor atualizado com sucesso!");
        });
    }
});
