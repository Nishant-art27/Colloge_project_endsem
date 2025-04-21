
import { useState } from "react";
import { Search } from "lucide-react";

type Props = {
  onSearch: (query: string) => void;
};
export default function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) {
      setError("Please enter a recipe or ingredient");
      return;
    }
    setError("");
    onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex gap-2 shadow rounded-lg overflow-hidden bg-white">
      <input
        className="flex-grow px-4 py-2 outline-none font-sans text-lg"
        placeholder="Search recipes or ingredients..."
        value={value}
        onChange={e => setValue(e.target.value)}
        aria-label="Search recipes"
      />
      <button className="bg-primary px-4 flex items-center text-white hover:bg-accent transition" type="submit" aria-label="Search">
        <Search />
      </button>
      {error && <span className="w-full block text-red-500 text-xs mt-1 ml-2">{error}</span>}
    </form>
  );
}
