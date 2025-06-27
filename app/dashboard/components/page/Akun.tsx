'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FaHandshake,
  FaMoneyCheckAlt,
  FaUsers,
  FaBuilding,
  FaSearch,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaUserCircle,
} from 'react-icons/fa';
import { MdApartment, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

// --- Reusable Components (from Dashboard.tsx or similar design) ---

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
    default:
      bgColorClass = 'bg-gray-500';
      break;
  }

  return (
    <div
      className={`flex items-center p-4 rounded-lg shadow-md text-white transition-all duration-300 transform translate-x-0 ${bgColorClass}`}
    >
      {icon}
      <span>{message}</span>
      <button onClick={() => onClose(id)} className="ml-4 text-white hover:text-gray-200">
        &times;
      </button>
    </div>
  );
}

// Reusable Modal Component
function Modal({ title, children, isOpen, onClose }: { title: string; children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl animate-fade-in-up transform scale-95 md:scale-100">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Data Structures (for dummy data) ---

interface Partnership {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Aktif' | 'Pending' | 'Selesai';
  type: 'Media' | 'Sponsor' | 'Komunitas' | 'Lain-lain';
  startDate: string;
}

interface Investor {
  id: string;
  name: string;
  contactEmail: string;
  amountInvested: number;
  investmentDate: string;
  status: 'Aktif' | 'Pasif';
  notes: string;
}

interface Mitra {
  id: string;
  name: string;
  type: 'Reseller' | 'Seller';
  division: string;
  joinDate: string;
  status: 'Aktif' | 'Nonaktif';
}

interface Division {
  id: string;
  name: string;
  head: string;
  description: string;
  totalMembers: number;
}

interface YhoikiAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer' | 'Member'; // Contoh role
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
}

// --- Form Components for CRUD Operations ---
// PASTIKAN SEMUA KOMPONEN FORM INI DIDEFINISIKAN SEBELUM ManageAccountsPage

function PartnershipForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: Partnership | Omit<Partnership, 'id'>) => void; initialData?: Partnership | null; onCancel: () => void }) {
  const [formData, setFormData] = useState<Omit<Partnership, 'id'> | Partnership>(
    initialData || {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      status: 'Pending',
      type: 'Lain-lain',
      startDate: new Date().toISOString().split('T')[0],
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
        status: 'Pending',
        type: 'Lain-lain',
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Perusahaan</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Kontak Person</label>
        <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telepon</label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="Aktif">Aktif</option>
          <option value="Pending">Pending</option>
          <option value="Selesai">Selesai</option>
        </select>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipe Partnership</label>
        <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="Media">Media</option>
          <option value="Sponsor">Sponsor</option>
          <option value="Komunitas">Komunitas</option>
          <option value="Lain-lain">Lain-lain</option>
        </select>
      </div>
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
        <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Partnership'}</button>
      </div>
    </form>
  );
}

function InvestorForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: Investor | Omit<Investor, 'id'>) => void; initialData?: Investor | null; onCancel: () => void }) {
  const [formData, setFormData] = useState<Omit<Investor, 'id'> | Investor>(
    initialData || {
      name: '',
      contactEmail: '',
      amountInvested: 0,
      investmentDate: new Date().toISOString().split('T')[0],
      status: 'Aktif',
      notes: '',
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        contactEmail: '',
        amountInvested: 0,
        investmentDate: new Date().toISOString().split('T')[0],
        status: 'Aktif',
        notes: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amountInvested' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Investor</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Email Kontak</label>
        <input type="email" id="contactEmail" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="amountInvested" className="block text-sm font-medium text-gray-700">Jumlah Investasi (Rp)</label>
        <input type="number" id="amountInvested" name="amountInvested" value={formData.amountInvested} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="investmentDate" className="block text-sm font-medium text-gray-700">Tanggal Investasi</label>
        <input type="date" id="investmentDate" name="investmentDate" value={formData.investmentDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="Aktif">Aktif</option>
          <option value="Pasif">Pasif</option>
        </select>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Investor'}</button>
      </div>
    </form>
  );
}

function MitraForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: Mitra | Omit<Mitra, 'id'>) => void; initialData?: Mitra | null; onCancel: () => void }) {
  const [formData, setFormData] = useState<Omit<Mitra, 'id'> | Mitra>(
    initialData || {
      name: '',
      type: 'Reseller',
      division: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'Aktif',
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        type: 'Reseller',
        division: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Aktif',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const availableDivisions = ['Service', 'Academy', 'Hosting', 'Store Game', 'Apparel', 'Food', 'Umum', 'Lain-lain'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Mitra</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipe Mitra</label>
        <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="Reseller">Reseller</option>
          <option value="Seller">Seller</option>
        </select>
      </div>
      <div>
        <label htmlFor="division" className="block text-sm font-medium text-gray-700">Divisi</label>
        <select id="division" name="division" value={formData.division} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="">Pilih Divisi</option>
          {availableDivisions.map(div => <option key={div} value={div}>{div}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">Tanggal Bergabung</label>
        <input type="date" id="joinDate" name="joinDate" value={formData.joinDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Mitra'}</button>
      </div>
    </form>
  );
}

function DivisionForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: Division | Omit<Division, 'id'>) => void; initialData?: Division | null; onCancel: () => void }) {
  const [formData, setFormData] = useState<Omit<Division, 'id'> | Division>(
    initialData || {
      name: '',
      head: '',
      description: '',
      totalMembers: 0,
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        head: '',
        description: '',
        totalMembers: 0,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalMembers' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Divisi</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="head" className="block text-sm font-medium text-gray-700">Kepala Divisi</label>
        <input type="text" id="head" name="head" value={formData.head} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
      </div>
      <div>
        <label htmlFor="totalMembers" className="block text-sm font-medium text-gray-700">Total Anggota</label>
        <input type="number" id="totalMembers" name="totalMembers" value={formData.totalMembers} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Divisi'}</button>
      </div>
    </form>
  );
}

function YhoikiAccountForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: YhoikiAccount | Omit<YhoikiAccount, 'id'>) => void; initialData?: YhoikiAccount | null; onCancel: () => void }) {
  const [formData, setFormData] = useState<Omit<YhoikiAccount, 'id'> | YhoikiAccount>(
    initialData || {
      name: '',
      email: '',
      role: 'Member',
      status: 'Pending',
      joinDate: new Date().toISOString().split('T')[0],
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Member',
        status: 'Pending',
        joinDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Akun</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
        <select id="role" name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
          <option value="Member">Member</option>
        </select>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
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
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Akun Yhoiki'}</button>
      </div>
    </form>
  );
}


// --- Main Management Page Component ---

export default function ManageAccountsPage() {
  const [activeTab, setActiveTab] = useState<'partnerships' | 'investors' | 'mitra' | 'divisions' | 'yhoiki'>('partnerships');
  const [notifications, setNotifications] = useState<
    { id: number; type: 'success' | 'info' | 'warning' | 'error'; message: string }[]
  >([]);

  // State for data
  const [partnerships, setPartnerships] = useState<Partnership[]>([
    { id: 'p1', name: 'PT Solusi Digital', contactPerson: 'Budi Santoso', email: 'budi@solusidigital.com', phone: '081234567890', status: 'Aktif', type: 'Media', startDate: '2024-01-15' },
    { id: 'p2', name: 'Komunitas Startup Muda', contactPerson: 'Rina Wijaya', email: 'rina@startupmuda.org', phone: '087654321098', status: 'Pending', type: 'Komunitas', startDate: '2024-03-01' },
    { id: 'p3', name: 'Global Event Organizer', contactPerson: 'David Lee', email: 'david@global.com', phone: '085012345678', status: 'Selesai', type: 'Sponsor', startDate: '2023-11-20' },
  ]);

  const [investors, setInvestors] = useState<Investor[]>([
    { id: 'i1', name: 'Visionary Capital', contactEmail: 'info@visionary.com', amountInvested: 500000000, investmentDate: '2023-08-10', status: 'Aktif', notes: 'Lead investor untuk seed funding.' },
    { id: 'i2', name: 'Angel Investor A', contactEmail: 'angel.a@example.com', amountInvested: 100000000, investmentDate: '2024-02-20', status: 'Aktif', notes: 'Fokus pada pengembangan AI.' },
    { id: 'i3', name: 'PT Dana Mandiri', contactEmail: 'dana@mandiri.co.id', amountInvested: 200000000, investmentDate: '2023-01-05', status: 'Pasif', notes: 'Investasi awal, belum ada interaksi lebih lanjut.' },
  ]);

  const [mitra, setMitra] = useState<Mitra[]>([
    { id: 'm1', name: 'Andi Wijaya', type: 'Reseller', division: 'Apparel', joinDate: '2024-04-01', status: 'Aktif' },
    { id: 'm2', name: 'Siti K. Game Store', type: 'Seller', division: 'Store Game', joinDate: '2023-11-15', status: 'Aktif' },
    { id: 'm3', name: 'Budi Food Supply', type: 'Reseller', division: 'Food', joinDate: '2024-01-20', status: 'Nonaktif' },
  ]);

  const [divisions, setDivisions] = useState<Division[]>([
    { id: 'd1', name: 'Service', head: 'John Doe', description: 'Menyediakan layanan pengembangan IT.', totalMembers: 50 },
    { id: 'd2', name: 'Academy', head: 'Jane Smith', description: 'Pusat pelatihan dan edukasi digital.', totalMembers: 30 },
    { id: 'd3', name: 'Hosting', head: 'Robert Johnson', description: 'Layanan hosting server dan cloud.', totalMembers: 25 },
    { id: 'd4', name: 'Store Game', head: 'Emily Brown', description: 'Penjualan game dan aksesoris gaming.', totalMembers: 15 },
    { id: 'd5', name: 'Apparel', head: 'Michael Davis', description: 'Produksi dan penjualan pakaian.', totalMembers: 20 },
    { id: 'd6', name: 'Sarah Wilson', head: 'Michael Davis', description: 'Divisi makanan dan minuman.', totalMembers: 18 },
  ]);

  const [yhoikiAccounts, setYhoikiAccounts] = useState<YhoikiAccount[]>([
    { id: 'yh1', name: 'Admin Yhoiki 1', email: 'admin1@yhoiki.com', role: 'Admin', status: 'Active', joinDate: '2023-01-01' },
    { id: 'yh2', name: 'Editor Tim A', email: 'editora@yhoiki.com', role: 'Editor', status: 'Active', joinDate: '2023-03-10' },
    { id: 'yh3', name: 'Viewer Dashboard', email: 'viewer@yhoiki.com', role: 'Viewer', status: 'Pending', joinDate: '2024-02-05' },
  ]);

  // State for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null); // To store item being edited

  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');

  const addNotification = useCallback((type: 'success' | 'info' | 'warning' | 'error', message: string) => {
    const newId = notifications.length > 0 ? Math.max(...notifications.map((n) => n.id)) + 1 : 1;
    setNotifications((prev) => [...prev, { id: newId, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newId));
    }, 5000);
  }, [notifications]);

  // --- Internal CRUD operations (called by handleSave functions) ---
  const _addPartnership = (newPartnership: Omit<Partnership, 'id'>) => {
    const id = `p${partnerships.length + 1}`; // Simple ID generation
    setPartnerships((prev) => [...prev, { ...newPartnership, id }]);
    addNotification('success', `Partnership "${newPartnership.name}" berhasil ditambahkan.`);
  };

  const _updatePartnership = (updatedPartnership: Partnership) => {
    setPartnerships((prev) =>
      prev.map((p) => (p.id === updatedPartnership.id ? updatedPartnership : p))
    );
    addNotification('success', `Partnership "${updatedPartnership.name}" berhasil diperbarui.`);
  };

  const deletePartnership = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus partnership ini?')) {
      setPartnerships((prev) => prev.filter((p) => p.id !== id));
      addNotification('warning', 'Partnership berhasil dihapus.');
    }
  };

  const _addInvestor = (newInvestor: Omit<Investor, 'id'>) => {
    const id = `i${investors.length + 1}`;
    setInvestors((prev) => [...prev, { ...newInvestor, id }]);
    addNotification('success', `Investor "${newInvestor.name}" berhasil ditambahkan.`);
  };

  const _updateInvestor = (updatedInvestor: Investor) => {
    setInvestors((prev) =>
      prev.map((i) => (i.id === updatedInvestor.id ? updatedInvestor : i))
    );
    addNotification('success', `Investor "${updatedInvestor.name}" berhasil diperbarui.`);
  };

  const deleteInvestor = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus investor ini?')) {
      setInvestors((prev) => prev.filter((i) => i.id !== id));
      addNotification('warning', 'Investor berhasil dihapus.');
    }
  };

  const _addMitra = (newMitra: Omit<Mitra, 'id'>) => {
    const id = `m${mitra.length + 1}`;
    setMitra((prev) => [...prev, { ...newMitra, id }]);
    addNotification('success', `Mitra "${newMitra.name}" berhasil ditambahkan.`);
  };

  const _updateMitra = (updatedMitra: Mitra) => {
    setMitra((prev) =>
      prev.map((m) => (m.id === updatedMitra.id ? updatedMitra : m))
    );
    addNotification('success', `Mitra "${updatedMitra.name}" berhasil diperbarui.`);
  };

  const deleteMitra = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus mitra ini?')) {
      setMitra((prev) => prev.filter((m) => m.id !== id));
      addNotification('warning', 'Mitra berhasil dihapus.');
    }
  };

  const _addDivision = (newDivision: Omit<Division, 'id'>) => {
    const id = `d${divisions.length + 1}`;
    setDivisions((prev) => [...prev, { ...newDivision, id }]);
    addNotification('success', `Divisi "${newDivision.name}" berhasil ditambahkan.`);
  };

  const _updateDivision = (updatedDivision: Division) => {
    setDivisions((prev) =>
      prev.map((d) => (d.id === updatedDivision.id ? updatedDivision : d))
    );
    addNotification('success', `Divisi "${updatedDivision.name}" berhasil diperbarui.`);
  };

  const deleteDivision = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus divisi ini?')) {
      setDivisions((prev) => prev.filter((d) => d.id !== id));
      addNotification('warning', 'Divisi berhasil dihapus.');
    }
  };

  // Yhoiki Account CRUD Operations
  const _addYhoikiAccount = (newAccount: Omit<YhoikiAccount, 'id'>) => {
    const id = `yh${yhoikiAccounts.length + 1}`;
    setYhoikiAccounts((prev) => [...prev, { ...newAccount, id }]);
    addNotification('success', `Akun Yhoiki "${newAccount.name}" berhasil ditambahkan.`);
  };

  const _updateYhoikiAccount = (updatedAccount: YhoikiAccount) => {
    setYhoikiAccounts((prev) =>
      prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a))
    );
    addNotification('success', `Akun Yhoiki "${updatedAccount.name}" berhasil diperbarui.`);
  };

  const deleteYhoikiAccount = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus akun Yhoiki ini?')) {
      setYhoikiAccounts((prev) => prev.filter((a) => a.id !== id));
      addNotification('warning', 'Akun Yhoiki berhasil dihapus.');
    }
  };

  // --- Combined Save Handlers for Forms ---
  const handleSavePartnership = (data: Partnership | Omit<Partnership, 'id'>) => {
    if ('id' in data && data.id) { // Check if 'id' exists and is not empty (for safety)
      _updatePartnership(data as Partnership);
    } else {
      _addPartnership(data as Omit<Partnership, 'id'>);
    }
    handleCloseModal();
  };

  const handleSaveInvestor = (data: Investor | Omit<Investor, 'id'>) => {
    if ('id' in data && data.id) {
      _updateInvestor(data as Investor);
    } else {
      _addInvestor(data as Omit<Investor, 'id'>);
    }
    handleCloseModal();
  };

  const handleSaveMitra = (data: Mitra | Omit<Mitra, 'id'>) => {
    if ('id' in data && data.id) {
      _updateMitra(data as Mitra);
    } else {
      _addMitra(data as Omit<Mitra, 'id'>);
    }
    handleCloseModal();
  };

  const handleSaveDivision = (data: Division | Omit<Division, 'id'>) => {
    if ('id' in data && data.id) {
      _updateDivision(data as Division);
    } else {
      _addDivision(data as Omit<Division, 'id'>);
    }
    handleCloseModal();
  };

  const handleSaveYhoikiAccount = (data: YhoikiAccount | Omit<YhoikiAccount, 'id'>) => {
    if ('id' in data && data.id) {
      _updateYhoikiAccount(data as YhoikiAccount);
    } else {
      _addYhoikiAccount(data as Omit<YhoikiAccount, 'id'>);
    }
    handleCloseModal();
  };

  // --- Generic Handlers for Modals ---
  const handleAddClick = () => {
    setCurrentEditItem(null); // Clear any existing edit item
    setIsModalOpen(true);
  };

  const handleEditClick = (item: any) => {
    setCurrentEditItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEditItem(null); // Clear current edit item on close
  };

  // --- Filtered Data ---
  const filteredPartnerships = partnerships.filter(p =>
    Object.values(p).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredInvestors = investors.filter(i =>
    Object.values(i).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredMitra = mitra.filter(m =>
    Object.values(m).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredDivisions = divisions.filter(d =>
    Object.values(d).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredYhoikiAccounts = yhoikiAccounts.filter(a =>
    Object.values(a).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // --- Render Sections Based on Active Tab ---

  const renderContent = () => {
    switch (activeTab) {
      case 'partnerships':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Daftar Partnership</h2>
              <button
                onClick={handleAddClick}
                className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <FaPlusCircle className="mr-2" /> Tambah Partnership
              </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Perusahaan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak Person</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Mulai</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPartnerships.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.contactPerson}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          p.status === 'Aktif' ? 'bg-green-100 text-green-800' :
                          p.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.startDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <FaEdit className="inline text-lg" />
                        </button>
                        <button
                          onClick={() => deletePartnership(p.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <FaTrash className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal
              title={currentEditItem ? 'Edit Partnership' : 'Tambah Partnership Baru'}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
            >
              <PartnershipForm
                onSubmit={handleSavePartnership}
                initialData={currentEditItem}
                onCancel={handleCloseModal}
              />
            </Modal>
          </>
        );
      case 'investors':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Daftar Investor</h2>
              <button
                onClick={handleAddClick}
                className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <FaPlusCircle className="mr-2" /> Tambah Investor
              </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Investor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Kontak</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Investasi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Investasi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvestors.map((i) => (
                    <tr key={i.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{i.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{i.contactEmail}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Rp {i.amountInvested.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{i.investmentDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          i.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{i.notes}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(i)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <FaEdit className="inline text-lg" />
                        </button>
                        <button
                          onClick={() => deleteInvestor(i.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <FaTrash className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal
              title={currentEditItem ? 'Edit Investor' : 'Tambah Investor Baru'}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
            >
              <InvestorForm
                onSubmit={handleSaveInvestor}
                initialData={currentEditItem}
                onCancel={handleCloseModal}
              />
            </Modal>
          </>
        );
      case 'mitra':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Daftar Mitra (Reseller/Seller)</h2>
              <button
                onClick={handleAddClick}
                className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <FaPlusCircle className="mr-2" /> Tambah Mitra
              </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mitra</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Bergabung</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMitra.map((m) => (
                    <tr key={m.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{m.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{m.division}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{m.joinDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          m.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(m)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <FaEdit className="inline text-lg" />
                        </button>
                        <button
                          onClick={() => deleteMitra(m.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <FaTrash className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal
              title={currentEditItem ? 'Edit Mitra' : 'Tambah Mitra Baru'}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
            >
              <MitraForm
                onSubmit={handleSaveMitra}
                initialData={currentEditItem}
                onCancel={handleCloseModal}
              />
            </Modal>
          </>
        );
      case 'divisions':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Daftar Divisi</h2>
              <button
                onClick={handleAddClick}
                className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <FaPlusCircle className="mr-2" /> Tambah Divisi
              </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Divisi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepala Divisi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Anggota</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDivisions.map((d) => (
                    <tr key={d.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{d.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.head}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{d.totalMembers}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(d)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <FaEdit className="inline text-lg" />
                        </button>
                        <button
                          onClick={() => deleteDivision(d.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <FaTrash className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal
              title={currentEditItem ? 'Edit Divisi' : 'Tambah Divisi Baru'}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
            >
              <DivisionForm
                onSubmit={handleSaveDivision}
                initialData={currentEditItem}
                onCancel={handleCloseModal}
              />
            </Modal>
          </>
        );
      case 'yhoiki':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Daftar Akun Yhoiki</h2>
              <button
                onClick={handleAddClick}
                className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <FaPlusCircle className="mr-2" /> Tambah Akun Yhoiki
              </button>
            </div>
            <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Bergabung</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredYhoikiAccounts.map((account) => (
                    <tr key={account.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{account.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{account.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          account.status === 'Active' ? 'bg-green-100 text-green-800' :
                          account.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {account.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{account.joinDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(account)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <FaEdit className="inline text-lg" />
                        </button>
                        <button
                          onClick={() => deleteYhoikiAccount(account.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <FaTrash className="inline text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Modal
              title={currentEditItem ? 'Edit Akun Yhoiki' : 'Tambah Akun Yhoiki Baru'}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
            >
              <YhoikiAccountForm
                onSubmit={handleSaveYhoikiAccount}
                initialData={currentEditItem}
                onCancel={handleCloseModal}
              />
            </Modal>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col p-6 space-y-8 bg-gray-100 min-h-screen">
      {/* Notifications Area */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notif) => (
          <Notification key={notif.id} {...notif} onClose={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))} />
        ))}
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Kelola Akun & Entitas Yhoiki</h1>

      {/* Tabs for Navigation */}
      <div className="flex bg-white p-2 rounded-xl shadow-md overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('partnerships')}
          className={`flex-shrink-0 px-6 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'partnerships'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaHandshake className="inline-block mr-2" /> Partnership
        </button>
        <button
          onClick={() => setActiveTab('investors')}
          className={`flex-shrink-0 px-6 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'investors'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaMoneyCheckAlt className="inline-block mr-2" /> Investor
        </button>
        <button
          onClick={() => setActiveTab('mitra')}
          className={`flex-shrink-0 px-6 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'mitra'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaUsers className="inline-block mr-2" /> Mitra
        </button>
        <button
          onClick={() => setActiveTab('divisions')}
          className={`flex-shrink-0 px-6 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'divisions'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaBuilding className="inline-block mr-2" /> Divisi
        </button>
        <button
          onClick={() => setActiveTab('yhoiki')}
          className={`flex-shrink-0 px-6 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'yhoiki'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FaUserCircle className="inline-block mr-2" /> Akun Yhoiki
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center space-x-3">
        <FaSearch className="text-gray-400 text-xl" />
        <input
          type="text"
          placeholder={`Cari ${activeTab === 'partnerships' ? 'partnership' : activeTab === 'investors' ? 'investor' : activeTab === 'mitra' ? 'mitra' : activeTab === 'divisions' ? 'divisi' : 'akun Yhoiki'}...`}
          className="flex-1 p-2 border-none focus:ring-0 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content Area Based on Active Tab */}
      {renderContent()}
    </div>
  );
}