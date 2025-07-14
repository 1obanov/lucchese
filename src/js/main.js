import "virtual:svg-icons-register";
import Alpine from "alpinejs";

document.addEventListener("alpine:init", () => {
  Alpine.store("menu", {
    isMobileMenuOpen: false,
    openSubmenuId: null,
  });
});

Alpine.start();
