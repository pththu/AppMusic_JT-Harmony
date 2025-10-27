import { useState, useEffect } from "react";

const useFetch = (fetchFunction) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchFunction();
        console.log('result', result)
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  console.log('data in useFetch:', data);

  return data;
};

export default useFetch;
