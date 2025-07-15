import "virtual:svg-icons-register";
import Alpine from "alpinejs";
import Swiper from "swiper/bundle";
import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

function productPage() {
  const selections = {
    sizes: "selectedSize",
    widths: "selectedWidth",
    toeHeelSizes: "selectedToeHeelSize",
    calfWidths: "selectedCalfWidth",
  };

  return {
    product: null,
    currentVariant: null,
    colors: [],
    selectedSize: null,
    selectedWidth: null,
    selectedToeHeelSize: null,
    selectedCalfWidth: null,
    isProductLoaded: false,
    showMoreMedia: false,

    async init() {
      try {
        const res = await fetch("/src/data/product.json");
        const productData = await res.json();

        this.product = productData;
        this.currentVariant = this.product?.variants?.[0] ?? null;
        this.colors = this.product?.colors ?? [];

        this.setDefaultSelections();

        this.isProductLoaded = true;

        this.$nextTick(() => {
          this.handleSwiper();

          window.addEventListener("resize", () => {
            this.handleSwiper();
          });
        });

        Fancybox.bind("[data-fancybox]", {});
      } catch (error) {
        console.error("Failed to load product data:", error);
      }
    },

    setDefaultSelections() {
      if (!this.product) return;

      for (const [productKey, selectedKey] of Object.entries(selections)) {
        const value = this.product?.[productKey] ?? [];
        this[selectedKey] = value[0] ?? null;
      }
    },

    handleSwiper() {
      const mobileBreakpoint = 768;
      const isMobile = window.innerWidth < mobileBreakpoint;

      if (isMobile) {
        if (!this.swiperInstance) {
          this.swiperInstance = new Swiper(".thumbsSlider", {
            spaceBetween: 1,
            slidesPerView: 3.5,
          });
        }
        if (!this.swiper2Instance) {
          this.swiper2Instance = new Swiper(".mainSlider", {
            thumbs: {
              swiper: this.swiperInstance,
            },
          });
        }
      } else {
        if (this.swiper2Instance) {
          this.swiper2Instance.destroy(true, true);
          this.swiper2Instance = null;
        }
        if (this.swiperInstance) {
          this.swiperInstance.destroy(true, true);
          this.swiperInstance = null;
        }
      }
    },

    selectColor(color) {
      const variant = this.product.variants.find((v) => v.color === color);
      if (variant) {
        this.currentVariant = variant;
      }

      this.setDefaultSelections();
    },

    setValue(field, value) {
      if (field in this) {
        this[field] = value;
      }
    },

    toggleShowMore() {
      this.showMoreMedia = !this.showMoreMedia;

      if (!this.showMoreMedia) {
        this.$nextTick(() => {
          const el = this.$refs.mediaSection;
          if (el) {
            const elRect = el.getBoundingClientRect();
            const elCenter =
              elRect.top +
              window.pageYOffset -
              window.innerHeight / 2 +
              elRect.height / 2;

            window.scrollTo({
              top: elCenter,
              behavior: "smooth",
            });
          }
        });
      }
    },
  };
}

document.addEventListener("alpine:init", () => {
  Alpine.store("menu", {
    isMobileMenuOpen: false,
    openSubmenuId: null,
    openMobileMenu() {
      this.isMobileMenuOpen = true;
    },

    closeMobileMenu() {
      this.isMobileMenuOpen = false;
    },

    openSubmenu(id) {
      this.openSubmenuId = id;
    },

    closeSubmenu() {
      this.openSubmenuId = null;
    },
  });

  Alpine.store("sizePicker", {
    isChooseSizeOpen: false,
    open() {
      this.isChooseSizeOpen = true;
    },
    close() {
      this.isChooseSizeOpen = false;
    },
  });

  Alpine.store("infoLayout", {
    openInfoLayout: null,
    open(id) {
      this.openInfoLayout = id;
    },
    close() {
      this.openInfoLayout = null;
    },
  });

  Alpine.store("faqAccordion", {
    openSections: [],

    toggle(section) {
      if (this.openSections.includes(section)) {
        this.openSections = this.openSections.filter(
          (openSection) => openSection !== section
        );
      } else {
        this.openSections.push(section);
      }
    },

    isOpen(section) {
      return this.openSections.includes(section);
    },
  });

  Alpine.effect(() => {
    const menu = Alpine.store("menu");
    const sizePicker = Alpine.store("sizePicker");

    document.body.classList.toggle(
      "overflow-hidden",
      menu.isMobileMenuOpen || sizePicker.isChooseSizeOpen
    );
  });

  Alpine.data("productPage", productPage);
});

Alpine.start();
