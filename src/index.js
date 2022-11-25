"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const getHashSearchParams = (location) => {
    const hash = location.hash.slice(1);
    const [prefix, query] = hash.split("?");
    return [prefix, new URLSearchParams(query)];
};
const getHashParam = (key, defaultValue) => {
    if (typeof window === "undefined") {
        return defaultValue;
    }
    const [, searchParams] = getHashSearchParams(window.location);
    return searchParams.get(key) || "";
};
const setHashParam = (key, value) => {
    if (typeof window !== "undefined") {
        const [prefix, searchParams] = getHashSearchParams(window.location);
        if (typeof value === "undefined" || value === "") {
            searchParams.delete(key);
        }
        else {
            searchParams.set(key, value);
        }
        const search = searchParams.toString();
        const hash = search ? `${prefix}?${search}` : prefix;
        history.replaceState(null, "", location.href.replace(/(^[^#]+)#?(.*$)?/, (_, baseUrl) => hash ? `${baseUrl}#${hash}` : baseUrl));
    }
};
const useHashParam = (key, defaultValue) => {
    const [innerValue, setInnerValue] = (0, react_1.useState)(getHashParam(key, defaultValue));
    (0, react_1.useEffect)(() => {
        const handleHashChange = () => setInnerValue(getHashParam(key, defaultValue));
        handleHashChange();
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [key]);
    const setValue = (0, react_1.useCallback)((value) => {
        if (typeof value === "function") {
            const param = value(getHashParam(key, defaultValue));
            setHashParam(key, param);
            setInnerValue(param);
        }
        else {
            setHashParam(key, value);
            setInnerValue(value);
        }
    }, [key]);
    return [innerValue || defaultValue, setValue];
};
exports.default = useHashParam;
