// app/admin/events/page.tsx
'use client'; // Mark as client component

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient'; // Make sure path is correct for Supabase

// --- UI Components (Moved here for self-containment) ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      className={`px-6 py-3 rounded-xl font-medium text-white bg-green-700 hover:bg-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string; // Explicitly make value controlled
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Explicitly define onChange
  className?: string;
}

const Input: React.FC<InputProps> = ({ label, id, type = 'text', placeholder, value, onChange, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        {...props}
      />
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  placeholder?: string;
  value: string; // Explicitly make value controlled
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Explicitly define onChange
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, id, placeholder, value, onChange, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={5}
        className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
        {...props}
      ></textarea>
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: { value: string; label: string }[];
  value: string; // Explicitly make value controlled
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // Explicitly define onChange
  className?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, options, value, onChange, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-gray-700 text-sm font-medium mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- End UI Components ---

// Type definitions for CommitteeMember, Event, and EventFormData
export interface CommitteeMember {
  nama: string; // Corresponds to 'nama' in struktur_panitia JSONB
  jabatan: string; // Corresponds to 'jabatan' in struktur_panitia JSONB
  foto: string; // Corresponds to 'foto' in struktur_panitia JSONB
}

export interface Event {
  id: string; // Will be generated by Supabase
  slug: string;
  thumbnail: string; // Corresponds to 'thumbnail' in DB
  judul: string; // Corresponds to 'judul' in DB
  tanggal: string; // ISO date string, e.g., '2025-12-25'
  jam: string; // HH:MM string, e.g., '19:00'
  jenis: 'offline' | 'online'; // Corresponds to 'jenis' in DB
  lokasi: string; // Physical address or Zoom link
  pembuat: string; // Corresponds to 'pembuat' in DB
  struktur_panitia?: CommitteeMember[]; // Corresponds to 'struktur_panitia' JSONB in DB
  sponsor?: string[]; // Corresponds to 'sponsor' JSONB (array of URLs) in DB
  deskripsi: string; // Corresponds to 'deskripsi' in DB (Rich text/Markdown)
  // Add Supabase specific fields like created_at, user_id if needed
  user_id?: string;
  created_at?: string;
}

// EventFormData omits fields automatically generated by Supabase
export type EventFormData = Omit<Event, 'id' | 'user_id' | 'created_at'>;

// Initial form data state for new events, now matching DB column names
const initialFormData: EventFormData = {
  slug: '',
  thumbnail: '',
  judul: '',
  tanggal: '',
  jam: '',
  jenis: 'offline', // Default value for event type
  lokasi: '',
  pembuat: '',
  struktur_panitia: [], // Initialize as empty array
  sponsor: [],      // Initialize as empty array
  deskripsi: '',
};

const AdminEventsPage: React.FC = () => {
  // State variables for managing events data and UI
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for managing current view (list, add, or edit)
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  // State to hold the ID of the event being edited
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  // State to hold the form data, now directly matching DB schema
  const [formData, setFormData] = useState<EventFormData>(initialFormData);

  // States for dynamic form fields: committee members and sponsor logos
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(
    [{ nama: '', jabatan: '', foto: '' }] // Start with one empty member, matching DB sub-fields
  );
  const [sponsorLogos, setSponsorLogos] = useState<string[]>(['']); // Start with one empty logo URL

  // State for the delete confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  // States for search and filter functionality in the list view
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  // State to indicate if a form submission is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- API Calls ---

  /**
   * Fetches all events from the backend API.
   * Uses useCallback for memoization to prevent unnecessary re-renders.
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true); // Set loading state to true
    setError(null);    // Clear any previous errors
    try {
      const response = await fetch('/api/events'); // Call the GET /api/events endpoint
      if (!response.ok) {
        const errorText = await response.text(); // Read response as text for debugging
        console.error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}, Response Body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Event[] = await response.json(); // Parse the JSON response
      setEvents(data); // Update the events state
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(`Gagal memuat event: ${err.message}`); // Set error message
    } finally {
      setLoading(false); // Set loading state to false regardless of success or failure
    }
  }, []); // Empty dependency array means this function is created once

  /**
   * Fetches a single event by its ID from the backend API.
   * Uses useCallback for memoization.
   * @param id The ID of the event to fetch.
   * @returns The fetched Event object or undefined if an error occurs.
   */
  const fetchEventById = useCallback(async (id: string) => {
    setLoading(true); // Set loading state
    setError(null);    // Clear errors
    try {
      const response = await fetch(`/api/events/${id}`); // Call the GET /api/events/[id] endpoint
      if (!response.ok) {
        const errorText = await response.text(); // Read response as text for debugging
        console.error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}, Response Body: ${errorText}`);
        // Attempt to parse as JSON, but handle if it's not valid JSON
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Server responded with non-JSON error: ${errorText}`);
        }
      }
      const data: Event = await response.json(); // Parse the JSON response
      setLoading(false); // Set loading state to false
      return data;       // Return the fetched event
    } catch (err: any) {
      console.error(`Error fetching event with ID ${id}:`, err);
      setError(`Gagal memuat event untuk diedit: ${err.message}`);
      setLoading(false);
      return undefined; // Return undefined on error
    }
  }, []); // Empty dependency array

  /**
   * Creates a new event by sending a POST request to the backend API.
   * @param eventData The data for the new event.
   */
  const createEvent = async (eventData: EventFormData) => {
    setIsSubmitting(true); // Indicate submission is in progress
    setError(null);         // Clear errors
    try {
      // Map frontend names to backend names for the payload
      const payload = {
        slug: eventData.slug,
        thumbnail: eventData.thumbnail,
        judul: eventData.judul,
        tanggal: eventData.tanggal,
        jam: eventData.jam,
        jenis: eventData.jenis,
        lokasi: eventData.lokasi,
        pembuat: eventData.pembuat,
        struktur_panitia: eventData.struktur_panitia,
        sponsor: eventData.sponsor,
        deskripsi: eventData.deskripsi,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send mapped data as JSON
      });
      if (!response.ok) {
        const errorText = await response.text(); // Read response as text for debugging
        console.error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}, Response Body: ${errorText}`);
        // Attempt to parse as JSON, but handle if it's not valid JSON
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Server responded with non-JSON error: ${errorText}`);
        }
      }
      alert('Event berhasil ditambahkan!'); // Show success message
      await fetchEvents(); // Refresh the list of events
      handleBackToList();  // Navigate back to the list view
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(`Gagal membuat event: ${err.message}`);
      alert(`Terjadi kesalahan saat membuat event: ${err.message}`);
    } finally {
      setIsSubmitting(false); // End submission process
    }
  };

  /**
   * Updates an existing event by sending a PATCH request to the backend API.
   * @param id The ID of the event to update.
   * @param eventData The updated data for the event.
   */
  const updateExistingEvent = async (id: string, eventData: EventFormData) => {
    setIsSubmitting(true); // Indicate submission is in progress
    setError(null);         // Clear errors
    try {
      // Map frontend names to backend names for the payload
      const payload = {
        slug: eventData.slug,
        thumbnail: eventData.thumbnail,
        judul: eventData.judul,
        tanggal: eventData.tanggal,
        jam: eventData.jam,
        jenis: eventData.jenis,
        lokasi: eventData.lokasi,
        pembuat: eventData.pembuat,
        struktur_panitia: eventData.struktur_panitia,
        sponsor: eventData.sponsor,
        deskripsi: eventData.deskripsi,
      };

      const response = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send mapped data as JSON
      });
      if (!response.ok) {
        const errorText = await response.text(); // Read response as text for debugging
        console.error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}, Response Body: ${errorText}`);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Server responded with non-JSON error: ${errorText}`);
        }
      }
      alert('Event berhasil diperbarui!'); // Show success message
      await fetchEvents(); // Refresh the list of events
      handleBackToList();  // Navigate back to the list view
    } catch (err: any) {
      console.error(`Error updating event ${id}:`, err);
      setError(`Gagal memperbarui event: ${err.message}`);
      alert(`Terjadi kesalahan saat memperbarui event: ${err.message}`);
    } finally {
      setIsSubmitting(false); // End submission process
    }
  };

  /**
   * Deletes an event by sending a DELETE request to the backend API.
   * @param id The ID of the event to delete.
   */
  const deleteExistingEvent = async (id: string) => {
    setError(null); // Clear errors
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorText = await response.text(); // Read response as text for debugging
        console.error(`HTTP error! Status: ${response.status}, Status Text: ${response.statusText}, Response Body: ${errorText}`);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Server responded with non-JSON error: ${errorText}`);
        }
      }
      alert('Event berhasil dihapus!'); // Show success message
      await fetchEvents(); // Refresh the list of events
    } catch (err: any) {
      console.error(`Error deleting event ${id}:`, err);
      setError(`Gagal menghapus event: ${err.message}`);
      alert(`Terjadi kesalahan saat menghapus event: ${err.message}`);
    } finally {
      setIsModalOpen(false);    // Close the modal
      setEventToDelete(null); // Clear the event to delete
    }
  };

  // --- Effects and Handlers ---

  // Effect to fetch events when the component mounts or currentView changes to 'list'
  useEffect(() => {
    if (currentView === 'list') {
      fetchEvents();
    }
  }, [currentView, fetchEvents]); // Dependencies: currentView and fetchEvents

  // Effect to load event data when in 'edit' view and an editingEventId is set
  useEffect(() => {
    const loadEventForEdit = async () => {
      if (currentView === 'edit' && editingEventId) {
        const fetchedEvent = await fetchEventById(editingEventId);
        if (fetchedEvent) {
          // Set formData and dynamic fields with fetched data, mapping from DB names
          setFormData({
            slug: fetchedEvent.slug,
            thumbnail: fetchedEvent.thumbnail,
            judul: fetchedEvent.judul,
            tanggal: fetchedEvent.tanggal,
            jam: fetchedEvent.jam,
            jenis: fetchedEvent.jenis,
            lokasi: fetchedEvent.lokasi,
            pembuat: fetchedEvent.pembuat,
            struktur_panitia: fetchedEvent.struktur_panitia || [],
            sponsor: fetchedEvent.sponsor || [],
            deskripsi: fetchedEvent.deskripsi,
          });
          setCommitteeMembers(fetchedEvent.struktur_panitia || [{ nama: '', jabatan: '', foto: '' }]);
          setSponsorLogos(fetchedEvent.sponsor || ['']);
        }
      } else {
        // Reset form state if not in edit view or editingEventId is cleared
        resetFormState();
      }
    };
    loadEventForEdit();
  }, [currentView, editingEventId, fetchEventById]); // Dependencies for this effect

  // Effects to keep formData synchronized with committeeMembers and sponsorLogos
  useEffect(() => {
    setFormData(prev => ({ ...prev, struktur_panitia: committeeMembers }));
  }, [committeeMembers]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, sponsor: sponsorLogos }));
  }, [sponsorLogos]);

  /**
   * Resets the form data and dynamic fields to their initial empty states.
   */
  const resetFormState = () => {
    setFormData(initialFormData);
    setCommitteeMembers([{ nama: '', jabatan: '', foto: '' }]);
    setSponsorLogos(['']);
  };

  /**
   * Handles click to switch to 'add' view.
   */
  const handleAddNewClick = () => {
    setCurrentView('add');
    setEditingEventId(null); // Clear editing ID
    resetFormState();        // Reset form
  };

  /**
   * Handles click to switch to 'edit' view for a specific event.
   */
  const handleEditClick = (id: string) => {
    setCurrentView('edit');
    setEditingEventId(id); // Set editing ID
  };

  /**
   * Handles click to switch back to 'list' view.
   */
  const handleBackToList = () => {
    setCurrentView('list');
    setEditingEventId(null); // Clear editing ID
    resetFormState();        // Reset form
  };

  /**
   * Generic change handler for form inputs to update formData state.
   * @param e The change event from an input, textarea, or select element.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    // Map frontend IDs to backend column names for formData update
    const fieldMap: { [key: string]: keyof EventFormData } = {
      slug: 'slug',
      thumbnailUrl: 'thumbnail', // Map thumbnailUrl to thumbnail
      title: 'judul',           // Map title to judul
      date: 'tanggal',          // Map date to tanggal
      time: 'jam',              // Map time to jam
      type: 'jenis',            // Map type to jenis
      location: 'lokasi',       // Map location to lokasi
      creator: 'pembuat',       // Map creator to pembuat
      description: 'deskripsi', // Map description to deskripsi
    };
    const mappedId = fieldMap[id] || id; // Use mapped ID or original if not found in map
    setFormData(prev => ({ ...prev, [mappedId]: value }));
  };

  /**
   * Handles image uploads to Supabase Storage and updates the corresponding form field.
   * @param file The file to upload.
   * @param type The type of image being uploaded ('thumbnail', 'committee', or 'sponsor').
   * @param index Optional: The index for committee member or sponsor logo arrays.
   */
  const handleImageUpload = async (file: File, type: 'thumbnail' | 'committee' | 'sponsor', index?: number) => {
    if (!file) return;

    try {
      // Define the file path in Supabase Storage
      const filePath = `${type}_uploads/${Date.now()}_${file.name}`;
      // Upload the file
      const { data, error: uploadError } = await supabase.storage.from('event-images').upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage.from('event-images').getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image.');
      }

      const downloadURL = publicUrlData.publicUrl;
      console.log(`Uploaded ${type} image: ${downloadURL}`);

      // Update the correct form field based on the image type
      if (type === 'thumbnail') {
        setFormData(prev => ({ ...prev, thumbnail: downloadURL })); // Use 'thumbnail'
      } else if (type === 'committee' && index !== undefined) {
        updateCommitteeMember(index, 'foto', downloadURL); // Use 'foto'
      } else if (type === 'sponsor' && index !== undefined) {
        updateSponsorLogo(index, downloadURL); // Update sponsor logo directly
      }
      alert('Gambar berhasil diunggah!');
    } catch (err: any) {
      console.error("Error uploading image:", err);
      alert(`Gagal mengunggah gambar: ${err.message}`);
    }
  };

  /**
   * Handles the form submission (either creating or updating an event).
   * @param e The form submission event.
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission

    // Basic client-side validation (can be expanded for more robust checks)
    if (!formData.slug || !formData.thumbnail || !formData.judul || !formData.tanggal || !formData.jam || !formData.lokasi || !formData.pembuat || !formData.deskripsi) {
      alert('Harap lengkapi semua bidang yang wajib diisi.');
      return;
    }

    // Call appropriate API function based on whether an event is being edited or added
    if (editingEventId) {
      await updateExistingEvent(editingEventId, formData);
    } else {
      await createEvent(formData);
    }
  };

  // --- Delete Modal Logic ---

  /**
   * Opens the delete confirmation modal for a specific event.
   * @param id The ID of the event to be deleted.
   */
  const handleDeleteClick = (id: string) => {
    setEventToDelete(id);    // Set the ID of the event to delete
    setIsModalOpen(true);    // Open the modal
  };

  /**
   * Confirms the deletion of an event and calls the delete API.
   */
  const confirmDelete = async () => {
    if (eventToDelete) {
      await deleteExistingEvent(eventToDelete); // Call the delete API
      setEventToDelete(null);                 // Clear the event to delete
      setIsModalOpen(false);                  // Close the modal
    }
  };

  /**
   * Closes the delete confirmation modal.
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setEventToDelete(null);
  };

  // --- Dynamic Form Field Handlers (Committee and Sponsors) ---

  /**
   * Adds a new empty committee member row to the form.
   */
  const addCommitteeMember = () => setCommitteeMembers([...committeeMembers, { nama: '', jabatan: '', foto: '' }]);

  /**
   * Removes a committee member row at a specific index.
   * @param index The index of the committee member to remove.
   */
  const removeCommitteeMember = (index: number) => setCommitteeMembers(committeeMembers.filter((_, i) => i !== index));

  /**
   * Updates a specific field of a committee member at a given index.
   * @param index The index of the committee member to update.
   * @param field The field to update ('nama', 'jabatan', or 'foto').
   * @param value The new value for the field.
   */
  const updateCommitteeMember = (index: number, field: keyof CommitteeMember, value: string) => {
    const newMembers = [...committeeMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setCommitteeMembers(newMembers);
  };

  /**
   * Adds a new empty sponsor logo URL row to the form.
   */
  const addSponsorLogo = () => setSponsorLogos([...sponsorLogos, '']);

  /**
   * Removes a sponsor logo URL row at a specific index.
   * @param index The index of the sponsor logo to remove.
   */
  const removeSponsorLogo = (index: number) => setSponsorLogos(sponsorLogos.filter((_, i) => i !== index));

  /**
   * Updates the URL of a sponsor logo at a given index.
   * @param index The index of the sponsor logo to update.
   * @param value The new URL for the sponsor logo.
   */
  const updateSponsorLogo = (index: number, value: string) => {
    const newLogos = [...sponsorLogos];
    newLogos[index] = value;
    setSponsorLogos(newLogos);
  };

  // --- Filtering Logic for Event List ---

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.judul.toLowerCase().includes(searchTerm.toLowerCase()) || // Use 'judul'
                          event.pembuat.toLowerCase().includes(searchTerm.toLowerCase()); // Use 'pembuat'
    const matchesFilter = filterType === 'all' || event.jenis === filterType; // Use 'jenis'
    return matchesSearch && matchesFilter;
  });

  // --- Loading and Error States for UI ---
  if (loading && currentView === 'list') return <div className="text-center py-8 text-lg font-medium">Memuat daftar event...</div>;
  if (error && currentView === 'list') return <div className="text-center py-8 text-lg font-medium text-red-600">Error: {error}</div>;
  if (loading && currentView === 'edit') return <div className="text-center py-8 text-lg font-medium">Memuat data event untuk diedit...</div>;
  if (error && currentView === 'edit') return <div className="text-center py-8 text-lg font-medium text-red-600">Error: {error}</div>;

  // --- Main Component Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br"> {/* Removed padding here */}
      <div className=" mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8"> {/* Added padding here */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {currentView === 'list' && 'Dashboard Admin Event'}
          {currentView === 'add' && 'Tambah Event Baru'}
          {currentView === 'edit' && 'Edit Event'}
        </h1>

        {currentView === 'list' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Search Input */}
              <Input
                label="Cari Event"
                id="search"
                placeholder="Cari berdasarkan judul atau pembuat..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto flex-grow"
              />
              {/* Filter Select */}
              <Select
                label="Filter Jenis"
                id="filterType"
                options={[
                  { value: 'all', label: 'Semua' },
                  { value: 'online', label: 'Online' },
                  { value: 'offline', label: 'Offline' },
                ]}
                value={filterType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterType(e.target.value)}
                className="w-full sm:w-auto"
              />
              {/* Add New Event Button */}
              <Button onClick={handleAddNewClick} className="w-full sm:w-auto">
                Tambah Event Baru
              </Button>
            </div>

            {/* Events Table */}
            <div className="overflow-x-auto rounded-xl shadow-md">
              <table className="min-w-full bg-white border-collapse">
                <thead className="bg-green-600 text-white">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium rounded-tl-xl">Judul</th>
                    <th className="py-3 px-4 text-left font-medium">Tanggal</th>
                    <th className="py-3 px-4 text-left font-medium">Jenis</th>
                    <th className="py-3 px-4 text-left font-medium">Pembuat</th>
                    <th className="py-3 px-4 text-left font-medium rounded-tr-xl">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">Tidak ada event yang ditemukan.</td>
                    </tr>
                  ) : (
                    filteredEvents.map((event: Event) => (
                      <tr key={event.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                        <td className="py-3 px-4 text-gray-800 font-medium">{event.judul}</td> {/* Use 'judul' */}
                        <td className="py-3 px-4 text-gray-700">{new Date(event.tanggal).toLocaleDateString('id-ID')}</td> {/* Use 'tanggal' */}
                        <td className="py-3 px-4 text-gray-700">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.jenis === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}> {/* Use 'jenis' */}
                            {event.jenis === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{event.pembuat}</td> {/* Use 'pembuat' */}
                        <td className="py-3 px-4 flex space-x-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(event.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            title="Edit Event"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-1.75 2.121L.95 14.85a1 1 0 00-.293.707v3h3a1 1 0 00.707-.293l11.314-11.314-3-3z"></path></svg>
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClick(event.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            title="Hapus Event"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 2a1 1 0 100 2H8a1 1 0 000-2h5z" clipRule="evenodd"></path></svg>
                          </button>
                          {/* View Detail Link */}
                          <Link href={`/event/${event.slug}`} passHref>
                            <button
                              className="text-green-600 hover:text-green-800 transition-colors duration-200"
                              title="Lihat Detail"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path></svg>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Add/Edit Event Form */}
        {(currentView === 'add' || currentView === 'edit') && (
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Slug Input */}
            <Input
              label="Slug Event (URL unik)"
              id="slug"
              placeholder="contoh-judul-event"
              value={formData.slug}
              onChange={handleChange}
              required // HTML5 required attribute for basic validation
            />
            {/* Thumbnail URL Input */}
            <Input
              label="URL Thumbnail Event"
              id="thumbnailUrl" // Keep this ID for frontend input, mapping in handleChange
              type="url"
              placeholder="https://example.com/thumbnail.jpg"
              value={formData.thumbnail} // Use 'thumbnail' from formData
              onChange={handleChange}
              required
            />
            {/* Thumbnail Upload Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Upload Thumbnail</label>
              <input
                type="file"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'thumbnail')}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>

            {/* Title Input */}
            <Input
              label="Judul Event"
              id="title" // Keep this ID for frontend input, mapping in handleChange
              placeholder="Nama event yang menarik"
              value={formData.judul} // Use 'judul'
              onChange={handleChange}
              required
            />
            {/* Date Input */}
            <Input
              label="Tanggal Event"
              id="date" // Keep this ID for frontend input, mapping in handleChange
              type="date"
              value={formData.tanggal} // Use 'tanggal'
              onChange={handleChange}
              required
            />
            {/* Time Input */}
            <Input
              label="Jam Event"
              id="time" // Keep this ID for frontend input, mapping in handleChange
              type="time"
              value={formData.jam} // Use 'jam'
              onChange={handleChange}
              required
            />
            {/* Type Select */}
            <Select
              label="Jenis Event"
              id="type" // Keep this ID for frontend input, mapping in handleChange
              options={[
                { value: 'online', label: 'Online' },
                { value: 'offline', label: 'Offline' },
              ]}
              value={formData.jenis} // Use 'jenis'
              onChange={handleChange}
              required
            />
            {/* Location Input */}
            <Input
              label="Lokasi / Link Zoom"
              id="location" // Keep this ID for frontend input, mapping in handleChange
              placeholder="Alamat fisik atau URL Zoom/Google Meet"
              value={formData.lokasi} // Use 'lokasi'
              onChange={handleChange}
              required
            />
            {/* Creator Input */}
            <Input
              label="Nama Pembuat Event"
              id="creator" // Keep this ID for frontend input, mapping in handleChange
              placeholder="Nama Komunitas/Organisasi"
              value={formData.pembuat} // Use 'pembuat'
              onChange={handleChange}
              required
            />

            {/* Committee Structure Section */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Struktur Panitia</h2>
              {committeeMembers.map((member, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-grow w-full sm:w-auto">
                    <Input
                      label={`Nama Panitia ${index + 1}`}
                      id={`committeeStructure.${index}.name`} // Keep frontend ID, map in updateCommitteeMember
                      placeholder="Nama Lengkap"
                      value={member.nama} // Use 'nama'
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCommitteeMember(index, 'nama', e.target.value)}
                      required
                    />
                    <Input
                      label={`Jabatan Panitia ${index + 1}`}
                      id={`committeeStructure.${index}.position`} // Keep frontend ID, map in updateCommitteeMember
                      placeholder="Jabatan"
                      value={member.jabatan} // Use 'jabatan'
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCommitteeMember(index, 'jabatan', e.target.value)}
                      required
                    />
                    <Input
                      label={`URL Foto Panitia ${index + 1}`}
                      id={`committeeStructure.${index}.photoUrl`} // Keep frontend ID, map in updateCommitteeMember
                      type="url"
                      placeholder="https://example.com/foto.jpg"
                      value={member.foto} // Use 'foto'
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCommitteeMember(index, 'foto', e.target.value)}
                      required
                    />
                    <div className="mb-2">
                      <label className="block text-gray-700 text-sm font-medium mb-1">Upload Foto</label>
                      <input
                        type="file"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'committee', index)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </div>
                  </div>
                  {committeeMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCommitteeMember(index)}
                      className="ml-0 sm:ml-4 px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={addCommitteeMember} className="mt-4 bg-green-500 hover:bg-green-600">
                Tambah Panitia
              </Button>
            </div>

            {/* Sponsor Logos Section */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Logo Sponsor</h2>
              {sponsorLogos.map((logoUrl, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-grow w-full sm:w-auto">
                    <Input
                      label={`URL Logo Sponsor ${index + 1}`}
                      id={`sponsorLogos.${index}`} // Keep frontend ID, map in updateSponsorLogo
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logoUrl} // Directly use logoUrl as it's a string array
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSponsorLogo(index, e.target.value)}
                      required
                    />
                    <div className="mb-2">
                      <label className="block text-gray-700 text-sm font-medium mb-1">Upload Logo</label>
                      <input
                        type="file"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'sponsor', index)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </div>
                  </div>
                  {sponsorLogos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSponsorLogo(index)}
                      className="ml-0 sm:ml-4 px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" onClick={addSponsorLogo} className="mt-4 bg-green-500 hover:bg-green-600">
                Tambah Logo Sponsor
              </Button>
            </div>

            {/* Description Text Area */}
            <TextArea
              label="Deskripsi Event (Rich Text)"
              id="description"
              placeholder="Gunakan Markdown atau HTML sederhana untuk deskripsi."
              value={formData.deskripsi} // Use 'deskripsi'
              onChange={handleChange}
              required
            />

            {/* Form Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                type="button"
                onClick={handleBackToList}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : (editingEventId ? 'Perbarui Event' : 'Buat Event')}
              </Button>
            </div>
          </form>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Event"
        message="Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default AdminEventsPage;