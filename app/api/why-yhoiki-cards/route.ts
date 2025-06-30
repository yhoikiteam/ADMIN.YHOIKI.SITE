// src/app/api/why-yhoiki-cards/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan path ini

// GET: Mengambil semua kartu Why Yhoiki
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('why_yhoiki_cards')
      .select('*')
      .order('created_at', { ascending: true }); // Atau order lain yang relevan

    if (error) {
      console.error('Supabase GET why_yhoiki_cards error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API GET why_yhoiki_cards error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Menambahkan kartu Why Yhoiki baru
export async function POST(request: Request) {
  try {
    const newCardData = await request.json();
    const { emote, title, description, whyYhoikiSectionId } = newCardData; // Optional: whyYhoikiSectionId

    if (!emote || !title || !description) {
      return NextResponse.json({ error: 'Missing required fields for whyYhoikiCard' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('why_yhoiki_cards')
      .insert([{
        emote,
        title,
        description,
        // why_yhoiki_section_id: whyYhoikiSectionId // Uncomment jika ingin melink ke section parent
      }])
      .select();

    if (error) {
      console.error('Supabase POST why_yhoiki_cards error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error('API POST why_yhoiki_cards error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Mengupdate kartu Why Yhoiki yang sudah ada
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (!id) {
        return NextResponse.json({ error: 'Missing ID for update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('why_yhoiki_cards')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase PUT why_yhoiki_cards error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Why Yhoiki Card not found' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error('API PUT why_yhoiki_cards error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Menghapus kartu Why Yhoiki
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing ID for delete' }, { status: 400 });
    }

    const { error } = await supabase
      .from('why_yhoiki_cards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase DELETE why_yhoiki_cards error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Why Yhoiki Card deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('API DELETE why_yhoiki_cards error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}