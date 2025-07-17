export async function loadProduct() {
  try {
    const res = await fetch("/src/data/product.json");
    return await res.json();
  } catch (error) {
    console.error("Error loading product data:", error);
    return null;
  }
}

export async function loadRecommendations() {
  try {
    const res = await fetch("/src/data/recommendations.json");
    return await res.json();
  } catch (error) {
    console.error("Error loading recommendations:", error);
    return null;
  }
}
