const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const pageTitle = document.title;
const cards = Array.from(document.querySelectorAll('.card'));

function infographicSlug(title) {
  return (title || 'infografico')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'infografico';
}

function findCardBySlug(slug) {
  return cards.find(card => infographicSlug(card.dataset.title) === slug);
}

function showModal(card) {
  const title = card.dataset.title || 'Infográfico';
  modalImg.src = card.dataset.image;
  modalImg.alt = title;
  modalTitle.textContent = title;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.title = title + ' | HELPABNTCCMN';
}

function hideModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.title = pageTitle;
}

function openInfographic(card, trackNavigation = true) {
  const slug = infographicSlug(card.dataset.title);
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
  if (event.key === 'Escape' && modal.classList.contains('show')) {
    closeModal();
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
