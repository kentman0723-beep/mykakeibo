import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setLoading(true);
            await login(email, password);
            navigate("/");
        } catch {
            setError("ログインに失敗しました。メールアドレスとパスワードをご確認ください。");
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>ログイン</h2>
                {error && <div className="alert error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">メールアドレス</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">パスワード</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button disabled={loading} type="submit" className="btn-primary">
                        ログイン
                    </button>
                </form>
                <div className="auth-footer">
                    アカウントをお持ちでないですか？ <Link to="/signup">新規登録</Link>
                </div>
            </div>
        </div>
    );
}
