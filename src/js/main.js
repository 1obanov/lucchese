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
    recommendations: null,
    currentRecommendations: null,
    showMoreMedia: false,

    async init() {
      const fetchJson = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
        return res.json();
      };
      try {
        const [productData, recommendationsData] = await Promise.all([
          fetchJson("/src/data/product.json"),
          fetchJson("/src/data/recommendations.json"),
        ]);

        this.product = productData;
        this.currentVariant = this.product?.variants?.[0] ?? null;

        this.recommendations = recommendationsData;
        this.currentRecommendations = this.recommendations.map(
          (rec) => rec.variants[0]
        );

        this.colors = this.product?.colors ?? [];

        this.setDefaultSelections();

        this.isProductLoaded = true;

        this.$nextTick(() => {
          this.handleSwiper();

          window.addEventListener("resize", () => {
            this.handleSwiper();
          });
        });

        this.initRecommendationsSlider();

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

    initRecommendationsSlider() {
      const recommendationsSlider = new Swiper(".recommendationsSlider", {
        loop: true,
        spaceBetween: 2,
        slidesPerView: 1.1,
        navigation: {
          nextEl: ".button-next",
          prevEl: ".button-prev",
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
          },
        },
      });
    },

    selectColor(color) {
      const variant = this.product.variants.find((v) => v.color === color);
      if (variant) {
        this.currentVariant = variant;
      }

      this.setDefaultSelections();
    },

    selectRecommendationColor(index, colorName) {
      const original = this.recommendations[index];
      const matchingVariant = original.variants.find(
        (variant) => variant.color === colorName
      );

      if (matchingVariant) {
        this.currentRecommendations[index] = {
          ...original,
          ...matchingVariant,
          color: colorName,
        };
      }
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

  Alpine.store("footerMenu", {
    openIds: [],

    toggle(id) {
      if (this.openIds.includes(id)) {
        this.openIds = this.openIds.filter((openId) => openId !== id);
      } else {
        this.openIds.push(id);
      }
    },

    isOpen(id) {
      return this.openIds.includes(id);
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
