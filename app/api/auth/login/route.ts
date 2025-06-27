import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password }: { email?: string; password?: string } = await request.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Supabase signIn error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ message: 'Login successful', user: data.user });
}