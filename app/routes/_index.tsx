import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader"; // For the loading spinner

// Define types for the API response
interface ResultPayload {
  text: string;
  link?: string;
  id: number;
}

interface APIResult {
  id: number;
  payload: ResultPayload;
}

export default function Index() {
  const [query, setQuery] = useState<string>(""); // Explicit type for query
  const [results, setResults] = useState<APIResult[]>([]); // Explicit type for results
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSearch = async () => {
    if (!query) {
      setError("Please enter a search query.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ query_text: query }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image+Available"; // Online fallback image

  // Function to clean URL or use fallback
  const cleanImageUrl = (url?: string) => {
    if (!url) return fallbackImage; // Return the "Not Available" image if no URL is provided
    try {
      const cleanedUrl = new URL(url);
      return cleanedUrl.href;
    } catch (error) {
      console.error("Error with image URL:", error);
      return fallbackImage; // Return "Not Available" image for invalid URLs
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-6">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-6 text-white text-center">
          Hybrid Search API
        </h1>

        <div className="mb-6 text-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search term"
            className="border p-3 rounded w-1/2 mb-4 text-white bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500 ml-2"
            disabled={loading}
          >
            {loading ? <ClipLoader size={20} color="white" /> : "Search"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-400 text-center">
            {error}
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Results:
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.length > 0 ? (
              results.map((result) => {
                const [name, category, subcategory] = result.payload?.text
                  .split("\n")
                  .map((item) => item.trim()) || ["No name", "No category", "No subcategory"];

                const imageUrl = cleanImageUrl(result.payload.link);

                return (
                  <div
                    key={result.id}
                    className="bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-700 hover:shadow-xl transition duration-300 ease-in-out"
                  >
                    {/* Display the image from the API response or fallback if it fails */}
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-full h-40 object-cover mb-4 rounded-t-lg"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage; // If the image fails to load, use the fallback image
                      }}
                    />
                    <p className="text-white font-bold mb-2">{name}</p>
                    <p className="text-gray-400">{category}</p>
                    <p className="text-gray-500 text-sm">{subcategory}</p>
                    <div className="mt-4">
                      <button className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-400">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              !loading && <p className="text-gray-500">No results found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
