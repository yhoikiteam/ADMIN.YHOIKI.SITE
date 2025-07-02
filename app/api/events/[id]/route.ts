import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { EventFormData } from '@/types/interfaceEvents';

const TABLE_NAME = 'events';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error(`Error fetching event with ID (${params.id}):`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body: EventFormData = await req.json();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(body)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating event (${params.id}):`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', params.id);

  if (error) {
    console.error(`Error deleting event (${params.id}):`, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Event deleted successfully' });
}
