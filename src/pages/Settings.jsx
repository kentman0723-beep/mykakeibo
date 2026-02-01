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
            return setError("Passwords do not match");
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
                setMessage("Profile updated successfully");
            })
            .catch((err) => {
                console.error(err);
                if (err.code === 'auth/requires-recent-login') {
                    setError("セキュリティのため、重要な変更（メール/パスワード）を行う前に再ログインが必要です。ログアウトして再度ログインしてください。");
                } else {
                    setError("Failed to update account: " + err.message);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <div className="layout-container">
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate("/")}>← Back</button>
                <h2>Account Settings</h2>
            </header>

            <div className="settings-card">
                {error && <div className="alert error">{error}</div>}
                {message && <div className="alert success">{message}</div>}

                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <label>Nickname</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Display Name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password (Leave blank to keep)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New Password"
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="Confirm New Password"
                            disabled={!password}
                        />
                    </div>

                    <button disabled={loading} className="btn-primary" type="submit">
                        Update Profile
                    </button>
                </form>
            </div>
        </div>
    );
}
