import React, { useState } from 'react';
import { Project, ScheduleTask, UserRole } from '../types';
import { CalendarClock, Edit3, Save, X, Plus, Trash2 } from 'lucide-react';

interface Props {
    userRole: UserRole;
    project: Project;
    onProjectUpdate: (project: Project) => void;
}

const ScheduleModule: React.FC<Props> = ({ userRole, project, onProjectUpdate }) => {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<ScheduleTask | null>(null);

  // Permission check: Only PM, Site Engineer, and Supervisor can edit schedule
  const canEdit = [UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER, UserRole.SUPERVISOR].includes(userRole);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const projectStartDate = new Date(project.startDate).getTime();
  const projectEndDate = new Date(project.endDate).getTime();
  const totalDuration = projectEndDate - projectStartDate;

  const getBoqItemById = (id: string) => project.boq.find(item => item.id === id);

  const handleAddTask = () => {
    if (!canEdit) return;
    const task: ScheduleTask = {
      id: generateId(),
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days later
      progress: 0,
      status: 'On Track',
      priority: 'Medium',
      dependencies: [],
      assignedResources: [],
      estimatedDays: 0,
      actualDays: 0,
      associatedQuantity: 0,
    };
    setNewTask(task);
  };

  const handleSaveNewTask = () => {
    if (!newTask) return;
    onProjectUpdate({ ...project, schedule: [...project.schedule, newTask] });
    setNewTask(null);
  };

  const handleEditTask = (taskId: string) => {
    if (!canEdit) return;
    setEditingTask(taskId);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ScheduleTask>) => {
    const updatedSchedule = project.schedule.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    onProjectUpdate({ ...project, schedule: updatedSchedule });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!canEdit) return;
    const updatedSchedule = project.schedule.filter(task => task.id !== taskId);
    onProjectUpdate({ ...project, schedule: updatedSchedule });
  };

  // Calculate summary statistics
  const totalTasks = project.schedule.length;
  const completedTasks = project.schedule.filter(task => task.status === 'Completed').length;
  const delayedTasks = project.schedule.filter(task => task.status === 'Delayed').length;
  const onTrackTasks = project.schedule.filter(task => task.status === 'On Track').length;
  const totalEstimatedDays = project.schedule.reduce((sum, task) => sum + (task.estimatedDays || 0), 0);
  const averageProgress = totalTasks > 0 ? Math.round(project.schedule.reduce((sum, task) => sum + task.progress, 0) / totalTasks) : 0;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Work Schedule</h2>
          <p className="text-slate-500 text-sm">Timeline and Critical Path for {project.code}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex gap-6">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Tasks</div>
            <div className="font-bold text-slate-800">{totalTasks}</div>
          </div>
          <div className="w-px bg-slate-200"></div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Completed</div>
            <div className="font-bold text-green-600">{completedTasks}</div>
          </div>
          <div className="w-px bg-slate-200"></div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Avg Progress</div>
            <div className="font-bold text-blue-600">{averageProgress}%</div>
          </div>
          {totalEstimatedDays > 0 && (
            <>
              <div className="w-px bg-slate-200"></div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Total Days</div>
                <div className="font-bold text-slate-800">{totalEstimatedDays}d</div>
              </div>
            </>
          )}
          {delayedTasks > 0 && (
            <>
              <div className="w-px bg-slate-200"></div>
              <div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Delayed</div>
                <div className="font-bold text-red-600">{delayedTasks}</div>
              </div>
            </>
          )}
        </div>
        {canEdit && (
          <button
            onClick={handleAddTask}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors ml-4"
          >
            <Plus size={16} /> Add Task
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
        {project.schedule.length === 0 ? (
             <div className="text-center text-slate-400 italic">No schedule data defined.</div>
        ) : (
        <div className="space-y-4">
          {project.schedule.map((task) => {
            const taskStart = new Date(task.startDate).getTime();
            const duration = (new Date(task.endDate).getTime() - taskStart);
            const leftPercent = totalDuration > 0 ? ((taskStart - projectStartDate) / totalDuration) * 100 : 0;
            const widthPercent = totalDuration > 0 ? (duration / totalDuration) * 100 : 0;

            const boqItem = task.boqItemId ? getBoqItemById(task.boqItemId) : null;
            const actualProgress = boqItem ? (boqItem.completedQuantity / boqItem.quantity) * 100 : 0;

            return (
              <div key={task.id} className="group">
                <div className="flex items-center gap-4">
                  <div className="w-1/3">
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{task.name}</div>
                    <div className="text-[10px] text-slate-500">{boqItem?.description || 'N/A'}</div>
                  </div>
                  <div className="w-2/3">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 relative text-white text-[10px] font-semibold">
                      {/* Baseline Bar */}
                      <div
                        className="absolute h-full rounded-full bg-blue-400 flex items-center justify-end px-1"
                        style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                        title={`Planned: ${task.startDate} to ${task.endDate}`}
                      >
                        <span className="truncate">{task.name}</span>
                      </div>
                      {/* Actual Progress Bar */}
                      {boqItem && (
                        <div
                          className="absolute h-full rounded-full bg-green-500 opacity-80"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${(widthPercent * actualProgress) / 100}%`,
                          }}
                          title={`Actual Progress: ${actualProgress.toFixed(1)}%`}
                        ></div>
                      )}
                    </div>
                  </div>
                   {canEdit && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditTask(task.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit3 size={14} /></button>
                      <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
        
        {/* Legend */}
        <div className="mt-8 flex gap-6 text-xs border-t pt-4 border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Planned (Baseline)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Actual Progress</span>
          </div>
        </div>
      </div>

      {/* New Task Modal */}
      {newTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-700">Add New Task</h3>
              <button onClick={() => setNewTask(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newTask.endDate}
                    onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Days</label>
                  <input
                    type="number"
                    value={newTask.estimatedDays}
                    onChange={(e) => setNewTask({ ...newTask, estimatedDays: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Associated BOQ Item</label>
                <select
                  value={newTask.boqItemId || ''}
                  onChange={(e) => setNewTask({ ...newTask, boqItemId: e.target.value || undefined })}
                  className="w-full p-2 border border-slate-300 rounded-md"
                >
                  <option value="">-- Select BOQ Item --</option>
                  {project.boq.map(boqItem => (
                    <option key={boqItem.id} value={boqItem.id}>{boqItem.description} (Qty: {boqItem.quantity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Associated Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={newTask.associatedQuantity}
                  onChange={(e) => setNewTask({ ...newTask, associatedQuantity: Number(e.target.value) })}
                  className="w-full p-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setNewTask(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (() => {
        const task = project.schedule.find(t => t.id === editingTask);
        if (!task) return null;
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-700">Edit Task</h3>
                <button onClick={() => setEditingTask(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                  <input
                    type="text"
                    value={task.name}
                    onChange={(e) => handleUpdateTask(editingTask, { name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={task.description || ''}
                    onChange={(e) => handleUpdateTask(editingTask, { description: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={task.startDate}
                      onChange={(e) => handleUpdateTask(editingTask, { startDate: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={task.endDate}
                      onChange={(e) => handleUpdateTask(editingTask, { endDate: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => handleUpdateTask(editingTask, { progress: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTask(editingTask, { status: e.target.value as 'On Track' | 'Delayed' | 'Completed' })}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    >
                      <option value="On Track">On Track</option>
                      <option value="Delayed">Delayed</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select
                      value={task.priority || 'Medium'}
                      onChange={(e) => handleUpdateTask(editingTask, { priority: e.target.value as 'Low' | 'Medium' | 'High' })}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Days</label>
                    <input
                      type="number"
                      value={task.estimatedDays || 0}
                      onChange={(e) => handleUpdateTask(editingTask, { estimatedDays: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Actual Days</label>
                    <input
                      type="number"
                      value={task.actualDays || 0}
                      onChange={(e) => handleUpdateTask(editingTask, { actualDays: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Associated Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={task.associatedQuantity || 0}
                      onChange={(e) => handleUpdateTask(editingTask, { associatedQuantity: Number(e.target.value) })}
                      className="w-full p-2 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Associated BOQ Item</label>
                  <select
                    value={task.boqItemId || ''}
                    onChange={(e) => handleUpdateTask(editingTask, { boqItemId: e.target.value || undefined })}
                    className="w-full p-2 border border-slate-300 rounded-md"
                  >
                    <option value="">-- Select BOQ Item --</option>
                    {project.boq.map(boqItem => (
                      <option key={boqItem.id} value={boqItem.id}>{boqItem.description} (Qty: {boqItem.quantity})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ScheduleModule;
