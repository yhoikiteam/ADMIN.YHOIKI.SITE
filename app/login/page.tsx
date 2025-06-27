'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email dan password wajib diisi.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/login', {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        router.push('/dashboard');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Login gagal. Periksa kredensial Anda.');
      } else {
        setError('Terjadi kesalahan saat mencoba login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center py-12 px-4">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-10"
            >
              <Image
                src="/images/logoyhoiki.png"
                alt="Yhoiki Logo"
                width={70}
                height={70}
                className="mx-auto"
              />
            </motion.div>
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-gray-800"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Admin <span className="text-green-600">Login</span>
            </motion.h1>
            <motion.p
              className="mt-2 text-gray-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Akses Panel Administrasi Yhoiki
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-2 border border-green-500 rounded-full focus:ring-2 focus:ring-green-600 focus:border-green-600 transition duration-200"
                placeholder="Masukkan email admin Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-2 border border-green-500 rounded-full focus:ring-2 focus:ring-green-600 focus:border-green-600 transition duration-200"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <motion.p
                className="text-red-600 text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-full transition duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Login'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-gray-500 text-sm">
            Bukan admin?{' '}
            <Link href="/" className="text-green-600 hover:underline">
              Kembali ke Beranda
            </Link>
          </p>
        </motion.div>
      </section>
    </>
  );
}