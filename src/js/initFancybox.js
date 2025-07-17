import { Fancybox } from "@fancyapps/ui/dist/fancybox/";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export function initFancybox() {
  Fancybox.bind("[data-fancybox]");
}
