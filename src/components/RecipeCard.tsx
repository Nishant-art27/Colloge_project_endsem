import { Plus, Heart, Tag, Clock } from "lucide-react";
import { useRecipeContext } from "@/context/RecipeContext";
import { Link } from "react-router-dom";
import { Recipe } from "@/context/RecipeContext";

type Props = Recipe;

export default function RecipeCard({ id, title, image, cuisine, ingredients, readyInMinutes }: Props) {
  const { state, dispatch } = useRecipeContext();
  const isFav = !!state.favorites.find((r) => r.id === id);
  
  return (
    <div className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <button
          aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-3 right-3 rounded-full p-2 transition-all ${
            isFav 
              ? "bg-primary text-white shadow-md" 
              : "bg-white/80 text-gray-600 hover:bg-primary hover:text-white"
          }`}
          onClick={(e) => {
            e.preventDefault();
            dispatch({
              type: "TOGGLE_FAVORITE",
              recipe: { id, title, image, cuisine, ingredients, readyInMinutes },
            });
          }}
        >
          <Heart size={18} className={isFav ? "fill-white" : ""} />
        </button>
        
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
            <Clock size={12} />
            {readyInMinutes || 30} min
          </span>
        </div>
      </div>
      
      <Link to={`/recipe/${id}`} className="block p-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-playfair text-lg font-semibold text-accent group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <Tag size={14} />
            <span>{cuisine}</span>
          </div>
          
          <div className="flex flex-wrap mt-2 gap-1">
            {ingredients.slice(0, 3).map((ing, idx) => (
              <span key={idx} className="bg-soft/70 text-xs px-2 py-0.5 rounded">
                {ing}
              </span>
            ))}
            {ingredients.length > 3 && (
              <span className="text-xs text-gray-500">+{ingredients.length - 3} more</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
