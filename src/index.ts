import { useCallback, useEffect, useState } from "react";

const getHashSearchParams = (location: Location): [string, URLSearchParams] => {
  const hash = location.hash.slice(1);
  const [prefix, query] = hash.split("?");

  return [prefix, new URLSearchParams(query)];
};

const getHashParam = (key: string, defaultValue: string) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const [, searchParams] = getHashSearchParams(window.location);
  return searchParams.get(key) || "";
};

const setHashParam = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    const [prefix, searchParams] = getHashSearchParams(window.location);

    if (typeof value === "undefined" || value === "") {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }

    const search = searchParams.toString();
    window.location.hash = search ? `${prefix}?${search}` : prefix;
  }
};

const useHashParam = (key: string, defaultValue: string) => {
  const [innerValue, setInnerValue] = useState(getHashParam(key, defaultValue));

  useEffect(() => {
    const handleHashChange = () =>
      setInnerValue(getHashParam(key, defaultValue));
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [key]);

  const setValue = useCallback(
    (value: string | ((prev: string) => string)) => {
      if (typeof value === "function") {
        setHashParam(key, value(getHashParam(key, defaultValue)));
      } else {
        setHashParam(key, value);
      }
    },
    [key]
  );

  return [innerValue || defaultValue, setValue];
};
export default useHashParam;
