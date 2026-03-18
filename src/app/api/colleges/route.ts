import { NextResponse } from 'next/server';

const COLLEGES = [
  { id: '1', name: 'Indian Institute of Technology (IIT) Delhi', gradingSystem: '10-point' },
  { id: '2', name: 'Indian Institute of Technology (IIT) Bombay', gradingSystem: '10-point' },
  { id: '3', name: 'Anna University', gradingSystem: '10-point' },
  { id: '4', name: 'Delhi University', gradingSystem: '10-point' },
  { id: '5', name: 'Savitribai Phule Pune University', gradingSystem: '10-point' },
  { id: '6', name: 'Stanford University', gradingSystem: '4-point' },
  { id: '7', name: 'Harvard University', gradingSystem: '4-point' },
  { id: '8', name: 'Massachusetts Institute of Technology (MIT)', gradingSystem: '4-point' },
  { id: '9', name: 'University of Oxford', gradingSystem: '4-point' },
  { id: '10', name: 'National Forensic Sciences University (NFSU)', gradingSystem: 'nfsu-10' },
  { id: '11', name: 'National University of Singapore (NUS)', gradingSystem: '5-point' },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(COLLEGES.slice(0, 10));
  }

  const filtered = COLLEGES.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return NextResponse.json(filtered);
}
