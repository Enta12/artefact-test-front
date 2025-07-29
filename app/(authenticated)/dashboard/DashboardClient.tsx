"use client";

import { useRef, useState } from "react";
import ProjectCard from "@/app/components/ProjectCard";
import CreateProjectModal, { CreateProjectModalRef } from "@/app/components/CreateProjectModal";
import AppLayout from "@/app/components/AppLayout";
import CreateProjectCard from "@/app/components/CreateProjectCard";

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface DashboardClientProps {
  initialProjects: Project[];
}

export default function DashboardClient({ initialProjects }: DashboardClientProps) {
  const modalRef = useRef<CreateProjectModalRef>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const handleCreateProject = (newProject: Project) => {
    setProjects([...projects, newProject]);
  };

  return (
    <AppLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
          />
        ))}
        <CreateProjectCard onCreateClick={() => modalRef.current?.open()}/>
      </div>

      <CreateProjectModal
        ref={modalRef}
        onCreate={handleCreateProject}
      />
    </AppLayout>
  );
} 