import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { type, text } = await req.json();

    if (!type || !text) {
        return NextResponse.json({ error: 'Missing type or text' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cgpa_feedbacks')
      .insert([
        { type, text }
      ])
      .select();

    if (error) {
        console.error('Supabase Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
    // Basic protection (optional, better to have a token in headers or something)
    // For now, let's keep it simple or implement token-based access.
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('adminToken');

        if (secret !== 'viciss-admin-42-x9k2') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabase
            .from('cgpa_feedbacks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ feedbacks: data });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
