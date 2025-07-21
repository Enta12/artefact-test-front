'use client';

import { use } from 'react';
import LoadingState from '@/app/components/LoadingState';
import AppLayout from '@/app/components/AppLayout';
import { useAuthQuery } from '@/app/hooks/useAuthQuery';

interface Project {
  id: string;
  name: string;
  description: string;
}

interface PageParams {
  id: string;
}

export default function ProjectPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);

  const { data: project, isLoading } = useAuthQuery<Project>(
    ['project', resolvedParams.id],
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${resolvedParams.id}`
  );

  if (isLoading) {
    return (
      <AppLayout title="Chargement...">
        <div className="flex justify-center items-center min-h-screen">
          <LoadingState 
            message="Chargement du projet" 
            className="mt-12"
          />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout title="Projet non trouvé">
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-600">Projet non trouvé</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={project.name}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{project.name}</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700">Hello World!</p>
        </div>
      </div>
    </AppLayout>
  );
} 