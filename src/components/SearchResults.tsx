
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  category: string;
  excerpt?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  onClose: () => void;
}

const SearchResults = ({ results, onClose }: SearchResultsProps) => {
  const navigate = useNavigate();

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No results found
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {results.map((result) => (
        <button
          key={result.id}
          className="w-full text-left p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => {
            navigate(`/articles/${result.id}`);
            onClose();
          }}
        >
          <h4 className="text-sm font-semibold">{result.title}</h4>
          {result.excerpt && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.excerpt}</p>
          )}
          <span className="text-xs text-highlight mt-1 block">{result.category}</span>
        </button>
      ))}
    </div>
  );
};

export default SearchResults;
