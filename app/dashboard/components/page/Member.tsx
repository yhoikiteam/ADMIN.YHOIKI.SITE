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
  FaUserCircle, // Untuk ikon foto profil default atau ikon member
  FaGithub, // Untuk ikon GitHub
  FaLinkedin, // Untuk ikon LinkedIn
  FaInstagram, // Untuk ikon Instagram
} from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';

// --- Reusable Components (Salin dari Akun.tsx jika belum ada) ---

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

interface YhoikiMember {
  id: string;
  fullName: string;
  photoUrl: string; // URL foto profil
  jobDesk: string;
  githubUrl?: string; // Opsional
  linkedinUrl?: string; // Opsional
  instagramUrl?: string; // Opsional
  email: string;
  phone: string;
  joinDate: string; // Format YYYY-MM-DD
  status: 'Active' | 'Inactive' | 'On Leave';
}

// --- Form Component for CRUD Operations ---

function YhoikiMemberForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: YhoikiMember | Omit<YhoikiMember, 'id'>) => void; initialData?: YhoikiMember | null; onCancel: () => void }) {
  const [formData, setFormData] = useState<Omit<YhoikiMember, 'id'> | YhoikiMember>(
    initialData || {
      fullName: '',
      photoUrl: '',
      jobDesk: '',
      githubUrl: '',
      linkedinUrl: '',
      instagramUrl: '',
      email: '',
      phone: '',
      joinDate: new Date().toISOString().split('T')[0], // Default ke tanggal hari ini
      status: 'Active',
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        fullName: '',
        photoUrl: '',
        jobDesk: '',
        githubUrl: '',
        linkedinUrl: '',
        instagramUrl: '',
        email: '',
        phone: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="photoUrl" className="block text-sm font-medium text-gray-700">URL Foto Profil</label>
        <input type="url" id="photoUrl" name="photoUrl" value={formData.photoUrl} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="https://example.com/photo.jpg" />
      </div>
      <div>
        <label htmlFor="jobDesk" className="block text-sm font-medium text-gray-700">Job Desk</label>
        <input type="text" id="jobDesk" name="jobDesk" value={formData.jobDesk} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700">GitHub URL</label>
          <input type="url" id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="https://github.com/username" />
        </div>
        <div>
          <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
          <input type="url" id="linkedinUrl" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="https://linkedin.com/in/username" />
        </div>
        <div>
          <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700">Instagram URL</label>
          <input type="url" id="instagramUrl" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="https://instagram.com/username" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">Tanggal Bergabung</label>
        <input type="date" id="joinDate" name="joinDate" value={formData.joinDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Member'}</button>
      </div>
    </form>
  );
}

// --- Main YhoikiMemberPage Component ---

export default function YhoikiMemberPage() {
  const [yhoikiMembers, setYhoikiMembers] = useState<YhoikiMember[]>([
    { id: 'mem1', fullName: 'Budi Raharjo', photoUrl: 'https://via.placeholder.com/50/FF5733/FFFFFF?text=BR', jobDesk: 'Software Engineer', githubUrl: 'https://github.com/budirh', linkedinUrl: 'https://linkedin.com/in/budirh', instagramUrl: 'https://instagram.com/budirh', email: 'budi.r@yhoiki.com', phone: '081211122233', joinDate: '2022-05-20', status: 'Active' },
    { id: 'mem2', fullName: 'Siti Aminah', photoUrl: 'https://via.placeholder.com/50/33FF57/FFFFFF?text=SA', jobDesk: 'UI/UX Designer', githubUrl: '', linkedinUrl: 'https://linkedin.com/in/sitiah', instagramUrl: 'https://instagram.com/sitiah', email: 'siti.a@yhoiki.com', phone: '081344455566', joinDate: '2023-01-10', status: 'Active' },
    { id: 'mem3', fullName: 'Joko Susanto', photoUrl: 'https://via.placeholder.com/50/3357FF/FFFFFF?text=JS', jobDesk: 'Marketing Specialist', githubUrl: '', linkedinUrl: 'https://linkedin.com/in/jokos', instagramUrl: '', email: 'joko.s@yhoiki.com', phone: '081777888999', joinDate: '2023-09-01', status: 'On Leave' },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEditingData, setCurrentEditingData] = useState<YhoikiMember | null>(null);
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
  const _addYhoikiMember = (newMember: Omit<YhoikiMember, 'id'>) => {
    const id = `mem${yhoikiMembers.length + 1}-${Date.now()}`; // Unique ID
    setYhoikiMembers((prev) => [...prev, { ...newMember, id }]);
    addNotification('success', `Member "${newMember.fullName}" berhasil ditambahkan.`);
  };

  const _updateYhoikiMember = (updatedMember: YhoikiMember) => {
    setYhoikiMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? updatedMember : m))
    );
    addNotification('success', `Member "${updatedMember.fullName}" berhasil diperbarui.`);
  };

  const deleteYhoikiMember = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus member "${name}" ini?`)) {
      setYhoikiMembers((prev) => prev.filter((m) => m.id !== id));
      addNotification('warning', `Member "${name}" berhasil dihapus.`);
    }
  };

  // --- Form Handlers ---
  const handleAddClick = () => {
    setEditingId(null);
    setCurrentEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (member: YhoikiMember) => {
    setEditingId(member.id);
    setCurrentEditingData(member);
    setIsModalOpen(true);
  };

  const handleSaveYhoikiMember = (data: YhoikiMember | Omit<YhoikiMember, 'id'>) => {
    if ('id' in data && data.id) {
      _updateYhoikiMember(data as YhoikiMember);
    } else {
      _addYhoikiMember(data as Omit<YhoikiMember, 'id'>);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setCurrentEditingData(null);
  };

  // --- Filtered Data ---
  const filteredYhoikiMembers = yhoikiMembers.filter(m =>
    Object.values(m).some(val =>
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
        <h2 className="text-3xl font-semibold text-gray-800">Manajemen Member Yhoiki</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <FaPlusCircle className="mr-2" /> Tambah Member
        </button>
      </div>

      <div className="mb-8 flex items-center space-x-4">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Member Yhoiki..."
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Desk</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sosial Media</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Bergabung</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredYhoikiMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.fullName} className="h-12 w-12 rounded-full object-cover border border-gray-200 shadow-sm" />
                  ) : (
                    <FaUserCircle className="h-12 w-12 text-gray-400" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.jobDesk}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center mb-1">
                    <MdEmail className="mr-2 text-gray-500" />
                    <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">{member.email}</a>
                  </div>
                  <div className="flex items-center">
                    <MdPhone className="mr-2 text-gray-500" />
                    <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">{member.phone}</a>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    {member.githubUrl && (
                      <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700 transition-colors">
                        <FaGithub className="text-xl" />
                      </a>
                    )}
                    {member.linkedinUrl && (
                      <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700 transition-colors">
                        <FaLinkedin className="text-xl" />
                      </a>
                    )}
                    {member.instagramUrl && (
                      <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700 transition-colors">
                        <FaInstagram className="text-xl" />
                      </a>
                    )}
                    {!member.githubUrl && !member.linkedinUrl && !member.instagramUrl && (
                      <span className="text-gray-500 italic">N/A</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{member.joinDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === 'Active' ? 'bg-green-100 text-green-800' :
                    member.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditClick(member)}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                      title="Edit"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => deleteYhoikiMember(member.id, member.fullName)}
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
              {editingId ? 'Edit Member Yhoiki' : 'Tambah Member Yhoiki Baru'}
            </h3>
            <YhoikiMemberForm onSubmit={handleSaveYhoikiMember} initialData={currentEditingData} onCancel={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
}