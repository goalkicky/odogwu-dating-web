const profiles = [
  {name:"Chioma",age:27,city:"Lagos",active:"2m ago",photo:"chioma.jpg"},
  {name:"Amaka",age:25,city:"Abuja",active:"5m ago",photo:"amaka.jpg"},
  {name:"Kelechi",age:29,city:"Enugu",active:"7m ago",photo:"kelechi.jpg"},
  {name:"Tobi",age:31,city:"Lagos",active:"8m ago",photo:"tobi.jpg"},
  {name:"Nhenna",age:26,city:"Port Harcourt",active:"10m ago",photo:"nhenna.jpg"},
  {name:"Chibuike",age:30,city:"Benin City",active:"11m ago",photo:"chibuike.jpg"},
  {name:"Adaeze",age:28,city:"Ibadan",active:"12m ago",photo:"adaeze.jpg"},
  {name:"Ijeoma",age:27,city:"Lagos",active:"13m ago",photo:"ijeoma.jpg"},
  {name:"Ifunanya",age:24,city:"Owerri",active:"14m ago",photo:"ifunanya.jpg"},
  {name:"Uche",age:28,city:"Lagos",active:"16m ago",photo:"chioma.jpg"},
  {name:"Chinonso",age:26,city:"Abuja",active:"18m ago",photo:"amaka.jpg"},
  {name:"Emeka",age:32,city:"Enugu",active:"21m ago",photo:"chibuike.jpg"}
];

const grid = document.getElementById("profileGrid");
const search = document.getElementById("searchInput");
const countText = document.getElementById("countText");
const loadMore = document.getElementById("loadMore");
let visible = 9;

function cardTemplate(p, index){
  return `
    <article class="profile-card" data-index="${index}" data-name="${p.name.toLowerCase()}" data-city="${p.city.toLowerCase()}">
      <img class="profile-photo" src="assets/${p.photo}" alt="${p.name}'s profile photo" />
      <span class="online-dot"></span>
      <div class="profile-info">
        <div class="name-line">${p.name}, ${p.age}<span class="verified">✓</span></div>
        <div class="location">
          <svg viewBox="0 0 24 24"><path d="M12 21s7-6.3 7-12A7 7 0 1 0 5 9c0 5.7 7 12 7 12Z"></path><circle cx="12" cy="9" r="2.2" fill="none" stroke-width="2"></circle></svg>
          ${p.city}, Nigeria
        </div>
        <div class="active"><span class="mini-dot"></span>Active ${p.active}</div>
      </div>
      <div class="card-actions">
        <button class="action pass" title="Pass" onclick="passProfile(this)">
          <span class="action-circle">×</span><small>Pass</small>
        </button>
        <button class="action super" title="Super Like" onclick="toggleAction(this)">
          <span class="action-circle">★</span><small>Super Like</small>
        </button>
        <button class="action like" title="Like" onclick="toggleAction(this)">
          <span class="action-circle">♥</span><small>Like</small>
        </button>
        <button class="action message" title="Message" onclick="messageProfile('${p.name}')">
          <span class="action-circle">●</span><small>Message</small>
        </button>
      </div>
    </article>
  `;
}

function render(){
  const term = search.value.trim().toLowerCase();
  const filtered = profiles.filter(p => !term || p.name.toLowerCase().includes(term) || p.city.toLowerCase().includes(term));
  const shown = filtered.slice(0, visible);
  grid.innerHTML = shown.length ? shown.map((p,i)=>cardTemplate(p,i)).join("") :
    `<div class="empty">No profiles found.</div>`;
  const total = term ? filtered.length : 45;
  countText.textContent = term
    ? `Showing ${shown.length ? 1 : 0}–${shown.length} of ${filtered.length}`
    : `Showing 1–${Math.min(visible,9)} of ${total}`;
  loadMore.style.display = term || visible >= profiles.length ? "none" : "block";
}
function passProfile(btn){
  const card = btn.closest(".profile-card");
  card.style.transition="all .25s ease";
  card.style.transform="translateX(-110%) rotate(-8deg)";
  card.style.opacity="0";
  setTimeout(()=>card.remove(),250);
}
function toggleAction(btn){
  btn.classList.toggle("active");
}
function messageProfile(name){
  alert(`Opening messages with ${name}`);
}
search.addEventListener("input", render);
loadMore.addEventListener("click",()=>{
  visible = Math.min(visible + 3, profiles.length);
  render();
});
document.querySelectorAll(".nav-item[data-nav]").forEach(item=>{
  item.addEventListener("click",()=>{
    document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
    if(item.dataset.nav !== "Matches") item.classList.add("active");
  });
});
render();
