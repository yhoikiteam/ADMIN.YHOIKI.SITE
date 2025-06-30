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
  FaHeading,
  FaRegEdit,
  FaUsersCog,
  FaQuestionCircle,
  FaStar,
  FaQuoteRight,
  FaToggleOn,
  FaToggleOff,
  FaLink,
} from 'react-icons/fa';
import { MdOutlineTextSnippet, MdTitle, MdDescription, MdCallToAction, MdBrush, MdRocket } from 'react-icons/md';

// Import Supabase Client
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan path ini jika berbeda

// --- Reusable Components (Notification - from previous files) ---
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

// --- Data Structures (Interfaces) ---

interface HeroSectionData {
  id?: string; // Tambahkan ID karena dari database
  title: string;
  writingText: string[]; // Ini akan menjadi array of strings dari DB
}

interface Division {
  id: string;
  emote: string; // e.g., '🚀' or icon class
  title: string;
  description: string;
  ctaText: string; // cta_text di DB
  colorGradient: string; // color_gradient di DB
  runningText: string[]; // running_text di DB
  status: 'active' | 'coming_soon' | 'inactive';
}

interface WhyYhoikiCard {
  id: string;
  emote: string;
  title: string;
  description: string;
}

interface WhyYhoikiSectionData {
  id?: string; // Tambahkan ID karena dari database
  title: string;
  description: string;
  cards: WhyYhoikiCard[]; // Ini akan dikelola terpisah
}

interface Highlight {
  id: string;
  type: 'video' | 'article' | 'event' | 'other';
  title: string;
  link: string;
  created_at?: string; // Tambahkan ini karena ada di database
  updated_at?: string; // Tambahkan ini karena ada di database
}

interface HighlightSectionData {
  highlights: Highlight[];
}

interface Testimonial { // For "Apa Kata Mereka" section
  id: string;
  comment: string;
  author: string;
  created_at?: string;
  updated_at?: string;
}

// --- Form Components (Simplified for initial structure) ---
// These would be dynamic based on the section being edited
function SectionForm({
  sectionType,
  initialData,
  onSubmit,
  onCancel,
}: {
  sectionType: string;
  initialData: any; // Can be HeroSectionData | Division | WhyYhoikiCard | WhyYhoikiSectionData | Highlight | null
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: e.target.value.split('\n').map(s => s.trim()).filter(s => s !== ''),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderFormFields = () => {
    switch (sectionType) {
      case 'hero':
        return (
          <>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Hero</label>
              <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="writingText" className="block text-sm font-medium text-gray-700">Teks Menulis (pisahkan dengan baris baru)</label>
              <textarea id="writingText" name="writingText" value={Array.isArray(formData.writingText) ? formData.writingText.join('\n') : formData.writingText || ''} onChange={(e) => handleArrayChange(e, 'writingText')} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
          </>
        );
      case 'divisi':
        return (
          <>
            <div>
              <label htmlFor="emote" className="block text-sm font-medium text-gray-700">Emote (misal: 🚀)</label>
              <input type="text" id="emote" name="emote" value={formData.emote || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Divisi</label>
              <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Divisi</label>
              <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div>
              <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700">Teks CTA</label>
              <input type="text" id="ctaText" name="ctaText" value={formData.ctaText || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="colorGradient" className="block text-sm font-medium text-gray-700">Warna Gradient (misal: from-blue-400 to-indigo-600)</label>
              <input type="text" id="colorGradient" name="colorGradient" value={formData.colorGradient || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="runningText" className="block text-sm font-medium text-gray-700">Teks Berjalan (pisahkan dengan baris baru)</label>
              <textarea id="runningText" name="runningText" value={Array.isArray(formData.runningText) ? formData.runningText.join('\n') : ''} onChange={(e) => handleArrayChange(e, 'runningText')} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" name="status" value={formData.status || 'active'} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </>
        );
      case 'whyYhoikiSection':
        return (
          <>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Kenapa Yhoiki</label>
              <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Kenapa Yhoiki</label>
              <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
            {/* Cards are managed separately for simplicity in this form, or can be nested */}
            <p className="text-sm text-gray-500 mt-2">Kartu Kenapa Yhoiki dikelola secara terpisah.</p>
          </>
        );
      case 'whyYhoikiCard':
        return (
          <>
            <div>
              <label htmlFor="emote" className="block text-sm font-medium text-gray-700">Emote (misal: ✨)</label>
              <input type="text" id="emote" name="emote" value={formData.emote || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Kartu</label>
              <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Kartu</label>
              <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
          </>
        );
      case 'highlight':
        return (
          <>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Jenis Highlight</label>
              <select id="type" name="type" value={formData.type || 'article'} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                <option value="video">Video</option>
                <option value="article">Artikel</option>
                <option value="event">Event</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Highlight</label>
              <input type="text" id="title" name="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700">Link</label>
              <input type="url" id="link" name="link" value={formData.link || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </>
        );
      case 'testimonial':
        return (
          <>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Komentar</label>
              <textarea id="comment" name="comment" value={formData.comment || ''} onChange={handleChange} rows={3} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md"></textarea>
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">Penulis</label>
              <input type="text" id="author" name="author" value={formData.author || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </>
        );
      default:
        return <p>Tidak ada form untuk bagian ini.</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFormFields()}
      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData && initialData.id ? 'Simpan Perubahan' : 'Tambah Data'}</button>
      </div>
    </form>
  );
}


// --- Main SettingLandingPage Component ---

export default function SettingLandingPage() {
  // State for each landing page section
  const [heroData, setHeroData] = useState<HeroSectionData>({ // Ubah initial state
    title: '',
    writingText: [],
  });

  const [divisiYhoiki, setDivisiYhoiki] = useState<Division[]>([]); // Ubah initial state

  const [whyYhoikiSection, setWhyYhoikiSection] = useState<WhyYhoikiSectionData>({ // Ubah initial state
    title: '',
    description: '',
    cards: [],
  });

  const [highlightSection, setHighlightSection] = useState<HighlightSectionData>({
    highlights: [], // Akan dimuat dari Supabase
  });

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]); // Ubah initial state

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSection, setEditingSection] = useState<string | null>(null); // 'hero', 'divisi', 'whyYhoikiSection', 'whyYhoikiCard', 'highlight', 'testimonial'
  const [currentEditingData, setCurrentEditingData] = useState<any>(null); // Data for the currently edited item/section
  const [notifications, setNotifications] = useState<
    { id: number; type: 'success' | 'info' | 'warning' | 'error'; message: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  // --- Fetch Functions from API Routes ---

  const fetchHeroData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hero-section');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch hero section');
      }
      if (data) {
        // Sesuaikan nama field dari DB ke state
        setHeroData({
          id: data.id,
          title: data.title,
          writingText: Array.isArray(data.writing_text) ? data.writing_text : data.writing_text ? data.writing_text.split(',') : [],
        });
      } else {
        setHeroData({ title: '', writingText: [] }); // Set default empty if no data
      }
    } catch (err: any) {
      console.error('Error fetching hero data:', err.message);
      setError(`Gagal memuat Hero Section: ${err.message}`);
      addNotification('error', `Gagal memuat Hero Section: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchDivisions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/divisions');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch divisions');
      }
      // Sesuaikan nama field dari DB ke state
      const mappedData = data.map((div: any) => ({
        id: div.id,
        emote: div.emote,
        title: div.title,
        description: div.description,
        ctaText: div.cta_text,
        colorGradient: div.color_gradient,
        runningText: div.running_text,
        status: div.status,
      }));
      setDivisiYhoiki(mappedData || []);
    } catch (err: any) {
      console.error('Error fetching divisions:', err.message);
      setError(`Gagal memuat Divisi Yhoiki: ${err.message}`);
      addNotification('error', `Gagal memuat Divisi Yhoiki: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchWhyYhoikiSection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/why-yhoiki-section');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Why Yhoiki Section');
      }
      if (data) {
        setWhyYhoikiSection((prev) => ({
          ...prev,
          id: data.id,
          title: data.title,
          description: data.description,
        }));
      } else {
        setWhyYhoikiSection((prev) => ({ ...prev, title: '', description: '' })); // Default empty
      }
    } catch (err: any) {
      console.error('Error fetching Why Yhoiki Section:', err.message);
      setError(`Gagal memuat Kenapa Yhoiki Section: ${err.message}`);
      addNotification('error', `Gagal memuat Kenapa Yhoiki Section: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchWhyYhoikiCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/why-yhoiki-cards');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Why Yhoiki Cards');
      }
      setWhyYhoikiSection((prev) => ({
        ...prev,
        cards: data || [],
      }));
    } catch (err: any) {
      console.error('Error fetching Why Yhoiki Cards:', err.message);
      setError(`Gagal memuat Kartu Kenapa Yhoiki: ${err.message}`);
      addNotification('error', `Gagal memuat Kartu Kenapa Yhoiki: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .order('created_at', { ascending: true }); // Urutkan berdasarkan waktu pembuatan

      if (error) {
        throw error;
      }
      setHighlightSection({ highlights: data || [] });
    } catch (err: any) {
      console.error('Error fetching highlights:', err.message);
      setError(`Gagal memuat highlight: ${err.message}`);
      addNotification('error', `Gagal memuat highlight: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/testimonials');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch testimonials');
      }
      setTestimonials(data || []);
    } catch (err: any) {
      console.error('Error fetching testimonials:', err.message);
      setError(`Gagal memuat Testimonial: ${err.message}`);
      addNotification('error', `Gagal memuat Testimonial: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);


  // Effect to load all data on component mount
  useEffect(() => {
    fetchHeroData();
    fetchDivisions();
    fetchWhyYhoikiSection();
    fetchWhyYhoikiCards();
    fetchHighlights();
    fetchTestimonials();
  }, [fetchHeroData, fetchDivisions, fetchWhyYhoikiSection, fetchWhyYhoikiCards, fetchHighlights, fetchTestimonials]);


  // --- CRUD Functions for Hero Section ---
  const handleEditHero = () => {
    setEditingSection('hero');
    setCurrentEditingData(heroData);
    setIsModalOpen(true);
  };

  const handleSaveHero = async (data: HeroSectionData) => {
    try {
      const response = await fetch('/api/hero-section', {
        method: 'POST', // Menggunakan POST sebagai UPSERT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          writingText: data.writingText, // Pastikan ini array
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save hero section');
      }
      // Update state setelah berhasil menyimpan
      setHeroData({
        id: result.id,
        title: result.title,
        writingText: Array.isArray(result.writing_text) ? result.writing_text : result.writing_text ? result.writing_text.split(',') : [],
      });
      addNotification('success', 'Data Hero Section berhasil diperbarui.');
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving hero section:', err.message);
      addNotification('error', `Gagal menyimpan Hero Section: ${err.message}`);
    }
  };

  // --- CRUD Functions for Divisi Yhoiki ---
  const handleAddDivisi = () => {
    setEditingSection('divisi');
    setCurrentEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditDivisi = (divisi: Division) => {
    setEditingSection('divisi');
    setCurrentEditingData(divisi);
    setIsModalOpen(true);
  };

  const handleSaveDivisi = async (data: Division) => {
    try {
      let response;
      if (data.id) { // Update existing
        response = await fetch('/api/divisions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data), // Kirim semua data termasuk ID untuk update
        });
      } else { // Add new
        response = await fetch('/api/divisions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save division');
      }
      await fetchDivisions(); // Refresh data setelah operasi
      addNotification('success', `Divisi "${data.title}" berhasil diperbarui.`);
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving division:', err.message);
      addNotification('error', `Gagal menyimpan Divisi: ${err.message}`);
    }
  };

  const handleDeleteDivisi = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus divisi "${title}" ini?`)) {
      try {
        const response = await fetch('/api/divisions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete division');
        }
        await fetchDivisions(); // Refresh data setelah operasi
        addNotification('warning', `Divisi "${title}" berhasil dihapus.`);
      } catch (err: any) {
        console.error('Error deleting division:', err.message);
        addNotification('error', `Gagal menghapus Divisi: ${err.message}`);
      }
    }
  };

  const handleToggleDivisiStatus = async (divisiToToggle: Division) => {
    const newStatus = divisiToToggle.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch('/api/divisions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: divisiToToggle.id, status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update division status');
      }
      await fetchDivisions(); // Refresh data
      addNotification('info', `Status divisi "${divisiToToggle.title}" diubah menjadi ${newStatus.replace('_', ' ')}.`);
    } catch (err: any) {
      console.error('Error toggling division status:', err.message);
      addNotification('error', `Gagal mengubah status Divisi: ${err.message}`);
    }
  };


  // --- CRUD Functions for Why Yhoiki Section ---
  const handleEditWhyYhoikiSection = () => {
    setEditingSection('whyYhoikiSection');
    setCurrentEditingData(whyYhoikiSection);
    setIsModalOpen(true);
  };

  const handleSaveWhyYhoikiSection = async (data: WhyYhoikiSectionData) => {
    try {
      const response = await fetch('/api/why-yhoiki-section', {
        method: 'POST', // Menggunakan POST sebagai UPSERT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save Why Yhoiki section');
      }
      // Update state setelah berhasil menyimpan
      setWhyYhoikiSection((prev) => ({
        ...prev,
        id: result.id,
        title: result.title,
        description: result.description,
      }));
      addNotification('success', 'Data Kenapa Yhoiki Section berhasil diperbarui.');
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving Why Yhoiki section:', err.message);
      addNotification('error', `Gagal menyimpan Kenapa Yhoiki Section: ${err.message}`);
    }
  };

  const handleAddWhyYhoikiCard = () => {
    setEditingSection('whyYhoikiCard');
    setCurrentEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditWhyYhoikiCard = (card: WhyYhoikiCard) => {
    setEditingSection('whyYhoikiCard');
    setCurrentEditingData(card);
    setIsModalOpen(true);
  };

  const handleSaveWhyYhoikiCard = async (data: WhyYhoikiCard) => {
    try {
      let response;
      if (data.id) { // Update existing
        response = await fetch('/api/why-yhoiki-cards', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else { // Add new
        response = await fetch('/api/why-yhoiki-cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save Why Yhoiki card');
      }
      await fetchWhyYhoikiCards(); // Refresh data setelah operasi
      addNotification('success', `Kartu "${data.title}" berhasil diperbarui.`);
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving Why Yhoiki card:', err.message);
      addNotification('error', `Gagal menyimpan Kartu Kenapa Yhoiki: ${err.message}`);
    }
  };

  const handleDeleteWhyYhoikiCard = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kartu "${title}" ini?`)) {
      try {
        const response = await fetch('/api/why-yhoiki-cards', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete Why Yhoiki card');
        }
        await fetchWhyYhoikiCards(); // Refresh data setelah operasi
        addNotification('warning', `Kartu "${title}" berhasil dihapus.`);
      } catch (err: any) {
        console.error('Error deleting Why Yhoiki card:', err.message);
        addNotification('error', `Gagal menghapus Kartu Kenapa Yhoiki: ${err.message}`);
      }
    }
  };

  // --- CRUD Functions for Highlight Section (INTEGRATED WITH SUPABASE) ---
  // (Bagian ini sudah Anda miliki, jadi hanya memastikan fetchHighlights dipanggil setelah perubahan)
  const handleAddHighlight = () => {
    setEditingSection('highlight');
    setCurrentEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditHighlight = (highlight: Highlight) => {
    setEditingSection('highlight');
    setCurrentEditingData(highlight);
    setIsModalOpen(true);
  };

  const handleSaveHighlight = async (data: Highlight) => {
    try {
      if (data.id) { // Update existing
        const { id, created_at, updated_at, ...updateData } = data; // Hapus created_at/updated_at dari payload update
        const { error } = await supabase
          .from('highlights')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
        addNotification('success', `Highlight "${data.title}" berhasil diperbarui.`);
      } else { // Add new
        // Pastikan hanya kolom yang diperlukan yang dikirimkan
        const { type, title, link } = data;
        const { error } = await supabase
          .from('highlights')
          .insert([{ type, title, link }]);

        if (error) throw error;
        addNotification('success', `Highlight "${data.title}" berhasil ditambahkan.`);
      }
      fetchHighlights(); // Refresh data setelah operasi
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving highlight:', err.message);
      addNotification('error', `Gagal menyimpan highlight: ${err.message}`);
    }
  };

  const handleDeleteHighlight = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus highlight "${title}" ini?`)) {
      try {
        const { error } = await supabase
          .from('highlights')
          .delete()
          .eq('id', id);

        if (error) throw error;
        addNotification('warning', `Highlight "${title}" berhasil dihapus.`);
        fetchHighlights(); // Refresh data setelah operasi
      } catch (err: any) {
        console.error('Error deleting highlight:', err.message);
        addNotification('error', `Gagal menghapus highlight: ${err.message}`);
      }
    }
  };

  // --- CRUD Functions for Testimonials (Apa Kata Mereka) ---
  const handleAddTestimonial = () => {
    setEditingSection('testimonial');
    setCurrentEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingSection('testimonial');
    setCurrentEditingData(testimonial);
    setIsModalOpen(true);
  };

  const handleSaveTestimonial = async (data: Testimonial) => {
    try {
      let response;
      if (data.id) { // Update existing
        response = await fetch('/api/testimonials', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else { // Add new
        response = await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save testimonial');
      }
      await fetchTestimonials(); // Refresh data setelah operasi
      addNotification('success', `Testimonial dari "${data.author}" berhasil diperbarui.`);
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving testimonial:', err.message);
      addNotification('error', `Gagal menyimpan Testimonial: ${err.message}`);
    }
  };

  const handleDeleteTestimonial = async (id: string, author: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus testimonial dari "${author}" ini?`)) {
      try {
        const response = await fetch('/api/testimonials', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete testimonial');
        }
        await fetchTestimonials(); // Refresh data setelah operasi
        addNotification('warning', `Testimonial dari "${author}" berhasil dihapus.`);
      } catch (err: any) {
        console.error('Error deleting testimonial:', err.message);
        addNotification('error', `Gagal menghapus Testimonial: ${err.message}`);
      }
    }
  };


  // --- Modal Management ---
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setCurrentEditingData(null);
  };

  const handleFormSubmit = (data: any) => {
    switch (editingSection) {
      case 'hero':
        handleSaveHero(data);
        break;
      case 'divisi':
        handleSaveDivisi(data);
        break;
      case 'whyYhoikiSection':
        handleSaveWhyYhoikiSection(data);
        break;
      case 'whyYhoikiCard':
        handleSaveWhyYhoikiCard(data);
        break;
      case 'highlight':
        handleSaveHighlight(data);
        break;
      case 'testimonial':
        handleSaveTestimonial(data);
        break;
      default:
        console.warn('Unknown section for saving:', editingSection);
    }
  };

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

      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Pengaturan Landing Page</h1>

      {/* Section: Hero */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Section Hero</h2>
          <button
            onClick={handleEditHero}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <FaEdit className="mr-2" /> Edit Hero Section
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-lg font-medium text-gray-700 flex items-center"><FaHeading className="mr-2 text-blue-500" />Judul: <span className="font-normal ml-2">{heroData.title}</span></p>
          <p className="text-lg font-medium text-gray-700 flex items-center"><MdOutlineTextSnippet className="mr-2 text-blue-500" />Teks Menulis: <span className="font-normal ml-2">{heroData.writingText.join(', ')}</span></p>
        </div>
      </div>

      {/* Section: Divisi Yhoiki */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Section Divisi Yhoiki</h2>
          <button
            onClick={handleAddDivisi}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <FaPlusCircle className="mr-2" /> Tambah Divisi
          </button>
        </div>
        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Divisi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {divisiYhoiki.map((divisi) => (
                <tr key={divisi.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 flex items-center"><span className="mr-2 text-lg">{divisi.emote}</span>{divisi.title}</div>
                    <div className="text-xs text-gray-500 flex items-center"><MdCallToAction className="mr-1" />CTA: {divisi.ctaText}</div>
                    <div className="text-xs text-gray-500 flex items-center"><MdBrush className="mr-1" />Gradient: {divisi.colorGradient}</div>
                    <div className="text-xs text-gray-500 flex items-center"><MdRocket className="mr-1" />Running Text: {divisi.runningText.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{divisi.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      divisi.status === 'active' ? 'bg-green-100 text-green-800' :
                      divisi.status === 'coming_soon' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {divisi.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleDivisiStatus(divisi)}
                        className={`text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-full ${divisi.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
                        title={divisi.status === 'active' ? 'Nonaktifkan Divisi' : 'Aktifkan Divisi'}
                      >
                        {divisi.status === 'active' ? <FaToggleOn className="text-xl text-green-600" /> : <FaToggleOff className="text-xl text-red-600" />}
                      </button>
                      <button
                        onClick={() => handleEditDivisi(divisi)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Edit Divisi"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteDivisi(divisi.id, divisi.title)}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Hapus Divisi"
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

      {/* Section: Kenapa Yhoiki */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Section Kenapa Yhoiki</h2>
          <div className="flex space-x-3">
            <button
              onClick={handleEditWhyYhoikiSection}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              <FaEdit className="mr-2" /> Edit Teks Utama
            </button>
            <button
              onClick={handleAddWhyYhoikiCard}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <FaPlusCircle className="mr-2" /> Tambah Kartu
            </button>
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
          <p className="text-lg font-medium text-gray-700 flex items-center"><MdTitle className="mr-2 text-blue-500" />Judul: <span className="font-normal ml-2">{whyYhoikiSection.title}</span></p>
          <p className="text-lg font-medium text-gray-700 flex items-center"><MdDescription className="mr-2 text-blue-500" />Deskripsi: <span className="font-normal ml-2">{whyYhoikiSection.description}</span></p>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Daftar Kartu</h3>
        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Kartu</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {whyYhoikiSection.cards.map((card) => (
                <tr key={card.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center"><span className="mr-2 text-lg">{card.emote}</span>{card.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{card.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditWhyYhoikiCard(card)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Edit Kartu"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteWhyYhoikiCard(card.id, card.title)}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Hapus Kartu"
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

      {/* Section: Highlight */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Section Highlight</h2>
          <button
            onClick={handleAddHighlight}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <FaPlusCircle className="mr-2" /> Tambah Highlight
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Memuat Highlights...</p>
            {/* Anda bisa menambahkan spinner loading di sini */}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!loading && !error && highlightSection.highlights.length === 0 && (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">Belum ada Highlight. Tambahkan yang pertama!</p>
          </div>
        )}

        {!loading && !error && highlightSection.highlights.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul Highlight</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highlightSection.highlights.map((highlight) => (
                  <tr key={highlight.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{highlight.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{highlight.type}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 hover:underline">
                      <a href={highlight.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <FaLink className="mr-1" /> {highlight.link}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditHighlight(highlight)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                          title="Edit Highlight"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteHighlight(highlight.id, highlight.title)}
                          className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Hapus Highlight"
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
      </div>

      {/* Section: Apa Kata Mereka (Testimonials) */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Section Apa Kata Mereka (Testimonials)</h2>
          <button
            onClick={handleAddTestimonial}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <FaPlusCircle className="mr-2" /> Tambah Testimonial
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          *Catatan: Dalam implementasi nyata, data testimonial akan diambil dari database. Ini adalah contoh data statis.
        </p>
        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komentar</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700 italic">"{testimonial.comment}"</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{testimonial.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditTestimonial(testimonial)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Edit Testimonial"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id, testimonial.author)}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Hapus Testimonial"
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


      {/* Modal for Add/Edit Sections */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl transform transition-all scale-100 opacity-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {currentEditingData && currentEditingData.id ? 'Edit Data' : 'Tambah Data'} {editingSection && editingSection.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <SectionForm
              sectionType={editingSection as string}
              initialData={currentEditingData}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}