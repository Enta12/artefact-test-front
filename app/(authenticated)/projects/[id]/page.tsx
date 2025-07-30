import { cookies } from 'next/headers';
import ProjectPageClient, { Project } from './ProjectPageClient';
import { Column } from '@/app/components/board/Board';
import { Member, Tag } from '@/app/types/board';


export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  async function fetchWithAuth<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('API error');
    return res.json() as Promise<T>;
  }

  const [project, columns, members, tags] = await Promise.all([
    fetchWithAuth<Project>(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`),
    fetchWithAuth<Column[]>(`${process.env.NEXT_PUBLIC_API_URL}/columns/project/${projectId}`),
    fetchWithAuth<Member[]>(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/members`),
    fetchWithAuth<Tag[]>(`${process.env.NEXT_PUBLIC_API_URL}/tags/project/${projectId}`),
  ]);

  console.log(members);

  return (
    <ProjectPageClient
      project={project}
      columns={columns}
      members={members}
      tags={tags}
    />
  );
} 