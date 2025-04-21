import { Recipe } from "@/context/RecipeContext";
import { withCache } from "./cache";
import { MOCK_RECIPES } from "./mockData";

const API_KEY = "3e85a4e1b715445cae2a9e60b42d0329";
const BASE_URL = "https://api.spoonacular.com";

// Max retries for API requests
const MAX_RETRIES = 2;

// Delay between retries (in ms)
const RETRY_DELAY = 1000;

// Utility function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function to retry API calls
const withRetry = async <T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY);
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

// Transforming the API response to match our app's data structure
export const transformRecipe = (recipe: any): Recipe => {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image.startsWith('http') 
      ? recipe.image 
      : `https://spoonacular.com/recipeImages/${recipe.image}`,
    cuisine: recipe.cuisines?.length > 0 ? recipe.cuisines[0] : "Unknown",
    ingredients: recipe.extendedIngredients?.map((i: any) => i.original) || [],
    readyInMinutes: recipe.readyInMinutes || 30,
    servings: recipe.servings || 2,
    instructions: recipe.analyzedInstructions?.[0]?.steps?.map((s: any) => s.step) || [],
    summary: recipe.summary || "",
    vegetarian: recipe.vegetarian || false,
    vegan: recipe.vegan || false,
    glutenFree: recipe.glutenFree || false,
    dairyFree: recipe.dairyFree || false,
    sustainable: recipe.sustainable || false,
    healthScore: recipe.healthScore || 0,
  };
};

// Function to search for recipes (without caching - results may change frequently)
export const searchRecipesRaw = async (
  query: string = "", 
  cuisine: string[] = [], 
  ingredients: string[] = [],
  offset: number = 0,
  number: number = 12
): Promise<{ results: Recipe[], totalResults: number }> => {
  try {
    return await withRetry(async () => {
      // Construct the endpoint with query parameters
      let endpoint = `${BASE_URL}/recipes/complexSearch`;
      
      // Build query parameters
      const params = new URLSearchParams({
        apiKey: API_KEY,
        offset: offset.toString(),
        number: number.toString(),
        addRecipeInformation: "true",
        fillIngredients: "true",
        instructionsRequired: "true",
        sort: "popularity", // Sort by popularity
        sortDirection: "desc", // Descending order
      });

      // Add search query if provided
      if (query) {
        params.append("query", query);
      }
      
      // Add cuisine filter if provided
      if (cuisine.length > 0) {
        params.append("cuisine", cuisine.join(","));
      }
      
      // Add ingredients filter if provided
      if (ingredients.length > 0) {
        params.append("includeIngredients", ingredients.join(","));
      }
      
      // Exclude beef
      params.append("excludeIngredients", "beef");
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our app's data structure
      const recipes = data.results.map(transformRecipe);
      
      return {
        results: recipes,
        totalResults: data.totalResults,
      };
    });
  } catch (error) {
    console.error("Error fetching recipes, using mock data:", error);
    
    // Filter mock data to match the query and filters as closely as possible
    let filteredMockRecipes = [...MOCK_RECIPES];
    
    if (query) {
      const queryLower = query.toLowerCase();
      filteredMockRecipes = filteredMockRecipes.filter(r => 
        r.title.toLowerCase().includes(queryLower) || 
        r.ingredients.some(i => i.toLowerCase().includes(queryLower))
      );
    }
    
    if (cuisine.length > 0) {
      filteredMockRecipes = filteredMockRecipes.filter(r => 
        cuisine.some(c => r.cuisine.toLowerCase().includes(c.toLowerCase()))
      );
    }
    
    if (ingredients.length > 0) {
      filteredMockRecipes = filteredMockRecipes.filter(r => 
        ingredients.some(ing => 
          r.ingredients.some(i => i.toLowerCase().includes(ing.toLowerCase()))
        )
      );
    }
    
    // Paginate the results
    const startIdx = offset;
    const endIdx = Math.min(startIdx + number, filteredMockRecipes.length);
    const paginatedRecipes = filteredMockRecipes.slice(startIdx, endIdx);
    
    return {
      results: paginatedRecipes,
      totalResults: filteredMockRecipes.length,
    };
  }
};

// Cached version of search recipes - only cache when there's no offset (first page)
export const searchRecipes = async (
  query: string = "", 
  cuisine: string[] = [], 
  ingredients: string[] = [],
  offset: number = 0,
  number: number = 12
): Promise<{ results: Recipe[], totalResults: number }> => {
  // Only cache the first page
  if (offset === 0) {
    return withCache(
      searchRecipesRaw,
      (q, c, i, o, n) => `search_${q}_${c.join(',')}_${i.join(',')}_${o}_${n}`
    )(query, cuisine, ingredients, offset, number);
  }
  
  // Don't cache pagination results
  return searchRecipesRaw(query, cuisine, ingredients, offset, number);
};

// Function to get a single recipe by ID (with caching)
const getRecipeByIdRaw = async (id: number): Promise<Recipe> => {
  try {
    return await withRetry(async () => {
      const endpoint = `${BASE_URL}/recipes/${id}/information`;
      
      const params = new URLSearchParams({
        apiKey: API_KEY,
        includeNutrition: "false",
      });
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our app's data structure
      return transformRecipe(data);
    });
  } catch (error) {
    console.error(`Error fetching recipe with ID ${id}, using mock data:`, error);
    
    // Try to find a mock recipe with a similar ID
    const mockRecipe = MOCK_RECIPES.find(r => r.id === id) || MOCK_RECIPES[0];
    
    return mockRecipe;
  }
};

// Cached version of get recipe by ID
export const getRecipeById = withCache(
  getRecipeByIdRaw,
  (id) => `recipe_${id}`
);

// Get random recipes (with caching)
const getRandomRecipesRaw = async (number: number = 9): Promise<Recipe[]> => {
  try {
    return await withRetry(async () => {
      const endpoint = `${BASE_URL}/recipes/random`;
      
      const params = new URLSearchParams({
        apiKey: API_KEY,
        number: number.toString(),
        tags: "vegetarian", // Excluding beef by defaulting to vegetarian
      });
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our app's data structure
      return data.recipes.map(transformRecipe);
    });
  } catch (error) {
    console.error("Error fetching random recipes, using mock data:", error);
    
    // Return mock recipes, shuffled for randomness
    return MOCK_RECIPES
      .slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, number);
  }
};

// Cached version of get random recipes
export const getRandomRecipes = withCache(
  getRandomRecipesRaw,
  (number) => `random_${number}`
);

// Get recipes by ingredients (with caching)
const getRecipesByIngredientsRaw = async (
  ingredients: string[],
  number: number = 9
): Promise<Recipe[]> => {
  try {
    return await withRetry(async () => {
      const endpoint = `${BASE_URL}/recipes/findByIngredients`;
      
      const params = new URLSearchParams({
        apiKey: API_KEY,
        ingredients: ingredients.join(","),
        number: number.toString(),
        ranking: "1", // Maximize used ingredients
        ignorePantry: "true", // Ignore common pantry items
      });
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // For this endpoint, we need to fetch full recipe details for each recipe
      const recipeIds = data.map((recipe: any) => recipe.id);
      const recipePromises = recipeIds.map((id: number) => getRecipeById(id));
      
      return Promise.all(recipePromises);
    });
  } catch (error) {
    console.error("Error fetching recipes by ingredients, using mock data:", error);
    
    // Filter mock recipes to include the requested ingredients
    return MOCK_RECIPES
      .filter(recipe => 
        ingredients.some(ingredient => 
          recipe.ingredients.some(i => 
            i.toLowerCase().includes(ingredient.toLowerCase())
          )
        )
      )
      .slice(0, number);
  }
};

// Cached version of get recipes by ingredients
export const getRecipesByIngredients = withCache(
  getRecipesByIngredientsRaw,
  (ingredients, number) => `byIngredients_${ingredients.join(',')}_${number}`
); 