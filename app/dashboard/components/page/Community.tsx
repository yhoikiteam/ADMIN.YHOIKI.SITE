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

// --- Reusable Components (Salin dari Akun.tsx/YhoikiMemberPage.tsx jika belum ada) ---

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
        &times;
      </button>
    </div>
  );
}

// --- Data Structures ---

// Jika Anda ingin mengelola detail komunitas itu sendiri (bukan hanya eventnya)
// interface Community {
//   id: string;
//   name: string;
//   description: string;
//   foundedDate: string;
//   // ... properti lain tentang komunitas
// }

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string; // Nama lokasi fisik
  googleMapsUrl?: string; // Opsional
  onlineLink?: string; // Opsional (misal: Zoom, Google Meet link)
  organizer: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  attendeesCount?: number; // Opsional, untuk pelaporan
  imageUrl?: string; // Opsional, untuk poster event
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
      googleMapsUrl: '',
      onlineLink: '',
      organizer: '',
      status: 'Upcoming',
      attendeesCount: 0,
      imageUrl: '',
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
        googleMapsUrl: '',
        onlineLink: '',
        organizer: '',
        status: 'Upcoming',
        attendeesCount: 0,
        imageUrl: '',
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
          <label htmlFor="googleMapsUrl" className="block text-sm font-medium text-gray-700">Google Maps URL (Opsional)</label>
          <input type="url" id="googleMapsUrl" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label htmlFor="onlineLink" className="block text-sm font-medium text-gray-700">Link Online (Opsional)</label>
          <input type="url" id="onlineLink" name="onlineLink" value={formData.onlineLink} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
        </div>
      </div>
      <div>
        <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">Penyelenggara</label>
        <input type="text" id="organizer" name="organizer" value={formData.organizer} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL Gambar/Poster Event (Opsional)</label>
        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="https://example.com/event-poster.jpg" />
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
          <label htmlFor="attendeesCount" className="block text-sm font-medium text-gray-700">Jumlah Peserta (Opsional)</label>
          <input type="number" id="attendeesCount" name="attendeesCount" value={formData.attendeesCount || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
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
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([
    { id: 'evt1', title: 'Webinar Pengembangan Diri', description: 'Webinar tentang tips dan trik pengembangan diri untuk komunitas Yhoiki.', date: '2025-07-15', time: '14:00', location: 'Online', onlineLink: 'https://meet.google.com/xyzabc', organizer: 'Tim Komunitas Yhoiki', status: 'Upcoming', attendeesCount: 150, imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Webinar' },
    { id: 'evt2', title: 'Kumpul Bareng Member Jakarta', description: 'Acara kumpul santai dan networking untuk member Yhoiki di area Jakarta.', date: '2025-08-01', time: '19:00', location: 'Coffee Shop XYZ', googleMapsUrl: 'https://maps.app.goo.gl/abcdef', organizer: 'Divisi Acara Yhoiki', status: 'Upcoming', attendeesCount: 50, imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Gathering' },
    { id: 'evt3', title: 'Workshop Desain Grafis', description: 'Workshop praktis dasar-dasar desain grafis menggunakan Figma.', date: '2025-06-10', time: '10:00', location: 'Gedung Komunitas Lt. 2', organizer: 'Divisi Kreatif Yhoiki', status: 'Completed', attendeesCount: 80, imageUrl: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=Workshop' },
    { id: 'evt4', title: 'Webinar Membangun Startup', description: 'Webinar tentang strategi awal membangun startup yang sukses.', date: '2025-09-05', time: '15:00', location: 'Online', onlineLink: 'https://zoom.us/j/123456789', organizer: 'Yhoiki Ventures', status: 'Upcoming', attendeesCount: 200, imageUrl: 'https://via.placeholder.com/150/FFFF33/000000?text=Startup' },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEditingData, setCurrentEditingData] = useState<CommunityEvent | null>(null);
  const [notifications, setNotifications] = useState<
    { id: number; type: 'success' | 'info' | 'warning' | 'error'; message: string }[]
  >([]);

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

  // --- CRUD Operations ---
  const _addCommunityEvent = (newEvent: Omit<CommunityEvent, 'id'>) => {
    const id = `evt${communityEvents.length + 1}-${Date.now()}`; // Unique ID
    setCommunityEvents((prev) => [...prev, { ...newEvent, id }]);
    addNotification('success', `Event "${newEvent.title}" berhasil ditambahkan.`);
  };

  const _updateCommunityEvent = (updatedEvent: CommunityEvent) => {
    setCommunityEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    addNotification('success', `Event "${updatedEvent.title}" berhasil diperbarui.`);
  };

  const deleteCommunityEvent = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus event "${title}" ini?`)) {
      setCommunityEvents((prev) => prev.filter((e) => e.id !== id));
      addNotification('warning', `Event "${title}" berhasil dihapus.`);
    }
  };

  // --- Form Handlers ---
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
      _updateCommunityEvent(data as CommunityEvent);
    } else {
      _addCommunityEvent(data as Omit<CommunityEvent, 'id'>);
    }
    handleCloseModal();
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
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="h-16 w-16 object-cover rounded-md border border-gray-200 shadow-sm" />
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
                  {event.googleMapsUrl && (
                    <a href={event.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                      <FaLink className="mr-1" /> Maps
                    </a>
                  )}
                  {event.onlineLink && (
                    <a href={event.onlineLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
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
                  {event.attendeesCount !== undefined && event.attendeesCount > 0 && (
                      <div className="text-xs text-gray-500 mt-1">({event.attendeesCount} Peserta)</div>
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
                      onClick={() => deleteCommunityEvent(event.id, event.title)}
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