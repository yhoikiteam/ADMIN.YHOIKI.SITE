// app/api/hero/route.ts
import { supabase } from '@/lib/supabaseClient'; // Adjust path if necessary
import { NextResponse } from 'next/server';

// Define the interface for Hero Section data
interface HeroSectionData {
  id?: string;
  title: string;
  writing_text: string[]; // Use snake_case to match Supabase column name
}

// GET /api/hero - Fetch the Hero Section data
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('hero_sections')
      .select('id, title, writing_text')
      .limit(1)
      .single(); // Assuming only one hero section

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error fetching hero section:', error);
      return NextResponse.json({ error: 'Failed to fetch hero section' }, { status: 500 });
    }

    if (!data) {
      // No data found, return a 404 or an empty object, depending on preference
      return NextResponse.json({ message: 'No hero section data found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in GET /api/hero:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/hero - Create a new Hero Section entry
export async function POST(req: Request) {
  try {
    const { title, writing_text }: HeroSectionData = await req.json();

    if (!title || !Array.isArray(writing_text)) {
      return NextResponse.json({ error: 'Title and writing_text (array) are required' }, { status: 400 });
    }

    // Optional: Check if a hero section already exists to prevent duplicates
    const { data: existingHero, error: existingError } = await supabase
      .from('hero_sections')
      .select('id')
      .limit(1);

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking existing hero section:', existingError);
      return NextResponse.json({ error: 'Failed to check existing hero section' }, { status: 500 });
    }

    if (existingHero && existingHero.length > 0) {
      return NextResponse.json({ error: 'Hero section already exists. Use PUT to update.' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('hero_sections')
      .insert({ title, writing_text })
      .select('id, title, writing_text')
      .single();

    if (error) {
      console.error('Error creating hero section:', error);
      return NextResponse.json({ error: 'Failed to create hero section' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Unexpected error in POST /api/hero:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/hero - Update an existing Hero Section entry
// This endpoint assumes you either know the ID or update the *first* one found
// For a single hero section, we might not even need an ID in the path/body.
export async function PUT(req: Request) {
  try {
    const { id, title, writing_text }: HeroSectionData = await req.json();

    if (!id || !title || !Array.isArray(writing_text)) {
      return NextResponse.json({ error: 'ID, title, and writing_text (array) are required for update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('hero_sections')
      .update({ title, writing_text })
      .eq('id', id)
      .select('id, title, writing_text')
      .single();

    if (error) {
      console.error('Error updating hero section:', error);
      return NextResponse.json({ error: 'Failed to update hero section' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in PUT /api/hero:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/hero - Delete a Hero Section entry
// This endpoint assumes you provide the ID of the hero section to delete.
export async function DELETE(req: Request) {
  try {
    const { id }: { id: string } = await req.json(); // Assuming ID is sent in the body for DELETE

    if (!id) {
      return NextResponse.json({ error: 'ID is required for deletion' }, { status: 400 });
    }

    const { error } = await supabase
      .from('hero_sections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting hero section:', error);
      return NextResponse.json({ error: 'Failed to delete hero section' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Hero section deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in DELETE /api/hero:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}