"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Task } from "../../types/board";
import { TaskFormData } from "../../types/task";
import Modal, { ModalRef } from "../Modal";
import Button from "../Button";
import ConfirmModal from "../ConfirmModal";
import TaskForm from "./TaskForm";
import Tabs from "../Tabs";
import {
  FiCalendar,
  FiClock,
  FiTag,
  FiUser,
  FiAlertCircle,
  FiRotateCw,
  FiInfo,
  FiEdit2,
  FiTrash2,
  FiX,
  FiFlag,
  FiBox,
  FiEye,
} from "react-icons/fi";
import { useBoardActions } from "@/app/hooks/useBoardActions";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
}

const PRIORITY_STYLE = {
  HIGH: {
    color:
      "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200",
    borderColor: "border-red-300",
    icon: FiAlertCircle,
    label: "Haute",
    badgeColor: "bg-red-100 text-red-800",
  },
  MEDIUM: {
    color:
      "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200",
    borderColor: "border-yellow-300",
    icon: FiFlag,
    label: "Moyenne",
    badgeColor: "bg-yellow-100 text-yellow-800",
  },
  LOW: {
    color:
      "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200",
    borderColor: "border-green-300",
    icon: FiFlag,
    label: "Basse",
    badgeColor: "bg-green-100 text-green-800",
  },
  URGENT: {
    color:
      "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200",
    borderColor: "border-purple-300",
    icon: FiAlertCircle,
    label: "Urgente",
    badgeColor: "bg-purple-100 text-purple-800",
  },
};

const TYPE_STYLE = {
  TASK: { icon: FiBox, label: "Tâche", color: "text-blue-600" },
  FEATURE: { icon: FiFlag, label: "Fonctionnalité", color: "text-purple-600" },
  BUG: { icon: FiAlertCircle, label: "Bug", color: "text-red-600" },
  IMPROVEMENT: {
    icon: FiRotateCw,
    label: "Amélioration",
    color: "text-green-600",
  },
};

const TaskDetailModal = ({ task, onClose }: TaskDetailModalProps) => {
  const modalRef = useRef<ModalRef>(null);
  const deleteModalRef = useRef<ModalRef>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const queryClient = useQueryClient();

  const { updateTask, removeTask } = useBoardActions();

  useEffect(() => {
    modalRef.current?.open();
  }, []);

  const formatDate = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return formatDate(date);
  };

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  const priority = PRIORITY_STYLE[task.priority as keyof typeof PRIORITY_STYLE];
  const taskType = TYPE_STYLE[task.type as keyof typeof TYPE_STYLE];
  const TypeIcon = taskType?.icon;

  console.log("hello", task);

  return (
    <>
      <Modal
        ref={modalRef}
        className="max-w-4xl!"
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {TypeIcon && (
                  <div
                    className={`p-2 rounded-lg bg-gray-100 ${taskType.color}`}
                  >
                    <TypeIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {task.title}
                  </h1>
                  <p className="text-sm text-gray-500">{taskType.label}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                  className="!p-3 !rounded-xl hover:scale-105 transition-transform"
                >
                  <FiEdit2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        }
        onAfterClose={onClose}
      >
        {isEditing ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Modifier la tâche
              </h2>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Annuler
                </Button>
              </div>
            </div>

            <TaskForm
              initialData={task}
              projectId={task.projectId}
              onSubmit={(data: TaskFormData) => {
                updateTask(task.id, data);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
              submitLabel="Enregistrer les modifications"
            />
          </div>
        ) : (
          <div className="space-y-8">
            <Tabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                {
                  id: "details",
                  label: "Détails",
                  icon: FiEye,
                  content: (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-8">
                        {task.description && (
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FiInfo className="w-5 h-5 text-blue-600" />
                              </div>
                              Description
                            </h3>
                            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                              <p className="whitespace-pre-wrap">
                                {task.description}
                              </p>
                            </div>
                          </div>
                        )}

                        {task.tags?.length > 0 && (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm">
                            <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900 mb-4">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <FiTag className="w-5 h-5 text-purple-600" />
                              </div>
                              Tags
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {task.tags.map((tag) => (
                                <span
                                  key={tag.id}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm border"
                                  style={{
                                    backgroundColor: tag.color + "20",
                                    color: tag.color,
                                    borderColor: tag.color + "40",
                                  }}
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
                            Informations
                          </h3>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Assigné à
                            </label>
                            {task.assignedTo ? (
                              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                                  <FiUser className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-blue-900">
                                  {task.assignedTo.name}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <FiUser className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-gray-500">
                                  Non assigné
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">
                              Priorité
                            </label>
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${priority.color} ${priority.borderColor}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${priority.badgeColor.replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                                <priority.icon className="w-4 h-4" />
                              </div>
                              <span className="font-medium">
                                {priority.label}
                              </span>
                            </div>
                          </div>

                          {task.dueDate && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-600">
                                Échéance
                              </label>
                              <div
                                className={`flex items-center gap-3 p-3 rounded-xl border ${
                                  isOverdue
                                    ? "bg-red-50 border-red-200"
                                    : "bg-green-50 border-green-200"
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isOverdue ? "bg-red-200" : "bg-green-200"
                                  }`}
                                >
                                  <FiCalendar
                                    className={`w-4 h-4 ${
                                      isOverdue
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <div
                                    className={`font-medium ${
                                      isOverdue
                                        ? "text-red-900"
                                        : "text-green-900"
                                    }`}
                                  >
                                    {formatDate(task.dueDate)}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      isOverdue
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {formatRelativeTime(task.dueDate)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <FiClock className="w-4 h-4" />
                              <div>
                                <div>Créé le {formatDate(task.createdAt)}</div>
                                <div className="text-xs text-gray-500">
                                  {formatTime(task.createdAt)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <FiEdit2 className="w-4 h-4" />
                              <div>
                                <div>
                                  Modifié {formatRelativeTime(task.updatedAt)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatTime(task.updatedAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
                            Actions
                          </h3>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => deleteModalRef.current?.open()}
                            className="w-full flex items-center justify-center gap-3 !py-3 !rounded-xl hover:scale-105 transition-transform"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            Supprimer la tâche
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  id: "activity",
                  label: "Activité",
                  icon: FiClock,
                  content: (
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <div className="text-center py-12 text-gray-500">
                        <FiClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>
                          L&apos;historique des activités sera bientôt
                          disponible
                        </p>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      <ConfirmModal
        ref={deleteModalRef}
        title="Supprimer la tâche"
        description="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible."
        itemLabel={task.title}
        confirmLabel="Supprimer définitivement"
        variant="danger"
        isLoading={false}
        onConfirm={() => {
          removeTask(task.columnId, task.id);
          queryClient.invalidateQueries({
            queryKey: ["columns", task.projectId],
          });
          onClose();
        }}
        onCancel={() => deleteModalRef.current?.close()}
      />
    </>
  );
};

export default TaskDetailModal;
