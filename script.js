const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalDescriptionText = document.getElementById('modal-description-text');
const pageTitle = document.title;
let lastFocusedElement = null;
const cards = Array.from(document.querySelectorAll('.card'));

function legacyInfographicSlug(title, card = null) {
  // Mantém os endereços descritivos antigos para compatibilidade com links já divulgados.
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
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'infografico';
}

function infographicSlug(title, card = null) {
  // Identificador estatístico permanente: posição do card na galeria, de 01 a 99.
  const index = cards.indexOf(card);
  if (index >= 0 && index < 99) return String(index + 1).padStart(2, '0');
  return legacyInfographicSlug(title, card);
}

function findCardBySlug(slug) {
  // Novas rotas numéricas: /infografico/01 até /infografico/99.
  if (/^\\d{2}$/.test(slug)) {
    const index = Number(slug) - 1;
    return index >= 0 && index < cards.length ? cards[index] : null;
  }

  // Rotas descritivas antigas continuam funcionando.
  return cards.find(card => legacyInfographicSlug(card.dataset.title, card) === slug)
    || (slug === 'referencias'
      ? cards.find(card => card.dataset.image?.split('?')[0].split('/').pop() === 'Referências.png')
      : null);
}
function showModal(card) {
  if (!modal.classList.contains('show')) {
    lastFocusedElement = document.activeElement;
  }
  const title = card.dataset.title || 'Infográfico';
  modalImg.src = card.dataset.image;
  modalImg.alt = card.querySelector('.thumb img')?.alt || title;
  modalTitle.textContent = title;
  const accessibleDescription = card.dataset.accessibleDescription || '';
  modalDescription.hidden = !accessibleDescription;
  modalDescriptionText.textContent = accessibleDescription;
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
