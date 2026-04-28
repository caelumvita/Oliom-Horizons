(function(){
  const key = "oh_theme";
  const saved = localStorage.getItem(key);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");

  function applyTheme(value){
    const t = value === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = t;
    localStorage.setItem(key, t);
    window.dispatchEvent(new CustomEvent("oh-theme-change", { detail:{ theme:t } }));
  }

  document.documentElement.dataset.theme = theme;
  window.OHTheme = { key, get:()=>document.documentElement.dataset.theme || "light", set:applyTheme };

  window.addEventListener("storage", e => {
    if(e.key === key && e.newValue){
      document.documentElement.dataset.theme = e.newValue === "dark" ? "dark" : "light";
    }
  });
})();
