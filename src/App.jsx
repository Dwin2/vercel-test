// Minimal React + Supabase CRUD example
// Paste this into src/App.jsx (or src/App.tsx with small tweaks)
// You'll also need environment variables set (see the chat for step-by-step setup).

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize once per app with env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchItems() {
    setError("");
    const { data, error } = await supabase
      .from("items")
      .select("id, text, created_at")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setItems(data || []);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function addItem(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase
        .from("items")
        .insert({ text })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) => [data, ...prev]);
      setText("");
    } catch (err) {
      setError(err.message || "Failed to add");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id) {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message || "Failed to remove");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Items</h1>

        <form onSubmit={addItem} className="flex gap-2 mb-4">
          <input
            className="flex-1 rounded-xl border p-3 bg-white"
            placeholder="Add a new item..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="rounded-xl px-4 py-3 bg-black text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Working..." : "Add"}
          </button>
        </form>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-xl border bg-white p-3"
            >
              <div className="flex flex-col">
                <span className="font-medium">{item.text}</span>
                <span className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="rounded-lg border px-3 py-2 hover:bg-gray-50"
                aria-label={`Delete ${item.text}`}
              >
                ×
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-gray-500">No items yet — add one above.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
