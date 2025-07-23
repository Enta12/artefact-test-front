'use client';

import Board from '@/app/components/board/Board';
import { useParams } from 'next/navigation';
import AppLayout from '@/app/components/AppLayout';
import Tabs from '@/app/components/Tabs';
import { FiUser } from 'react-icons/fi';
import { useState } from 'react';
import ProjectMembers from '@/app/components/board/ProjectMembers';

export default function ProjectPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const [activeTab, setActiveTab] = useState<'board' | 'members'>('board');

  return (
    <AppLayout title="Tableau de bord" className='flex-1 overflow-x-auto overflow-y-hidden min-w-screen w-fit overflow-scroll'>
      <Tabs
        navClassName="mx-4"
        variant="secondary"
        tabs={[
          {
            id: 'board',
            label: 'Board',
            content: <Board projectId={projectId} />,
          },
          {
            id: 'members',
            label: 'Membres',
            icon: FiUser,
            content: (
              <ProjectMembers projectId={projectId} />
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'board' | 'members')}
      />
    </AppLayout>
  );
} 