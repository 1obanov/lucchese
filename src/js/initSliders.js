import Swiper from "swiper/bundle";

let productThumbsSwiper = null;
let productMainSwiper = null;

export function handleProductSlider() {
  const mobileBreakpoint = 768;
  const isMobile = window.innerWidth < mobileBreakpoint;

  if (isMobile) {
    if (!productThumbsSwiper) {
      productThumbsSwiper = new Swiper(".thumbsSlider", {
        spaceBetween: 1,
        slidesPerView: 3.5,
      });
    }
    if (!productMainSwiper) {
      productMainSwiper = new Swiper(".mainSlider", {
        thumbs: {
          swiper: productThumbsSwiper,
        },
      });
    }
  } else {
    if (productMainSwiper) {
      productMainSwiper.destroy(true, true);
      productMainSwiper = null;
    }
    if (productThumbsSwiper) {
      productThumbsSwiper.destroy(true, true);
      productThumbsSwiper = null;
    }
  }
}

export function initRecommendationsSlider() {
  return new Swiper(".recommendationsSlider", {
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
}
