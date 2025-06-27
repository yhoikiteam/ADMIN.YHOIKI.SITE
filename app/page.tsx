'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminIndexPage() {
  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center py-12 px-4 text-white text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl mx-auto p-8 md:p-10 bg-white rounded-2xl shadow-xl" // Changed: Removed backdrop-blur-sm and border-white/20, made background fully white
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-tight mb-4 text-gray-800" // Changed: Text color to gray-800 for contrast on white background
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Selamat Datang di <br /> Panel Admin{' '}
            <span className="text-white bg-green-500 rounded-xl p-2 shadow-sm">Yhoiki</span> {/* Changed: Reverted text-green-200 to text-green-500, added bg-white and shadow-sm for consistency with original Yhoiki branding */}
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl mb-8 text-gray-600" // Changed: Text color to gray-600 for contrast
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Di sini Anda dapat mengelola semua aspek platform Yhoiki.
            <br /> Akses data, kelola pengguna, dan pantau kinerja sistem.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          >
            <Link
              href="/login"
              className="inline-block bg-green-600 text-white hover:bg-green-700 px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition duration-300 transform hover:scale-105" // Changed: Button color to green-600 with white text for better contrast and consistency
            >
              Login ke Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}