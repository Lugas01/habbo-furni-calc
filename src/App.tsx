import React, { useState, useEffect } from "react";
import "./App.css";
import DefaultImage from "./Images/TicketBox.png";
import Logo from "./Images/lugas.png"; // Import the logo

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

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [mode, setMode] = useState<"pnl" | "price">("pnl");

  useEffect(() => {
    fetch("https://tc-api.serversia.com/items")
      .then((response) => response.json())
      .then((data) => setItems(data));
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js";
    script.async = true;

    script.onload = () => {
      try {
        if (window.kofiWidgetOverlay) {
          window.kofiWidgetOverlay.draw("lugas", {
            type: "floating-chat",
            "floating-chat.donateButton.text": "Support me",
            "floating-chat.donateButton.background-color": "#00b9fe",
            "floating-chat.donateButton.text-color": "#fff",
          });
        }
      } catch (error) {
        console.error("Error loading Ko-fi widget:", error);
      }
    };

    script.onerror = (error) => {
      console.error("Script load error:", error);
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
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

  return (
    <div className="App">
      <img src={Logo} alt="Logo" className="logo" />
      <p className="made-by">Made by Lugas</p>
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
      <button onClick={handleAddTransaction}>Add Item</button>
      <button onClick={calculate}>Calculate</button>
      <button onClick={clearTransactions}>Clear List</button>
      {result !== null && (
        <h2>
          Your {mode === "pnl" ? "PnL" : "Price"} is: {result.toFixed(2)} HC
        </h2>
      )}
      <p className="eth-donations">
        ETH donations: 0xd20fe36F1287D215a86FfdBe830BA6D5c5bFB297
      </p>
      <footer>
        <p>
          Prices calculated based on{" "}
          <a href="https://traderclub.gg/">TraderClub.gg</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
