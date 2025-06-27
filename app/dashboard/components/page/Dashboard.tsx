'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaBars,
  FaUserPlus,
  FaMoneyCheckAlt,
  FaComments,
  FaChartLine,
  FaCheckCircle,
  FaUsers, // For Total Member
  FaShoppingCart, // For Transaksi Total / Order Masuk
  FaEye, // For Pengunjung Hari Ini
  FaStore, // For Seller Aktif
  FaWallet, // For Saldo Yhoiki
  FaCalendarAlt, // For Event/Schedule
  FaHandshake, // For Partnership requests
  FaBuilding, // For Investors/Funding
  FaCogs, // For Services Division
  FaGraduationCap, // For Academy Division
  FaServer, // For Hosting Division
  FaGamepad, // For Game Store Division
  FaTshirt, // For Apparel Division
  FaUtensils, // For Food Division
  FaExchangeAlt, // For Total Fundings
  FaLink, // For New Partnerships
  FaUserTag, // For New Reseller Registrations
  FaPlusCircle,
  FaRocket,
  FaLightbulb, // For Quick Add Event Button
} from 'react-icons/fa';
import {
  MdAddBox,
  MdVerifiedUser,
  MdOutlineAttachMoney,
  MdEventAvailable,
  MdInfo,
  MdError,
  MdCheckCircle,
  MdSupervisorAccount, // For Manage Partners/Mitra
  MdAttachMoney, // For Manage Funding
  MdApartment, // For Manage Divisions
  MdEdit, // For Edit Event
  MdDelete, // For Delete Event
  MdOutlineMonetizationOn, // For Net Revenue
  MdOutlineReceiptLong, // For Expenses
  MdOutlineSwapHoriz, // For Cash Flow
} from 'react-icons/md';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts'; // Import ApexOptions type

// Import FullCalendar components and plugins
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction'; // for selectable dates

// --- Reusable Components ---

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center space-x-3 transition-all duration-300 hover:shadow-lg">
      <div className="text-3xl text-green-600">{icon}</div> {/* Theme: Green 600 */}
      <div>
        <h3 className="text-lg font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
}

function ShortcutCard({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white flex flex-col items-center justify-center p-4 rounded-xl shadow hover:bg-gray-50 transition-all duration-300 space-y-2 text-center"
    >
      <div className="text-3xl">{icon}</div>
      <span className="text-gray-800 font-medium text-sm">{label}</span>
    </button>
  );
}

// Updated ListCard to accept icon and message for activities
function ListCard({ title, items }: { title: string; items: { text: string; icon?: React.ReactNode }[] }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex-1">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <ul className="divide-y divide-gray-200">
        {items.map((item, idx) => (
          <li key={idx} className="py-2 text-gray-700 text-sm flex items-center">
            {item.icon && <span className="mr-2 text-lg text-green-500">{item.icon}</span>}
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventCard({ title, date, description }: { title: string; date: string; description: string }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center space-x-2 mb-1">
        <FaCalendarAlt className="text-green-500 text-lg" />
        <h4 className="text-md font-semibold text-gray-800">{title}</h4>
      </div>
      <p className="text-sm text-gray-500 mb-2">{date}</p>
      <p className="text-gray-700 text-sm">{description}</p>
    </div>
  );
}

// New Modal Component for Event Details
function EventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: {
  event: any;
  onClose: () => void;
  onEdit: (id: string, newTitle: string, newDate: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(event.title);
  const [editedDate, setEditedDate] = useState(event.date || event.start);
  const dateObj = new Date(event.date || event.start);
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleSave = () => {
    onEdit(event.id || event.title, editedTitle, editedDate); // Use event.id if available, otherwise title as fallback
    setEditMode(false);
    onClose(); // Close modal after saving
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fade-in-up">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-2xl font-bold text-gray-800">Detail Event</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">
            &times;
          </button>
        </div>
        {!editMode ? (
          <>
            <p className="text-lg font-semibold text-gray-700 mb-2">{event.title}</p>
            <p className="text-md text-gray-600 mb-4">
              <FaCalendarAlt className="inline mr-2 text-green-500" />
              {formattedDate}
            </p>
            {event.description && <p className="text-gray-700 mb-4">{event.description}</p>}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MdEdit className="mr-2" /> Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin menghapus event '${event.title}'?`)) {
                    onDelete(event.id || event.title); // Use event.id if available, otherwise title as fallback
                    onClose();
                  }
                }}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <MdDelete className="mr-2" /> Hapus
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                Judul Event
              </label>
              <input
                type="text"
                id="edit-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Event
              </label>
              <input
                type="date"
                id="edit-date"
                value={editedDate.split('T')[0]} // Ensure date format for input type="date"
                onChange={(e) => setEditedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// New component for Progress Bar
function ProgressBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = Math.round((value / max) * 100);
  const progressBarColor = percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-medium text-gray-600 mb-2">{label}</h3>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className={`${progressBarColor} h-3 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="text-sm text-gray-800 mt-2">
        {value.toLocaleString('id-ID')} / {max.toLocaleString('id-ID')} ({percentage}%)
      </p>
    </div>
  );
}

// NEW: Financial Summary Chart Component
function FinancialSummaryChart({
  netRevenue,
  expenses,
  cashFlow,
}: {
  netRevenue: number;
  expenses: number;
  cashFlow: number;
}) {
  const series = [{ data: [netRevenue, expenses, cashFlow] }];
  const options: ApexOptions = {
    chart: {
      id: 'financial-summary-bar-chart',
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return `Rp ${val.toLocaleString('id-ID')}`;
      },
      style: {
        colors: ['#333'],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Pendapatan Bersih', 'Pengeluaran', 'Arus Kas'],
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      title: {
        text: 'Jumlah (Rp)',
      },
      labels: {
        formatter: function (val: number) {
          return `Rp ${val.toLocaleString('id-ID')}`;
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `Rp ${val.toLocaleString('id-ID')}`;
        },
      },
    },
    colors: ['#22C55E', '#F44336', '#03A9F4'], // Green for revenue, Red for expenses, Blue for cash flow
    grid: {
      borderColor: '#f1f1f1',
    },
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Ringkasan Keuangan Bulan Ini</h3>
      <Chart options={options} series={series} type="bar" height={350} />
    </div>
  );
}

// --- Error Boundary Component ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl shadow text-red-700 text-center">
          <MdError className="text-red-600 text-5xl mb-4" />
          <h2 className="text-xl font-bold mb-2">Oops! Something went wrong.</h2>
          <p className="text-sm">We're sorry for the inconvenience. Please try refreshing the page.</p>
          {this.state.error && (
            <details className="mt-4 text-xs text-red-500">
              <summary>Error Details</summary>
              <pre className="whitespace-pre-wrap break-all text-left">{this.state.error.message}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Dashboard Page ---
export default function DashboardPage() {
  const [notifications, setNotifications] = useState<
    { id: number; type: 'success' | 'info' | 'warning'; message: string }[]
  >([]);
  const [selectedRevenueType, setSelectedRevenueType] = useState<'overall' | 'division'>('overall');
  const [selectedDivisionForRevenue, setSelectedDivisionForRevenue] = useState<string>('Service');

  // State for event filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('All');

  // State for selected event in modal
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const [events, setEvents] = useState<any[]>([
    { id: '1', title: 'Meeting Bulanan Divisi Service', date: '2025-05-15', division: 'Service', description: 'Evaluasi kinerja bulan Mei dan perencanaan strategi Juni.' },
    { id: '2', title: 'Webinar Pemasaran Digital', date: '2025-07-05', division: 'Academy', description: 'Pelatihan strategi pemasaran digital untuk UMKM.' },
    { id: '3', title: 'Meetup Komunitas Developer', date: '2025-07-13', division: 'Service', description: 'Sesi berbagi pengetahuan tentang teknologi terbaru.' },
    { id: '4', title: 'Sesi Edukasi Investor', date: '2025-07-17', division: 'Utama', description: 'Diskusi peluang investasi bersama investor potensial.' },
    { id: '5', title: 'Evaluasi Kinerja Q2 & Strategi Q3', date: '2025-07-22', division: 'Utama', description: 'Rapat direksi untuk meninjau pencapaian dan menyusun strategi.' },
    { id: '6', title: 'Pameran Produk Baru', date: '2025-08-01', division: 'Apparel', description: 'Peluncuran koleksi pakaian terbaru Yhoiki Apparel.' },
    { id: '7', title: 'Turnamen Game Online', date: '2025-08-10', division: 'Store Game', description: 'Kompetisi game online antar komunitas.' },
    { id: '8', title: 'Pelatihan Keamanan Siber', date: '2025-09-03', division: 'Hosting', description: 'Workshop tentang praktik terbaik keamanan siber.' },
    { id: '9', title: 'Lokakarya Reseller Food', date: '2025-09-20', division: 'Food', description: 'Pembinaan untuk reseller divisi Food.' },
    { id: '10', title: 'Rapat Direksi Akhir Tahun', date: '2025-12-10', division: 'Utama', description: 'Rapat penutup tahun dan perencanaan tahun depan.' },
  ].map(event => ({ ...event, backgroundColor: '#34D399', borderColor: '#34D399' }))); // Add color properties

  const calendarRef = useRef<FullCalendar>(null);

  const [currentMonthEvents, setCurrentMonthEvents] = useState<any[]>([]);
  const [currentMonthName, setCurrentMonthName] = useState<string>('');

  const addNotification = (type: 'success' | 'info' | 'warning', message: string) => {
    const newId = notifications.length > 0 ? Math.max(...notifications.map((n) => n.id)) + 1 : 1;
    setNotifications((prev) => [...prev, { id: newId, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== newId));
    }, 5000);
  };

  useEffect(() => {
    const timer1 = setTimeout(() => addNotification('info', 'Investor baru melakukan pendanaan transaksi.'), 2000);
    const timer2 = setTimeout(() => addNotification('success', 'Pendaftaran mitra seller baru: "Yoga Pratama".'), 7000);
    const timer3 = setTimeout(() => addNotification('warning', 'Permintaan partnership baru dari "PT Maju Bersama".'), 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const themeGreen500 = '#22C55E';
  const themeGreen600 = '#16A34A';

  const overallWeeklyRevenueSeries = [
    {
      name: 'Pendapatan Yhoiki Utama',
      data: [3500000, 4200000, 3800000, 5000000, 5500000, 6000000, 4800000],
    },
  ];

  const divisionalWeeklyRevenueData = {
    Service: [1200000, 1500000, 1300000, 1800000, 2000000, 2100000, 1900000],
    Academy: [500000, 600000, 450000, 700000, 750000, 800000, 650000],
    Hosting: [800000, 900000, 700000, 1000000, 1100000, 1200000, 950000],
    'Store Game': [400000, 450000, 350000, 500000, 550000, 600000, 480000],
    Apparel: [300000, 350000, 280000, 400000, 420000, 450000, 380000],
    Food: [300000, 400000, 320000, 450000, 500000, 550000, 440000],
  };

  const currentWeeklyRevenueSeries =
    selectedRevenueType === 'overall'
      ? overallWeeklyRevenueSeries
      : [{ name: `Pendapatan Divisi ${selectedDivisionForRevenue}`, data: divisionalWeeklyRevenueData[selectedDivisionForRevenue as keyof typeof divisionalWeeklyRevenueData] || [] }];

  const weeklyRevenueOptions: ApexOptions = {
    chart: { id: 'pendapatan-mingguan-yhoiki', toolbar: { show: false } },
    xaxis: { categories: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'] },
    stroke: { curve: 'smooth', width: 3 },
    colors: [themeGreen500],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `Rp ${val.toLocaleString('id-ID')}`;
        },
      },
    },
    grid: {
      borderColor: '#f1f1f1',
    },
    dataLabels: { enabled: false },
  };

  const memberGrowthOptions: ApexOptions = {
    chart: { id: 'member-growth', toolbar: { show: false } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'] },
    stroke: { curve: 'smooth', width: 3 },
    colors: [themeGreen600],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `${val} Members`;
        },
      },
    },
    grid: {
      borderColor: '#f1f1f1',
    },
    dataLabels: { enabled: false },
  };

  const memberGrowthSeries = [
    {
      name: 'Total Member',
      data: [1000, 1050, 1100, 1150, 1200, 1230, 1250, 1270, 1300, 1320, 1350, 1380],
    },
  ];

  const fundingStatusOptions: ApexOptions = {
    chart: { id: 'funding-status', type: 'donut', toolbar: { show: false } },
    labels: ['Approved', 'Pending Approval', 'Rejected', 'In Review'],
    colors: [themeGreen500, '#FFC107', '#F44336', '#03A9F4'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 280,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    legend: {
      position: 'right',
      offsetY: 0,
      height: 150,
    },
    dataLabels: { enabled: true },
  };

  const fundingStatusSeries = [65, 20, 5, 10];

  const divisionalRevenueOptions: ApexOptions = {
    chart: { id: 'divisi-revenue', stacked: true, toolbar: { show: false } },
    xaxis: {
      categories: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025'],
    },
    colors: [themeGreen600, '#673AB7', '#00BCD4', '#FFEB3B', '#E91E63', '#4CAF50'],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 5,
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '13px',
              fontWeight: 900,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { position: 'bottom' },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `Rp ${val.toLocaleString('id-ID')}`;
        },
      },
    },
    grid: {
      borderColor: '#f1f1f1',
    },
  };

  const divisionalRevenueSeries = [
    { name: 'Service', data: [44000000, 55000000, 41000000, 67000000, 70000000, 75000000] },
    { name: 'Academy', data: [13000000, 23000000, 20000000, 8000000, 27000000, 30000000] },
    { name: 'Hosting', data: [11000000, 17000000, 15000000, 20000000, 22000000, 25000000] },
    { name: 'Store Game', data: [7000000, 9000000, 10000000, 12000000, 15000000, 18000000] },
    { name: 'Apparel', data: [5000000, 7000000, 8000000, 10000000, 11000000, 13000000] },
    { name: 'Food', data: [9000000, 11000000, 13000000, 15000000, 17000000, 20000000] },
  ];

  const investorFundingOptions: ApexOptions = {
    chart: { id: 'investor-funding', toolbar: { show: false } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'] },
    stroke: { curve: 'stepline', width: 3 },
    colors: [themeGreen500],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `Rp ${val.toLocaleString('id-ID')}`;
        },
      },
    },
    grid: {
      borderColor: '#f1f1f1',
    },
    dataLabels: { enabled: false },
  };

  const investorFundingSeries = [
    {
      name: 'Pendanaan Investor',
      data: [50000000, 75000000, 60000000, 90000000, 80000000, 100000000],
    },
  ];

  // Function to generate a simple unique ID
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleAddEvent = useCallback((startStr: string, endStr: string, allDay: boolean) => {
    const title = prompt('Masukkan Judul Event Baru Anda:');
    const description = prompt('Masukkan Deskripsi Event (opsional):');
    const division = prompt('Masukkan Divisi Event (contoh: Service, Academy, Utama):'); // Prompt for division

    if (title) {
      const newEvent = {
        id: generateUniqueId(), // Add a unique ID
        title,
        start: startStr,
        end: endStr,
        allDay,
        backgroundColor: themeGreen500,
        borderColor: themeGreen500,
        date: startStr.split('T')[0], // Store date for list filtering
        description: description || '',
        division: division || 'Lain-lain', // Default division if not provided
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      addNotification('success', `Event "${title}" berhasil ditambahkan!`);
    }
  }, [events, addNotification, themeGreen500]); // Include dependencies

  const handleDateSelect = (selectInfo: any) => {
    handleAddEvent(selectInfo.startStr, selectInfo.endStr, selectInfo.allDay);
  };

  const handleEventClick = (clickInfo: any) => {
    // Open modal with event details instead of direct delete confirmation
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      allDay: clickInfo.event.allDay,
      date: clickInfo.event.startStr.split('T')[0], // Ensure date for consistency
      description: clickInfo.event.extendedProps.description,
      division: clickInfo.event.extendedProps.division,
    });
  };

  const handleEditEvent = (id: string, newTitle: string, newDate: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === id ? { ...event, title: newTitle, start: newDate, date: newDate.split('T')[0] } : event
      )
    );
    addNotification('success', `Event "${newTitle}" berhasil diperbarui!`);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
    addNotification('warning', `Event telah dihapus.`);
  };

  const updateMonthlyEventList = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentView = calendarApi.view;

      if (currentView.type === 'dayGridMonth') {
        const startOfMonth = currentView.currentStart;
        const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0); // Correct end of month

        setCurrentMonthName(startOfMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' }));

        const filtered = events.filter((event) => {
          const eventDate = new Date(event.date || event.start);
          const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesDivision = filterDivision === 'All' || event.division === filterDivision;
          return eventDate >= startOfMonth && eventDate <= endOfMonth && matchesSearch && matchesDivision;
        }).sort((a, b) => new Date(a.date || a.start).getTime() - new Date(b.date || b.start).getTime());

        setCurrentMonthEvents(filtered);
      }
    }
  }, [events, searchTerm, filterDivision]); // Depend on searchTerm and filterDivision

  useEffect(() => {
    updateMonthlyEventList();
  }, [events, updateMonthlyEventList]); // Re-run when events state changes or updateMonthlyEventList changes

  const handleViewChange = () => {
    updateMonthlyEventList();
  };

  // Define icons for activity list
  const activityIcons: { [key: string]: React.ReactNode } = {
    '🤝': <FaHandshake />,
    '💰': <FaMoneyCheckAlt />,
    '👤': <FaUserPlus />,
    '🚀': <FaRocket />, // Assuming FaRocket is available, or use a generic one
    '✅': <FaCheckCircle />,
    '📈': <FaChartLine />,
    '💡': <FaLightbulb />, // Assuming FaLightbulb is available
  };
  // Fallback if FaRocket/FaLightbulb are not imported, use a generic one
  const getIconForActivity = (activityText: string) => {
    if (activityText.includes('partnership')) return <FaHandshake />;
    if (activityText.includes('pendanaan')) return <FaMoneyCheckAlt />;
    if (activityText.includes('pendaftaran')) return <FaUserPlus />;
    if (activityText.includes('meluncurkan produk')) return <FaShoppingCart />;
    if (activityText.includes('verifikasi')) return <MdVerifiedUser />;
    if (activityText.includes('evaluasi kinerja')) return <FaChartLine />;
    if (activityText.includes('proposal pendanaan')) return <MdOutlineAttachMoney />;
    return null; // No specific icon
  };

  const activityListItems = [
    { text: 'Permintaan partnership baru dari "PT Solusi Digital"', icon: getIconForActivity('partnership') },
    { text: 'Pendanaan investor masuk untuk Divisi Hosting', icon: getIconForActivity('pendanaan') },
    { text: 'Pendaftaran mitra reseller baru: "Andi Wijaya"', icon: getIconForActivity('pendaftaran') },
    { text: 'Divisi Game Store meluncurkan produk baru', icon: getIconForActivity('meluncurkan produk') },
    { text: 'Verifikasi seller layanan "Desain Grafis Jaya" selesai', icon: getIconForActivity('verifikasi') },
    { text: 'Rapat evaluasi kinerja Q2 lintas divisi', icon: getIconForActivity('evaluasi kinerja') },
    { text: 'Proposal pendanaan baru dari "Visionary Capital"', icon: getIconForActivity('proposal pendanaan') },
  ];


  const availableDivisions = ['All', ...Object.keys(divisionalWeeklyRevenueData), 'Utama', 'Lain-lain']; // Add 'Utama' and 'Lain-lain' for events

  return (
    <ErrorBoundary>
      <div className="flex flex-col p-6 space-y-8 bg-gray-100 min-h-screen">
        {/* Notifications Area */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-center p-4 rounded-lg shadow-md text-white transition-all duration-300 transform translate-x-0 ${
                notif.type === 'success'
                  ? 'bg-green-500'
                  : notif.type === 'info'
                  ? 'bg-blue-500'
                  : 'bg-yellow-500'
              }`}
            >
              {notif.type === 'success' && <MdCheckCircle className="text-xl mr-2" />}
              {notif.type === 'info' && <MdInfo className="text-xl mr-2" />}
              {notif.type === 'warning' && <MdError className="text-xl mr-2" />}
              <span>{notif.message}</span>
              <button onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))} className="ml-4 text-white hover:text-gray-200">
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* Modal for Event Details */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        )}

        {/* Statistik Ringkas - Focus on overall Yhoiki health */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <StatCard title="Total Mitra (Reseller/Seller)" value="1.230" icon={<FaUsers />} />
          <StatCard title="Total Pendanaan Masuk" value="Rp 500.000.000" icon={<FaExchangeAlt />} />
          <StatCard title="Partnership Baru" value="12" icon={<FaHandshake />} />
          <StatCard title="Divisi Aktif" value="6" icon={<MdApartment />} />
          <StatCard title="Pengunjung Utama Hari Ini" value="3.450" icon={<FaEye />} />
          <StatCard title="Saldo Utama Yhoiki" value="Rp 120.000.000" icon={<FaWallet />} />
          {/* Keep these StatCards for quick overview */}
          <StatCard title="Pendapatan Bersih Bulan Ini" value="Rp 85.000.000" icon={<MdOutlineMonetizationOn />} />
          <StatCard title="Pengeluaran Bulan Ini" value="Rp 25.000.000" icon={<MdOutlineReceiptLong />} />
          <StatCard title="Arus Kas Bulan Ini" value="Rp +60.000.000" icon={<MdOutlineSwapHoriz />} />
        </div>

        {/* NEW: Financial Summary Chart */}
        <FinancialSummaryChart
          netRevenue={85000000}
          expenses={25000000}
          cashFlow={60000000}
        />

        {/* Progress Bars for Goals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProgressBar label="Target Mitra Baru Bulan Ini" value={80} max={100} />
            <ProgressBar label="Target Pendanaan Q3" value={75000000} max={100000000} />
            <ProgressBar label="Target Pelatihan Academy" value={5} max={8} />
        </div>

        {/* Charts Section - Revenue Chart with Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Grafik Pendapatan Mingguan</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedRevenueType('overall')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedRevenueType === 'overall' ? 'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Yhoiki Utama
                </button>
                <button
                  onClick={() => setSelectedRevenueType('division')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedRevenueType === 'division' ? 'bg-green-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Per Divisi
                </button>
              </div>
            </div>
            {selectedRevenueType === 'division' && (
              <div className="mb-4">
                <label htmlFor="division-select" className="block text-sm font-medium text-gray-700 mb-1">Pilih Divisi:</label>
                <select
                  id="division-select"
                  value={selectedDivisionForRevenue}
                  onChange={(e) => setSelectedDivisionForRevenue(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  {Object.keys(divisionalWeeklyRevenueData).map((division) => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>
              </div>
            )}
            <Chart options={weeklyRevenueOptions} series={currentWeeklyRevenueSeries} type="line" height={300} />
          </div>

          {/* Grafik Pertumbuhan Mitra/Member Overall */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Pertumbuhan Mitra & Member</h3>
            <Chart options={memberGrowthOptions} series={memberGrowthSeries} type="area" height={300} />
          </div>
        </div>

        {/* Charts Section - Row 2 (Funding Status & Investor Funding Trend) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribusi Status Pendanaan Investor */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Distribusi Status Pendanaan</h3>
            <Chart options={fundingStatusOptions} series={fundingStatusSeries} type="donut" width={380} />
          </div>

          {/* Pendanaan Investor (Bulanan) */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Pendanaan Investor (Bulanan)</h3>
            <Chart options={investorFundingOptions} series={investorFundingSeries} type="line" height={300} />
          </div>
        </div>

        {/* Divisional Revenue Chart - This is perfect for main dashboard oversight */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Pendapatan Divisi (Per Kuartal)</h3>
          <Chart options={divisionalRevenueOptions} series={divisionalRevenueSeries} type="bar" height={350} />
        </div>

        {/* Aktivitas Terbaru & Kalender Event with Monthly List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aktivitas Terbaru (More relevant to main dashboard) */}
          <ListCard
            title="Aktivitas Terbaru Yhoiki"
            items={activityListItems} // Use the new items with icons
          />

          {/* Real-time Calendar with Event Adding and Monthly List */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Kalender Event & Jadwal</h3>
              {/* Quick Add Event Button */}
              <button
                onClick={() => handleAddEvent(new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0], true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow"
              >
                <FaPlusCircle className="mr-2" /> Tambah Event Cepat
              </button>
            </div>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              weekends={true}
              events={events}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              datesSet={handleViewChange}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay',
              }}
            />
            {/* Monthly Event List with Filter and Search */}
            <div className="mt-6 border-t pt-4 border-gray-200">
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Jadwal Bulan {currentMonthName}</h4>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  {availableDivisions.map(div => (
                    <option key={div} value={div}>{div === 'All' ? 'Semua Divisi' : div}</option>
                  ))}
                </select>
              </div>
              {currentMonthEvents.length > 0 ? (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Added max-height and overflow */}
                  {currentMonthEvents.map((event, index) => (
                    <li key={event.id || index} className="flex items-start text-sm text-gray-700">
                      <FaCalendarAlt className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date || event.start).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          {event.division && ` - Divisi: ${event.division}`}
                        </p>
                        {event.description && <p className="text-xs text-gray-600 mt-1">{event.description}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada jadwal event untuk bulan ini.</p>
              )}
            </div>
          </div>
        </div>

        {/* Shortcut Aksi Cepat - Aligned with Main Dashboard's Responsibilities */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          <ShortcutCard icon={<FaHandshake className="text-green-600 w-8 h-8" />} label="Kelola Partnership" />
          <ShortcutCard icon={<MdAttachMoney className="text-green-600 w-8 h-8" />} label="Kelola Pendanaan" />
          <ShortcutCard icon={<MdSupervisorAccount className="text-green-600 w-8 h-8" />} label="Kelola Mitra" />
          <ShortcutCard icon={<MdApartment className="text-green-600 w-8 h-8" />} label="Pantau Divisi" />
          <ShortcutCard icon={<FaChartLine className="text-green-600 w-8 h-8" />} label="Laporan Keuangan" />
          <ShortcutCard icon={<FaComments className="text-green-600 w-8 h-8" />} label="Cek Komunikasi Internal" />
        </div>

        {/* Daftar Terbaru - More High-Level Relevant Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ListCard
            title="Mitra & Reseller Terbaru"
            items={[
              { text: 'Reseller: Dimas F. (2 hari lalu)' },
              { text: 'Seller Layanan: Umar A. (5 hari lalu)' },
              { text: 'Reseller: Anggun A. (1 minggu lalu)' },
              { text: 'Seller Game: Siti K. (1 minggu lalu)' },
              { text: 'Seller Apparel: Budi H. (2 minggu lalu)' },
            ]}
          />
          <ListCard
            title="Aktivitas Pendanaan Terbaru"
            items={[
              { text: 'Investor Baru: PT Makmur Abadi (Rp 50jt)' },
              { text: 'Pendanaan Divisi Hosting: Doni (Rp 10jt)' },
              { text: 'Penarikan Dana Divisi Food: (Rp 2jt)' },
              { text: 'Pendanaan Umum Yhoiki: CV Jaya (Rp 25jt)' },
              { text: 'Pembatalan Pendanaan: Investor X' },
            ]}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}