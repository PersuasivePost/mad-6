import React, { createContext, useReducer, useContext } from "react";

const TaxContext = createContext();

function taxreducer(state, action) {
  switch (action.type) {
    case "SET_INCOME":
      return { ...state, income: action.payload };
    case "CALCULATE_TAX":
      // Dummy calculation; in real exam you'd compute based on state.income
      const taxAmount = parseFloat(state.income) * 0.1 || 0;
      return { ...state, taxResult: taxAmount };
    default:
      return state;
  }
}
