import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "../services/firebase"; // Need auth instance or just import from firebase/auth if user object is available

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== passwordConfirm) {
            return setError("パスワードが一致していません");
        }

        try {
            setError("");
            setLoading(true);
            const userCredential = await signup(email, password);
            await updateProfile(userCredential.user, {
                displayName: nickname
            });
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("アカウントの作成に失敗しました。");
        }
        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>新規登録</h2>
                {error && <div className="alert error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nickname">ニックネーム</label>
                        <input
                            type="text"
                            id="nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            placeholder="お名前"
                        />
                    </div>
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
                    <div className="form-group">
                        <label htmlFor="password-confirm">パスワード（確認）</label>
                        <input
                            type="password"
                            id="password-confirm"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            required
                        />
                    </div>
                    <button disabled={loading} type="submit" className="btn-primary">
                        新規登録
                    </button>
                </form>
                <div className="auth-footer">
                    アカウントをお持ちですか？ <Link to="/login">ログイン</Link>
                </div>
            </div>
        </div>
    );
}
