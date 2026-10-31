// ===== FutHis: cadastro, login e recuperação de senha =====
// ATENÇÃO: tudo fica no localStorage do navegador (serve para trabalho de faculdade).
// Em um site real, senha e envio de código por e-mail precisam de um servidor.

const CHAVE_USUARIOS = 'futhis_usuarios';
const CHAVE_SESSAO = 'futhis_sessao';
const CHAVE_CODIGOS = 'futhis_codigos';
const CHAVE_RESET = 'futhis_reset_email';
const PAGINA_APOS_LOGIN = 'index.html';
const PAGINA_LOGIN = 'login.html';
const MINUTOS_VALIDADE_CODIGO = 10;
const MAX_TENTATIVAS_CODIGO = 5;

const lerJSON = (chave, padrao) => {
    try { return JSON.parse(localStorage.getItem(chave)) || padrao; }
    catch { return padrao; }
};
const gravarJSON = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));
const normalizarEmail = (email) => email.trim().toLowerCase();

// ---------- Senha: nunca guardamos o texto puro (quando o navegador permite) ----------
async function hashSenha(senha) {
    if (window.crypto && crypto.subtle) {
        const bytes = new TextEncoder().encode(senha);
        const resumo = await crypto.subtle.digest('SHA-256', bytes);
        const hex = [...new Uint8Array(resumo)].map(b => b.toString(16).padStart(2, '0')).join('');
        return 'sha256:' + hex;
    }
    return 'txt:' + senha; // plano B se o navegador não tiver crypto.subtle
}

async function conferirSenha(senhaDigitada, guardada) {
    if (guardada.startsWith('txt:')) return guardada === 'txt:' + senhaDigitada;
    return guardada === await hashSenha(senhaDigitada);
}

// ---------- Mensagens na tela ----------
function mostrarMsg(idElemento, texto, sucesso = false) {
    const el = document.getElementById(idElemento);
    if (!el) { alert(texto); return; }
    el.textContent = texto;
    el.style.color = sucesso ? '#22C55E' : '#EF4444';
    el.hidden = false;
}

// ---------- Sessão ----------
function iniciarSessao(email) {
    const u = lerJSON(CHAVE_USUARIOS, {})[email];
    localStorage.setItem(CHAVE_SESSAO, email);
    // Mantém compatível com a página de perfil que já existe
    localStorage.setItem('usuario_nome', u.nome);
    localStorage.setItem('usuario_email', email);
    localStorage.setItem('usuario_time', u.time || '');
}

function sair() {
    ['futhis_sessao', 'usuario_nome', 'usuario_email', 'usuario_time']
        .forEach(c => localStorage.removeItem(c));
    window.location.href = PAGINA_LOGIN;
}

function salvarPerfilUsuario(nome, email, time) {
    const atual = localStorage.getItem(CHAVE_SESSAO);
    const usuarios = lerJSON(CHAVE_USUARIOS, {});
    if (!atual || !usuarios[atual]) return;
    usuarios[atual].nome = nome;
    usuarios[atual].time = time;
    gravarJSON(CHAVE_USUARIOS, usuarios);
}

// ---------- Cadastro ----------
async function tratarCadastro(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const email = normalizarEmail(document.getElementById('email').value);
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmar-senha');

    if (!nome || !email) return mostrarMsg('cadastro-erro', 'Preencha nome e e-mail.');
    if (senha.length < 6) return mostrarMsg('cadastro-erro', 'A senha precisa ter pelo menos 6 caracteres.');
    if (confirmar && confirmar.value !== senha) return mostrarMsg('cadastro-erro', 'As senhas não são iguais.');

    const usuarios = lerJSON(CHAVE_USUARIOS, {});
    if (usuarios[email]) return mostrarMsg('cadastro-erro', 'Este e-mail já está cadastrado. Faça login.');

    usuarios[email] = { nome, senha: await hashSenha(senha), time: '' };
    gravarJSON(CHAVE_USUARIOS, usuarios);
    iniciarSessao(email);
    window.location.href = PAGINA_APOS_LOGIN;
}

// ---------- Login ----------
async function tratarLogin(e) {
    e.preventDefault();
    const email = normalizarEmail(document.getElementById('login-email').value);
    const senha = document.getElementById('login-senha').value;

    const usuario = lerJSON(CHAVE_USUARIOS, {})[email];
    const ok = usuario && await conferirSenha(senha, usuario.senha);
    if (!ok) return mostrarMsg('login-erro', 'E-mail ou senha incorretos.'); // mesma msg para os dois casos

    iniciarSessao(email);
    window.location.href = PAGINA_APOS_LOGIN;
}

// ---------- Esqueci a senha: etapa 1 (pedir código) ----------
function tratarPedidoCodigo(e) {
    e.preventDefault();
    const email = normalizarEmail(document.getElementById('esqueci-email').value);
    const usuarios = lerJSON(CHAVE_USUARIOS, {});

    if (usuarios[email]) {
        const codigo = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, '0');
        const codigos = lerJSON(CHAVE_CODIGOS, {});
        codigos[email] = { codigo, expira: Date.now() + MINUTOS_VALIDADE_CODIGO * 60000, tentativas: 0 };
        gravarJSON(CHAVE_CODIGOS, codigos);
        // SIMULAÇÃO do e-mail: sem servidor não dá para enviar de verdade
        alert(`(Simulação de e-mail) Seu código de confirmação é: ${codigo}\nVálido por ${MINUTOS_VALIDADE_CODIGO} minutos.`);
    }
    sessionStorage.setItem(CHAVE_RESET, email);
    mostrarMsg('esqueci-msg', 'Se o e-mail estiver cadastrado, um código foi enviado.', true);

    const etapaEmail = document.getElementById('etapa-email');
    const etapaCodigo = document.getElementById('etapa-codigo');
    if (etapaEmail) etapaEmail.hidden = true;
    if (etapaCodigo) etapaCodigo.hidden = false;
}

// ---------- Esqueci a senha: etapa 2 (código + nova senha) ----------
async function tratarRedefinicao(e) {
    e.preventDefault();
    const email = sessionStorage.getItem(CHAVE_RESET);
    const codigoDigitado = document.getElementById('codigo').value.trim();
    const nova = document.getElementById('nova-senha').value;
    const confirmar = document.getElementById('confirmar-nova-senha');

    if (!email) return mostrarMsg('redefinir-msg', 'Comece informando o seu e-mail.');
    if (nova.length < 6) return mostrarMsg('redefinir-msg', 'A nova senha precisa ter pelo menos 6 caracteres.');
    if (confirmar && confirmar.value !== nova) return mostrarMsg('redefinir-msg', 'As senhas não são iguais.');

    const codigos = lerJSON(CHAVE_CODIGOS, {});
    const registro = codigos[email];
    if (!registro) return mostrarMsg('redefinir-msg', 'Código inválido. Peça um novo.');
    if (Date.now() > registro.expira) {
        delete codigos[email]; gravarJSON(CHAVE_CODIGOS, codigos);
        return mostrarMsg('redefinir-msg', 'Código expirado. Peça um novo.');
    }
    if (codigoDigitado !== registro.codigo) {
        registro.tentativas++;
        if (registro.tentativas >= MAX_TENTATIVAS_CODIGO) delete codigos[email];
        gravarJSON(CHAVE_CODIGOS, codigos);
        return mostrarMsg('redefinir-msg', 'Código incorreto.');
    }

    const usuarios = lerJSON(CHAVE_USUARIOS, {});
    usuarios[email].senha = await hashSenha(nova);
    gravarJSON(CHAVE_USUARIOS, usuarios);
    delete codigos[email]; gravarJSON(CHAVE_CODIGOS, codigos);
    sessionStorage.removeItem(CHAVE_RESET);

    mostrarMsg('redefinir-msg', 'Senha alterada! Redirecionando para o login...', true);
    setTimeout(() => { window.location.href = PAGINA_LOGIN; }, 1500);
}

// ---------- Liga tudo nos formulários que existirem na página ----------
document.addEventListener('DOMContentLoaded', () => {
    const ligar = (id, fn) => { const f = document.getElementById(id); if (f) f.addEventListener('submit', fn); };
    ligar('form-cadastro', tratarCadastro);
    ligar('form-login', tratarLogin);
    ligar('form-esqueci', tratarPedidoCodigo);
    ligar('form-redefinir', tratarRedefinicao);

    const btnSair = document.getElementById('btn-sair');
    if (btnSair) btnSair.addEventListener('click', sair);
});

window.FutHisAuth = { sair, salvarPerfilUsuario };
    window.location.href = "index.html";
}
