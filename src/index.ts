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
    const hash = search ? `${prefix}?${search}` : prefix;
    history.replaceState(
      null,
      "",
      location.href.replace(/(^[^#]+)#?(.*$)?/, (_, baseUrl) =>
        hash ? `${baseUrl}#${hash}` : baseUrl
      )
    );
  }
};

export const useHashParam = (
  key: string,
  defaultValue: string
): [string, (value: string | ((prev: string) => string)) => void] => {
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
        const param = value(getHashParam(key, defaultValue));
        setHashParam(key, param);
        setInnerValue(param);
      } else {
        setHashParam(key, value);
        setInnerValue(value);
      }
    },
    [key]
  );

  return [innerValue || defaultValue, setValue];
};

const serialize = JSON.stringify;
const deserialize = JSON.parse;

const getObjectHashParam = <T>(key: string, defaultValue: T): T => {
  const param = getHashParam(key, "");
  if (!param) return defaultValue;
  try {
    return deserialize(param) as T;
  } catch (error) {
    console.warn(
      new SyntaxError(
        `Failed to parse JSON ${param} of key "${key}".\n{} is used as an alternative parameter.`
      )
    );
    setHashParam(key, "{}");
    return {} as T;
  }
};

export const useObjectHashParam = <T extends object>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] => {
  const [innerValue, setInnerValue] = useState(
    getObjectHashParam(key, defaultValue)
  );

  useEffect(() => {
    const handleHashChange = () => {
      setInnerValue(getObjectHashParam(key, defaultValue));
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof value === "function") {
        const newValue = value(getObjectHashParam(key, defaultValue));
        setHashParam(key, serialize(newValue));
        setInnerValue(newValue);
      } else {
        setHashParam(key, serialize(value));
        setInnerValue(value);
      }
    },
    [key]
  );

  return [innerValue || defaultValue, setValue];
};
