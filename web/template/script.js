const toast = document.getElementById('toast');

function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toast);
  window.__toast = setTimeout(()=>toast.classList.remove('show'),1800);
}

document.getElementById('upgradeBtn').addEventListener('click',()=>showToast('Premium upgrade selected'));
document.getElementById('profileBtn').addEventListener('click',()=>showToast('Complete your profile'));

document.querySelectorAll('.story-card').forEach(card=>{
  card.addEventListener('click',()=>showToast(`${card.dataset.name}'s story`));
});

document.querySelectorAll('.nav-item,.nav-center').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const tab = btn.dataset.tab || 'Discover';
    document.querySelectorAll('.nav-item').forEach(x=>x.classList.remove('active'));
    if(btn.classList.contains('nav-item')) btn.classList.add('active');
    showToast(`${tab} selected`);
  });
});

document.querySelector('.messages-top').addEventListener('click',()=>showToast('Messages'));
