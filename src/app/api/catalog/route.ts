import { NextResponse } from 'next/server';
import { CATALOG } from '@/data/catalog';

export async function GET() {
  return NextResponse.json({
    success: true,
    total: CATALOG.length,
    catalog: CATALOG
  });
}
