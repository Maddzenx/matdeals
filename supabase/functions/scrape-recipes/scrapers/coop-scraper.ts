
// Mock Coop recipe scraper
import { mockRecipes } from "../mock/mock-recipes.ts";

export const scrapeCoopRecipes = async () => {
  console.log("Mocked Coop recipe scraper running");
  return mockRecipes.map(recipe => ({
    ...recipe,
    source: "coop"
  }));
};
