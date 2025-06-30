// src/app/api/divisions/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan path ini

// GET: Mengambil semua divisi
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('created_at', { ascending: true }); // Atau order lain yang relevan

    if (error) {
      console.error('Supabase GET divisions error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API GET divisions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Menambahkan divisi baru
export async function POST(request: Request) {
  try {
    const newDivisiData = await request.json();

    // Pastikan nama properti sesuai dengan kolom DB
    const { emote, title, description, ctaText, colorGradient, runningText, status } = newDivisiData;

    if (!emote || !title || !description || !ctaText || !colorGradient || !runningText || !status) {
      return NextResponse.json({ error: 'Missing required fields for division' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('divisions')
      .insert([{
        emote,
        title,
        description,
        cta_text: ctaText, // Sesuaikan nama kolom
        color_gradient: colorGradient, // Sesuaikan nama kolom
        running_text: runningText, // Sesuaikan nama kolom
        status
      }])
      .select();

    if (error) {
      console.error('Supabase POST divisions error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error('API POST divisions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Mengupdate divisi yang sudah ada
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json(); // Mengambil ID dan sisa data
    
    if (!id) {
        return NextResponse.json({ error: 'Missing ID for update' }, { status: 400 });
    }

    // Sesuaikan nama properti dari request body ke nama kolom DB
    const dataToUpdate: any = {};
    if (updateData.emote) dataToUpdate.emote = updateData.emote;
    if (updateData.title) dataToUpdate.title = updateData.title;
    if (updateData.description) dataToUpdate.description = updateData.description;
    if (updateData.ctaText) dataToUpdate.cta_text = updateData.ctaText;
    if (updateData.colorGradient) dataToUpdate.color_gradient = updateData.colorGradient;
    if (updateData.runningText) dataToUpdate.running_text = updateData.runningText;
    if (updateData.status) dataToUpdate.status = updateData.status;


    const { data, error } = await supabase
      .from('divisions')
      .update(dataToUpdate)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase PUT divisions error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Division not found' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error('API PUT divisions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Menghapus divisi
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json(); // Mengambil ID dari body

    if (!id) {
      return NextResponse.json({ error: 'Missing ID for delete' }, { status: 400 });
    }

    const { error } = await supabase
      .from('divisions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase DELETE divisions error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Division deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('API DELETE divisions error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}