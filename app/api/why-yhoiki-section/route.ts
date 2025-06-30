// src/app/api/why-yhoiki-section/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan path ini

// GET: Mengambil data Why Yhoiki Section (asumsi hanya ada satu entry)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('why_yhoiki_sections')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Supabase GET why_yhoiki_sections error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json(null, { status: 200 }); // Atau kembalikan default kosong
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error('API GET why_yhoiki_sections error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Membuat atau mengupdate Why Yhoiki Section (jika sudah ada, update yang pertama)
export async function POST(request: Request) {
  try {
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields: title or description' }, { status: 400 });
    }

    const { data: existingData, error: fetchError } = await supabase
      .from('why_yhoiki_sections')
      .select('id')
      .limit(1);

    if (fetchError) {
      console.error('Supabase fetch existing why_yhoiki_sections error:', fetchError.message);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let result;
    if (existingData && existingData.length > 0) {
      result = await supabase
        .from('why_yhoiki_sections')
        .update({ title, description })
        .eq('id', existingData[0].id)
        .select();
    } else {
      result = await supabase
        .from('why_yhoiki_sections')
        .insert([{ title, description }])
        .select();
    }

    if (result.error) {
      console.error('Supabase POST/PUT why_yhoiki_sections error:', result.error.message);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data[0], { status: existingData && existingData.length > 0 ? 200 : 201 });
  } catch (err) {
    console.error('API POST why_yhoiki_sections error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}