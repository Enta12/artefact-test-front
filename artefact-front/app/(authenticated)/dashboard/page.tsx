"use client";

import { useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import ProjectCard from "../../components/ProjectCard";
import CreateProjectModal, { CreateProjectModalRef } from "../../components/CreateProjectModal";
import LoadingState from "../../components/LoadingState";
import AppLayout from "../../components/AppLayout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthQuery } from '@/app/hooks/useAuthQuery';
import CreateProjectCard from "@/app/components/CreateProjectCard";

interface Project {
  id: string;
  name: string;
  description?: string;
}

export default function DashboardPage() {
  const { fetchWithAuth } = useAuth();
  const modalRef = useRef<CreateProjectModalRef>(null);
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: isLoadingProjects } = useAuthQuery<Project[]>(
    ['projects'],
    `${process.env.NEXT_PUBLIC_API_URL}/projects`
  );

  const createProject = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erreur lors de la création du projet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      modalRef.current?.close();
    },
  });

  const handleCreateProject = (data: { name: string; description: string }) => {
    createProject.mutate(data);
  };

  return (
    <AppLayout title="Dashboard">
      {isLoadingProjects ? (
        <LoadingState 
          message="Chargement de vos projets" 
          className="mt-12"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
          <CreateProjectCard onCreateClick={() => modalRef.current?.open()}/>
        </div>
      )}

      <CreateProjectModal
        ref={modalRef}
        onSubmit={handleCreateProject}
        isLoading={createProject.isPending}
      />
    </AppLayout>
  );
}