import "virtual:svg-icons-register";
import Alpine from "alpinejs";
import { loadProduct, loadRecommendations } from "./loadData.js";
import { initFancybox } from "./initFancybox.js";
import {
  handleProductSlider,
  initRecommendationsSlider,
  reInitProductSwipers,
} from "./initSliders.js";

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
    cart: JSON.parse(localStorage.getItem("cart")) || [],
    addedToCart: false,

    async init() {
      this.product = await loadProduct();
      this.recommendations = await loadRecommendations();

      this.currentVariant = this.product?.variants?.[0] ?? null;
      this.currentRecommendations = this.recommendations.map(
        (rec) => rec.variants[0]
      );

      this.colors = this.product?.colors ?? [];

      this.setDefaultSelections();

      this.isProductLoaded = true;

      this.$nextTick(() => {
        handleProductSlider();
        window.addEventListener("resize", handleProductSlider);
      });

      initRecommendationsSlider();

      initFancybox();
    },

    setDefaultSelections() {
      if (!this.product) return;

      for (const [productKey, selectedKey] of Object.entries(selections)) {
        const value = this.product?.[productKey] ?? [];
        this[selectedKey] = value[0] ?? null;
      }
    },

    selectColor(color) {
      const variant = this.product.variants.find((v) => v.color === color);
      if (variant) {
        this.currentVariant = variant;
      }

      this.setDefaultSelections();
      reInitProductSwipers();
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

    // Updates selectedSize, selectedWidth, selectedToeHeelSize, or selectedCalfWidth
    updateValue(field, value) {
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

    addToCart() {
      const existingIndex = this.cart.findIndex((item) => {
        const isSameProduct =
          item.id === this.currentVariant.id &&
          item.color === this.currentVariant.color &&
          item.size === this.selectedSize &&
          item.width === this.selectedWidth;

        const isSameToeHeelSize = this.currentVariant.hasToeHeelSize
          ? item.toeHeelSize === this.selectedToeHeelSize
          : true;

        const isSameCalfWidth = this.currentVariant.hasCalfWidth
          ? item.calfWidth === this.selectedCalfWidth
          : true;

        return isSameProduct && isSameToeHeelSize && isSameCalfWidth;
      });

      if (existingIndex > -1) {
        this.cart[existingIndex].quantity++;
      } else {
        const newItem = {
          id: this.currentVariant.id,
          name: this.product.name,
          price: this.product.price,
          url: this.currentVariant.url,
          color: this.currentVariant.color,
          image: this.currentVariant.images[0],
          size: this.selectedSize,
          width: this.selectedWidth,
          quantity: 1,
        };

        if (this.currentVariant.hasToeHeelSize) {
          newItem.toeHeelSize = this.selectedToeHeelSize;
        }

        if (this.currentVariant.hasCalfWidth) {
          newItem.calfWidth = this.selectedCalfWidth;
        }

        this.cart.push(newItem);
      }

      localStorage.setItem("cart", JSON.stringify(this.cart));

      this.addedToCart = true;
      setTimeout(() => (this.addedToCart = false), 2000);
    },

    isSameCartItem(cartItem, productItem) {
      return (
        cartItem.id === productItem.id &&
        cartItem.size === productItem.size &&
        cartItem.width === productItem.width &&
        cartItem.toeHeelSize === productItem.toeHeelSize &&
        cartItem.calfWidth === productItem.calfWidth
      );
    },

    incrementQuantity(product) {
      const item = this.cart.find((i) => this.isSameCartItem(i, product));
      if (item) {
        item.quantity++;
        localStorage.setItem("cart", JSON.stringify(this.cart));
      }
    },

    decrementQuantity(product) {
      const index = this.cart.findIndex((i) => this.isSameCartItem(i, product));

      if (index !== -1) {
        if (this.cart[index].quantity > 1) {
          this.cart[index].quantity--;
        } else {
          this.cart.splice(index, 1);
        }

        localStorage.setItem("cart", JSON.stringify(this.cart));
      }
    },

    changeQuantity(product, value) {
      const quantity = parseInt(value, 10);
      if (isNaN(quantity) || quantity < 1) return;

      const item = this.cart.find((i) => this.isSameCartItem(i, product));

      if (item) {
        item.quantity = quantity;
        localStorage.setItem("cart", JSON.stringify(this.cart));
      }
    },

    removeFromCart(product) {
      const index = this.cart.findIndex((i) => this.isSameCartItem(i, product));

      if (index !== -1) {
        this.cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(this.cart));
      }
    },

    cartTotal() {
      return this.cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
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

  Alpine.store("cartBtnObserver", {
    isAddToCartVisible: true,
  });

  Alpine.store("miniCart", {
    isCartOpen: false,
    open() {
      this.isCartOpen = true;
    },
    close() {
      this.isCartOpen = false;
    },
  });

  Alpine.effect(() => {
    const menu = Alpine.store("menu");
    const sizePicker = Alpine.store("sizePicker");
    const miniCart = Alpine.store("miniCart");

    document.body.classList.toggle(
      "overflow-hidden",
      menu.isMobileMenuOpen ||
        sizePicker.isChooseSizeOpen ||
        miniCart.isCartOpen
    );
  });

  Alpine.data("productPage", productPage);
});

Alpine.start();
