import { useRecipeContext } from "@/context/RecipeContext";
import RecipeCard from "@/components/RecipeCard";
import FilterChips from "@/components/FilterChips";
import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Search, Sliders, X, Loader2 } from "lucide-react";
import { searchRecipes, getRandomRecipes } from "@/lib/api";

// Common cuisines for filtering
const ALL_CUISINES = [
  "Italian", "Chinese", "Japanese", "Mexican", 
  "Indian", "Thai", "Mediterranean", "French", 
  "Greek", "Spanish"
];

// Common ingredients for filtering
const ALL_INGREDIENTS = [
  "Tomato", "Garlic", "Onion", "Chicken", "Potato", "Rice", 
  "Pasta", "Cheese", "Mushroom", "Carrot", "Bell Pepper", 
  "Spinach", "Avocado", "Tofu", "Pork", "Lemon"
];

export default function Browse() {
  const { state, dispatch } = useRecipeContext();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.query ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [page, setPage] = useState(0);
  const itemsPerPage = 12;
  
  const hasActiveFilters = state.filters.cuisine.length > 0 || state.filters.ingredients.length > 0 || searchTerm.length > 0;

  // Function to fetch recipes based on current filters and search
  const fetchRecipes = useCallback(async (newSearch = false) => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });
      dispatch({ type: "SET_ERROR", error: null });
      
      // If it's a new search, reset the page
      const currentPage = newSearch ? 0 : page;
      if (newSearch) setPage(0);
      
      const offset = currentPage * itemsPerPage;
      
      // If no search term and no filters, fetch random recipes
      if (!searchTerm && !state.filters.cuisine.length && !state.filters.ingredients.length) {
        const randomRecipes = await getRandomRecipes(itemsPerPage);
        setRecipes(newSearch ? randomRecipes : [...recipes, ...randomRecipes]);
        setTotalResults(randomRecipes.length);
      } else {
        // Search with filters
        const result = await searchRecipes(
          searchTerm,
          state.filters.cuisine,
          state.filters.ingredients,
          offset,
          itemsPerPage
        );
        
        setRecipes(newSearch ? result.results : [...recipes, ...result.results]);
        setTotalResults(result.totalResults);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to fetch recipes. Please try again." });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, [searchTerm, state.filters, page, recipes, dispatch]);

  // Initial load and when filters change
  useEffect(() => {
    fetchRecipes(true);
  }, [searchTerm, state.filters.cuisine, state.filters.ingredients]);

  function resetAllFilters() {
    dispatch({ type: "RESET_FILTERS" });
    setSearchTerm("");
  }

  // Load more recipes when scrolling to the bottom
  const loadMoreRecipes = () => {
    if (!state.loading && recipes.length < totalResults) {
      setPage(prev => prev + 1);
    }
  };

  // Effect for loading more when page changes
  useEffect(() => {
    if (page > 0) {
      fetchRecipes(false);
    }
  }, [page]);

  return (
    <div className="min-h-screen bg-gradient-to-bl from-soft via-white to-primary/10 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header and Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <h2 className="font-playfair text-3xl text-accent">Browse Recipes</h2>
          <div className={`relative flex-1 sm:max-w-xs ${isSearchFocused ? 'ring-2 ring-primary' : ''}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              className="border border-gray-200 rounded-lg pl-10 pr-10 py-2 w-full shadow-sm focus:outline-none transition"
              placeholder="Search by name or ingredient..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X size={16} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Sliders size={16} />
              <span>Filters {hasActiveFilters && <span className="bg-primary text-white px-2 py-0.5 rounded-full text-xs ml-1">{state.filters.cuisine.length + state.filters.ingredients.length + (searchTerm ? 1 : 0)}</span>}</span>
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-sm text-gray-500 hover:text-accent underline transition-colors"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Filter Chips */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2 border-t border-gray-100">
              <FilterChips
                options={ALL_CUISINES}
                selected={state.filters.cuisine}
                onChange={arr => dispatch({ type: "SET_FILTER", filter: { key: "cuisine", value: arr } })}
                label="Cuisine"
              />
              <FilterChips
                options={ALL_INGREDIENTS}
                selected={state.filters.ingredients}
                onChange={arr => dispatch({ type: "SET_FILTER", filter: { key: "ingredients", value: arr } })}
                label="Ingredients"
              />
            </div>
          )}
        </div>

        {/* Error message */}
        {state.error && (
          <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {state.error}
            <button 
              className="ml-2 underline"
              onClick={() => dispatch({ type: "SET_ERROR", error: null })}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Results Section */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            {totalResults} {totalResults === 1 ? 'recipe' : 'recipes'} found
          </p>
        </div>

        {/* Loading indicator */}
        {state.loading && recipes.length === 0 && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 pb-10">
          {recipes.length ? (
            recipes.map((r) => <RecipeCard key={r.id} {...r} />)
          ) : (
            !state.loading && (
              <div className="col-span-full text-xl text-gray-500 mt-10 font-medium text-center flex flex-col items-center gap-3">
                <p>No recipes found. Try adjusting your filters!</p>
                <button 
                  onClick={resetAllFilters}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 transition text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )
          )}
        </div>

        {/* Load more button */}
        {recipes.length > 0 && recipes.length < totalResults && (
          <div className="flex justify-center py-4">
            <button
              onClick={loadMoreRecipes}
              disabled={state.loading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
            >
              {state.loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
