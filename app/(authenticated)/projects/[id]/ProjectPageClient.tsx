"use client";

import Board from "@/app/components/board/Board";
import AppLayout from "@/app/components/AppLayout";
import Tabs from "@/app/components/Tabs";
import { FiUser } from "react-icons/fi";
import { useState } from "react";
import ProjectMembers from "@/app/components/board/ProjectMembers";
import { BoardProvider } from "@/context/BoardContext";
import type { Column, Tag, Member } from "@/app/types/board";


export interface Project {
  id: number;
  name: string;
  description?: string;
}

interface ProjectPageClientProps {
  project: Project;
  columns: Column[];
  members: Member[];
  tags: Tag[];
}

export default function ProjectPageClient({
  project,
  columns,
  members,
  tags,
}: ProjectPageClientProps) {
  const [activeTab, setActiveTab] = useState<"board" | "members">("board");

  return (
    <AppLayout
      title={project.name}
      className="flex-1 overflow-x-auto overflow-y-hidden min-w-screen w-fit overflow-scroll"
    >
      <BoardProvider
        initialTags={tags}
        initialColumns={columns}
        projectId={project.id}
        initialMembers={members}
      >
        <Tabs
          navClassName="mx-4"
          variant="secondary"
          tabs={[
            {
              id: "board",
              label: "Board",
              content: <Board />,
            },
            {
              id: "members",
              label: "Membres",
              icon: FiUser,
              content: <ProjectMembers />,
            },
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as "board" | "members")}
        />
      </BoardProvider>
    </AppLayout>
  );
}
