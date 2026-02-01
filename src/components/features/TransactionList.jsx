import { useFirestore } from "../../hooks/useFirestore";

export default function TransactionList({ transactions }) {
    const { deleteDocument } = useFirestore("transactions");

    return (
        <ul className="transaction-list">
            {transactions.map((transaction) => (
                <li key={transaction.id} className={`transaction-item ${transaction.type}`}>
                    <div className="transaction-info">
                        <p className="name">{transaction.name}</p>
                        <p className="date">
                            {transaction.date ? new Date(transaction.date).toLocaleDateString() : ""}
                        </p>
                    </div>
                    <div className="transaction-amount">
                        <span>{transaction.type === 'income' ? '+' : '-'}¥{transaction.amount}</span>
                        <button
                            className="btn-delete"
                            onClick={() => deleteDocument(transaction.id)}
                            aria-label="delete transaction"
                        >
                            x
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
