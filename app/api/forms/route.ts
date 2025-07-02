// app/api/forms/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client untuk sisi server
// Gunakan variabel lingkungan tanpa NEXT_PUBLIC_ di sisi server untuk keamanan
const supabaseUrl = process.env.SUPABASE_URL; // Pastikan ini ada di .env.local
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Atau gunakan anon key jika RLS diatur untuk anon
// Jika Anda hanya memiliki NEXT_PUBLIC_SUPABASE_ANON_KEY, Anda bisa menggunakannya di sini,
// tetapi pastikan RLS Supabase Anda mengizinkan operasi yang sesuai untuk peran 'anon'.
// Untuk operasi DELETE/UPDATE yang aman, biasanya disarankan menggunakan Supabase Auth atau Service Role Key.
// Untuk tujuan demo ini, kita akan asumsikan anon key cukup jika RLS diatur untuk anon.
const supabase = createClient(supabaseUrl!, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// GET: Mengambil semua formulir untuk user_id tertentu
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // Dapatkan userId dari query params

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching forms:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in GET /api/forms:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Membuat formulir baru
export async function POST(request: Request) {
  const formToSave = await request.json();

  // Basic validation
  if (!formToSave.name || !formToSave.slug || !formToSave.user_id || !formToSave.fields) {
    return NextResponse.json({ error: 'Missing required form fields' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('forms')
      .insert(formToSave)
      .select()
      .single();

    if (error) {
      console.error('Error inserting form:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error in POST /api/forms:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
