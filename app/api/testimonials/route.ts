// src/app/api/testimonials/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Sesuaikan path ini

// GET: Mengambil semua testimonial
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: true }); // Atau order lain yang relevan

    if (error) {
      console.error('Supabase GET testimonials error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API GET testimonials error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Menambahkan testimonial baru
export async function POST(request: Request) {
  try {
    const newTestimonialData = await request.json();
    const { comment, author } = newTestimonialData;

    if (!comment || !author) {
      return NextResponse.json({ error: 'Missing required fields for testimonial' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([{ comment, author }])
      .select();

    if (error) {
      console.error('Supabase POST testimonials error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error('API POST testimonials error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Mengupdate testimonial yang sudah ada
export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    
    if (!id) {
        return NextResponse.json({ error: 'Missing ID for update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase PUT testimonials error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error('API PUT testimonials error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Menghapus testimonial
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing ID for delete' }, { status: 400 });
    }

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase DELETE testimonials error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Testimonial deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('API DELETE testimonials error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}