import { useState, useCallback, useEffect } from "react";

const useApi = (apiFunction, args = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...params);
        setData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  useEffect(() => {
    fetchData(...args);
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;
