const languageButton = document.querySelector("[data-language-toggle]");
let currentLanguage = localStorage.getItem("huntagent-lang") || "en";
const openSelects = new Set();

function setLanguage(language) {
  currentLanguage = language;
  localStorage.setItem("huntagent-lang", language);
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";

  document.querySelectorAll("[data-en]").forEach((element) => {
    const value = element.dataset[language] || element.dataset.en;
    if (value) {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-placeholder-en]").forEach((element) => {
    const value = element.dataset[`placeholder${language === "zh" ? "Zh" : "En"}`];
    if (value) {
      element.setAttribute("placeholder", value);
    }
  });

  if (languageButton) {
    languageButton.textContent = language === "en" ? "中文" : "English";
  }
}

if (languageButton) {
  languageButton.addEventListener("click", () => {
    setLanguage(currentLanguage === "en" ? "zh" : "en");
  });
}

setLanguage(currentLanguage);

function enhanceSelects(root = document) {
  root.querySelectorAll("select.input:not([data-custom-select])").forEach((select) => {
    select.dataset.customSelect = "true";
    select.classList.add("native-select-hidden");

    const shell = document.createElement("div");
    shell.className = "select-shell";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const menu = document.createElement("div");
    menu.className = "select-menu";
    menu.setAttribute("role", "listbox");

    select.parentNode.insertBefore(shell, select);
    shell.append(select, trigger, menu);

    const close = () => {
      shell.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      openSelects.delete(shell);
    };

    const open = () => {
      openSelects.forEach((item) => {
        item.classList.remove("open");
        item.querySelector(".select-trigger")?.setAttribute("aria-expanded", "false");
      });
      shell.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      openSelects.add(shell);
    };

    const update = () => {
      const selected = select.selectedOptions[0] || select.options[0];
      trigger.textContent = selected ? selected.textContent : "";
      menu.querySelectorAll(".select-option").forEach((option) => {
        option.classList.toggle("selected", option.dataset.value === select.value);
      });
    };

    const rebuild = () => {
      menu.innerHTML = "";
      Array.from(select.options).forEach((option) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "select-option";
        item.dataset.value = option.value;
        item.textContent = option.textContent;
        item.setAttribute("role", "option");
        item.addEventListener("click", () => {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          update();
          close();
        });
        menu.appendChild(item);
      });
      update();
    };

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      shell.classList.contains("open") ? close() : open();
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        shell.classList.contains("open") ? close() : open();
      }
    });

    select.addEventListener("change", update);
    select.addEventListener("huntagent:refresh-select", rebuild);
    select.form?.addEventListener("reset", () => window.setTimeout(update, 0));
    rebuild();
  });
}

function refreshSelect(select) {
  select.dispatchEvent(new Event("huntagent:refresh-select"));
}

document.addEventListener("click", () => {
  openSelects.forEach((shell) => {
    shell.classList.remove("open");
    shell.querySelector(".select-trigger")?.setAttribute("aria-expanded", "false");
  });
  openSelects.clear();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    openSelects.forEach((shell) => {
      shell.classList.remove("open");
      shell.querySelector(".select-trigger")?.setAttribute("aria-expanded", "false");
    });
    openSelects.clear();
  }
});

window.HuntAgentUI = {
  enhanceSelects,
  refreshSelect
};

enhanceSelects();
