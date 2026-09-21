const toast = document.querySelector(".toast");
const modal = document.querySelector(".modal");

let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1600);
}

document.querySelector(".like-hotspot").addEventListener("click", () => {
  showToast("Liked ❤️");
});

document.querySelector(".comment-hotspot").addEventListener("click", () => {
  showToast("Comments opened");
});

document.querySelector(".share-hotspot").addEventListener("click", async () => {
  const shareData = {
    title: "Amaka — Sunset dates",
    text: "Sunset dates 🌅",
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (_) {
      // User cancelled the native share sheet.
    }
  } else {
    showToast("Share link copied");
  }
});

document.querySelector(".more-hotspot").addEventListener("click", () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
});

document.querySelector(".modal-close").addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.querySelector(".close-hotspot").addEventListener("click", () => {
  showToast("Story closed");
});

document.querySelectorAll(".option").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(`${button.textContent} selected`);
    closeModal();
  });
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});
