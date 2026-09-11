const modal=document.getElementById('modal');
const modalImg=document.getElementById('modal-image');
const modalTitle=document.getElementById('modal-title');

document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('click',()=>{
    modalImg.src=card.dataset.image;
    modalImg.alt=card.dataset.title;
    modalTitle.textContent=card.dataset.title;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  });
});
function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
document.querySelector('.close').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
