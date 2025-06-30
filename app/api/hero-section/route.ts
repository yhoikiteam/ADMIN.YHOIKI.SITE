// src/app/api/hero-section/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan path ini

// GET: Mengambil data Hero Section (asumsi hanya ada satu entry)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('hero_sections')
      .select('*')
      .limit(1); // Ambil hanya satu data

    if (error) {
      console.error('Supabase GET hero_sections error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Jika tidak ada data, kembalikan default atau null
    if (!data || data.length === 0) {
      return NextResponse.json(null, { status: 200 }); // Atau kembalikan default kosong
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error('API GET hero_sections error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Membuat atau mengupdate Hero Section (jika sudah ada, update yang pertama)
export async function POST(request: Request) {
  try {
    const { title, writingText } = await request.json();

    if (!title || !writingText) {
      return NextResponse.json({ error: 'Missing required fields: title or writingText' }, { status: 400 });
    }

    // Cek apakah sudah ada data hero_section
    const { data: existingData, error: fetchError } = await supabase
      .from('hero_sections')
      .select('id')
      .limit(1);

    if (fetchError) {
      console.error('Supabase fetch existing hero_sections error:', fetchError.message);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const heroDataToSave = { title, writing_text: writingText }; // Sesuaikan dengan nama kolom DB

    let result;
    if (existingData && existingData.length > 0) {
      // Jika sudah ada, update entry pertama
      result = await supabase
        .from('hero_sections')
        .update(heroDataToSave)
        .eq('id', existingData[0].id)
        .select();
    } else {
      // Jika belum ada, insert baru
      result = await supabase
        .from('hero_sections')
        .insert([heroDataToSave])
        .select();
    }

    if (result.error) {
      console.error('Supabase POST/PUT hero_sections error:', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data[0], { status: existingData && existingData.length > 0 ? 200 : 201 });
  } catch (err) {
    console.error('API POST hero_sections error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE tidak terlalu relevan untuk single entry Hero Section, tapi bisa ditambahkan jika perlu.
// PUT: Untuk update spesifik jika ada ID, atau POST bisa dimodifikasi untuk handle upsert.
// Untuk kesederhanaan, POST di atas sudah bertindak sebagai UPSERT.