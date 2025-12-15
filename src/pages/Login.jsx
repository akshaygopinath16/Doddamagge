import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Lock, User, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        let result;
        if (isLogin) {
            result = await login(username, password);
            if (result.success) {
                navigate(result.role === 'admin' ? '/dashboard' : '/events');
            }
        } else {
            result = await register(username, password);
            if (result.success) {
                setSuccessMessage('Registration successful! Logging you in...');
                // Small delay to let user see the message
                setTimeout(async () => {
                    const loginResult = await login(username, password);
                    if (loginResult.success) {
                        navigate(loginResult.role === 'admin' ? '/dashboard' : '/events');
                    } else {
                        setError('Auto-login failed. Please sign in manually.');
                        setIsLogin(true);
                    }
                }, 1500);
                return; // Stop here to wait for timeout
            }
        }

        if (result && !result.success) {
            setError(result.message);
        }
    };

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-panel ${styles.authBox}`}
            >
                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <Shield size={32} color="white" />
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '2rem' }}>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isLogin ? 'Enter your credentials to access the admin panel' : 'Sign up to get started'}
                    </p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        <CheckCircle size={16} />
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <User className={styles.inputIcon} size={20} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock className={styles.inputIcon} size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMessage(''); }}
                            style={{ color: 'var(--accent-primary)', background: 'none', fontWeight: '600' }}
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
