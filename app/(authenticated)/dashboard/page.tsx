import { cookies } from 'next/headers';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  description?: string;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  async function fetchWithAuth(url: string) {
    const res = await fetch(url, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Erreur API');
    return res.json();
  }

  const projects = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects`);

  return (
    <DashboardClient initialProjects={projects as Project[]} />
  );
}