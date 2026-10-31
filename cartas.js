const BANCO_BIOGRAFIAS = {
    "Lev Yashin": "Lev Ivanovitch Yashin, conhecido mundialmente como o 'Aranha Negra', é amplamente considerado o maior goleiro de toda a história do futebol. Atuando com sua icônica vestimenta totalmente preta, revolucionou completamente a posição ao comandar a organização defensiva, sair da área para interceptar cruzamentos e antecipar jogadas de ataque. Ao longo de sua carreira lendária, defendeu mais de 150 pênaltis e permaneceu mais de 270 jogos sem sofrer gols. Foi o único goleiro na história a conquistar a prestigiada Bola de Ouro da France Football (1963) e recebeu a Ordem de Mérito da FIFA.",
    "Gianluigi Buffon": "Gianluigi Buffon é um dos goleiros mais emblemáticos, consistentes e laureados do futebol moderno contemporâneo. Eternizado como ídolo máximo da Juventus de Turim e da Seleção Italiana de Futebol, conquistou a Copa do Mundo da FIFA em 2006 sofrendo apenas dois gols durante todo o torneio. Buffon é reverenciado internacionalmente por sua longevidade absurda no esporte de alto nível, mantendo reflexos felinos, posicionamento impecável e liderança de vestiário por mais de duas décadas consecutivas no topo do futebol mundial.",
    "Vozinha": "Josimar Dias, popularmente conhecido no cenário esportivo como 'Vozinha', é o goleiro titular absoluto e uma das maiores referências históricas da Seleção de Cabo Verde de Futebol. Com vasta experiência internacional no futebol europeu e africano, Vozinha liderou a sua nação em campanhas históricas e surpreendentes durante as edições da Copa Africana de Nações (CAN), consolidando-se como o atleta com maior número de internacionalizações oficiais por seu país.",
    "Guillermo Ochoa": "Francisco Guillermo Ochoa Magaña, o 'Memo Ochoa', é um goleiro lendário da Seleção Mexicana de Futebol. Tornou-se um fenômeno cultural global devido às suas atuações inacreditáveis e defesas historicamente impossíveis realizadas especificamente durante as Copas do Mundo da FIFA. Ochoa ostenta a marca impressionante de ter sido convocado para cinco edições consecutivas do torneio mundial, transformando-se em uma verdadeira parede intransponível contra as maiores potências do planeta.",
    "René Higuita": "René Higuita, apelidado carinhosamente de 'El Loco', é uma das figuras mais revolucionárias, irreverentes e folclóricas da história do futebol colombiano e mundial. Higuita quebrou todos os paradigmas tradicionais da posição de goleiro ao jogar adiantado como um goleiro-linha, saindo da área para driblar atacantes adversários, cobrar faltas e marcar gols oficiais. Ficou eternizado na história do esporte ao realizar a lendária 'defesa do escorpião' durante um amistoso oficial contra a Inglaterra no antigo estádio de Wembley."
};

(function () {
    const overlay = document.getElementById('wikiOverlay');
    if (!overlay) return;

    const textoEl = document.getElementById('wikiTexto');
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
        if (!box) return;
        box.textContent = '';
        box.appendChild(criarChip('Nascimento', paraData(nasc).getFullYear(), formatarData(nasc)));
        if (morte) box.appendChild(criarChip('Morte', paraData(morte).getFullYear(), formatarData(morte)));
        const idade = calcularIdade(nasc, morte);
        box.appendChild(criarChip(morte ? 'Idade ao falecer' : 'Idade atual', idade, 'anos'));
    }

    function abrirCarta(card) {
        const { wiki } = card.dataset;
        const nome = card.querySelector('.fut-name').textContent;

        document.getElementById('wikiTitulo').textContent = nome;
        const foto = document.getElementById('wikiFoto');
        if (foto) {
            foto.src = card.querySelector('.card-fut-foto img').src;
            foto.alt = nome;
        }
        montarDatas(card.dataset);
        
        const linkEl = document.getElementById('wikiLink');
        if (linkEl) {
            linkEl.href = 'https://wikipedia.org' + encodeURIComponent(wiki.replace(/ /g, '_'));
        }

        overlay.hidden = false;
        document.body.style.overflow = 'hidden';

        // Busca instantânea do texto no banco interno estável
        if (BANCO_BIOGRAFIAS[wiki]) {
            textoEl.textContent = BANCO_BIOGRAFIAS[wiki];
        } else {
            textoEl.textContent = 'Informações biográficas deste atleta estão sendo atualizadas pela administração do Futhis.';
        }
    }

    function fecharModal() {
        overlay.hidden = true;
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.card-fut-container').forEach(card => {
        if (!card.dataset.wiki || !card.dataset.nasc) return;
        const { nasc, morte } = card.dataset;
        
        if (!card.querySelector('.card-anos')) {
            const anos = document.createElement('p');
            anos.className = 'card-anos';
            const anoNasc = paraData(nasc).getFullYear();
            anos.textContent = morte ? `${anoNasc} – ${paraData(morte).getFullYear()}` : `${anoNasc} – presente`;
            card.querySelector('.fut-name').after(anos);
        }

        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.addEventListener('click', () => abrirCarta(card));
        card.addEventListener('keydown', e => { if (e.key === 'Enter') abrirCarta(card); });
    });

    const btnFechar = document.getElementById('wikiFechar');
    if (btnFechar) btnFechar.addEventListener('click', fecharModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) fecharModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') fecharModal(); });
})();
