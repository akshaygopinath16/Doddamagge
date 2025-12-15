import React from 'react';
import Sidebar from './Sidebar';
import styles from './DashboardLayout.module.css';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children, title }) => {
    const { user } = useAuth();

    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1 className={`${styles.title} text-gradient`}>{title}</h1>

                    <div className={styles.userInfo}>
                        <button style={{ background: 'none', color: 'var(--text-secondary)' }}>
                            <Bell size={20} />
                        </button>
                        <div className={styles.avatar} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user?.username || 'Admin User'}</span>
                    </div>
                </header>

                <div className="fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
