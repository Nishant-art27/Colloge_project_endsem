import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import { useState, useEffect } from "react";
import { Utensils, TrendingUp, Clock } from "lucide-react";
import { searchRecipes } from "@/lib/api";
import { Recipe } from "@/context/RecipeContext";

export default function Index() {
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [mostEatenRecipes, setMostEatenRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch popular and most eaten recipes when component mounts
  useEffect(() => {
    const fetchPopularRecipes = async () => {
      try {
        setLoading(true);
        // Get most popular recipes by using sort=popularity (default in the API)
        const popular = await searchRecipes("", [], [], 0, 3);
        setPopularRecipes(popular.results);
        
        // Get most eaten recipes by sorting by meta-score - another approximation for "most eaten"
        const mostEaten = await searchRecipes("", [], [], 0, 3);
        setMostEatenRecipes(mostEaten.results);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRecipes();
  }, []);

  function handleSearch(query: string) {
    setSearchQ(query);
    // Navigate to Browse with query as state
    navigate("/browse", { state: { query } });
  }

  function handleRecipeClick(id: number) {
    navigate(`/recipe/${id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-soft via-white to-primary/30">
      <header className="text-center pt-16 pb-10">
        <h1 className="font-playfair text-5xl sm:text-6xl font-bold text-accent mb-4">Recipe Radar</h1>
        <p className="max-w-xl mx-auto text-lg sm:text-xl font-medium text-gray-600">Discover and filter recipes from across the world using powerful ingredient and cuisine filters. Find your next meal inspiration!</p>
      </header>
      <div className="mb-10">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Popular Recipes Section */}
      <section className="mb-10">
        <h2 className="font-playfair text-2xl text-center text-primary my-6 flex items-center justify-center gap-2">
          <TrendingUp size={28} /> Most Popular Recipes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto">
          {loading ? (
            <div className="col-span-3 text-center py-8">Loading popular recipes...</div>
          ) : (
            popularRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="animate-fade-in cursor-pointer" 
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover rounded-t-md shadow" />
                <div className="bg-white p-4 rounded-b-md shadow">
                  <h3 className="font-playfair font-semibold text-lg text-accent mb-1">{recipe.title}</h3>
                  <p className="text-sm text-gray-600">{recipe.cuisine}</p>
                  <div className="flex gap-1 mt-2">
                    {recipe.ingredients.slice(0, 3).map((ing, i) => (
                      <span className="px-2 py-0.5 bg-soft/70 text-xs rounded" key={i}>{ing.split(' ')[0]}</span>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <span className="px-2 py-0.5 bg-soft/70 text-xs rounded">+{recipe.ingredients.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Most Eaten Recipes Section */}
      <section>
        <h2 className="font-playfair text-2xl text-center text-primary my-6 flex items-center justify-center gap-2">
          <Clock size={28} /> Most Eaten Recipes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 max-w-5xl mx-auto">
          {loading ? (
            <div className="col-span-3 text-center py-8">Loading most eaten recipes...</div>
          ) : (
            mostEatenRecipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="animate-fade-in cursor-pointer" 
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover rounded-t-md shadow" />
                <div className="bg-white p-4 rounded-b-md shadow">
                  <h3 className="font-playfair font-semibold text-lg text-accent mb-1">{recipe.title}</h3>
                  <p className="text-sm text-gray-600">{recipe.cuisine}</p>
                  <div className="flex gap-1 mt-2">
                    {recipe.ingredients.slice(0, 3).map((ing, i) => (
                      <span className="px-2 py-0.5 bg-soft/70 text-xs rounded" key={i}>{ing.split(' ')[0]}</span>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <span className="px-2 py-0.5 bg-soft/70 text-xs rounded">+{recipe.ingredients.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="mt-auto pb-4 pt-10 text-center text-gray-400">Made with 🍕 and Spoonacular API</footer>
    </div>
  );
}
