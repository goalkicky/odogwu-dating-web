const toast = document.getElementById("toast");
let timer;
function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(timer);
  timer=setTimeout(()=>toast.classList.remove("show"),1500);
}
document.getElementById("locationBtn").addEventListener("click",()=>showToast("Location selector opened"));
document.querySelector(".upgrade").addEventListener("click",()=>showToast("Premium upgrade selected"));
document.querySelectorAll(".nav-item").forEach((item)=>{
  item.addEventListener("click",()=>{
    document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
    item.classList.add("active");
    const label=item.querySelector("span:last-child")?.textContent;
    if(label) showToast(label);
  });
});
document.querySelector(".back").addEventListener("click",()=>showToast("Back"));
document.querySelector(".messages").addEventListener("click",()=>showToast("Messages"));
