let nameInput = document.querySelector('.name-input');
let greetButton = document.querySelector('.greet');
let nextButton = document.querySelector('.next');
let slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function salvarItem(idConteudo) {
    let salvos = JSON.parse(localStorage.getItem('futhis_salvos')) || [];
    if (!salvos.includes(idConteudo)) {
        salvos.push(idConteudo);
        localStorage.setItem('futhis_salvos', JSON.stringify(salvos));
        alert('Adicionado aos seus itens salvos!');
    }
}

// Chame no topo de páginas que exigem login: exigirLogin();
function exigirLogin() {
    if (!localStorage.getItem('futhis_sessao')) window.location.href = 'login.html';
}

document.addEventListener("DOMContentLoaded", () => {
    const inputPerfilNome = document.getElementById("perfil-nome");
    const inputPerfilEmail = document.getElementById("perfil-email");
    const inputPerfilTime = document.getElementById("perfil-time");
    const btnAtualizarPerfil = document.getElementById("btn-atualizar-perfil");

    if (inputPerfilNome && inputPerfilEmail) {
        const nomeSalvo = localStorage.getItem("usuario_nome") || "Nome do Torcedor";
        const emailSalvo = localStorage.getItem("usuario_email") || "seuemail@futhis.com";
        const timeSalvo = localStorage.getItem("usuario_time") || "";

        inputPerfilNome.value = nomeSalvo;
        inputPerfilEmail.value = emailSalvo;
        if (inputPerfilTime) inputPerfilTime.value = timeSalvo;
    }

    if (btnAtualizarPerfil) {
        btnAtualizarPerfil.addEventListener("click", () => {
            if (inputPerfilNome.value.trim() === "" || inputPerfilEmail.value.trim() === "") {
                alert("Os campos de Nome e E-mail não podem ficar vazios.");
                return;
            }

            localStorage.setItem("usuario_nome", inputPerfilNome.value);
            localStorage.setItem("usuario_email", inputPerfilEmail.value);
            localStorage.setItem("usuario_time", inputPerfilTime ? inputPerfilTime.value : "");

            if (window.FutHisAuth) {
                FutHisAuth.salvarPerfilUsuario(inputPerfilNome.value, inputPerfilEmail.value, inputPerfilTime ? inputPerfilTime.value : "");
            }
            alert("Perfil de torcedor atualizado com sucesso!");
        });
    }

    // Os gráficos só rodam se a biblioteca Chart.js estiver carregada na página
    if (typeof Chart === 'undefined') return;

    const ctxGols = document.getElementById('graficoGols');
    if (ctxGols) {
        new Chart(ctxGols, {
            type: 'bar',
            data: {
                labels: ['Botafogo', 'Palmeiras', 'Flamengo', 'Fortaleza', 'São Paulo', 'Cruzeiro'],
                datasets: [{
                    label: 'Gols Marcados',
                    data: [32, 35, 40, 28, 25, 22], // TROQUE pelos valores reais
                    backgroundColor: '#D4AF37',
                    borderColor: '#FFFFFF',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#FFFFFF' } }
                },
                scales: {
                    x: { ticks: { color: '#A0A0AB' } },
                    y: { ticks: { color: '#A0A0AB' }, beginAtZero: true }
                }
            }
        });
    }

    const ctxPontos = document.getElementById('graficoPontos');
    if (ctxPontos) {
        new Chart(ctxPontos, {
            type: 'line',
            data: {
                labels: ['Rod 26', 'Rod 27', 'Rod 28', 'Rod 29', 'Rod 30'],
                datasets: [{
                    label: 'Evolução Líder',
                    data: [48, 51, 54, 57, 60], // TROQUE pelos valores reais
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#FFFFFF' } }
                },
                scales: {
                    x: { ticks: { color: '#A0A0AB' } },
                    y: { ticks: { color: '#A0A0AB' } }
                }
            }
        });
    }

    const ctxDefesas = document.getElementById('graficoDefesas');
    if (ctxDefesas) {
        new Chart(ctxDefesas, {
            type: 'pie',
            data: {
                labels: ['Difíceis', 'Pênaltis', 'Normais'],
                datasets: [{
                    data: [35, 10, 55], // TROQUE pelos valores reais
                    backgroundColor: ['#D4AF37', '#27272A', '#A0A0AB'],
                    borderColor: '#16161D',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#FFFFFF' } }
                }
            }
        });
    }
});


// ==================== CARTAS DOS GOLEIROS (modal da Wikipédia) ====================
(function () {
  const _modal = document.getElementById('wikiOverlay');
  if (!_modal) return;

const overlay = document.getElementById('wikiOverlay');
if (!overlay) { /* esta página não tem o modal das cartas */ }

const textoEl = document.getElementById('wikiTexto');
const API = 'https://pt.wikipedia.org/w/api.php';
const SECOES_IGNORADAS = ['Ver também', 'Referências', 'Ligações externas', 'Notas', 'Bibliografia', 'Ligações Externas'];

const paraData = (iso) => new Date(iso + 'T00:00:00');
const formatarData = (iso) => paraData(iso).toLocaleDateString('pt-BR');

function calcularIdade(nascIso, fimIso) {
    const nasc = paraData(nascIso);
    const fim = fimIso ? paraData(fimIso) : new Date();
    const idade = fim.getFullYear() - nasc.getFullYear();
    const antes = fim.getMonth() < nasc.getMonth() ||
        (fim.getMonth() === nasc.getMonth() && fim.getDate() < nasc.getDate());
    return antes ? idade - 1 : idade;
}

async function chamarApi(params) {
    const url = API + '?format=json&origin=*&' + new URLSearchParams(params);
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error('Falha na requisição');
    return resposta.json();
}

async function pegarExtrato(titulo) {
    const dados = await chamarApi({
        action: 'query', prop: 'extracts', explaintext: 1, redirects: 1, titles: titulo
    });
    const pagina = Object.values(dados.query.pages)[0];
    if (pagina.missing !== undefined || !pagina.extract) return null;
    return { titulo: pagina.title, extract: pagina.extract };
}

// Tenta o título exato; se não existir, usa a busca da Wikipédia e pega o 1º resultado
async function buscarArtigo(titulo) {
    const direto = await pegarExtrato(titulo);
    if (direto) return direto;
    const busca = await chamarApi({
        action: 'query', list: 'search', srlimit: 1, srsearch: titulo + ' futebolista goleiro'
    });
    const achado = busca.query.search[0];
    if (!achado) throw new Error('Artigo não encontrado');
    const resultado = await pegarExtrato(achado.title);
    if (!resultado) throw new Error('Artigo não encontrado');
    return resultado;
}

// Converte "== Seção ==" do texto puro em títulos e parágrafos
function renderizarArtigo(texto) {
    textoEl.textContent = '';
    let ignorando = false;
    texto.split('\n').forEach(linha => {
        const l = linha.trim();
        if (!l) return;
        const m = l.match(/^(={2,})\s*(.+?)\s*=+$/);
        if (m) {
            ignorando = SECOES_IGNORADAS.includes(m[2]);
            if (ignorando) return;
            const h = document.createElement(m[1].length === 2 ? 'h3' : 'h4');
            h.textContent = m[2];
            textoEl.appendChild(h);
            return;
        }
        if (ignorando) return;
        const p = document.createElement('p');
        p.textContent = l;
        textoEl.appendChild(p);
    });
}

function criarChip(rotulo, ano, detalhe) {
    const div = document.createElement('div');
    div.className = 'wiki-chip';
    const small = document.createElement('small'); small.textContent = rotulo;
    const strong = document.createElement('strong'); strong.textContent = ano;
    const span = document.createElement('span'); span.textContent = detalhe;
    div.append(small, strong, span);
    return div;
}

function montarDatas({ nasc, morte }) {
    const box = document.getElementById('wikiDatas');
    box.textContent = '';
    box.appendChild(criarChip('Nascimento', paraData(nasc).getFullYear(), formatarData(nasc)));
    if (morte) box.appendChild(criarChip('Morte', paraData(morte).getFullYear(), formatarData(morte)));
    const idade = calcularIdade(nasc, morte);
    box.appendChild(criarChip(morte ? 'Idade ao falecer' : 'Idade atual', idade, 'anos'));
}

async function abrirCarta(card) {
    const { wiki } = card.dataset;
    const nome = card.querySelector('.fut-name').textContent;

    document.getElementById('wikiTitulo').textContent = nome;
    const foto = document.getElementById('wikiFoto');
    foto.src = card.querySelector('.card-fut-foto img').src;
    foto.alt = nome;
    montarDatas(card.dataset);
    document.getElementById('wikiLink').href =
        'https://pt.wikipedia.org/wiki/' + encodeURIComponent(wiki.replace(/ /g, '_'));

    textoEl.textContent = 'Carregando...';
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';

    try {
        const artigo = await buscarArtigo(wiki);
        renderizarArtigo(artigo.extract);
        document.getElementById('wikiLink').href =
            'https://pt.wikipedia.org/wiki/' + encodeURIComponent(artigo.titulo.replace(/ /g, '_'));
    } catch (erro) {
        textoEl.textContent = 'Não foi possível carregar o texto. Abra o artigo pelo link abaixo.';
    }
}

function fecharModal() {
    overlay.hidden = true;
    document.body.style.overflow = '';
}

document.querySelectorAll('.card-fut-container').forEach(card => {
    if (!card.dataset.wiki || !card.dataset.nasc) return; // carta sem data-wiki/data-nasc
    // Anos de nascimento e morte sempre visíveis na carta
    const { nasc, morte } = card.dataset;
    const anos = document.createElement('p');
    anos.className = 'card-anos';
    const anoNasc = paraData(nasc).getFullYear();
    anos.textContent = morte ? `${anoNasc} – ${paraData(morte).getFullYear()}` : `${anoNasc} – presente`;
    card.querySelector('.fut-name').after(anos);

    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => abrirCarta(card));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') abrirCarta(card); });
});

document.getElementById('wikiFechar').addEventListener('click', fecharModal);
overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });

})();
