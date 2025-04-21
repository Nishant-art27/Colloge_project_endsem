import React, { createContext, useContext, useReducer } from "react";

export type Recipe = {
  id: number;
  title: string;
  image: string;
  cuisine: string;
  ingredients: string[];
  liked?: boolean;
  // Additional properties from Spoonacular API
  readyInMinutes?: number;
  servings?: number;
  instructions?: string[];
  summary?: string;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  sustainable?: boolean;
  healthScore?: number;
};

type State = {
  favorites: Recipe[];
  filters: {
    ingredients: string[];
    cuisine: string[];
  };
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "TOGGLE_FAVORITE"; recipe: Recipe }
  | { type: "SET_FILTER"; filter: { key: "ingredients" | "cuisine"; value: string[] } }
  | { type: "RESET_FILTERS" }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null };

const RecipeContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

const initialState: State = {
  favorites: [],
  filters: {
    ingredients: [],
    cuisine: [],
  },
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_FAVORITE":
      const already = state.favorites.find(r => r.id === action.recipe.id);
      return {
        ...state,
        favorites: already
          ? state.favorites.filter(r => r.id !== action.recipe.id)
          : [...state.favorites, action.recipe],
      };
    case "SET_FILTER":
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.filter.key]: action.filter.value,
        },
      };
    case "RESET_FILTERS":
      return { ...state, filters: { ingredients: [], cuisine: [] } };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error };
    default:
      return state;
  }
}

export const RecipeProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <RecipeContext.Provider value={{ state, dispatch }}>{children}</RecipeContext.Provider>;
};

export const useRecipeContext = () => {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error("useRecipeContext must be within RecipeProvider");
  return ctx;
};
