'use client'
import { createContext, useReducer, useEffect, useState } from "react";
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

export function StoreProvider(props) {
  // Start with default state
  const [state, dispatch] = useReducer(reducer, defaultInitialState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved data from localStorage after component mounts (client-side only)
  useEffect(() => {
    // Only run on client side
    const loadLocalStorageData = () => {
      const initialState = { ...defaultInitialState };
      
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
      
      // Load all stored data
      initialState.userData = getFromStorage('userData');
      initialState.companyData = getFromStorage('companyData');
      initialState.supplierData = getFromStorage('supplierData'); 
      initialState.customerData = getFromStorage('customerData');
      initialState.saleData = getFromStorage('saleData');
      initialState.purchaseData = getFromStorage('purchaseData');
      
      // Update state with localStorage data
      Object.entries(initialState).forEach(([key, value]) => {
        if (value !== null) {
          // Use appropriate action type based on key
          const actionType = getActionTypeForKey(key);
          if (actionType) {
            dispatch({ type: actionType, payload: value });
          }
        }
      });
      
      setIsHydrated(true);
    };
    
    loadLocalStorageData();
  }, []);
  
  // Helper function to get action type from key
  const getActionTypeForKey = (key) => {
    switch (key) {
      case 'userData': return 'SET_USER';
      case 'supplierData': return 'SAVE_SUPPLIER';
      case 'customerData': return 'SAVE_CUSTOMER';
      case 'saleData': return 'SAVE_SALE';
      case 'purchaseData': return 'SAVE_PURCHASE';
      default: return null;
    }
  };

  const value = { state, dispatch };
  
  // You can optionally render children only after hydration is complete
  // This prevents flickering from default state to hydrated state
  return (
    <useStore.Provider value={value}>
      {props.children}
    </useStore.Provider>
  );
}