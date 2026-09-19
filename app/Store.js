'use client'
import { createContext, useReducer } from "react";
import axios from "axios";

export const useStore = createContext();

// Every page in this app does a bare `import axios from 'axios'` and calls it
// directly (no shared instance) — setting the default header here once makes
// every one of those call sites send the token automatically.
const applyAuthHeader = (user) => {
  if (user?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initial state without localStorage access
const defaultInitialState = {
  userData: null,
  companyData: null,
  supplierData: null,
  customerData: null,
  saleData: null,
  purchaseData: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      const user = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', JSON.stringify(user));
      }
      applyAuthHeader(user);
      return { ...state, userData: user };
    case 'LOG_OUT':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
      }
      applyAuthHeader(null);
      return { ...state, userData: null };
    case 'SAVE_SUPPLIER':
      const supplier = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('supplierData', JSON.stringify(supplier));
      }
      return { ...state, supplierData: supplier };
    case 'SAVE_CUSTOMER':
      const customer = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('customerData', JSON.stringify(customer));
      }
      return { ...state, customerData: customer };
    case 'SAVE_SALE':
      const sale = action.payload;
      sale.type = 'SALE';
      if (typeof window !== 'undefined') {
        localStorage.setItem('saleData', JSON.stringify(sale));
      }
      return { ...state, saleData: sale };
    case 'SAVE_PURCHASE':
      const purchase = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('purchaseData', JSON.stringify(purchase));
      }
      return { ...state, purchaseData: purchase };
    default:
      return state;
  }
}

// Safely get data from localStorage
const getFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return null;
  }
};

// useReducer's lazy-initializer form runs synchronously during the first
// render (server: no window, falls back to defaults; client: real
// localStorage), BEFORE any component's mount effects fire — unlike loading
// this in a useEffect, which let child pages fire their own data-fetching
// effects first and send requests with no Authorization header at all.
const init = () => {
  if (typeof window === 'undefined') return defaultInitialState;

  const userData = getFromStorage('userData');
  applyAuthHeader(userData);

  return {
    ...defaultInitialState,
    userData,
    companyData: getFromStorage('companyData'),
    supplierData: getFromStorage('supplierData'),
    customerData: getFromStorage('customerData'),
    saleData: getFromStorage('saleData'),
    purchaseData: getFromStorage('purchaseData'),
  };
};

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, defaultInitialState, init);

  const value = { state, dispatch };

  return (
    <useStore.Provider value={value}>
      {props.children}
    </useStore.Provider>
  );
}