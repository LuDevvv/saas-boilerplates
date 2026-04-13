import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/utils/classNames";

interface TagInputProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  onTagsChange,
  placeholder = "Agregar nueva etiqueta",
  className = "",
}) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onTagsChange(updatedTags);
      setNewTag("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    onTagsChange(updatedTags);
  };

  return (
    <div className={cn("group flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5 transition-colors group-focus-within:text-primary-500">
          {label}
        </label>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className={cn(
              "w-full px-4 py-3.5 text-[15px] border-2 rounded-2xl transition-all duration-500 ease-out-expo",
              "bg-gray-50/50 focus:bg-white dark:bg-white/[0.02] dark:focus:bg-gray-900 border-transparent dark:border-white/[0.02]",
              "placeholder:text-gray-400/80 focus:outline-none focus:border-primary-500/50 focus:shadow-sm hover:border-primary-500/20 hover:shadow-md",
              "text-gray-900 dark:text-white"
            )}
          />
        </div>
        <button
          type="button"
          onClick={handleAddTag}
          className="p-3.5 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 active:scale-90 transition-all shadow-lg shadow-primary-500/20 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 px-1">
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all duration-300",
              "bg-gray-50/50 dark:bg-white/[0.03] border-2 border-transparent hover:border-primary-500/30 text-gray-700 dark:text-gray-300 group/tag"
            )}
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="p-0.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="px-1 mt-1">
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
            Añade etiquetas para mejorar la búsqueda y categorización
          </p>
        </div>
      )}
    </div>
  );
};
