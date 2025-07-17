export async function loadProduct() {
  try {
    const url = new URL("/src/data/product.json", import.meta.url);
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error("Error loading product data:", error);
    return null;
  }
}

export async function loadRecommendations() {
  try {
    const url = new URL("/src/data/recommendations.json", import.meta.url);
    const res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.error("Error loading recommendations:", error);
    return null;
  }
}
