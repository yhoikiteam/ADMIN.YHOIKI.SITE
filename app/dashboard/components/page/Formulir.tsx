'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Text,
  Hash,
  CircleDot,
  CheckSquare,
  ListCollapse,
  Save,
  LayoutDashboard,
  XCircle,
  AlertCircle,
  Eye,
  CalendarDays,
  Clock,
  Type,
  AlignLeft,
  Mail,
  Sparkles,
  LoaderCircle,
  Copy, // Import Copy icon
  QrCode, // Import QrCode icon
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import QRCodeGenerator from '@/components/QrCodeGenerator'; // Import the new QR code component

type FieldType = 'text' | 'paragraph' | 'number' | 'radio' | 'checkbox' | 'dropdown' | 'date' | 'time';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  description?: string;
  required?: boolean;
}

interface FormData {
  id?: string;
  name: string;
  slug: string;
  fields: FormField[];
  user_id: string;
  created_at: string;
  recipient_email?: string;
}

const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Base URL for your forms (adjust this to your actual domain)
const FORM_BASE_URL = 'https://yhoiki.site/formulir?slug='; // <-- PASTIKAN INI SESUAI DENGAN DOMAIN ASLI ANDA

const FormulirPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  const [forms, setForms] = useState<FormData[]>([]);
  const [currentForm, setCurrentForm] = useState<FormData | null>(null);
  const [mode, setMode] = useState<'dashboard' | 'builder' | 'preview'>('dashboard');
  const [selectedFormSlug, setSelectedFormSlug] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [formToDeleteId, setFormToDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<{ url: string; name: string } | null>(null); // State for QR modal

  const showMessage = useCallback((type: 'success' | 'error' | 'warning', text: string) => {
    setMessage({ type, text });
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      if (!supabase) {
        console.error("Supabase client is not initialized. Ensure supabaseClient.ts is configured correctly.");
        showMessage('error', 'Failed to initialize Supabase service.');
        setIsAppReady(true);
        return;
      }

      let storedUserId = localStorage.getItem('form_builder_anon_user_id');
      if (!storedUserId) {
        storedUserId = crypto.randomUUID();
        localStorage.setItem('form_builder_anon_user_id', storedUserId);
      }
      setUserId(storedUserId);
      setIsAppReady(true);
    } catch (error: any) {
      console.error("Error initializing app:", error);
      showMessage('error', 'Failed to initialize application.');
      setIsAppReady(true);
    }
  }, [showMessage]);

  useEffect(() => {
    const fetchForms = async () => {
      if (!supabase || !userId || mode !== 'dashboard') return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setForms(data as FormData[]);
      } catch (error: any) {
        console.error("Error fetching forms:", error);
        showMessage('error', `Failed to load forms: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (isAppReady && userId && mode === 'dashboard') {
      fetchForms();

      const channel = supabase
        .channel(`forms_for_user_${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'forms', filter: `user_id=eq.${userId}` },
          (payload) => {
            console.log("Real-time change detected:", payload);
            fetchForms();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, showMessage, mode, isAppReady]);

  const createNewForm = () => {
    if (!userId) {
      showMessage('error', 'Application not ready. Please refresh.');
      return;
    }
    setCurrentForm({
      name: 'Formulir Baru Tanpa Judul',
      slug: createSlug('Formulir Baru Tanpa Judul'),
      fields: [],
      user_id: userId,
      created_at: new Date().toISOString(),
      recipient_email: '',
    });
    setMode('builder');
    setSuggestedQuestions([]);
    setIsGeneratingQuestions(false);
    setIsGeneratingOptions(null);
    setSelectedFormSlug(null);
  };

  const editForm = async (formId: string) => {
    if (!supabase || !userId) return;

    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          showMessage('error', 'Formulir tidak ditemukan atau tidak memiliki akses.');
        } else {
          throw error;
        }
      } else if (data) {
        setCurrentForm(data as FormData);
        setMode('builder');
        setSelectedFormSlug(data.slug);
      } else {
        showMessage('error', 'Formulir tidak ditemukan atau tidak memiliki akses.');
      }
    } catch (error: any) {
      console.error("Error fetching form for editing from Supabase:", error);
      showMessage('error', `Gagal memuat formulir untuk diedit: ${error.message}`);
    }
  };

  const saveForm = async () => {
    if (!supabase || !userId || !currentForm) {
      showMessage('error', 'Tidak ada formulir untuk disimpan atau aplikasi tidak siap.');
      return;
    }

    try {
      const formToSave = {
        ...currentForm,
        user_id: userId,
        created_at: currentForm.created_at || new Date().toISOString(),
        slug: createSlug(currentForm.name),
        fields: currentForm.fields,
        recipient_email: currentForm.recipient_email || null
      };

      if (currentForm.id) {
        const { error } = await supabase
          .from('forms')
          .update(formToSave)
          .eq('id', currentForm.id)
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('forms')
          .insert(formToSave)
          .select()
          .single();
        if (error) throw error;
        setCurrentForm(data as FormData);
      }
      showMessage('success', 'Formulir berhasil diperbarui!');
      setMode('dashboard'); // <-- Kembali ke dashboard setelah simpan
      setCurrentForm(null); // <-- Reset currentForm
      setSelectedFormSlug(null); // <-- Reset selectedFormSlug
    } catch (error: any) {
      console.error("Error saving form to Supabase:", error);
      showMessage('error', `Gagal menyimpan formulir: ${error.message}`);
    }
  };

  const requestDeleteForm = (formId: string) => {
    setFormToDeleteId(formId);
    setShowDeleteModal(true);
  };

  const confirmDeleteForm = async () => {
    if (!supabase || !userId || !formToDeleteId) return;

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formToDeleteId)
        .eq('user_id', userId);
      if (error) throw error;

      showMessage('success', 'Formulir berhasil dihapus!');
      setFormToDeleteId(null);
      setShowDeleteModal(false);
      if (currentForm?.id === formToDeleteId) {
        setCurrentForm(null);
        setMode('dashboard');
        setSelectedFormSlug(null);
      }
    } catch (error: any) {
      console.error("Error deleting form from Supabase:", error);
      showMessage('error', `Gagal menghapus formulir: ${error.message}`);
    }
  };

  const cancelDeleteForm = () => {
    setFormToDeleteId(null);
    setShowDeleteModal(false);
  };

  const updateFieldName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentForm) {
      const newName = e.target.value;
      setCurrentForm({ ...currentForm, name: newName, slug: createSlug(newName) });
    }
  };

  const updateRecipientEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentForm) {
      setCurrentForm({ ...currentForm, recipient_email: e.target.value });
    }
  };

  const addField = (type: FieldType, label?: string) => {
    if (currentForm) {
      const newField: FormField = {
        id: crypto.randomUUID(),
        label: label || `Pertanyaan Baru (${type === 'text' ? 'Teks Singkat' : type === 'paragraph' ? 'Paragraf' : type === 'radio' ? 'Pilihan Ganda' : type === 'checkbox' ? 'Kotak Centang' : type === 'dropdown' ? 'Dropdown' : type === 'date' ? 'Tanggal' : type === 'time' ? 'Waktu' : type})`,
        type,
        ...(type === 'radio' || type === 'checkbox' || type === 'dropdown' ? { options: ['Opsi 1', 'Opsi 2'] } : {}),
        description: '',
        required: false,
      };
      setCurrentForm({ ...currentForm, fields: [...currentForm.fields, newField] });
    }
  };

  const updateField = (fieldId: string, newValues: Partial<FormField>) => {
    if (currentForm) {
      const updatedFields = currentForm.fields.map(field =>
        field.id === fieldId ? { ...field, ...newValues } : field
      );
      setCurrentForm({ ...currentForm, fields: updatedFields });
    }
  };

  const deleteField = (fieldId: string) => {
    if (currentForm) {
      const filteredFields = currentForm.fields.filter(field => field.id !== fieldId);
      setCurrentForm({ ...currentForm, fields: filteredFields });
    }
  };

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    if (currentForm) {
      const index = currentForm.fields.findIndex(field => field.id === fieldId);
      if (index === -1) return;

      const newFields = [...currentForm.fields];
      if (direction === 'up' && index > 0) {
        [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      } else if (direction === 'down' && index < newFields.length - 1) {
        [newFields[index + 1], newFields[index]] = [newFields[index], newFields[index + 1]];
      }
      setCurrentForm({ ...currentForm, fields: newFields });
    }
  };

  const submitFormResponse = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase || !currentForm) {
      showMessage('error', 'Tidak dapat mengirim tanggapan. Formulir tidak valid atau layanan tidak siap.');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const responseData: { [key: string]: any } = {};

    currentForm.fields.forEach(field => {
      if (field.type === 'checkbox') {
        responseData[field.label] = formData.getAll(field.id);
      } else {
        responseData[field.label] = formData.get(field.id);
      }
    });

    try {
      const { error } = await supabase
        .from('responses')
        .insert({
          form_id: currentForm.id,
          form_name: currentForm.name,
          response_data: responseData,
          submitted_at: new Date().toISOString(),
          user_id: userId || 'anonymous',
        });

      if (error) throw error;
      showMessage('success', 'Tanggapan formulir berhasil dikirim!');
      e.currentTarget.reset();
    } catch (error: any) {
      console.error("Error submitting form response to Supabase:", error);
      showMessage('error', `Gagal mengirim tanggapan formulir: ${error.message}`);
    }
  };

  // LLM Integration Functions (now calling API Routes)
  const generateSuggestedQuestions = async () => {
    if (!currentForm) return;

    setIsGeneratingQuestions(true);
    setSuggestedQuestions([]);
    try {
      const response = await fetch('/api/ai/suggest-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formName: currentForm.name,
          existingQuestions: currentForm.fields.map(f => f.label).join(', ') || 'Tidak ada pertanyaan'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage('error', `Error from AI: ${result.error || 'Unknown error'}`);
        return;
      }

      if (Array.isArray(result.suggestions)) {
        setSuggestedQuestions(result.suggestions);
      } else {
        showMessage('error', 'Format saran pertanyaan tidak valid dari AI.');
      }
    } catch (error: any) {
      console.error("Error generating questions:", error);
      showMessage('error', `Terjadi kesalahan saat membuat saran pertanyaan: ${error.message}`);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const generateSuggestedOptions = async (fieldId: string, questionLabel: string) => {
    setIsGeneratingOptions(fieldId);
    try {
      const response = await fetch('/api/ai/suggest-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionLabel })
      });

      const result = await response.json();

      if (!response.ok) {
        showMessage('error', `Error from AI: ${result.error || 'Unknown error'}`);
        return;
      }

      if (Array.isArray(result.suggestions)) {
        updateField(fieldId, { options: result.suggestions });
      } else {
        showMessage('error', 'Format saran opsi tidak valid dari AI.');
      }
    } catch (error: any) {
      console.error("Error generating options:", error);
      showMessage('error', `Terjadi kesalahan saat membuat saran opsi: ${error.message}`);
    } finally {
      setIsGeneratingOptions(null);
    }
  };

  const handleCopyFormLink = async (slug: string) => {
    const formUrl = `${FORM_BASE_URL}${slug}`;
    try {
      await navigator.clipboard.writeText(formUrl);
      showMessage('success', 'Link formulir berhasil disalin!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      showMessage('error', 'Gagal menyalin link. Silakan coba lagi.');
    }
  };

  const handleShowQR = (form: FormData) => {
    setShowQRModal({ url: `${FORM_BASE_URL}${form.slug}`, name: form.name });
  };

  const navigateToFormPreview = useCallback((form: FormData) => {
    setCurrentForm(form);
    setSelectedFormSlug(form.slug);
    setMode('preview');
    console.log(`Simulasi navigasi ke /formulir/${form.slug}`);
  }, []);

  useEffect(() => {
    if (mode === 'preview' && selectedFormSlug) {
      const fetchFormForPreview = async () => {
        if (!supabase) return;

        try {
          const { data, error } = await supabase
            .from('forms')
            .select('*')
            .eq('slug', selectedFormSlug)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              showMessage('error', 'Formulir pratinjau tidak ditemukan.');
            } else {
              throw error;
            }
          } else if (data) {
            setCurrentForm(data as FormData);
          } else {
            showMessage('error', 'Formulir pratinjau tidak ditemukan.');
          }
        } catch (error: any) {
          console.error("Error fetching form for preview:", error);
          showMessage('error', `Gagal memuat formulir pratinjau: ${error.message}`);
        }
      };

      fetchFormForPreview();
    }
  }, [selectedFormSlug, mode, showMessage]);

  if (!isAppReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700">
        Memuat aplikasi...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-inter text-gray-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      {/* Global Message Display */}
      {message && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 p-3 px-6 rounded-lg shadow-md z-50 ${
          message.type === 'success' ? 'bg-green-500 text-white' : message.type === 'warning' ? 'bg-yellow-500 text-gray-900' : 'bg-red-500 text-white'
        } flex items-center space-x-2`}>
          {message.type === 'error' && <AlertCircle size={20} />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 text-white">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="w-full max-w-4xl bg-white p-4 rounded-xl shadow-lg flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700 flex items-center">
          <Pencil className="mr-2" /> Pembuat Formulir
        </h1>
        {userId && (
            <div className="text-sm text-gray-600 hidden sm:block">
                ID Sesi Anda: <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-xs sm:text-sm">{userId}</span>
            </div>
        )}
        <div className="flex space-x-2">
            {mode === 'builder' && (
                <button
                    onClick={() => navigateToFormPreview(currentForm!)}
                    disabled={!currentForm || !currentForm.id}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Pratinjau Formulir"
                >
                    <Eye size={20} />
                    <span className="hidden sm:inline">Pratinjau</span>
                </button>
            )}
            {mode === 'preview' && (
                <button
                    onClick={() => {
                        setMode('dashboard');
                    }}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center space-x-2"
                    title="Kembali ke Pembangun"
                >
                    <Pencil size={20} />
                    <span className="hidden sm:inline">Pembangun</span>
                </button>
            )}
            <button
                onClick={() => { setMode('dashboard'); setCurrentForm(null); setSelectedFormSlug(null); }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2"
                title="Kembali ke Dashboard"
            >
                <LayoutDashboard size={20} />
                <span className="hidden sm:inline">Dashboard</span>
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl bg-white p-6 rounded-2xl shadow-xl relative">
        {mode === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Dashboard Formulir Anda</h2>
            <button
              onClick={createNewForm}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2 mb-6"
            >
              <Plus size={20} /> Buat Formulir Baru
            </button>

            {loading ? (
                <p className="text-gray-500 text-center py-12 flex items-center justify-center space-x-2">
                    <LoaderCircle className="animate-spin" size={20} /> <span>Memuat formulir...</span>
                </p>
            ) : forms.length === 0 ? (
              <p className="text-gray-500 text-center py-12">Anda belum membuat formulir apa pun. Mulai sekarang!</p>
            ) : (
              <ul className="space-y-4">
                {forms.map((form) => (
                  <li key={form.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-4 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex-grow text-center sm:text-left">
                      <span className="text-lg font-semibold text-green-700">{form.name}</span>
                      <p className="text-sm text-gray-500 mt-1">
                        Dibuat: {new Date(form.created_at).toLocaleDateString()} {new Date(form.created_at).toLocaleTimeString()}
                      </p>
                       <p className="text-sm text-gray-500 mt-1">
                        URL: <span className="font-mono bg-gray-100 px-1 rounded-sm text-xs">{FORM_BASE_URL}{form.slug}</span>
                      </p>
                      {form.id && (
                          <p className="text-sm text-gray-500 mt-1">
                              ID: <span className="font-mono bg-gray-100 px-1 rounded-sm text-xs">{form.id}</span>
                          </p>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => editForm(form.id!)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Pencil size={18} /> <span>Edit</span>
                      </button>
                      <button
                        onClick={() => navigateToFormPreview(form)}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Eye size={18} /> <span>Lihat</span>
                      </button>
                      <button
                        onClick={() => handleCopyFormLink(form.slug)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 flex items-center space-x-1"
                        title="Salin Link Formulir"
                      >
                        <Copy size={18} /> <span>Salin</span>
                      </button>
                      <button
                        onClick={() => handleShowQR(form)}
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 flex items-center space-x-1"
                        title="Unduh QR Code"
                      >
                        <QrCode size={18} /> <span>QR</span>
                      </button>
                      <button
                        onClick={() => requestDeleteForm(form.id!)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 flex items-center space-x-1"
                      >
                        <Trash2 size={18} /> <span>Hapus</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {mode === 'builder' && currentForm && (
          <div className="flex flex-col lg:flex-row lg:space-x-6">
            <div className="flex-grow space-y-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <input
                  id="formName"
                  type="text"
                  value={currentForm.name}
                  onChange={updateFieldName}
                  placeholder="Nama Formulir Anda"
                  className="w-full text-3xl font-bold text-gray-700 p-2 border-b-2 border-transparent focus:outline-none focus:border-green-500 transition-all duration-200"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL Slug: <span className="font-mono bg-gray-100 px-1 rounded-sm text-xs">/formulir?{currentForm.slug}</span>
                </p>
                <input
                    type="email"
                    value={currentForm.recipient_email || ''}
                    onChange={updateRecipientEmail}
                    placeholder="Email penerima tanggapan (opsional)"
                    className="w-full text-sm text-gray-600 p-2 mt-2 border-b border-transparent focus:outline-none focus:border-green-300 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">Catatan: Fitur pengiriman email memerlukan backend.</p>
              </div>

              <div className="space-y-4">
                {currentForm.fields.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Belum ada bidang. Tambahkan satu dari bilah sisi!</p>
                )}
                {currentForm.fields.map((field, index) => (
                  <div key={field.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-md flex flex-col space-y-3 transition-all duration-200 hover:shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 text-sm sm:text-base">{index + 1}. {field.type.toUpperCase()}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => moveField(field.id, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 transition-colors"
                          title="Pindah ke Atas"
                        >
                          <ArrowUp size={18} />
                        </button>
                        <button
                          onClick={() => moveField(field.id, 'down')}
                          disabled={index === currentForm.fields.length - 1}
                          className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 transition-colors"
                          title="Pindah ke Bawah"
                        >
                          <ArrowDown size={18} />
                        </button>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Hapus Bidang"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <label htmlFor={`field-label-${field.id}`} className="block text-sm font-medium text-gray-700">Label Bidang</label>
                    <input
                      id={`field-label-${field.id}`}
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Label Pertanyaan"
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                    />

                    <label htmlFor={`field-desc-${field.id}`} className="block text-sm font-medium text-gray-700">Deskripsi (opsional)</label>
                    <input
                      id={`field-desc-${field.id}`}
                      type="text"
                      value={field.description || ''}
                      onChange={(e) => updateField(field.id, { description: e.target.value })}
                      placeholder="Deskripsi pertanyaan"
                      className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                    />

                    {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'dropdown') && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Opsi (satu per baris)</label>
                        <textarea
                          value={field.options?.join('\n') || ''}
                          onChange={(e) => updateField(field.id, { options: e.target.value.split('\n') })}
                          placeholder="Opsi 1&#10;Opsi 2&#10;Opsi 3"
                          rows={3}
                          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 resize-y transition-all duration-200"
                        />
                        <button
                          onClick={() => generateSuggestedOptions(field.id, field.label)}
                          disabled={isGeneratingOptions === field.id}
                          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingOptions === field.id ? (
                            <>
                              <LoaderCircle size={18} className="animate-spin" />
                              <span>Membuat Saran...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
                              <span>Saran Opsi ✨</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        id={`field-required-${field.id}`}
                        checked={field.required || false}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor={`field-required-${field.id}`}>Wajib diisi</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-64 lg:flex-shrink-0 mt-8 lg:mt-0 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Tambahkan Bidang</h3>
              <button
                onClick={generateSuggestedQuestions}
                disabled={isGeneratingQuestions}
                className="w-full mb-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingQuestions ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" />
                    <span>Membuat Saran...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Saran Pertanyaan ✨</span>
                  </>
                )}
              </button>

              {suggestedQuestions.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Saran dari AI:</h4>
                  <ul className="space-y-2 text-sm">
                    {suggestedQuestions.map((q, i) => (
                      <li key={i} className="flex justify-between items-center text-gray-700">
                        <span>{q}</span>
                        <button
                          onClick={() => { addField('text', q); setSuggestedQuestions(suggestedQuestions.filter((_, idx) => idx !== i)); }}
                          className="bg-green-200 hover:bg-green-300 text-green-800 text-xs px-2 py-1 rounded-md"
                          title="Tambahkan sebagai bidang teks"
                        >
                          Tambah
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSuggestedQuestions([])}
                    className="w-full mt-3 text-red-600 hover:text-red-800 text-sm"
                  >
                    Hapus Saran
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addField('text')}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl shadow-sm transition-all duration-200 text-sm font-semibold"
                  title="Teks Singkat"
                >
                  <Type size={20} className="mb-1 text-green-500" /> Teks
                </button>
                <button
                  onClick={() => addField('paragraph')}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl shadow-sm transition-all duration-200 text-sm font-semibold"
                  title="Paragraf"
                >
                  <AlignLeft size={20} className="mb-1 text-green-500" /> Paragraf
                </button>
                <button
                  onClick={() => addField('number')}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl shadow-sm transition-all duration-200 text-sm font-semibold"
                  title="Angka"
                >
                  <Hash size={20} className="mb-1 text-green-500" /> Angka
                </button>
                <button
                  onClick={() => addField('radio')}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl shadow-sm transition-all duration-200 text-sm font-semibold"
                  title="Pilihan Ganda"
                >
                  <CircleDot size={20} className="mb-1 text-green-500" /> Pilihan
                </button>
                <button
                  onClick={() => addField('checkbox')}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl shadow-sm transition-all duration-200 text-sm font-semibold"
                  title="Kotak Centang"
                >
                  <CheckSquare size={20} className="mb-1 text-green-500" /> Centang
                </button>
                <button
                  onClick={() => addField('dropdown')}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl shadow-sm transition-all duration-200 text-sm font-semibold"
                  title="Dropdown"
                >
                  <ListCollapse size={20} className="mb-1 text-green-500" /> Dropdown
                </button>
                <button
                  onClick={() => addField('date')}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl shadow-sm transition-all duration-200 text-sm font-semibold"
                  title="Tanggal"
                >
                  <CalendarDays size={20} className="mb-1 text-green-500" /> Tanggal
                </button>
                <button
                  onClick={() => addField('time')}
                  className="flex flex-col items-center p-3 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl shadow-sm transition-all duration-200 text-sm font-semibold"
                  title="Waktu"
                >
                  <Clock size={20} className="mb-1 text-green-500" /> Waktu
                </button>
              </div>
              <button
                onClick={saveForm}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Save size={20} /> Simpan
              </button>
            </div>
          </div>
        )}

        {mode === 'preview' && currentForm && (
            <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentForm.name}</h2>
                <p className="text-sm text-gray-600 mb-2">
                    URL Formulir: <span className="font-mono bg-gray-100 px-1 rounded-sm text-xs">{FORM_BASE_URL}{currentForm.slug}</span>
                </p>
                {currentForm.recipient_email && (
                  <p className="text-sm text-gray-600 mb-4 flex items-center">
                    <Mail size={16} className="mr-2"/> Tanggapan akan dikirimkan ke: <span className="font-semibold ml-1">{currentForm.recipient_email}</span>
                  </p>
                )}
                <form onSubmit={submitFormResponse} className="space-y-6">
                    {currentForm.fields.map(field => (
                        <div key={field.id} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm">
                            <label className="block text-lg font-medium text-gray-700 mb-1">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.description && <p className="text-sm text-gray-500 mb-2">{field.description}</p>}

                            {field.type === 'text' && (
                                <input
                                    type="text"
                                    name={field.id}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                                    required={field.required}
                                />
                            )}
                            {field.type === 'paragraph' && (
                                <textarea
                                    name={field.id}
                                    rows={4}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-green-400 focus:border-green-400 resize-y transition-all duration-200"
                                ></textarea>
                            )}
                            {field.type === 'number' && (
                                <input
                                    type="number"
                                    name={field.id}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                                    required={field.required}
                                />
                            )}
                            {field.type === 'radio' && (
                                <div className="space-y-2">
                                    {field.options?.map(option => (
                                        <div key={option} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`${field.id}-${option}`}
                                                name={field.id}
                                                value={option}
                                                className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                required={field.required}
                                            />
                                            <label htmlFor={`${field.id}-${option}`} className="ml-2 text-gray-700">{option}</label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {field.type === 'checkbox' && (
                                <div className="space-y-2">
                                    {field.options?.map(option => (
                                        <div key={option} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`${field.id}-${option}`}
                                                name={field.id}
                                                value={option}
                                                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                required={field.required}
                                            />
                                            <label htmlFor={`${field.id}-${option}`} className="ml-2 text-gray-700">{option}</label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {field.type === 'dropdown' && (
                                <select
                                    name={field.id}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-green-400 focus:border-green-400 bg-white transition-all duration-200"
                                    required={field.required}
                                >
                                    <option value="">Pilih sebuah opsi</option>
                                    {field.options?.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            )}
                            {field.type === 'date' && (
                                <input
                                    type="date"
                                    name={field.id}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                                    required={field.required}
                                />
                            )}
                            {field.type === 'time' && (
                                <input
                                    type="time"
                                    name={field.id}
                                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-green-400 focus:border-green-400 transition-all duration-200"
                                    required={field.required}
                                />
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-colors duration-200 mt-6"
                    >
                        Kirim Tanggapan
                    </button>
                </form>
            </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center space-y-4">
            <AlertCircle size={48} className="text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-800">Konfirmasi Hapus</h3>
            <p className="text-gray-600">Apakah Anda yakin ingin menghapus formulir ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={cancelDeleteForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg transition-colors duration-200"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteForm}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors duration-200"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeGenerator
          url={showQRModal.url}
          formName={showQRModal.name}
          onClose={() => setShowQRModal(null)}
        />
      )}
    </div>
  );
};

export default FormulirPage;