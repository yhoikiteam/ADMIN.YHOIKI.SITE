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
  FaHandshake, // Icon for partner
  FaUserTie, // Contact person
  FaCalendarAlt, // Join Date
  FaMoneyBillWave, // Total Sales Value
  FaBoxOpen,
  FaUsers, // Total Items Added
} from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

// --- Reusable Components (Pastikan ini sudah ada atau salin dari file lain) ---
// Notifikasi
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

interface Partner {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: 'Reseller' | 'Seller' | 'Mentor'; // Tipe Mitra
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string; // Tanggal bergabung mitra
  address?: string;
  notes?: string;
  totalSalesValue?: number; // Contoh data ringkasan
  totalItemsAdded?: number; // Contoh data ringkasan
}

// --- Form Components ---
function PartnerForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: Partner | Omit<Partner, 'id'>) => void; initialData?: Partner | null; onCancel: () => void }) {
    const [formData, setFormData] = useState<Omit<Partner, 'id'> | Partner>(
      initialData || {
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        type: 'Reseller',
        status: 'Pending', // Default status for new registration
        joinDate: new Date().toISOString().split('T')[0],
        address: '',
        notes: '',
        totalSalesValue: 0,
        totalItemsAdded: 0,
      }
    );

    useEffect(() => {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          contactPerson: '',
          email: '',
          phone: '',
          type: 'Reseller',
          status: 'Pending',
          joinDate: new Date().toISOString().split('T')[0],
          address: '',
          notes: '',
          totalSalesValue: 0,
          totalItemsAdded: 0,
        });
      }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Mitra</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Kontak Person</label>
            <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Kontak</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telepon Kontak</label>
          <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat (Opsional)</label>
          <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipe Mitra</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
              <option value="Reseller">Reseller</option>
              <option value="Seller">Seller</option>
              <option value="Mentor">Mentor</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status Mitra</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">Tanggal Bergabung</label>
            <input type="date" id="joinDate" name="joinDate" value={formData.joinDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
        </div>
        {initialData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="totalSalesValue" className="block text-sm font-medium text-gray-700">Total Nilai Penjualan (Rp)</label>
                    <input type="number" id="totalSalesValue" name="totalSalesValue" value={formData.totalSalesValue} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                    <label htmlFor="totalItemsAdded" className="block text-sm font-medium text-gray-700">Total Item Ditambahkan</label>
                    <input type="number" id="totalItemsAdded" name="totalItemsAdded" value={formData.totalItemsAdded} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
                </div>
            </div>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Mitra'}</button>
        </div>
      </form>
    );
  }

// --- Main MitraPage Component ---

export default function MitraPage() {
  const [partners, setPartners] = useState<Partner[]>([
    { id: 'mitra1', name: 'Dimas F. Utama', contactPerson: 'Dimas F. Utama', email: 'dimas@example.com', phone: '081211112222', type: 'Reseller', status: 'Active', joinDate: '2023-01-10', address: 'Jakarta', notes: 'Reseller aktif produk digital', totalSalesValue: 15000000, totalItemsAdded: 50 },
    { id: 'mitra2', name: 'PT Solusi Abadi', contactPerson: 'Umar A.', email: 'umar.a@solusiabadi.com', phone: '081333334444', type: 'Seller', status: 'Active', joinDate: '2023-03-20', address: 'Bandung', notes: 'Menjual layanan IT', totalSalesValue: 75000000, totalItemsAdded: 10 },
    { id: 'mitra3', name: 'Anggun Aini', contactPerson: 'Anggun Aini', email: 'anggun@mentor.com', phone: '085755556666', type: 'Mentor', status: 'Active', joinDate: '2023-05-15', address: 'Surabaya', notes: 'Mentor coding bootcamp', totalSalesValue: 0, totalItemsAdded: 0 },
    { id: 'mitra4', name: 'Siti K. Jaya', contactPerson: 'Siti K. Jaya', email: 'siti@gamejaya.com', phone: '087877778888', type: 'Seller', status: 'Pending', joinDate: '2024-01-01', address: 'Semarang', notes: 'Menunggu verifikasi produk game', totalSalesValue: 0, totalItemsAdded: 0 },
    { id: 'mitra5', name: 'Budi Santoso', contactPerson: 'Budi Santoso', email: 'budi.s@reseller.net', phone: '082199990000', type: 'Reseller', status: 'Inactive', joinDate: '2023-10-01', address: 'Yogyakarta', notes: 'Reseller non-aktif, perlu follow-up', totalSalesValue: 5000000, totalItemsAdded: 20 },
  ]);

  const [searchTermPartners, setSearchTermPartners] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEditingData, setCurrentEditingData] = useState<Partner | null>(null);
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

  // --- CRUD Partners ---
  const _addPartner = (newPartner: Omit<Partner, 'id'>) => {
    const id = `mitra${partners.length + 1}-${Date.now()}`;
    const partnerToAdd = { ...newPartner, id };
    setPartners((prev) => [...prev, partnerToAdd]);
    addNotification('success', `Mitra "${newPartner.name}" berhasil didaftarkan.`);
    if (newPartner.status === 'Pending') {
      addNotification('info', `Mitra baru "${newPartner.name}" sedang menunggu verifikasi.`);
    }
  };

  const _updatePartner = (updatedPartner: Partner) => {
    setPartners((prev) =>
      prev.map((p) => (p.id === updatedPartner.id ? updatedPartner : p))
    );
    addNotification('success', `Data mitra "${updatedPartner.name}" berhasil diperbarui.`);
  };

  const deletePartner = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus mitra "${name}" ini?`)) {
      setPartners((prev) => prev.filter((p) => p.id !== id));
      addNotification('warning', `Mitra "${name}" berhasil dihapus.`);
    }
  };

  // --- Form Handlers ---
  const handleAddClick = () => {
    setEditingId(null);
    setCurrentEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (partner: Partner) => {
    setEditingId(partner.id);
    setCurrentEditingData(partner);
    setIsModalOpen(true);
  };

  const handleSaveData = (data: Partner | Omit<Partner, 'id'>) => {
    if ('id' in data && data.id) {
      _updatePartner(data as Partner);
    } else {
      _addPartner(data as Omit<Partner, 'id'>);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setCurrentEditingData(null);
  };

  // --- Filtered Data ---
  const filteredPartners = partners.filter(partner =>
    Object.values(partner).some(val =>
      String(val).toLowerCase().includes(searchTermPartners.toLowerCase())
    )
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
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

      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Manajemen Mitra Yhoiki</h1>

      {/* Overview Statistics (Similar to Dashboard/Pedanaan) */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ringkasan Mitra</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total Mitra Aktif</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{partners.filter(p => p.status === 'Active').length}</p>
            </div>
            <FaHandshake className="text-blue-500 text-5xl" />
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Mitra Menunggu Verifikasi</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{partners.filter(p => p.status === 'Pending').length}</p>
            </div>
            <FaInfoCircle className="text-purple-500 text-5xl" />
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Total Mitra Terdaftar</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{partners.length}</p>
            </div>
            <FaUsers className="text-yellow-500 text-5xl" />
          </div>
        </div>
      </div>

      {/* Section: Manage Partners */}
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Daftar Mitra</h2>
          <button
            onClick={handleAddClick}
            className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <FaPlusCircle className="mr-2" /> Tambah Mitra Baru
          </button>
        </div>

        <div className="mb-6 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Mitra..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
            value={searchTermPartners}
            onChange={(e) => setSearchTermPartners(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mitra</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ringkasan Aktivitas</th> {/* New column */}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                    <div className="text-xs text-gray-500 flex items-center"><FaCalendarAlt className="mr-1" /> Bergabung: {partner.joinDate}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center"><FaUserTie className="mr-2 text-gray-500" />{partner.contactPerson}</div>
                    <div className="flex items-center"><MdEmail className="mr-2 text-gray-500" /><a href={`mailto:${partner.email}`} className="text-blue-600 hover:underline">{partner.email}</a></div>
                    <div className="flex items-center"><MdPhone className="mr-2 text-gray-500" /><a href={`tel:${partner.phone}`} className="text-blue-600 hover:underline">{partner.phone}</a></div>
                    {partner.address && <div className="flex items-center"><MdLocationOn className="mr-2 text-gray-500" />{partner.address}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{partner.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      partner.status === 'Active' ? 'bg-green-100 text-green-800' :
                      partner.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                      {partner.totalSalesValue !== undefined && partner.totalSalesValue > 0 && (
                          <div className="flex items-center"><FaMoneyBillWave className="mr-2 text-gray-500" />Penjualan: Rp {partner.totalSalesValue.toLocaleString('id-ID')}</div>
                      )}
                      {partner.totalItemsAdded !== undefined && partner.totalItemsAdded > 0 && (
                          <div className="flex items-center"><FaBoxOpen className="mr-2 text-gray-500" />Item Ditambahkan: {partner.totalItemsAdded}</div>
                      )}
                      {(partner.totalSalesValue === 0 || partner.totalSalesValue === undefined) &&
                       (partner.totalItemsAdded === 0 || partner.totalItemsAdded === undefined) &&
                       'Belum ada aktivitas'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditClick(partner)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Edit Mitra"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => deletePartner(partner.id, partner.name)}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Hapus Mitra"
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
      </div>

      {/* Modal for Add/Edit Partner */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl transform transition-all scale-100 opacity-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {editingId ? 'Edit Data Mitra' : 'Daftarkan Mitra Baru'}
            </h3>
            <PartnerForm
              onSubmit={handleSaveData}
              initialData={currentEditingData}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}