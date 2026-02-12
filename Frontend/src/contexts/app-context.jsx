import { useEffect, useMemo, useReducer } from "react";
import { AppContext } from "@/contexts/app-context-core";

const initialState = {
  user: null,
  currentPage: "dashboard",
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT_USER": {
      return { ...state, user: action.payload || null };
    }
    case "SET_PAGE": {
      return { ...state, currentPage: action.payload };
    }
    case "UPDATE_USER": {
      if (!state.user) return state;
      const updated = { ...state.user, ...action.payload };
      return { ...state, user: updated };
    }
    case "LOGOUT": {
      try {
        localStorage.removeItem("loggedInUser");
      } catch {
        /* ignore localStorage write errors */
      }
      return { ...state, user: null, currentPage: "dashboard" };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    try {
      const saved = sessionStorage.getItem("loggedInUser");
      if (saved) {
        return { user: JSON.parse(saved), currentPage: "dashboard" };
      }
    } catch {
      /* ignore sessionStorage read errors */
    }
    return initialState;
  });

  useEffect(() => {
    if (state.user) {
      try {
        sessionStorage.setItem("loggedInUser", JSON.stringify(state.user));
      } catch {
        /* ignore sessionStorage write errors */
      }
    }
  }, [state.user]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// useApp moved to app-context-core.js to keep this file exporting only components
