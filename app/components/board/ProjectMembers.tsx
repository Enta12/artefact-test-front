import React, { useState } from "react";
import Button from "../Button";
import Input from "../Input";
import Select from "../Select";
import {
  FiUser,
  FiMail,
  FiShield,
  FiTrash2,
  FiPlus,
  FiUsers,
} from "react-icons/fi";
import { useBoardActions } from "../../hooks/useBoardActions";
import type { Member } from "../../types/board";


const roles = [
  {
    value: "OWNER",
    label: "Propriétaire",
    icon: <FiShield className="w-4 h-4 text-indigo-600" />,
  },
  {
    value: "ADMIN",
    label: "Admin",
    icon: <FiShield className="w-4 h-4 text-blue-600" />,
  },
  {
    value: "MEMBER",
    label: "Membre",
    icon: <FiUser className="w-4 h-4 text-green-600" />,
  },
  {
    value: "VIEWER",
    label: "Lecteur",
    icon: <FiUser className="w-4 h-4 text-gray-400" />,
  },
];



export const ProjectMembers = () => {
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("MEMBER");
  const [isAdding, setIsAdding] = useState(false);

  const {
    members,
    projectId,  
    addMember,
    updateMember,
    removeMember,
  } = useBoardActions();


  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const newMember: Member = {
        id: Date.now(),
        projectId,
        user: {
          id: Date.now(),
          email: newEmail,
        },
        role: newRole as Member["role"],
      };
      addMember(newMember);
      setNewEmail("");
      setNewRole("MEMBER");
    } catch (err) {
      console.error("Erreur ajout membre", err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRoleChange = (member: Member, role: string) => {
    updateMember(member, { role: role as Member["role"] });
  };

  const handleRemove = (member: Member) => {
    removeMember(member);
  };


  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <FiUsers className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Membres du projet</h2>
          <p className="text-sm text-gray-600">
            Gérez les membres et leurs rôles sur ce projet
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {m.user.name || "-"}
                </div>
                <div className="text-sm text-gray-500 truncate flex items-center gap-1">
                  <FiMail className="w-4 h-4" /> {m.user.email || "-"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                items={roles.map((r) => ({ id: r.value, label: r.label }))}
                value={m.role}
                onChange={(val) =>
                  typeof val === "string" ? handleRoleChange(m, val) : undefined
                }
                className="min-w-[120px]"
              />
              <button
                className="text-red-600 hover:text-red-500 cursor-pointer"
                onClick={() => handleRemove(m)}
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-end"
      >
        <div className="flex-1 w-full">
          <Input
            label="Email du membre"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            placeholder="exemple@email.com"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Rôle
          </label>
          <Select
            items={roles.map((r) => ({ id: r.value, label: r.label }))}
            value={newRole}
            onChange={(val) =>
              typeof val === "string" ? setNewRole(val) : undefined
            }
            placeholder="Choisir un rôle"
            className="min-w-[140px]"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          isLoading={isAdding}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Ajouter
        </Button>
      </form>
    </div>
  );
};

export default ProjectMembers;
