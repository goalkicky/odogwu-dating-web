const grid=document.getElementById('photoGrid');
const photoInput=document.getElementById('photoInput');
const videoInput=document.getElementById('videoInput');
const toast=document.getElementById('toast');

document.querySelectorAll('.remove').forEach(btn=>btn.addEventListener('click',e=>{
  e.stopPropagation(); const item=e.currentTarget.closest('.photo-item'); item.remove(); updatePhotoCount();
}));
function updatePhotoCount(){
  const n=grid.querySelectorAll('.photo-item').length;
  const count=document.querySelector('.photos-card .section-head strong');
  if(count) count.textContent=`${n}/6`;
}
document.getElementById('addPhoto').addEventListener('click',()=>photoInput.click());
document.getElementById('addVideo').addEventListener('click',()=>videoInput.click());
photoInput.addEventListener('change',e=>{
  [...e.target.files].slice(0,6-grid.querySelectorAll('.photo-item').length).forEach(file=>{
    const url=URL.createObjectURL(file); const item=document.createElement('div'); item.className='photo-item';
    item.innerHTML=`<img src="${url}" alt="Added profile photo"><button class="remove" aria-label="Remove photo">×</button>`;
    item.querySelector('.remove').onclick=()=>{item.remove();updatePhotoCount()}; grid.insertBefore(item,document.getElementById('addPhoto')); 
  }); updatePhotoCount(); e.target.value='';
});
videoInput.addEventListener('change',e=>{if(e.target.files[0]) showToast('Video selected');e.target.value='';});

document.querySelectorAll('.accordion-title').forEach(head=>head.addEventListener('click',()=>{
  const target=document.getElementById(head.dataset.target); if(!target)return;
  const hidden=getComputedStyle(target).display==='none'; target.style.display=hidden?'':'none';
  const arrow=head.querySelector('strong span'); if(arrow && (arrow.textContent==='⌃'||arrow.textContent==='⌄')) arrow.textContent=hidden?'⌃':'⌄';
}));

document.getElementById('saveBtn').addEventListener('click',()=>showToast('Profile saved successfully'));
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(window._toast);window._toast=setTimeout(()=>toast.classList.remove('show'),2200)}
