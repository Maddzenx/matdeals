
// Mock ICA recipe scraper
import { mockRecipes } from "../mock/mock-recipes.ts";

export const scrapeIcaRecipes = async () => {
  console.log("Mocked ICA recipe scraper running");
  return mockRecipes.map(recipe => ({
    ...recipe,
    source: "ica"
  }));
};
