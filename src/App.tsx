import React, { useState, useEffect } from "react";
import "./App.css";
import DefaultImage from "./Images/TicketBox.png"; // Import the default image

interface Item {
  id: number;
  name: string;
  description: string;
  hc_val: number;
  image: string;
}

interface Transaction {
  item: string;
  type?: "won" | "lost";
  quantity: number;
}

const CURRENCIES = {
  USD: 5.14,
  GBP: 4,
  CAD: 7.11,
  EUR: 4.99,
};

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [mode, setMode] = useState<"pnl" | "price">("pnl");
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>("USD");

  useEffect(() => {
    fetch("https://tc-api.serversia.com/items")
      .then((response) => response.json())
      .then((data) => setItems(data));
  }, []);

  const handleAddTransaction = () => {
    setTransactions([...transactions, { item: "", type: "lost", quantity: 0 }]);
  };

  const handleChange = (
    index: number,
    field: keyof Transaction,
    value: any
  ) => {
    const updatedTransactions = transactions.map((transaction, i) =>
      i === index ? { ...transaction, [field]: value } : transaction
    );
    setTransactions(updatedTransactions);
  };

  const calculate = () => {
    let hcResult: number;
    if (mode === "pnl") {
      const totalLoss = transactions
        .filter((t) => t.type === "lost")
        .reduce(
          (acc, t) =>
            acc +
            (items.find((item) => item.name === t.item)?.hc_val || 0) *
              t.quantity,
          0
        );
      const totalGain = transactions
        .filter((t) => t.type === "won")
        .reduce(
          (acc, t) =>
            acc +
            (items.find((item) => item.name === t.item)?.hc_val || 0) *
              t.quantity,
          0
        );
      hcResult = totalGain - totalLoss;
    } else {
      hcResult = transactions.reduce(
        (acc, t) =>
          acc +
          (items.find((item) => item.name === t.item)?.hc_val || 0) *
            t.quantity,
        0
      );
    }
    setResult(parseFloat(hcResult.toFixed(2)));
  };

  const clearTransactions = () => {
    if (window.confirm("Are you sure you want to clear your list?")) {
      setTransactions([]);
      setResult(null);
    }
  };

  const resultInCurrency =
    result !== null ? (result * CURRENCIES[currency]).toFixed(2) : null;

  return (
    <div className="App">
      <h1>Habbo Furni Calculator</h1>
      <div>
        <label>
          <input
            type="radio"
            value="pnl"
            checked={mode === "pnl"}
            onChange={() => setMode("pnl")}
          />
          Calculate PnL
        </label>
        <label>
          <input
            type="radio"
            value="price"
            checked={mode === "price"}
            onChange={() => setMode("price")}
          />
          Calculate Price
        </label>
      </div>
      <div className="currency-selector">
        <label>
          Currency:
          <select
            value={currency}
            onChange={(e) =>
              setCurrency(e.target.value as keyof typeof CURRENCIES)
            }
          >
            {Object.keys(CURRENCIES).map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </label>
      </div>
      {transactions.map((transaction, index) => (
        <div key={index} className="transaction">
          <select
            value={transaction.item}
            onChange={(e) => handleChange(index, "item", e.target.value)}
          >
            <option value="" disabled>
              Select item
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          {mode === "pnl" && (
            <select
              value={transaction.type || "lost"}
              onChange={(e) => handleChange(index, "type", e.target.value)}
            >
              <option value="lost">Lost</option>
              <option value="won">Won</option>
            </select>
          )}
          <input
            type="number"
            value={transaction.quantity}
            onChange={(e) =>
              handleChange(index, "quantity", parseInt(e.target.value) || 0)
            }
            placeholder="Quantity"
          />
          <div className="image-container">
            <img
              src={
                transaction.item
                  ? items.find((item) => item.name === transaction.item)
                      ?.image || DefaultImage
                  : DefaultImage
              }
              alt={transaction.item}
              className="item-image"
            />
          </div>
        </div>
      ))}
      <button onClick={handleAddTransaction}>Add Another Item</button>
      <button onClick={calculate}>Calculate</button>
      <button onClick={clearTransactions}>Clear List</button>
      {result !== null && (
        <h2>
          Your {mode === "pnl" ? "PnL" : "Price"} is: {result.toFixed(2)} HC (
          {resultInCurrency} {currency})
        </h2>
      )}
    </div>
  );
};

export default App;
