import React, { useState, useEffect } from 'react';
import { Calendar, Upload, MapPin, Plus, ArrowLeft, Image as ImageIcon, Trash2, Edit2, CheckCircle, Clock } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';
import styles from './Events.module.css';
import paymentsStyles from './Payments.module.css';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EventForm = ({ onCancel, onSubmit, initialData }) => {
    const [dragActive, setDragActive] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        date: initialData?.date || '',
        location: initialData?.location || '',
        description: initialData?.description || ''
    });
    const [file, setFile] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('date', formData.date);
        data.append('location', formData.location);
        data.append('description', formData.description);
        if (file) {
            data.append('image', file);
        }
        onSubmit(data);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ padding: '2rem' }}
        >
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={onCancel} style={{ color: 'var(--text-secondary)', background: 'none' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                    {initialData ? 'Edit Event' : 'Create New Event'}
                </h2>
            </div>

            <form className={styles.formContainer} onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className={paymentsStyles.formGroup}>
                        <label className={paymentsStyles.label}>Event Title</label>
                        <input
                            className={paymentsStyles.input}
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Annual Gala"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className={paymentsStyles.formGroup}>
                            <label className={paymentsStyles.label}>Date</label>
                            <div className={styles.datePickerWrapper}>
                                <DatePicker
                                    selected={formData.date ? new Date(formData.date) : null}
                                    onChange={(date) => setFormData({ ...formData, date: date ? date.toISOString().split('T')[0] : '' })}
                                    dateFormat="dd/MM/yyyy"
                                    className={paymentsStyles.input}
                                    placeholderText="dd/mm/yyyy"
                                    required
                                    wrapperClassName={styles.datePickerFull}
                                />
                            </div>
                        </div>
                        <div className={paymentsStyles.formGroup}>
                            <label className={paymentsStyles.label}>Location</label>
                            <input
                                className={paymentsStyles.input}
                                required
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Grand Hall"
                            />
                        </div>
                    </div>

                    <div className={paymentsStyles.formGroup}>
                        <label className={paymentsStyles.label}>Description</label>
                        <textarea
                            className={paymentsStyles.input}
                            rows={4}
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the event..."
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label className={paymentsStyles.label}>Event Banner</label>
                    <div
                        className={styles.dropzone}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        style={{ borderColor: dragActive ? 'var(--accent-primary)' : 'var(--glass-border)' }}
                    >
                        {file ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-primary)' }}>{file.name}</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Click to change</p>
                            </div>
                        ) : (
                            <>
                                <Upload size={32} color="var(--text-secondary)" />
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    Drag & drop image here or <span style={{ color: 'var(--accent-primary)', cursor: 'pointer' }}>browse</span>
                                </p>
                            </>
                        )}
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            accept="image/*"
                        />
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onCancel} style={{ color: 'var(--text-secondary)', background: 'none' }}>Cancel</button>
                        <button type="submit" className={styles.addButton}>
                            {initialData ? 'Update Event' : 'Publish Event'}
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

const Events = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [view, setView] = useState('list'); // 'list', 'create', 'edit'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState(null);
    const { addToast } = useToast();

    const fetchEvents = () => {
        setLoading(true);
        eventService.getAll().then(data => {
            setEvents(data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to load events", err);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreate = async (eventData) => {
        try {
            await eventService.create(eventData);
            fetchEvents();
            setView('list');
            addToast("Event created successfully", "success");
        } catch (error) {
            console.error("Failed to create event", error);
            addToast(error.response?.data?.message || "Failed to create event", "error");
        }
    };

    const handleUpdate = async (eventData) => {
        try {
            await eventService.update(editingEvent._id, eventData);
            fetchEvents();
            setView('list');
            setEditingEvent(null);
            addToast("Event updated successfully", "success");
        } catch (error) {
            console.error("Failed to update event", error);
            addToast(error.response?.data?.message || "Failed to update event", "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventService.delete(id);
                fetchEvents();
                addToast("Event deleted successfully", "success");
            } catch (error) {
                console.error("Failed to delete event", error);
                addToast("Failed to delete event", "error");
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await eventService.updateStatus(id, 'approved');
            fetchEvents();
            addToast("Event approved and email sent", "success");
        } catch (error) {
            console.error("Failed to approve event", error);
            addToast("Failed to approve event", "error");
        }
    };

    const startEdit = (event) => {
        setEditingEvent(event);
        setView('edit');
    };

    if (view === 'create') {
        return <EventForm onCancel={() => setView('list')} onSubmit={handleCreate} />;
    }

    if (view === 'edit') {
        return <EventForm onCancel={() => { setView('list'); setEditingEvent(null); }} onSubmit={handleUpdate} initialData={editingEvent} />;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Upcoming Events</h2>
                <button className={styles.addButton} onClick={() => setView('create')}>
                    <Plus size={20} />
                    Create Event
                </button>
            </div>

            <div className={styles.grid}>
                {loading ? (
                    <div style={{ color: 'var(--text-secondary)' }}>Loading events...</div>
                ) : events.map((event) => (
                    <motion.div
                        key={event._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.eventCard}
                    >
                        <div className={styles.cardImage}>
                            {event.image ? (
                                <img
                                    src={`http://localhost:5000${event.image}`}
                                    alt={event.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                                />
                            ) : (
                                <ImageIcon size={40} opacity={0.5} />
                            )}

                            {/* Status Badge for Admin */}
                            {isAdmin && (
                                <div style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    background: event.status === 'approved' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {event.status === 'approved' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                    {event.status === 'approved' ? 'Approved' : 'Pending'}
                                </div>
                            )}
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.cardDate}>
                                <Calendar size={14} />
                                {event.date}
                            </div>
                            <h3 className={styles.cardTitle}>{event.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <MapPin size={14} />
                                {event.location}
                            </div>
                            <p className={styles.cardDesc}>{event.description}</p>

                            {/* Admin Actions */}
                            {isAdmin && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    {event.status === 'pending' && (
                                        <button
                                            onClick={() => handleApprove(event._id)}
                                            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                                            title="Approve Event"
                                        >
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                    )}
                                    <button
                                        onClick={() => startEdit(event)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                        title="Edit Event"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event._id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        title="Delete Event"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Events;
