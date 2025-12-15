import React from 'react';
import { LayoutDashboard, CreditCard, Calendar, LogOut, Shield, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'events', label: 'Events', icon: Calendar, path: '/events' },
    ];

    if (user?.role === 'admin') {
        menuItems.unshift(
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
            { id: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' }
        );
        menuItems.push({ id: 'users', label: 'Users', icon: User, path: '/users' });
    }

    // Add Profile for everyone
    menuItems.push({ id: 'profile', label: 'Profile', icon: User, path: '/profile' });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Shield color="white" size={24} />
                </div>
                <span className="text-gradient">AdminPanel</span>
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button onClick={handleLogout} className={`${styles.navItem} ${styles.logout}`}>
                <LogOut size={20} />
                Logout
            </button>
        </aside>
    );
};

export default Sidebar;
