
import { useRecipeContext } from "@/context/RecipeContext";
import RecipeCard from "@/components/RecipeCard";
export default function Favorites() {
  const { state } = useRecipeContext();
  return (
    <div className="min-h-screen bg-gradient-to-br from-soft via-white to-primary/10 py-10 px-4">
      <h2 className="font-playfair text-3xl text-center text-accent mb-8">Your Favorite Recipes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 max-w-6xl mx-auto">
        {state.favorites.length ? (
          state.favorites.map(r => <RecipeCard key={r.id} {...r} />)
        ) : (
          <div className="col-span-full text-xl text-gray-500 mt-10 font-medium text-center">No favorites yet. Add some recipes!</div>
        )}
      </div>
    </div>
  );
}
