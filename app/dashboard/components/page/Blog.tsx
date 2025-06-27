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
  FaPenAlt, // Untuk ikon blog/artikel
  FaUserEdit, // Untuk Author
  FaCalendarAlt, // Untuk tanggal publikasi
  FaTags, // Untuk tags
} from 'react-icons/fa';

// --- Reusable Components (Salin dari file Anda yang lain jika belum ada) ---

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

interface BlogPost {
  id: string;
  title: string;
  author: string;
  publishDate: string; // Format YYYY-MM-DD
  content: string; // Isi blog post, bisa panjang
  tags: string[]; // Array of tags
  imageUrl?: string; // URL gambar thumbnail/header
  status: 'Published' | 'Draft' | 'Archived';
}

// --- Form Component for CRUD Operations ---

function BlogPostForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: BlogPost | Omit<BlogPost, 'id'>) => void; initialData?: BlogPost | null; onCancel: () => void }) {
  const [formData, setFormData] = useState<Omit<BlogPost, 'id'> | BlogPost>(
    initialData || {
      title: '',
      author: '',
      publishDate: new Date().toISOString().split('T')[0],
      content: '',
      tags: [],
      imageUrl: '',
      status: 'Draft',
    }
  );
  const [tagsInput, setTagsInput] = useState<string>(initialData?.tags.join(', ') || '');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setTagsInput(initialData.tags.join(', '));
    } else {
      setFormData({
        title: '',
        author: '',
        publishDate: new Date().toISOString().split('T')[0],
        content: '',
        tags: [],
        imageUrl: '',
        status: 'Draft',
      });
      setTagsInput('');
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setFormData((prev) => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Post</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="author" className="block text-sm font-medium text-gray-700">Penulis</label>
        <input type="text" id="author" name="author" value={formData.author} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">Tanggal Publikasi</label>
        <input type="date" id="publishDate" name="publishDate" value={formData.publishDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Konten Post</label>
        <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows={10} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 font-mono"></textarea>
      </div>
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags (pisahkan dengan koma)</label>
        <input type="text" id="tags" name="tags" value={tagsInput} onChange={handleTagsChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="contoh: teknologi, AI, berita" />
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL Gambar (Opsional)</label>
        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" placeholder="https://example.com/image.jpg" />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Post'}</button>
      </div>
    </form>
  );
}

// --- Main BlogPage Component ---

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    { id: 'blog1', title: 'Masa Depan AI: Tren dan Prediksi', author: 'Budi Santoso', publishDate: '2025-06-20', content: 'Kecerdasan Buatan (AI) terus berkembang...', tags: ['AI', 'teknologi', 'masa depan'], imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=AI', status: 'Published' },
    { id: 'blog2', title: 'Tips Produktivitas untuk Pengembang', author: 'Siti Aminah', publishDate: '2025-06-15', content: 'Sebagai pengembang, produktivitas adalah kunci...', tags: ['produktivitas', 'pengembangan', 'tips'], imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Productivity', status: 'Published' },
    { id: 'blog3', title: 'Panduan Memulai Bisnis Online', author: 'Joko Susilo', publishDate: '2025-06-01', content: 'Memulai bisnis online bisa jadi tantangan...', tags: ['bisnis', 'startup', 'e-commerce'], imageUrl: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=Business', status: 'Archived' },
    { id: 'blog4', title: 'Menguasai React Hooks', author: 'Agus Dharma', publishDate: '2025-05-25', content: 'React Hooks telah mengubah cara kita menulis komponen...', tags: ['React', 'JavaScript', 'frontend'], imageUrl: 'https://via.placeholder.com/150/FFFF33/000000?text=React', status: 'Published' },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEditingData, setCurrentEditingData] = useState<BlogPost | null>(null);
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
  const _addBlogPost = (newPost: Omit<BlogPost, 'id'>) => {
    const id = `blog${blogPosts.length + 1}-${Date.now()}`; // Unique ID
    setBlogPosts((prev) => [...prev, { ...newPost, id }]);
    addNotification('success', `Post "${newPost.title}" berhasil ditambahkan.`);
  };

  const _updateBlogPost = (updatedPost: BlogPost) => {
    setBlogPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
    addNotification('success', `Post "${updatedPost.title}" berhasil diperbarui.`);
  };

  const deleteBlogPost = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus post "${title}" ini?`)) {
      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
      addNotification('warning', `Post "${title}" berhasil dihapus.`);
    }
  };

  // --- Form Handlers ---
  const handleAddClick = () => {
    setEditingId(null);
    setCurrentEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingId(post.id);
    setCurrentEditingData(post);
    setIsModalOpen(true);
  };

  const handleSaveBlogPost = (data: BlogPost | Omit<BlogPost, 'id'>) => {
    if ('id' in data && data.id) {
      _updateBlogPost(data as BlogPost);
    } else {
      _addBlogPost(data as Omit<BlogPost, 'id'>);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setCurrentEditingData(null);
  };

  // --- Filtered Data ---
  const filteredBlogPosts = blogPosts.filter(post =>
    Object.values(post).some(val =>
      (Array.isArray(val) ? val.join(' ') : String(val)).toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-3xl font-semibold text-gray-800">Manajemen Blog</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <FaPlusCircle className="mr-2" /> Tambah Post Baru
        </button>
      </div>

      <div className="mb-8 flex items-center space-x-4">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Post Blog..."
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul & Konten</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Publikasi</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBlogPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="h-16 w-16 object-cover rounded-md border border-gray-200 shadow-sm" />
                  ) : (
                    <FaPenAlt className="h-16 w-16 text-gray-400" />
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-2">{post.content}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                        <FaUserEdit className="mr-2 text-gray-500" /> {post.author}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 text-gray-500" /> {post.publishDate}
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <FaTags className="mr-1 text-gray-400" /> {tag}
                      </span>
                    ))}
                    {post.tags.length === 0 && <span className="italic text-gray-500">Tidak ada tags</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    post.status === 'Published' ? 'bg-green-100 text-green-800' :
                    post.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditClick(post)}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                      title="Edit"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => deleteBlogPost(post.id, post.title)}
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
          <div className="bg-white rounded-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-3xl transform transition-all scale-100 opacity-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {editingId ? 'Edit Post Blog' : 'Tambah Post Blog Baru'}
            </h3>
            <BlogPostForm onSubmit={handleSaveBlogPost} initialData={currentEditingData} onCancel={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
}