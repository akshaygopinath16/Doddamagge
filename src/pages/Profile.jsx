import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css'; // Reusing auth styles
import { User, Lock, Save } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
    const { user, login } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        try {
            const updateData = { username };
            if (password) updateData.password = password;

            const response = await api.put('/users/profile', updateData);

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            // Optionally update local storage or re-login context
            // For now, simpler to just show success. 
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>My Profile</h2>

                {message.text && (
                    <div className={message.type === 'error' ? styles.error : styles.success}
                        style={{ marginBottom: '1rem', color: message.type === 'error' ? '#ef4444' : '#10b981', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={styles.inputGroup}>
                        <User className={styles.inputIcon} size={20} />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            placeholder="Username"
                        />
                    </div>

                    <div style={{ borderTop: '1px solid var(--glass-border)', padding: '1rem 0' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>Leave blank to keep current password</p>
                        <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                            <Lock className={styles.inputIcon} size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                placeholder="New Password"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <Lock className={styles.inputIcon} size={20} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.input}
                                placeholder="Confirm New Password"
                            />
                        </div>
                    </div>

                    <button type="submit" className={styles.submitButton} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Save size={18} />
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
