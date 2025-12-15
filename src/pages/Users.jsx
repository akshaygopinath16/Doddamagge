import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Payments.module.css'; // Reusing table styles
import { Shield, User, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth(); // To avoid editing self if needed
    const { addToast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await userService.getAll();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
            addToast("Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await userService.updateRole(userId, newRole);
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            addToast(`Role updated to ${newRole}`, "success");
        } catch (error) {
            console.error("Failed to update role", error);
            addToast("Failed to update role", "error");
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const updatedUser = await userService.toggleStatus(userId);
            setUsers(users.map(u => u._id === userId ? { ...u, isActive: updatedUser.isActive } : u));

            const action = updatedUser.isActive ? "Activated" : "Deactivated";
            addToast(`User ${action} successfully`, "success");
        } catch (error) {
            console.error("Failed to toggle status", error);
            addToast("Failed to update status", "error");
        }
    };

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading users...</div>;

    return (
        <div style={{ padding: '0 1rem' }}>
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <motion.tr
                                key={u._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <User size={16} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{u.username}</span>
                                        {currentUser._id === u._id && <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>(You)</span>}
                                    </div>
                                </td>
                                <td>
                                    <span className={u.role === 'admin' ? styles.statusCompleted : styles.statusPending}>
                                        {u.role === 'admin' ? <Shield size={12} style={{ marginRight: 4 }} /> : null}
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td>
                                    <span style={{
                                        color: u.isActive ? '#10b981' : '#ef4444',
                                        display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem'
                                    }}>
                                        {u.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                        className={styles.input}
                                        style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.875rem' }}
                                        disabled={currentUser._id === u._id}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                                            disabled={currentUser._id === u._id || u.isActive}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid #10b981',
                                                background: u.isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                                color: '#10b981',
                                                opacity: (currentUser._id === u._id || u.isActive) ? 0.4 : 1,
                                                cursor: (currentUser._id === u._id || u.isActive) ? 'not-allowed' : 'pointer',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            Activate
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                                            disabled={currentUser._id === u._id || !u.isActive}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ef4444',
                                                background: !u.isActive ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                                color: '#ef4444',
                                                opacity: (currentUser._id === u._id || !u.isActive) ? 0.4 : 1,
                                                cursor: (currentUser._id === u._id || !u.isActive) ? 'not-allowed' : 'pointer',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            Deactivate
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
