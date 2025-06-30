// src/app/api/community-events/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Adjust path if necessary

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const updatedEventData = await request.json();

    // Basic validation
    if (!updatedEventData.title || !updatedEventData.date || !updatedEventData.time || !updatedEventData.organizer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('community_events')
      .update(updatedEventData)
      .eq('id', id)
      .select(); // Select the updated data

    if (error) {
      console.error('Supabase PUT error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error('API PUT error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('community_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase DELETE error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('API DELETE error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}