const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const pageTitle = document.title;
let lastFocusedElement = null;
const cards = Array.from(document.querySelectorAll('.card'));

function infographicSlug(title, card = null) {
  // Identificadores exclusivos para os quatro cards publicados com o mesmo título.
  // Todos os quatro cards de Referências usam rotas exclusivas.
  // A rota antiga /infografico/referencias continua aceita em findCardBySlug para compatibilidade.
  const image = card?.dataset.image?.split('?')[0].split('/').pop() || '';
  const referenceRoutes = {
    'Referências.png': 'referencias-definicao-e-orientacoes-gerais',
    'Referências0.png': 'referencias-livro-no-todo-e-partes-de-monografias',
    'Referências1.png': 'referencias-trabalhos-academicos',
    'Referências2.png': 'referencias-eventos'
  };

  if (referenceRoutes[image]) return referenceRoutes[image];

  return (title || 'infografico')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'infografico';
}

function findCardBySlug(slug) {
  return cards.find(card => infographicSlug(card.dataset.title, card) === slug) || (slug === 'referencias' ? cards.find(card => card.dataset.image?.split('?')[0].split('/').pop() === 'Referências.png') : null);
}

function showModal(card) {
  if (!modal.classList.contains('show')) {
    lastFocusedElement = document.activeElement;
  }
  const title = card.dataset.title || 'Infográfico';
  modalImg.src = card.dataset.image;
  modalImg.alt = title;
  modalTitle.textContent = title;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.title = title + ' | HELPABNTCCMN';
  document.querySelector('.close').focus();
}

function hideModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.title = pageTitle;
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

function openInfographic(card, trackNavigation = true) {
  const slug = infographicSlug(card.dataset.title, card);
  showModal(card);

  if (trackNavigation) {
    const route = '/infografico/' + slug;
    if (window.location.pathname !== route) {
      // O Cloudflare Web Analytics acompanha mudanças de rota via History API.
      history.pushState({ helpabntccmnInfografico: slug }, '', route);
    }
  }
}

function closeModal() {
  const state = history.state;

  if (state && state.helpabntccmnInfografico) {
    // Ao abrir um link direto, voltar à página inicial em vez de sair do portal.
    if (state.helpabntccmnDirect) {
      window.location.assign('/');
    } else {
      history.back();
    }
    return;
  }

  hideModal();
}

cards.forEach(card => {
  card.addEventListener('click', () => openInfographic(card));
});

document.querySelector('.close').addEventListener('click', closeModal);
modal.addEventListener('click', event => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', event => {
  if (!modal.classList.contains('show')) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }

  // Mantém o foco dentro da janela ampliada enquanto ela estiver aberta.
  if (event.key === 'Tab') {
    // O botão de fechar é o único controle interativo da janela.
    // Mantém o foco nele, impedindo que a navegação escape para o fundo.
    event.preventDefault();
    modal.querySelector('.close').focus();
  }
});

// Mantém o modal sincronizado com os botões Voltar e Avançar do navegador.
window.addEventListener('popstate', () => {
  const slug = history.state && history.state.helpabntccmnInfografico;

  if (slug) {
    const card = findCardBySlug(slug);
    if (card) {
      showModal(card);
      return;
    }
  }

  hideModal();
});

// Permite abrir diretamente ou compartilhar o endereço de um infográfico.
const routeMatch = window.location.pathname.match(/^\/infografico\/([^/]+)\/?$/);
if (routeMatch) {
  const slug = decodeURIComponent(routeMatch[1]);
  const card = findCardBySlug(slug);

  if (card) {
    history.replaceState(
      { helpabntccmnInfografico: slug, helpabntccmnDirect: true },
      '',
      window.location.pathname
    );
    showModal(card);
  } else {
    window.history.replaceState({}, '', '/');
  }
}
