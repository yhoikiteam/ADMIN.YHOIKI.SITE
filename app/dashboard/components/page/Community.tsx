// src/app/dashboard/yhoikiteam/component/CommunityEventsPage.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarAlt, // Untuk Event
  FaMapMarkerAlt, // Untuk Lokasi
  FaLink, // Untuk link online
  FaUser, // Untuk Organizer
} from 'react-icons/fa';
import { MdOutlineAccessTime } from 'react-icons/md'; // Untuk ikon waktu

// --- Reusable Components (Notification - as provided) ---
function Notification({ id, type, message, onClose }: { id: number; type: 'success' | 'info' | 'warning' | 'error'; message: string; onClose: (id: number) => void }) {
    let bgColorClass = '';
    let icon = null;
    switch (type) {
        case 'success':
            bgColorClass = 'bg-green-500';
            icon = <FaCheckCircle className="text-xl mr-2" />;
            break;
        case 'info':
            bgColorClass = 'bg-blue-500';
            icon = <FaInfoCircle className="text-xl mr-2" />;
            break;
        case 'warning':
            bgColorClass = 'bg-yellow-500';
            icon = <FaExclamationTriangle className="text-xl mr-2" />;
            break;
        case 'error':
            bgColorClass = 'bg-red-500';
            icon = <FaTimesCircle className="text-xl mr-2" />;
            break;
    }

    return (
        <div className={`flex items-center p-4 rounded-lg shadow-md text-white ${bgColorClass}`}>
            {icon}
            <span>{message}</span>
            <button onClick={() => onClose(id)} className="ml-auto text-white hover:text-gray-100">
                ×
            </button>
        </div>
    );
}

// --- Data Structures ---
interface CommunityEvent {
    id: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    location: string; // Nama lokasi fisik
    maps_url?: string; // Opsional (camelCase to snake_case for DB)
    online_link?: string; // Opsional (camelCase to snake_case for DB)
    organizer: string;
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    attendees_count?: number; // Opsional, untuk pelaporan (camelCase to snake_case for DB)
    image_url?: string; // Opsional, untuk poster event (camelCase to snake_case for DB)
}

// --- Form Component for CRUD Operations ---
function CommunityEventForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: CommunityEvent | Omit<CommunityEvent, 'id'>) => void; initialData?: CommunityEvent | null; onCancel: () => void }) {
    const [formData, setFormData] = useState<Omit<CommunityEvent, 'id'> | CommunityEvent>(
        initialData || {
            title: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            time: '09:00',
            location: '',
            maps_url: '',
            online_link: '',
            organizer: '',
            status: 'Upcoming',
            attendees_count: 0,
            image_url: '',
        }
    );

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                location: '',
                maps_url: '',
                online_link: '',
                organizer: '',
                status: 'Upcoming',
                attendees_count: 0,
                image_url: '',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Event</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Event</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Tanggal</label>
                    <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">Waktu</label>
                    <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                </div>
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi Fisik (Jika Ada)</label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="Contoh: Gedung Serbaguna, Online" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="maps_url" className="block text-sm font-medium text-gray-700">Google Maps URL (Opsional)</label>
                    <input type="url" id="maps_url" name="maps_url" value={formData.maps_url || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                    <label htmlFor="online_link" className="block text-sm font-medium text-gray-700">Link Online (Opsional)</label>
                    <input type="url" id="online_link" name="online_link" value={formData.online_link || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                </div>
            </div>
            <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">Penyelenggara</label>
                <input type="text" id="organizer" name="organizer" value={formData.organizer} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">URL Gambar/Poster Event (Opsional)</label>
                <input type="url" id="image_url" name="image_url" value={formData.image_url || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="https://example.com/event-poster.jpg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="attendees_count" className="block text-sm font-medium text-gray-700">Jumlah Peserta (Opsional)</label>
                    <input type="number" id="attendees_count" name="attendees_count" value={formData.attendees_count || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Event'}</button>
            </div>
        </form>
    );
}

// --- Main CommunityEventsPage Component ---
export default function CommunityEventsPage() {
    const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [currentEditingData, setCurrentEditingData] = useState<CommunityEvent | null>(null);
    const [notifications, setNotifications] = useState<
        { id: number; type: 'success' | 'info' | 'warning' | 'error'; message: string }[]
    >([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const addNotification = useCallback((type: 'success' | 'info' | 'warning' | 'error', message: string) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // --- Fetch Events ---
    const fetchCommunityEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/community-events');
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to fetch events');
            }
            const data: CommunityEvent[] = await response.json();
            setCommunityEvents(data);
        } catch (err: any) {
            console.error('Error fetching community events:', err);
            setError(err.message || 'Gagal memuat event komunitas.');
            addNotification('error', err.message || 'Gagal memuat event komunitas.');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchCommunityEvents();
    }, [fetchCommunityEvents]);

    // --- CRUD Operations ---
    const handleAddCommunityEvent = async (newEvent: Omit<CommunityEvent, 'id'>) => {
        try {
            const response = await fetch('/api/community-events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEvent),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to add event');
            }
            const addedEvent: CommunityEvent = await response.json();
            setCommunityEvents((prev) => [...prev, addedEvent]);
            addNotification('success', `Event "${addedEvent.title}" berhasil ditambahkan.`);
        } catch (err: any) {
            console.error('Error adding community event:', err);
            addNotification('error', err.message || 'Gagal menambahkan event.');
        } finally {
            handleCloseModal();
        }
    };

    const handleUpdateCommunityEvent = async (updatedEvent: CommunityEvent) => {
        try {
            const response = await fetch(`/api/community-events/${updatedEvent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEvent),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to update event');
            }
            const data: CommunityEvent = await response.json(); // The updated event from API
            setCommunityEvents((prev) =>
                prev.map((e) => (e.id === data.id ? data : e))
            );
            addNotification('success', `Event "${data.title}" berhasil diperbarui.`);
        } catch (err: any) {
            console.error('Error updating community event:', err);
            addNotification('error', err.message || 'Gagal memperbarui event.');
        } finally {
            handleCloseModal();
        }
    };

    const handleDeleteCommunityEvent = async (id: string, title: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus event "${title}" ini?`)) {
            try {
                const response = await fetch(`/api/community-events/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || 'Failed to delete event');
                }
                setCommunityEvents((prev) => prev.filter((e) => e.id !== id));
                addNotification('warning', `Event "${title}" berhasil dihapus.`);
            } catch (err: any) {
                console.error('Error deleting community event:', err);
                addNotification('error', err.message || 'Gagal menghapus event.');
            }
        }
    };

    // --- Form Handlers (unchanged) ---
    const handleAddClick = () => {
        setEditingId(null);
        setCurrentEditingData(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (event: CommunityEvent) => {
        setEditingId(event.id);
        setCurrentEditingData(event);
        setIsModalOpen(true);
    };

    const handleSaveCommunityEvent = (data: CommunityEvent | Omit<CommunityEvent, 'id'>) => {
        if ('id' in data && data.id) {
            handleUpdateCommunityEvent(data as CommunityEvent);
        } else {
            handleAddCommunityEvent(data as Omit<CommunityEvent, 'id'>);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setCurrentEditingData(null);
    };

    // --- Filtered Data ---
    const filteredCommunityEvents = communityEvents.filter(event =>
        Object.values(event).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="p-6 bg-white rounded-2xl shadow-xl">
            {/* Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        id={notification.id}
                        type={notification.type}
                        message={notification.message}
                        onClose={removeNotification}
                    />
                ))}
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800">Manajemen Event Komunitas</h2>
                <button
                    onClick={handleAddClick}
                    className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                    <FaPlusCircle className="mr-2" /> Tambah Event Baru
                </button>
            </div>

            <div className="mb-8 flex items-center space-x-4">
                <div className="relative flex-grow">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari Event Komunitas..."
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-600">Memuat event komunitas...</div>
            ) : error ? (
                <div className="text-center py-10 text-red-600">Error: {error}</div>
            ) : filteredCommunityEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Tidak ada event komunitas yang ditemukan.</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poster</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Event</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu & Tanggal</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi/Link</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penyelenggara</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCommunityEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {event.image_url ? (
                                            <img src={event.image_url} alt={event.title} className="h-16 w-16 object-cover rounded-md border border-gray-200 shadow-sm" />
                                        ) : (
                                            <FaCalendarAlt className="h-16 w-16 text-gray-400" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                        <div className="text-sm text-gray-500 line-clamp-2">{event.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex items-center"><FaCalendarAlt className="mr-2 text-gray-500" />{event.date}</div>
                                        <div className="flex items-center"><MdOutlineAccessTime className="mr-2 text-gray-500" />{event.time}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <div className="flex items-center mb-1">
                                            <FaMapMarkerAlt className="mr-2 text-gray-500" />
                                            {event.location}
                                        </div>
                                        {event.maps_url && (
                                            <a href={event.maps_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                <FaLink className="mr-1" /> Maps
                                            </a>
                                        )}
                                        {event.online_link && (
                                            <a href={event.online_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                                                <FaLink className="mr-1" /> Online Link
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        <div className="flex items-center">
                                            <FaUser className="mr-2 text-gray-500" /> {event.organizer}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                                            event.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {event.status}
                                        </span>
                                        {event.attendees_count !== undefined && event.attendees_count > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">({event.attendees_count} Peserta)</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleEditClick(event)}
                                                className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <FaEdit className="text-lg" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCommunityEvent(event.id, event.title)}
                                                className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                                                title="Hapus"
                                            >
                                                <FaTrash className="text-lg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl transform transition-all scale-100 opacity-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            {editingId ? 'Edit Event Komunitas' : 'Tambah Event Komunitas Baru'}
                        </h3>
                        <CommunityEventForm onSubmit={handleSaveCommunityEvent} initialData={currentEditingData} onCancel={handleCloseModal} />
                    </div>
                </div>
            )}
        </div>
    );
}