// app/api/forms/[id]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client untuk sisi server
const supabaseUrl = process.env.SUPABASE_URL; // Pastikan ini ada di .env.local
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Atau gunakan anon key jika RLS diatur untuk anon
const supabase = createClient(supabaseUrl!, supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// GET: Mengambil satu formulir berdasarkan ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // Dapatkan userId dari query params

  if (!id || !userId) {
    return NextResponse.json({ error: 'Form ID and User ID are required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId) // Pastikan hanya pemilik yang bisa melihat
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ error: 'Formulir tidak ditemukan atau tidak memiliki akses.' }, { status: 404 });
      }
      console.error('Error fetching single form:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in GET /api/forms/[id]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT/PATCH: Memperbarui formulir yang sudah ada
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const updatedForm = await request.json();
  const userId = updatedForm.user_id; // Ambil userId dari body request

  if (!id || !userId) {
    return NextResponse.json({ error: 'Form ID and User ID are required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('forms')
      .update(updatedForm)
      .eq('id', id)
      .eq('user_id', userId) // Pastikan hanya pemilik yang bisa memperbarui
      .select()
      .single();

    if (error) {
      console.error('Error updating form:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/forms/[id]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Menghapus formulir
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId'); // Dapatkan userId dari query params

  if (!id || !userId) {
    return NextResponse.json({ error: 'Form ID and User ID are required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Pastikan hanya pemilik yang bisa menghapus

    if (error) {
      console.error('Error deleting form:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Formulir berhasil dihapus.' }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/forms/[id]:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
