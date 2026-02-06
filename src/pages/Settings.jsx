import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Settings() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [nickname, setNickname] = useState(currentUser.displayName || "");
    const [email, setEmail] = useState(currentUser.email || "");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleUpdateProfile(e) {
        e.preventDefault();

        // Validation for password if provided
        if (password && password !== passwordConfirm) {
            return setError("パスワードが一致していません");
        }

        const promises = [];
        setLoading(true);
        setError("");
        setMessage("");

        if (nickname !== currentUser.displayName) {
            promises.push(updateProfile(currentUser, { displayName: nickname }));
        }
        if (email !== currentUser.email) {
            promises.push(updateEmail(currentUser, email));
        }
        if (password) {
            promises.push(updatePassword(currentUser, password));
        }

        Promise.all(promises)
            .then(() => {
                setMessage("プロフィールを更新しました");
            })
            .catch((err) => {
                console.error(err);
                if (err.code === 'auth/requires-recent-login') {
                    setError("セキュリティのため、重要な変更（メール/パスワード）を行う前に再ログインが必要です。ログアウトして再度ログインしてください。");
                } else {
                    setError("アカウントの更新に失敗しました: " + err.message);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <div className="layout-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate("/")}>← 戻る</button>
                <h2>アカウント設定</h2>
            </header>

            <div className="settings-card">
                {error && <div className="alert error">{error}</div>}
                {message && <div className="alert success">{message}</div>}

                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <label>ニックネーム</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="表示名"
                        />
                    </div>
                    <div className="form-group">
                        <label>メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>新しいパスワード（変更しない場合は空欄）</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="新しいパスワード"
                        />
                    </div>
                    <div className="form-group">
                        <label>パスワード確認</label>
                        <input
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="パスワードを再入力"
                            disabled={!password}
                        />
                    </div>

                    <button disabled={loading} className="btn-primary" type="submit">
                        更新する
                    </button>
                </form>
            </div>
        </div>
    );
}
