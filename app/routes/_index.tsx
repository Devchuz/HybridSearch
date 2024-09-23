import { useState } from "react";

export default function Index() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener la URL de la API desde variables de entorno
  const apiUrl = "https://devchuz-api-query.hf.space/search/";

  const handleSearch = async () => {
    if (!query) {
      setError("Please enter a search query.");
      return;
    }

    setLoading(true);
    setError(null); // Limpiar errores previos

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "application/json",
        },
        body: JSON.stringify({ query_text: query }), // Enviar query_text correctamente
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from API:', data);  // Imprimir los datos obtenidos

      setResults(data.results || []);
    } catch (err: any) {
      console.error('Fetch error:', err);  // Imprimir el error completo
      setError(`An error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-2xl text-center mt-16">
        <h1 className="text-4xl font-bold mb-6 text-white">Hybrid Search API</h1>

        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search term"
            className="border p-3 rounded w-full mb-4 text-white bg-gray-700 placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-500"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-white">Results:</h2>
          <div className="grid grid-cols-1 gap-4">
            {results.length > 0 ? (
              results.map((result) => {
                const [category, subcategory] = result.payload?.text.split("\n") || ["No category", "No subcategory"];
                return (
                  <div
                    key={result.id}
                    className="bg-white shadow-lg rounded-lg p-4 border hover:shadow-2xl transition duration-300 ease-in-out"
                  >
                    <p className="text-gray-700 font-semibold">{category}</p>
                    <p className="text-gray-500">{subcategory}</p>
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
