import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api/perfumes`
        );
        if (!res.ok) throw new Error("Failed to fetch perfumes");
        const data = await res.json();
        setPerfumes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, []);

  return (
    <AppContext.Provider value={{ perfumes, loading, error }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}