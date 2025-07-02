import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { EventFormData } from '@/types/interfaceEvents';

const TABLE_NAME = 'events';

export async function GET() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('tanggal', { ascending: true })
    .order('jam', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body: EventFormData = await req.json();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(body)
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
