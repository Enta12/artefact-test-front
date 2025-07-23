'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { fr } from 'date-fns/locale';
import Input from '../Input';
import Button from '../Button';
import TextArea from '../TextArea';
import { generateAccessibleColor } from '../../utils/colors';
import { 
  FiCalendar, 
  FiTag, 
  FiUser, 
  FiFlag, 
  FiBox, 
  FiAlertCircle,
  FiSave,
  FiX,
  FiEdit3
} from 'react-icons/fi';
import { Task, User, Tag } from '../../types/board';
import { TaskFormData, TaskType, TaskPriority } from '../../types/task';
import AdvancedSelect from '../CreatableSelect';

interface TaskFormProps {
  initialData?: Task;
  projectId: number;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  users: User[];
  tags: Tag[];
  onCreateTag?: (name: string, color: string) => Promise<void>;
}

const priorityOptions = [
  { value: 'LOW', label: 'Basse', icon: FiFlag, color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'MEDIUM', label: 'Moyenne', icon: FiFlag, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { value: 'HIGH', label: 'Haute', icon: FiAlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  { value: 'URGENT', label: 'Urgente', icon: FiAlertCircle, color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

const typeOptions = [
  { value: 'TASK', label: 'Tâche', icon: FiBox, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'FEATURE', label: 'Fonctionnalité', icon: FiFlag, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { value: 'BUG', label: 'Bug', icon: FiAlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  { value: 'IMPROVEMENT', label: 'Amélioration', icon: FiEdit3, color: 'text-green-600', bgColor: 'bg-green-50' },
];


const TaskForm = ({
  initialData,
  projectId,
  onSubmit,
  onCancel,
  submitLabel = "Enregistrer",
  isSubmitting = false,
  users,
  tags,
  onCreateTag
}: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: (initialData?.type as TaskType) || 'TASK',
    priority: (initialData?.priority as TaskPriority) || 'MEDIUM',
    startDate: initialData?.startDate ? new Date(initialData.startDate) : null,
    endDate: initialData?.endDate ? new Date(initialData.endDate) : null,
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : null,
    selectedTags: initialData?.tags?.map(tag => ({
      ...tag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: projectId
    } as Tag)) || [],
    assignedToId: initialData?.assignedTo?.id
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
    }
  };

  const handleCreateTag = async (inputValue: string) => {
    if (onCreateTag) {
      const color = generateAccessibleColor();
      await onCreateTag(inputValue, color);
    }
  };

  const selectedType = typeOptions.find(option => option.value === formData.type);
  const selectedPriority = priorityOptions.find(option => option.value === formData.priority);
  const TypeIcon = selectedType?.icon || FiBox;
  const PriorityIcon = selectedPriority?.icon || FiFlag;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FiEdit3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Informations principales</h3>
            <p className="text-sm text-gray-600">Définissez les caractéristiques essentielles de votre tâche</p>
          </div>
        </div>

        <div className="space-y-6">
          <Input
            label="Titre de la tâche"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            autoFocus
            className="text-lg font-medium"
            placeholder="Donnez un titre clair et précis à votre tâche..."
          />

          <TextArea
            label="Description détaillée"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Décrivez votre tâche en détail, incluez les critères d'acceptation si nécessaire..."
            className="resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${selectedType?.bgColor || 'bg-gray-100'}`}>
              <TypeIcon className={`w-5 h-5 ${selectedType?.color || 'text-gray-600'}`} />
            </div>
            <div>
              <label className="text-base font-semibold text-gray-900">Type de tâche</label>
              <p className="text-sm text-gray-600">Catégorisez votre tâche</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {typeOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    formData.type === option.value
                      ? `${option.bgColor} border-current ${option.color}`
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={formData.type === option.value}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-lg ${
                    formData.type === option.value ? option.bgColor : 'bg-white'
                  }`}>
                    <OptionIcon className={`w-4 h-4 ${
                      formData.type === option.value ? option.color : 'text-gray-400'
                    }`} />
                  </div>
                  <span className="font-medium">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${selectedPriority?.bgColor || 'bg-gray-100'}`}>
              <PriorityIcon className={`w-5 h-5 ${selectedPriority?.color || 'text-gray-600'}`} />
            </div>
            <div>
              <label className="text-base font-semibold text-gray-900">Priorité</label>
              <p className="text-sm text-gray-600">Définissez l&apos;urgence</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {priorityOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    formData.priority === option.value
                      ? `${option.bgColor} border-current ${option.color}`
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={formData.priority === option.value}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-lg ${
                    formData.priority === option.value ? option.bgColor : 'bg-white'
                  }`}>
                    <OptionIcon className={`w-4 h-4 ${
                      formData.priority === option.value ? option.color : 'text-gray-400'
                    }`} />
                  </div>
                  <span className="font-medium">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl">
            <FiCalendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Planification</h3>
            <p className="text-sm text-gray-600">Définissez les dates importantes pour cette tâche</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date de début</label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date: Date | null) => setFormData({ ...formData, startDate: date })}
              locale={fr}
              dateFormat="dd/MM/yyyy"
              placeholderText="Début optionnel"
              className="w-full rounded-xl border border-gray-300 px-4 py-3
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       transition-all duration-200 bg-white shadow-sm"
              isClearable
              showPopperArrow
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date de fin</label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date: Date | null) => setFormData({ ...formData, endDate: date })}
              locale={fr}
              dateFormat="dd/MM/yyyy"
              placeholderText="Fin optionnelle"
              className="w-full rounded-xl border border-gray-300 px-4 py-3
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       transition-all duration-200 bg-white shadow-sm"
              isClearable
              minDate={formData.startDate || undefined}
              showPopperArrow
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date d&apos;échéance</label>
            <DatePicker
              selected={formData.dueDate}
              onChange={(date: Date | null) => setFormData({ ...formData, dueDate: date })}
              locale={fr}
              dateFormat="dd/MM/yyyy"
              placeholderText="Échéance importante"
              className="w-full rounded-xl border border-gray-300 px-4 py-3
                       focus:ring-2 focus:ring-green-500 focus:border-green-500
                       transition-all duration-200 bg-white shadow-sm"
              isClearable
              highlightDates={[new Date()]}
              showPopperArrow
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FiTag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <label className="text-base font-semibold text-gray-900">Tags</label>
              <p className="text-sm text-gray-600">Organisez avec des étiquettes</p>
            </div>
          </div>
          
          <AdvancedSelect
            options={tags.map(tag => ({
              value: tag,
              label: tag.name,
              color: tag.color
            }))}
            value={formData.selectedTags.map(tag => ({
              value: tag,
              label: tag.name,
              color: tag.color
            }))}
            onChange={(newValue) => {
              setFormData({
                ...formData,
                selectedTags: newValue.map(v => v.value)
              });
            }}
            onCreateOption={handleCreateTag}
            formatOptionLabel={({ label, color }) => (
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium">{label}</span>
              </div>
            )}
            placeholder="Sélectionnez ou créez des tags..."
          />
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FiUser className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <label className="text-base font-semibold text-gray-900">Assigné à</label>
              <p className="text-sm text-gray-600">Qui sera responsable ?</p>
            </div>
          </div>
          
          <select
            value={formData.assignedToId || ''}
            onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-xl border border-blue-200 px-4 py-3
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     transition-all duration-200 bg-white shadow-sm font-medium"
          >
            <option value="">Non assigné</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {initialData && (
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <FiFlag className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <label className="text-base font-semibold text-gray-900">Statut</label>
              <p className="text-sm text-gray-600">Où en est cette tâche ?</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="px-6 py-3 flex items-center gap-2 !rounded-xl hover:scale-105 transition-transform"
        >
          <FiX className="w-4 h-4" />
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!formData.title.trim() || isSubmitting}
          className="px-8 py-3 flex items-center gap-2 !rounded-xl hover:scale-105 transition-transform"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <FiSave className="w-4 h-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm; 