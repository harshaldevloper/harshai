import { NextResponse } from 'next/server';
export async function POST() {
  const testMode = process.env.TEST_MODE === 'true';
  if (testMode) {
    return NextResponse.json({ success: true, testMode: true, output: { message: 'Executed (mock)' } });
  }
  return NextResponse.json({ success: false, error: 'API key required' }, { status: 400 });
}
