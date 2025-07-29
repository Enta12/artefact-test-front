'use client';

import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
      {project.description && (
        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
      )}
    </Link>
  );
};

export default ProjectCard; 