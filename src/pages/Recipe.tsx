import { useParams, Link } from "react-router-dom";
import { useRecipeContext } from "@/context/RecipeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Heart, Clock, ChefHat, ArrowLeft, Share2, Loader2, Users, Leaf, Wheat, Milk } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { getRecipeById } from "@/lib/api";
import { Recipe as RecipeType } from "@/context/RecipeContext";

export default function Recipe() {
  const { id } = useParams();
  const { state, dispatch } = useRecipeContext();
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [recipe, setRecipe] = useState<RecipeType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the recipe is in favorites
  const isFavorite = state.favorites.some(r => r.id === Number(id));

  // Fetch recipe details from API
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if the recipe is in favorites first
        const favoriteRecipe = state.favorites.find(r => r.id === Number(id));
        
        if (favoriteRecipe) {
          setRecipe(favoriteRecipe);
        } else {
          // Fetch from API if not in favorites
          const fetchedRecipe = await getRecipeById(Number(id));
          setRecipe(fetchedRecipe);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        setError("Failed to load recipe. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id, state.favorites]);

  const toggleFavorite = () => {
    if (recipe) {
      dispatch({ type: 'TOGGLE_FAVORITE', recipe });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `${recipe.title} has been ${isFavorite ? "removed from" : "added to"} your favorites.`
      });
    }
  };

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const shareRecipe = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Recipe link copied to clipboard."
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 size={48} className="mx-auto animate-spin text-primary mb-4" />
          <h2 className="font-playfair text-2xl mb-2">Loading recipe...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="font-playfair text-2xl mb-2">Recipe not found</h2>
          <p>Sorry, we couldn't find the recipe you're looking for.</p>
          <Button asChild className="mt-4">
            <Link to="/browse">Browse Recipes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft via-white to-primary/10 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/browse" className="flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to Browse
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={shareRecipe}
              title="Share recipe"
            >
              <Share2 size={18} />
            </Button>
            <Button 
              variant={isFavorite ? "default" : "outline"} 
              size="icon"
              onClick={toggleFavorite}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} className={isFavorite ? "fill-white" : ""} />
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="h-64 md:h-80 overflow-hidden relative">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="inline-block px-2 py-1 bg-accent text-white text-xs rounded-md mb-2">
                {recipe.cuisine} Cuisine
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <h1 className="font-playfair text-2xl md:text-3xl text-accent mb-2">{recipe.title}</h1>
            
            {/* Recipe summary */}
            {recipe.summary && (
              <div className="mb-6 text-sm text-gray-600">
                <div dangerouslySetInnerHTML={{ __html: recipe.summary }}></div>
              </div>
            )}
            
            {/* Recipe details/badges */}
            <div className="flex flex-wrap gap-4 mt-4 mb-6">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock size={16} />
                <span>{recipe.readyInMinutes || 30} minutes</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users size={16} />
                <span>{recipe.servings || 2} servings</span>
              </div>
              {recipe.vegetarian && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Leaf size={16} />
                  <span>Vegetarian</span>
                </div>
              )}
              {recipe.vegan && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Leaf size={16} />
                  <span>Vegan</span>
                </div>
              )}
              {recipe.glutenFree && (
                <div className="flex items-center gap-1 text-sm text-amber-600">
                  <Wheat size={16} />
                  <span>Gluten-free</span>
                </div>
              )}
              {recipe.dairyFree && (
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <Milk size={16} />
                  <span>Dairy-free</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <ChefHat size={16} />
                <span>Health Score: {recipe.healthScore || 50}/100</span>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-playfair">Ingredients</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`ingredient-${idx}`} 
                          checked={checkedIngredients[idx] || false}
                          onCheckedChange={() => toggleIngredient(idx)}
                        />
                        <label
                          htmlFor={`ingredient-${idx}`}
                          className={`text-sm cursor-pointer ${
                            checkedIngredients[idx] ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {ingredient}
                        </label>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-playfair">Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {recipe.instructions && recipe.instructions.length > 0 ? (
                      recipe.instructions.map((step, idx) => (
                        <li key={idx} className="mb-2">{step}</li>
                      ))
                    ) : (
                      <>
                        <li>Preheat oven to 350°F (175°C).</li>
                        <li>Combine all ingredients in a large bowl.</li>
                        <li>Transfer to a baking dish and bake for 25 minutes.</li>
                        <li>Let cool for 5 minutes before serving.</li>
                      </>
                    )}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
