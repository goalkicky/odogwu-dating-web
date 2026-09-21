const card = document.getElementById("profileCard");
const toast = document.getElementById("toast");
const filterModal = document.getElementById("filterModal");

function showToast(text){
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(window.__toast);
  window.__toast = setTimeout(()=>toast.classList.remove("show"), 1800);
}

document.getElementById("likeBtn").addEventListener("click", ()=>{
  showToast("You liked Amaka ❤️");
});

document.getElementById("messageBtn").addEventListener("click", ()=>{
  showToast("Opening your conversation with Amaka…");
});

document.getElementById("passBtn").addEventListener("click", ()=>{
  card.innerHTML = `
    <div class="empty">
      <h2>No more profiles nearby</h2>
      <p>Try changing your discovery filters to see more people.</p>
      <button id="resetProfile">Show Amaka again</button>
    </div>`;
  document.getElementById("resetProfile").addEventListener("click", ()=>location.reload());
});

document.getElementById("filterBtn").addEventListener("click", ()=>{
  filterModal.classList.add("open");
});
document.getElementById("closeModal").addEventListener("click", ()=>{
  filterModal.classList.remove("open");
});
filterModal.addEventListener("click", e=>{
  if(e.target === filterModal) filterModal.classList.remove("open");
});

const distance = document.getElementById("distance");
const distanceValue = document.getElementById("distanceValue");
distance.addEventListener("input", ()=>{
  distanceValue.textContent = distance.value + " km";
});
document.getElementById("applyFilters").addEventListener("click", ()=>{
  filterModal.classList.remove("open");
  showToast(`Filters applied — within ${distance.value} km`);
});
