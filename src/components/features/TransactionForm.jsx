import { useState } from "react";
import { useFirestore } from "../../hooks/useFirestore";

export default function TransactionForm({ uid }) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("expense"); // 'income' or 'expense'
    const { addDocument, loading } = useFirestore("transactions");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !amount) return;

        await addDocument({
            uid,
            name,
            amount: parseInt(amount, 10), // Ensure amount is a number
            type,
            date: new Date().toISOString() // Simply store ISO string for now
        });

        // Reset form
        setName("");
        setAmount("");
    };

    return (
        <div className="transaction-form-container">
            <h3>Add Transaction</h3>
            <form onSubmit={handleSubmit} className="transaction-form">
                <div className="form-row">
                    <label>
                        <span>Description</span>
                        <input
                            type="text"
                            required
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder="Rent, Groceries..."
                        />
                    </label>
                    <label>
                        <span>Amount (¥)</span>
                        <input
                            type="number"
                            required
                            onChange={(e) => setAmount(e.target.value)}
                            value={amount}
                            placeholder="0"
                        />
                    </label>
                </div>

                <div className="form-row">
                    <div className="type-selector">
                        <button
                            type="button"
                            className={type === "expense" ? "active expense" : ""}
                            onClick={() => setType("expense")}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            className={type === "income" ? "active income" : ""}
                            onClick={() => setType("income")}
                        >
                            Income
                        </button>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Adding..." : "Add Transaction"}
                    </button>
                </div>
            </form>
        </div>
    );
}
