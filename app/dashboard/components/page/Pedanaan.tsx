'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic'; // Import dynamic for client-side rendering of charts

// Import React Icons
import {
  FaSearch,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBuilding,
  FaMoneyCheckAlt,
  FaChartLine,
  FaDollarSign,
  FaUserTie,
  FaCalendarAlt,
  FaFilter, // For division filter
} from 'react-icons/fa';
import { MdEmail, MdPhone, MdAccountBalanceWallet, MdOutlineApartment } from 'react-icons/md';

// Dynamically import ApexCharts to ensure it's rendered on the client side
// This is crucial for libraries that rely on browser APIs
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// --- Reusable Components (Pastikan ini sudah ada atau salin dari file lain) ---
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

interface Investor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  companyName?: string;
  investmentAmount: number;
  investmentDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  notes?: string;
}

interface FundingRecord {
  id: string;
  investorId: string;
  investorName: string;
  division: 'Yhoiki Utama' | 'Services' | 'Academy' | 'Hosting' | 'Game Store' | 'Apparel' | 'Food';
  amount: number;
  lotPrice?: number; // Harga per lot, jika ada konsep lot
  date: string; // Tanggal pendanaan spesifik ini
  type: 'Equity' | 'Debt' | 'Grant';
  notes?: string;
}

interface DivisionData {
  id: string;
  name: string;
}

// --- Form Components (Sama seperti sebelumnya, tidak perlu diubah) ---
function InvestorForm({ onSubmit, initialData, onCancel }: { onSubmit: (data: Investor | Omit<Investor, 'id'>) => void; initialData?: Investor | null; onCancel: () => void }) {
    const [formData, setFormData] = useState<Omit<Investor, 'id'> | Investor>(
      initialData || {
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        companyName: '',
        investmentAmount: 0,
        investmentDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        notes: '',
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
          companyName: '',
          investmentAmount: 0,
          investmentDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          notes: '',
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Investor</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nama Perusahaan (Opsional)</label>
          <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="investmentAmount" className="block text-sm font-medium text-gray-700">Jumlah Investasi (Rp)</label>
            <input type="number" id="investmentAmount" name="investmentAmount" value={formData.investmentAmount} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="investmentDate" className="block text-sm font-medium text-gray-700">Tanggal Investasi Awal</label>
            <input type="date" id="investmentDate" name="investmentDate" value={formData.investmentDate} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status Investor</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Investor'}</button>
        </div>
      </form>
    );
  }

  function FundingRecordForm({ onSubmit, initialData, onCancel, investors, divisions }: { onSubmit: (data: FundingRecord | Omit<FundingRecord, 'id'>) => void; initialData?: FundingRecord | null; onCancel: () => void; investors: Investor[]; divisions: DivisionData[] }) {
    const [formData, setFormData] = useState<Omit<FundingRecord, 'id'> | FundingRecord>(
      initialData || {
        investorId: investors[0]?.id || '',
        investorName: investors[0]?.name || '',
        division: 'Yhoiki Utama',
        amount: 0,
        lotPrice: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'Equity',
        notes: '',
      }
    );

    useEffect(() => {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          investorId: investors[0]?.id || '',
          investorName: investors[0]?.name || '',
          division: 'Yhoiki Utama',
          amount: 0,
          lotPrice: 0,
          date: new Date().toISOString().split('T')[0],
          type: 'Equity',
          notes: '',
        });
      }
    }, [initialData, investors]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target;
      if (name === 'investorId') {
        const selectedInvestor = investors.find(inv => inv.id === value);
        setFormData((prev) => ({
          ...prev,
          investorId: value,
          investorName: selectedInvestor ? selectedInvestor.name : '',
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="investorId" className="block text-sm font-medium text-gray-700">Pilih Investor</label>
          <select id="investorId" name="investorId" value={formData.investorId} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
            {investors.length === 0 && <option value="">Tidak ada investor tersedia</option>}
            {investors.map(inv => (
              <option key={inv.id} value={inv.id}>{inv.name} ({inv.companyName || 'Individu'})</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="division" className="block text-sm font-medium text-gray-700">Divisi Tujuan</label>
          <select id="division" name="division" value={formData.division} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
            <option value="Yhoiki Utama">Yhoiki Utama</option>
            {divisions.map(div => (
              <option key={div.id} value={div.name}>{div.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah Pendanaan (Rp)</label>
            <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label htmlFor="lotPrice" className="block text-sm font-medium text-gray-700">Harga per Lot (Opsional)</label>
            <input type="number" id="lotPrice" name="lotPrice" value={formData.lotPrice} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Tanggal Pendanaan</label>
          <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipe Pendanaan</label>
          <select id="type" name="type" value={formData.type} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500">
            <option value="Equity">Equity</option>
            <option value="Debt">Debt</option>
            <option value="Grant">Grant</option>
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"></textarea>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors">Batal</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">{initialData ? 'Simpan Perubahan' : 'Tambah Pendanaan'}</button>
        </div>
      </form>
    );
  }


// --- Main FundingPage Component ---

export default function FundingPage() {
  const [investors, setInvestors] = useState<Investor[]>([
    { id: 'inv1', name: 'PT Makmur Jaya', contactPerson: 'Budi Hartono', email: 'budi@makmurjaya.com', phone: '081234567890', companyName: 'PT Makmur Jaya', investmentAmount: 500000000, investmentDate: '2024-01-15', status: 'Active', notes: 'Lead investor seed round' },
    { id: 'inv2', name: 'Anwar Sanusi', contactPerson: 'Anwar Sanusi', email: 'anwar.s@example.com', phone: '085612345678', companyName: '', investmentAmount: 100000000, investmentDate: '2024-03-01', status: 'Active', notes: 'Angel investor' },
    { id: 'inv3', name: 'PT Sejahtera Abadi', contactPerson: 'Siti Rahayu', email: 'siti@sejahteraabadi.co.id', phone: '087890123456', companyName: 'PT Sejahtera Abadi', investmentAmount: 250000000, investmentDate: '2024-05-10', status: 'Active', notes: 'Investasi untuk divisi Hosting' },
    { id: 'inv4', name: 'Fandi Ahmad', contactPerson: 'Fandi Ahmad', email: 'fandi@example.com', phone: '081122334455', companyName: '', investmentAmount: 75000000, investmentDate: '2024-06-05', status: 'Pending', notes: 'Sedang dalam negosiasi' },
  ]);

  const [fundingRecords, setFundingRecords] = useState<FundingRecord[]>([
    // Data historis untuk mendukung grafik
    { id: 'rec1', investorId: 'inv1', investorName: 'PT Makmur Jaya', division: 'Yhoiki Utama', amount: 500000000, lotPrice: 1000000, date: '2024-01-15', type: 'Equity', notes: 'Initial seed funding' },
    { id: 'rec2', investorId: 'inv2', investorName: 'Anwar Sanusi', division: 'Yhoiki Utama', amount: 100000000, lotPrice: 1200000, date: '2024-03-01', type: 'Equity', notes: 'Additional angel funding' },
    { id: 'rec3', investorId: 'inv3', investorName: 'PT Sejahtera Abadi', division: 'Hosting', amount: 250000000, lotPrice: 500000, date: '2024-05-10', type: 'Equity', notes: 'Pendanaan khusus divisi Hosting' },
    { id: 'rec4', investorId: 'inv1', investorName: 'PT Makmur Jaya', division: 'Academy', amount: 50000000, lotPrice: 1100000, date: '2024-06-01', type: 'Equity', notes: 'Pendanaan tambahan untuk Academy' },
    { id: 'rec5', investorId: 'inv4', investorName: 'Fandi Ahmad', division: 'Services', amount: 25000000, lotPrice: 900000, date: '2024-06-05', type: 'Equity', notes: 'Term sheet ditandatangani' },
    { id: 'rec6', investorId: 'inv1', investorName: 'PT Makmur Jaya', division: 'Yhoiki Utama', amount: 100000000, lotPrice: 1050000, date: '2024-06-20', type: 'Equity', notes: 'Top-up pendanaan' },
    { id: 'rec7', investorId: 'inv2', investorName: 'Anwar Sanusi', division: 'Game Store', amount: 30000000, lotPrice: 700000, date: '2024-06-25', type: 'Equity', notes: 'Investasi awal Game Store' },
  ]);

  const divisions: DivisionData[] = [
    { id: 'div1', name: 'Services' },
    { id: 'div2', name: 'Academy' },
    { id: 'div3', name: 'Hosting' },
    { id: 'div4', name: 'Game Store' },
    { id: 'div5', name: 'Apparel' },
    { id: 'div6', name: 'Food' },
  ];

  const allDivisionNames = useMemo(() => [
    'Yhoiki Utama',
    ...divisions.map(d => d.name)
  ], [divisions]);

  const [searchTermInvestors, setSearchTermInvestors] = useState<string>('');
  const [searchTermRecords, setSearchTermRecords] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'investor' | 'fundingRecord' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentEditingData, setCurrentEditingData] = useState<Investor | FundingRecord | null>(null);
  const [notifications, setNotifications] = useState<
    { id: number; type: 'success' | 'info' | 'warning' | 'error'; message: string }[]
  >([]);

  // State for chart filters
  const [selectedDivisionsForChart, setSelectedDivisionsForChart] = useState<string[]>(['Yhoiki Utama']);

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

  // --- CRUD Investors ---
  const _addInvestor = (newInvestor: Omit<Investor, 'id'>) => {
    const id = `inv${investors.length + 1}-${Date.now()}`;
    setInvestors((prev) => [...prev, { ...newInvestor, id }]);
    addNotification('success', `Investor "${newInvestor.name}" berhasil ditambahkan.`);
  };

  const _updateInvestor = (updatedInvestor: Investor) => {
    setInvestors((prev) =>
      prev.map((inv) => (inv.id === updatedInvestor.id ? updatedInvestor : inv))
    );
    // Update investorName in funding records if investor name changed
    setFundingRecords(prev => prev.map(rec =>
        rec.investorId === updatedInvestor.id ? { ...rec, investorName: updatedInvestor.name } : rec
    ));
    addNotification('success', `Investor "${updatedInvestor.name}" berhasil diperbarui.`);
  };

  const deleteInvestor = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus investor "${name}" ini dan semua catatan pendanaannya?`)) {
      setInvestors((prev) => prev.filter((inv) => inv.id !== id));
      setFundingRecords((prev) => prev.filter((rec) => rec.investorId !== id)); // Hapus juga catatan pendanaan terkait
      addNotification('warning', `Investor "${name}" dan catatan pendanaannya berhasil dihapus.`);
    }
  };

  // --- CRUD Funding Records ---
  const _addFundingRecord = (newRecord: Omit<FundingRecord, 'id'>) => {
    const id = `rec${fundingRecords.length + 1}-${Date.now()}`;
    setFundingRecords((prev) => [...prev, { ...newRecord, id }]);
    addNotification('success', `Pendanaan dari "${newRecord.investorName}" untuk divisi ${newRecord.division} berhasil ditambahkan.`);
  };

  const _updateFundingRecord = (updatedRecord: FundingRecord) => {
    setFundingRecords((prev) =>
      prev.map((rec) => (rec.id === updatedRecord.id ? updatedRecord : rec))
    );
    addNotification('success', `Pendanaan dari "${updatedRecord.investorName}" berhasil diperbarui.`);
  };

  const deleteFundingRecord = (id: string, investorName: string, division: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan pendanaan dari "${investorName}" untuk divisi ${division} ini?`)) {
      setFundingRecords((prev) => prev.filter((rec) => rec.id !== id));
      addNotification('warning', `Catatan pendanaan dari "${investorName}" untuk divisi ${division} berhasil dihapus.`);
    }
  };

  // --- Form Handlers ---
  const handleAddClick = (type: 'investor' | 'fundingRecord') => {
    setModalType(type);
    setEditingId(null);
    setCurrentEditingData(null);
    setIsModalOpen(true);
  };

  const handleEditInvestorClick = (investor: Investor) => {
    setModalType('investor');
    setEditingId(investor.id);
    setCurrentEditingData(investor);
    setIsModalOpen(true);
  };

  const handleEditFundingRecordClick = (record: FundingRecord) => {
    setModalType('fundingRecord');
    setEditingId(record.id);
    setCurrentEditingData(record);
    setIsModalOpen(true);
  };

  const handleSaveData = (data: Investor | FundingRecord | Omit<Investor, 'id'> | Omit<FundingRecord, 'id'>) => {
    if (modalType === 'investor') {
      if ('id' in data && data.id) {
        _updateInvestor(data as Investor);
      } else {
        _addInvestor(data as Omit<Investor, 'id'>);
      }
    } else if (modalType === 'fundingRecord') {
      if ('id' in data && data.id) {
        _updateFundingRecord(data as FundingRecord);
      } else {
        _addFundingRecord(data as Omit<FundingRecord, 'id'>);
      }
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setEditingId(null);
    setCurrentEditingData(null);
  };

  // --- Filtered Data ---
  const filteredInvestors = investors.filter(inv =>
    Object.values(inv).some(val =>
      String(val).toLowerCase().includes(searchTermInvestors.toLowerCase())
    )
  );

  const filteredFundingRecords = fundingRecords.filter(rec =>
    Object.values(rec).some(val =>
      String(val).toLowerCase().includes(searchTermRecords.toLowerCase())
    )
  );

  // --- Data for Charts & Statistics ---
  const totalFunding = fundingRecords.reduce((sum, rec) => sum + rec.amount, 0);

  // Chart 1: Total Pendanaan per Divisi (Bar Chart)
  const chartDataForDivisions = useMemo(() => {
    const fundingPerDivision: { [key: string]: number } = {};
    fundingRecords.forEach(rec => {
      fundingPerDivision[rec.division] = (fundingPerDivision[rec.division] || 0) + rec.amount;
    });

    const categories = Object.keys(fundingPerDivision).sort();
    const seriesData = categories.map(div => fundingPerDivision[div]);

    return { categories, seriesData };
  }, [fundingRecords]);

  const barChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5, // Fix: Changed from endingShape to borderRadius
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: chartDataForDivisions.categories,
      title: { text: 'Divisi' },
    },
    yaxis: {
      title: { text: 'Total Pendanaan (Rp)' },
      labels: {
        formatter: function (val: number) {
          return "Rp " + (val / 1000000).toLocaleString('id-ID') + ' Jt';
        },
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return "Rp " + val.toLocaleString('id-ID');
        },
      },
    },
    title: {
      text: 'Total Pendanaan per Divisi',
      align: 'left',
      style: {
        fontSize: '16px',
        color: '#333'
      }
    },
    colors: ['#4CAF50'], // Green color
  };

  const barChartSeries = [{
    name: 'Total Pendanaan',
    data: chartDataForDivisions.seriesData,
  }];


  // Chart 2: Perkembangan Harga per Lot & Total Gabungan (Line Chart)
  // Process historical lot price data
  const lotPriceChartData = useMemo(() => {
    const dailyData: { [date: string]: { [division: string]: { totalLotPrice: number, count: number } } } = {};

    // Collect data per day per division
    fundingRecords.forEach(record => {
      if (record.lotPrice !== undefined && record.lotPrice > 0) {
        const date = record.date;
        if (!dailyData[date]) {
          dailyData[date] = {};
        }
        if (!dailyData[date][record.division]) {
          dailyData[date][record.division] = { totalLotPrice: 0, count: 0 };
        }
        dailyData[date][record.division].totalLotPrice += record.lotPrice;
        dailyData[date][record.division].count += 1;
      }
    });

    // Sort dates
    const dates = Object.keys(dailyData).sort();

    // Prepare series for each division and for Yhoiki Utama (aggregated)
    const seriesMap: { [key: string]: { x: string, y: number | null }[] } = {};
    allDivisionNames.forEach(divName => {
        seriesMap[divName] = [];
    });

    dates.forEach(date => {
        let totalLotPriceForDay = 0;
        let totalCountForDay = 0;

        allDivisionNames.forEach(divName => {
            if (divName !== 'Yhoiki Utama') {
                const data = dailyData[date]?.[divName];
                const avgLotPrice = data ? data.totalLotPrice / data.count : null;
                seriesMap[divName].push({ x: date, y: avgLotPrice });

                if (data) {
                    totalLotPriceForDay += data.totalLotPrice;
                    totalCountForDay += data.count;
                }
            }
        });
        // Calculate Yhoiki Utama average
        const avgYhoikiUtamaLotPrice = totalCountForDay > 0 ? totalLotPriceForDay / totalCountForDay : null;
        seriesMap['Yhoiki Utama'].push({ x: date, y: avgYhoikiUtamaLotPrice });
    });

    return seriesMap;
  }, [fundingRecords, allDivisionNames]);


  const lineChartSeries = useMemo(() => {
    return selectedDivisionsForChart
        .map(divName => ({
            name: divName,
            data: lotPriceChartData[divName] || []
        }))
        .filter(series => series.data.length > 0 && series.data.some(point => point.y !== null)); // Filter out empty series
  }, [selectedDivisionsForChart, lotPriceChartData]);

  const lineChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 350,
      zoom: { enabled: true },
      toolbar: { show: true, tools: { zoom: true, pan: true, download: true, customIcons: [] } },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    title: {
      text: 'Perkembangan Harga Rata-rata per Lot',
      align: 'left',
      style: {
        fontSize: '16px',
        color: '#333'
      }
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeFormatter: {
          year: 'yyyy',
          month: 'MMM \'yy',
          day: 'dd MMM',
          hour: 'HH:mm'
        }
      },
      title: { text: 'Tanggal' },
    },
    yaxis: {
      title: { text: 'Harga per Lot (Rp)' },
      labels: {
        formatter: function (val: number) {
          return "Rp " + val.toLocaleString('id-ID');
        },
      },
    },
    tooltip: {
      x: { format: 'dd MMM yyyy' }, // Fix: Ensured datetime format consistency with 'dd MMM yyyy'
      y: {
        formatter: function (val: number) {
          return "Rp " + val.toLocaleString('id-ID');
        },
      },
    },
    legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
    },
    colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26A69A'], // Variety of colors for lines
  };

  const handleDivisionToggle = (divisionName: string) => {
    setSelectedDivisionsForChart(prev =>
      prev.includes(divisionName)
        ? prev.filter(name => name !== divisionName)
        : [...prev, divisionName]
    );
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

      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Manajemen Pendanaan & Investor</h1>

      {/* Overview Statistics */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ringkasan Pendanaan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Total Pendanaan Terkumpul</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">Rp {totalFunding.toLocaleString('id-ID')}</p>
            </div>
            <MdAccountBalanceWallet className="text-blue-500 text-5xl" />
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700">Jumlah Investor Aktif</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{investors.filter(inv => inv.status === 'Active').length}</p>
            </div>
            <FaBuilding className="text-purple-500 text-5xl" />
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700">Jumlah Pendanaan Tercatat</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{fundingRecords.length}</p>
            </div>
            <FaMoneyCheckAlt className="text-yellow-500 text-5xl" />
          </div>
        </div>

        {/* Charts Section */}
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Grafik Statistik Pendanaan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            {/* Total Funding per Division Chart */}
            <Chart
              options={barChartOptions}
              series={barChartSeries}
              type="bar"
              height={350}
            />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            {/* Lot Price Development Chart */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Divisi untuk Grafik Harga Lot:</label>
                <div className="flex flex-wrap gap-2">
                    {allDivisionNames.map(divName => (
                        <button
                            key={divName}
                            onClick={() => handleDivisionToggle(divName)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200
                                ${selectedDivisionsForChart.includes(divName)
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {divName}
                        </button>
                    ))}
                </div>
            </div>
            {lineChartSeries.length > 0 ? (
                <Chart
                    options={lineChartOptions}
                    series={lineChartSeries}
                    type="line"
                    height={350}
                />
            ) : (
                <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md">
                    <FaChartLine className="text-4xl mr-2" /> Pilih setidaknya satu divisi untuk melihat grafik harga lot.
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Section: Manage Investors */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Daftar Investor</h2>
          <button
            onClick={() => handleAddClick('investor')}
            className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <FaPlusCircle className="mr-2" /> Tambah Investor
          </button>
        </div>

        <div className="mb-6 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Investor..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
            value={searchTermInvestors}
            onChange={(e) => setSearchTermInvestors(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Investor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Investasi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Investasi Awal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvestors.map((investor) => (
                <tr key={investor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{investor.name}</div>
                    {investor.companyName && <div className="text-xs text-gray-500">{investor.companyName}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="flex items-center"><FaUserTie className="mr-2 text-gray-500" />{investor.contactPerson}</div>
                    <div className="flex items-center"><MdEmail className="mr-2 text-gray-500" /><a href={`mailto:${investor.email}`} className="text-blue-600 hover:underline">{investor.email}</a></div>
                    <div className="flex items-center"><MdPhone className="mr-2 text-gray-500" /><a href={`tel:${investor.phone}`} className="text-blue-600 hover:underline">{investor.phone}</a></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Rp {investor.investmentAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{investor.investmentDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      investor.status === 'Active' ? 'bg-green-100 text-green-800' :
                      investor.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {investor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditInvestorClick(investor)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Edit Investor"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => deleteInvestor(investor.id, investor.name)}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Hapus Investor"
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

      {/* Section: Manage Funding Records */}
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Catatan Pendanaan</h2>
          <button
            onClick={() => handleAddClick('fundingRecord')}
            className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <FaPlusCircle className="mr-2" /> Tambah Catatan Pendanaan
          </button>
        </div>

        <div className="mb-6 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari Catatan Pendanaan..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
            value={searchTermRecords}
            onChange={(e) => setSearchTermRecords(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisi</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga/Lot</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFundingRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.investorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center"><MdOutlineApartment className="mr-2 text-gray-500" />{record.division}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Rp {record.amount.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {record.lotPrice ? `Rp ${record.lotPrice.toLocaleString('id-ID')}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center"><FaCalendarAlt className="mr-2 text-gray-500" />{record.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.type === 'Equity' ? 'bg-indigo-100 text-indigo-800' :
                      record.type === 'Debt' ? 'bg-orange-100 text-orange-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditFundingRecordClick(record)}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-full hover:bg-blue-50"
                        title="Edit Catatan Pendanaan"
                      >
                        <FaEdit className="text-lg" />
                      </button>
                      <button
                        onClick={() => deleteFundingRecord(record.id, record.investorName, record.division)}
                        className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Hapus Catatan Pendanaan"
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


      {/* Modal for Add/Edit Investor or Funding Record */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-2xl transform transition-all scale-100 opacity-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {editingId ?
                (modalType === 'investor' ? 'Edit Investor' : 'Edit Catatan Pendanaan') :
                (modalType === 'investor' ? 'Tambah Investor Baru' : 'Tambah Catatan Pendanaan Baru')
              }
            </h3>
            {modalType === 'investor' && (
              <InvestorForm
                onSubmit={handleSaveData}
                initialData={currentEditingData as Investor | null}
                onCancel={handleCloseModal}
              />
            )}
            {modalType === 'fundingRecord' && (
              <FundingRecordForm
                onSubmit={handleSaveData}
                initialData={currentEditingData as FundingRecord | null}
                onCancel={handleCloseModal}
                investors={investors}
                divisions={divisions}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}