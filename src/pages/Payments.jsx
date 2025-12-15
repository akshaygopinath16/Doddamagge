import React, { useState, useEffect } from 'react';
import { Plus, Search, X, Check, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Payments.module.css';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ onClose, onSubmit, initialData }) => {
    const [amount, setAmount] = useState(initialData?.amount || '');
    const [user, setUser] = useState(initialData?.user || '');
    const [status, setStatus] = useState(initialData?.status || 'Completed');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            user,
            amount: parseFloat(amount),
            status
        });
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-panel ${styles.modal}`}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>{initialData ? 'Edit Payment' : 'Add New Payment'}</h2>
                    <button onClick={onClose}><X size={24} color="var(--text-secondary)" /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>User Name</label>
                        <input
                            className={styles.input}
                            value={user}
                            onChange={e => setUser(e.target.value)}
                            placeholder="Enter user name"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Amount (₹)</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    {/* Status selection for Admin/Edit */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Status</label>
                        <select
                            className={styles.input}
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        >
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} style={{ color: 'var(--text-secondary)', background: 'none' }}>Cancel</button>
                        <button type="submit" className={styles.addButton}>{initialData ? 'Update' : 'Confirm'}</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Payments = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);

    const fetchPayments = () => {
        setLoading(true);
        paymentService.getAll().then(data => {
            setPayments(data);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleAdd = async (data) => {
        try {
            await paymentService.create(data);
            fetchPayments();
        } catch (error) {
            console.error("Failed to create payment");
        }
    };

    const handleUpdate = async (data) => {
        try {
            await paymentService.update(editingPayment._id, data);
            fetchPayments();
            setEditingPayment(null);
        } catch (error) {
            console.error("Failed to update payment");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this payment?')) {
            try {
                await paymentService.delete(id);
                fetchPayments();
            } catch (error) {
                console.error("Failed to delete payment");
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await paymentService.updateStatus(id, 'Completed');
            fetchPayments();
        } catch (error) {
            console.error("Failed to approve payment");
        }
    };

    const openForEdit = (payment) => {
        setEditingPayment(payment);
        setModalOpen(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.controls}>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Search size={18} color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Search payments..."
                        style={{ background: 'none', border: 'none', color: 'white', outline: 'none' }}
                    />
                </div>
                <button className={styles.addButton} onClick={() => { setEditingPayment(null); setModalOpen(true); }}>
                    <Plus size={20} />
                    Add Payment
                </button>
            </div>

            <div className={`glass-panel ${styles.tableContainer}`}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Amount</th>
                            <th>Status</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading payments...</td></tr>
                        ) : payments.map((payment) => (
                            <tr key={payment._id}>
                                <td>{payment.date}</td>
                                <td>{payment.user}</td>
                                <td>₹{payment.amount.toFixed(2)}</td>
                                <td>
                                    <span className={`${styles.status} ${styles[`status${payment.status}`]}`}>
                                        {payment.status}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        {payment.status === 'Pending' && (
                                            <button onClick={() => handleApprove(payment._id)} title="Approve" style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Check size={18} />
                                            </button>
                                        )}
                                        <button onClick={() => openForEdit(payment)} title="Edit" style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(payment._id)} title="Delete" style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {modalOpen && (
                    <PaymentModal
                        onClose={() => setModalOpen(false)}
                        onSubmit={editingPayment ? handleUpdate : handleAdd}
                        initialData={editingPayment}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Payments;
