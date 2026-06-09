import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: { name: string } }) {
  try {
    const { name } = await params;
    const filePath = path.join(process.cwd(), 'public', 'avatars', name);
    
    if (fs.existsSync(filePath)) {
      const file = fs.readFileSync(filePath);
      return new NextResponse(file, { 
        headers: { 
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable'
        } 
      });
    }
    return new NextResponse('Avatar not found on disk', { status: 404 });
  } catch (err) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
