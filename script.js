// Dados dos produtos com múltiplas imagens
const produtos = {
    produto1: {
        nome: "Camisa Brasil 2026 - Amarela",
        descricao: "Camisa Oficial da Seleção Brasileira 2026 - Versão Amarela. Tecido Dry Cell, escudo bordado, tecnologia de absorção de suor.",
        preco: "R$ 89,99",
        precoAntigo: "R$ 120,00",
        imagens: [
            "imagens/camisa-amarela.jpg",
            "imagens/camisa-amarela-2.jpg",
            "imagens/camisa-amarela-3.jpg",
            "imagens/camisa-amarela-4.jpg"
        ],
        tamanhos: ["M"]
    },
    produto2: {
        nome: "Camisa Brasil 2026 - Azul",
        descricao: "Camisa Oficial da Seleção Brasileira 2026 - Versão Azul. Tecido Dry Cell, escudo bordado, tecnologia de absorção de suor.",
        preco: "R$ 89,99",
        precoAntigo: "R$ 120,00",
        imagens: [
            "imagens/camisa-azul.jpg",
            "imagens/camisa-azul-2.jpg",
            "imagens/camisa-azul-3.jpg",
            "imagens/camisa-azul-4.jpg",
            "imagens/camisa-azul-5.jpg"
        ],
        tamanhos: ["N/D"]
    }
};

// Variáveis
let imagemAtual = 0;
let imagensProduto = [];
let intervaloAutomatico;
let touchStartX = 0;
let touchEndX = 0;
let intervalosVitrine = {};
let imagensAtuaisVitrine = {};
let tipoEntrega = 'entrega';
let tamanhoSelecionado = '';
const NUMERO_WHATSAPP = "5598981865930";

// ========== CARROSSEL VITRINE (MAIS RÁPIDO) ==========
function iniciarCarrosselVitrine(produtoId) {
    const produto = produtos[produtoId];
    const card = document.querySelector(`[data-produto="${produtoId}"]`);
    if (!card) return;
    const img = card.querySelector('.vitrine-imagem');
    if (!img) return;
    imagensAtuaisVitrine[produtoId] = 0;
    if (intervalosVitrine[produtoId]) clearInterval(intervalosVitrine[produtoId]);
    produto.imagens.forEach(src => { const p = new Image(); p.src = src; });
    intervalosVitrine[produtoId] = setInterval(() => {
        img.style.opacity = '0'; img.style.transform = 'scale(1.03)';
        setTimeout(() => {
            imagensAtuaisVitrine[produtoId]++;
            if (imagensAtuaisVitrine[produtoId] >= produto.imagens.length) imagensAtuaisVitrine[produtoId] = 0;
            img.src = produto.imagens[imagensAtuaisVitrine[produtoId]];
            img.style.opacity = '1'; img.style.transform = 'scale(1)';
        }, 300);
    }, 2500);
}

document.addEventListener('DOMContentLoaded', function() {
    iniciarCarrosselVitrine('produto1');
    iniciarCarrosselVitrine('produto2');
    // Forçar indicadores
    const style = document.createElement('style');
    style.textContent = `.carrossel-indicadores{display:flex!important;visibility:visible!important;opacity:1!important;z-index:9999!important;pointer-events:auto!important;position:absolute!important;bottom:15px!important;left:50%!important;transform:translateX(-50%)!important;background:rgba(0,0,0,0.5)!important;padding:5px 10px!important;border-radius:20px!important;}.indicador{display:inline-block!important;width:12px!important;height:12px!important;min-width:12px!important;min-height:12px!important;border-radius:50%!important;background:rgba(255,255,255,0.5)!important;border:2px solid rgba(255,255,255,0.8)!important;cursor:pointer!important;padding:0!important;margin:0!important;opacity:1!important;visibility:visible!important;-webkit-appearance:none!important;}.indicador.ativo{background:#fff!important;border-color:#fff!important;transform:scale(1.4)!important;box-shadow:0 0 10px rgba(255,255,255,0.8)!important;}`;
    document.head.appendChild(style);
});

// ========== MODAL ==========
function mostrarDetalhes(produtoId) {
    const produto = produtos[produtoId];
    const modal = document.getElementById('modal');
    if (!produto) return;
    
    document.getElementById('modal-titulo').textContent = produto.nome;
    document.getElementById('modal-descricao').textContent = produto.descricao;
    document.getElementById('modal-preco').textContent = produto.preco;
    document.getElementById('modal-preco-antigo').textContent = produto.precoAntigo;
    
    imagensProduto = produto.imagens;
    imagemAtual = 0;
    tipoEntrega = 'entrega';
    tamanhoSelecionado = '';
    
    // Reset entrega
    document.querySelectorAll('.entrega-btn').forEach(b => b.classList.remove('selecionado'));
    const btnE = document.querySelector('.entrega-btn');
    if (btnE) btnE.classList.add('selecionado');
    
    carregarCarrossel();
    iniciarTrocaAutomatica();
    configurarTouch();
    
    const tg = document.querySelector('.tamanhos-grid');
    tg.innerHTML = '';
    produto.tamanhos.forEach(t => {
        const b = document.createElement('button');
        b.className = 'tamanho-btn'; b.textContent = t;
        b.onclick = (e) => selecionarTamanho(e, produto);
        tg.appendChild(b);
    });
    
    atualizarWhatsApp(produto);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function carregarCarrossel() {
    const ci = document.getElementById('carrossel-imagens');
    const co = document.getElementById('carrossel-indicadores');
    ci.innerHTML = ''; co.innerHTML = '';
    imagensProduto.forEach((img, i) => {
        const im = document.createElement('img');
        im.src = img; im.alt = 'Foto ' + (i+1);
        im.style.transition = 'opacity 0.5s ease-in-out';
        ci.appendChild(im);
        const ind = document.createElement('button');
        ind.className = 'indicador';
        if (i === 0) ind.classList.add('ativo');
        ind.onclick = () => irParaImagem(i);
        co.appendChild(ind);
    });
    atualizarPosicaoCarrossel();
}

function atualizarPosicaoCarrossel() {
    document.getElementById('carrossel-imagens').style.transform = `translateX(-${imagemAtual * 100}%)`;
    document.querySelectorAll('.indicador').forEach((ind, i) => ind.classList.toggle('ativo', i === imagemAtual));
}

function mudarImagem(d) {
    pararTrocaAutomatica();
    imagemAtual += d;
    if (imagemAtual >= imagensProduto.length) imagemAtual = 0;
    if (imagemAtual < 0) imagemAtual = imagensProduto.length - 1;
    atualizarPosicaoCarrossel();
    iniciarTrocaAutomatica();
}

function irParaImagem(i) { pararTrocaAutomatica(); imagemAtual = i; atualizarPosicaoCarrossel(); iniciarTrocaAutomatica(); }

// Troca automática mais rápida (2.5 segundos)
function iniciarTrocaAutomatica() { pararTrocaAutomatica(); intervaloAutomatico = setInterval(() => mudarImagem(1), 2500); }
function pararTrocaAutomatica() { if (intervaloAutomatico) clearInterval(intervaloAutomatico); }

function configurarTouch() {
    const c = document.querySelector('.carrossel-container');
    if (!c) return;
    c.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; pararTrocaAutomatica(); }, { passive: true });
    c.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].clientX;
        if (Math.abs(touchStartX - touchEndX) > 50) {
            touchStartX > touchEndX ? mudarImagem(1) : mudarImagem(-1);
        }
        iniciarTrocaAutomatica();
    });
}

// ========== SELEÇÕES ==========
function selecionarTamanho(event, produto) {
    document.querySelectorAll('.tamanho-btn').forEach(b => b.classList.remove('selecionado'));
    event.target.classList.add('selecionado');
    tamanhoSelecionado = event.target.textContent;
    atualizarWhatsApp(produto);
}

function selecionarEntrega(tipo, botao) {
    tipoEntrega = tipo;
    document.querySelectorAll('.entrega-btn').forEach(b => b.classList.remove('selecionado'));
    botao.classList.add('selecionado');
    const nome = document.getElementById('modal-titulo').textContent;
    const preco = document.getElementById('modal-preco').textContent;
    atualizarWhatsApp({ nome, preco });
}

// ========== WHATSAPP ==========
function atualizarWhatsApp(produto) {
    let msg = `Olá! Tenho interesse no produto: *${produto.nome}*`;
    if (tamanhoSelecionado) msg += ` no tamanho *${tamanhoSelecionado}*`;
    msg += ` - ${produto.preco}`;
    msg += `\nForma de recebimento: *${tipoEntrega === 'entrega' ? '🚚 Entrega' : '📍 Retirada na loja'}*`;
    document.getElementById('whatsapp-link').href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

// ========== FECHAR ==========
function fecharModal() {
    document.getElementById('modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    pararTrocaAutomatica();
}
window.onclick = function(e) { if (e.target == document.getElementById('modal')) fecharModal(); }
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') fecharModal(); });
