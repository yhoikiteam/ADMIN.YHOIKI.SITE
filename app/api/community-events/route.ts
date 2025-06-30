// src/app/api/community-events/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if necessary

// Helper function untuk membuat slug dari judul
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Ganti spasi dengan tanda hubung
    .replace(/[^\w-]+/g, '')   // Hapus semua karakter non-word
    .replace(/--+/g, '-');      // Ganti multiple tanda hubung dengan satu tanda hubung
}

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .order('date', { ascending: true }) // Order by date
      .order('time', { ascending: true }); // Then by time

    if (error) {
      console.error('Supabase GET error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newEventData = await request.json();

    // Basic validation (you can expand this)
    if (!newEventData.title || !newEventData.date || !newEventData.time || !newEventData.organizer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Masukkan Event ke tabel community_events
    const { data: eventResult, error: eventError } = await supabase
      .from('community_events')
      .insert([newEventData])
      .select(); // Select the inserted data to return it

    if (eventError) {
      console.error('Supabase POST community_events error:', eventError.message);
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    const createdEvent = eventResult[0];

    // 2. Tambahkan Event ke tabel highlights
    try {
      const eventTitleSlug = slugify(createdEvent.title);
      const highlightLink = `https://yhoiki.site/community/event/${eventTitleSlug}`; // Sesuaikan base URL jika perlu

      const highlightData = {
        type: 'event', // Karena ini dari community event
        title: createdEvent.title,
        link: highlightLink,
      };

      const { error: highlightError } = await supabase
        .from('highlights')
        .insert([highlightData]);

      if (highlightError) {
        console.error('Supabase POST highlights error:', highlightError.message);
        // Penting: Anda mungkin ingin menghapus event yang baru dibuat di community_events
        // jika penambahan highlight gagal, untuk menjaga konsistensi data.
        // Atau, cukup log error dan biarkan event komunitas tetap ada.
        // Untuk contoh ini, kita hanya akan log dan melanjutkan.
        console.warn(`Gagal menambahkan highlight untuk event "${createdEvent.title}".`);
      }
    } catch (highlightProcessError) {
      console.error('Error processing highlight insertion:', highlightProcessError);
      // Ini menangani error jika ada masalah saat slugify atau konstruksi link
      console.warn(`Gagal memproses highlight untuk event "${createdEvent.title}".`);
    }

    return NextResponse.json(createdEvent, { status: 201 }); // Return the created community event
  } catch (err) {
    console.error('API POST unhandled error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}