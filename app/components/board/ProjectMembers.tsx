import React, { useState } from 'react';
import Button from '../Button';
import Input from '../Input';
import DropdownMenu from '../DropdownMenu';
import Select from '../Select';
import { FiUser, FiMail, FiShield, FiTrash2, FiPlus, FiUsers } from 'react-icons/fi';
import { useAuthQuery, useAuthMutation } from '../../hooks/useAuthQuery';

interface Member {
  userId: number;
  user: { id: number; name: string; email: string };
  role: string;
}

interface ProjectMembersProps {
  projectId: number;
}

const roles = [
  { value: 'OWNER', label: 'Propriétaire', icon: <FiShield className="w-4 h-4 text-indigo-600" /> },
  { value: 'ADMIN', label: 'Admin', icon: <FiShield className="w-4 h-4 text-blue-600" /> },
  { value: 'MEMBER', label: 'Membre', icon: <FiUser className="w-4 h-4 text-green-600" /> },
  { value: 'VIEWER', label: 'Lecteur', icon: <FiUser className="w-4 h-4 text-gray-400" /> },
];

export const ProjectMembers: React.FC<ProjectMembersProps> = ({ projectId }) => {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('MEMBER');

  const {
    data: members = [],
    isLoading: loading,
    error,
    refetch: fetchMembers,
  } = useAuthQuery<Member[]>(
    ['project-members', projectId],
    `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/members`
  );

  const addMemberMutation = useAuthMutation<unknown, Error, { email: string; role: string }>(
    ({ email, role }) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/members`,
      method: 'POST',
      data: { email, role },
    }),
    {
      onSuccess: () => {
        fetchMembers();
        setNewEmail('');
        setNewRole('MEMBER');
      },
    }
  );

  const changeRoleMutation = useAuthMutation<unknown, Error, { userId: number; role: string }>(
    ({ userId, role }) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/members/${userId}`,
      method: 'PATCH',
      data: { role },
    }),
    {
      onSuccess: () => fetchMembers(),
    }
  );

  const removeMemberMutation = useAuthMutation<unknown, Error, { userId: number }>(
    ({ userId }) => ({
      url: `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/members/${userId}`,
      method: 'DELETE',
    }),
    {
      onSuccess: () => fetchMembers(),
    }
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addMemberMutation.mutate({ email: newEmail, role: newRole });
  };

  const handleRoleChange = (userId: number, role: string) => {
    changeRoleMutation.mutate({ userId, role });
  };

  const handleRemove = (userId: number) => {
    removeMemberMutation.mutate({ userId });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <FiUsers className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Membres du projet</h2>
          <p className="text-sm text-gray-600">Gérez les membres et leurs rôles sur ce projet</p>
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 mb-4">
          {error instanceof Error ? error.message : error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500"><span className="animate-spin"><FiUser /></span> Chargement...</div>
      ) : (
        <div className="space-y-3 mb-6">
          {members.length === 0 && (
            <div className="text-center text-gray-500 py-8">Aucun membre pour ce projet</div>
          )}
          {members.map((m) => (
            <div key={m.userId} className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{m.user?.name || '-'}</div>
                  <div className="text-sm text-gray-500 truncate flex items-center gap-1"><FiMail className="w-4 h-4" /> {m.user?.email || '-'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                  className="border rounded-md px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <DropdownMenu
                  actions={[{
                    label: 'Retirer',
                    onClick: () => handleRemove(m.userId),
                    variant: 'danger',
                  }]}
                  trigger={<button className="text-red-600 hover:text-red-500"><FiTrash2 className="w-4 h-4" /></button>}
                  align="right"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-1 w-full">
          <Input
            label="Email du membre"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            placeholder="exemple@email.com"
            className=""
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Rôle</label>
          <Select
            items={roles.map(r => ({ id: r.value, label: r.label }))}
            value={newRole}
            onChange={val => typeof val === 'string' ? setNewRole(val) : undefined}
            placeholder="Choisir un rôle"
            className="min-w-[140px]"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          isLoading={addMemberMutation.isPending}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Ajouter
        </Button>
      </form>
    </div>
  );
};

export default ProjectMembers; 