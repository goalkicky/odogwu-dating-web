document.addEventListener("DOMContentLoaded", () => {
  // Segmented controls
  document.querySelectorAll(".segmented, .choice-card").forEach(group => {
    group.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        group.querySelectorAll("button").forEach(b => {
          b.classList.remove("selected");
          const check = b.querySelector(".check");
          if (check) check.remove();
        });
        button.classList.add("selected");
        if (group.classList.contains("gender") || group.classList.contains("choice-card")) {
          const check = document.createElement("span");
          check.className = "check";
          check.textContent = "✓";
          button.appendChild(check);
        }
      });
    });
  });

  // Switch controls
  document.querySelectorAll(".switch").forEach(sw => {
    sw.addEventListener("click", () => sw.classList.toggle("on"));
  });

  // Upgrade / location demo interactions
  document.querySelector(".upgrade").addEventListener("click", () => {
    alert("Premium filters are ready for your upgrade flow.");
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".sheet").style.display = "none";
  });

  document.querySelector(".reset").addEventListener("click", () => {
    document.querySelectorAll(".segmented button, .choice-card button").forEach((b,i) => {
      b.classList.toggle("selected", i === 1);
      const c = b.querySelector(".check");
      if (c) c.remove();
    });
    document.querySelectorAll(".segmented .selected, .choice-card .selected").forEach(b => {
      const check = document.createElement("span");
      check.className = "check";
      check.textContent = "✓";
      b.appendChild(check);
    });
    document.querySelectorAll(".switch").forEach(sw => sw.classList.add("on"));
  });

  document.querySelector(".apply").addEventListener("click", () => {
    const apply = document.querySelector(".apply");
    const old = apply.innerHTML;
    apply.innerHTML = "✓  Filters Applied";
    setTimeout(() => apply.innerHTML = old, 1100);
  });
});
