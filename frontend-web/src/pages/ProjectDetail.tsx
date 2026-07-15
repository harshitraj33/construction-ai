import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Project, Task, TaskStatus, TaskPriority, UserRole } from '../types';
import { BrowserDatabase } from '../services/db';
import { 
  ArrowLeft, Calendar, Plus, CheckCircle, Globe,
  Clock, AlertCircle, ChevronLeft, ChevronRight, User, Trash2
} from 'lucide-react';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, api, isMocked } = useAuth();
  const { language, t, setLanguage } = useLanguage();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Form states
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedRole, setTaskAssignedRole] = useState<UserRole>('LABOR');

  useEffect(() => {
    const fetchData = async () => {
      if (isMocked) {
        const allProjs = BrowserDatabase.getProjects();
        const foundProj = allProjs.find(p => p.id === Number(id));
        if (foundProj) {
          setProject(foundProj);
        } else {
          const mockProj = {
            id: Number(id),
            name: id === '1' ? "Downtown Horizon Commercial Tower" : id === '2' ? "Greenwood Residential Eco-Villas" : id === '3' ? "Metro Station Underpass Renovation" : "Eastside Highway Bridge Expansion",
            description: "Smart city civil engineering building project.",
            owner: 2,
            status: (id === '1' ? 'ACTIVE' : id === '2' ? 'PLANNING' : id === '3' ? 'ON_HOLD' : 'COMPLETED') as any,
            start_date: "2026-01-01",
            budget: "3500000.00",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProject(mockProj);
        }
        const allTasks = BrowserDatabase.getTasks();
        setTasks(allTasks.filter(t => t.project === Number(id)));
        setLoading(false);
        return;
      }

      try {
        const [projRes, taskRes] = await Promise.all([
          api.get(`/api/projects/${id}/`),
          api.get(`/api/tasks/?project_id=${id}`)
        ]);
        setProject(projRes.data);
        setTasks(taskRes.data);
      } catch (err) {
        console.warn("Failed fetching project details, loading simulated detail views.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isMocked, api]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      project: Number(id),
      name: taskName,
      description: taskDesc,
      status: 'TODO' as TaskStatus,
      priority: taskPriority,
      due_date: taskDueDate || null,
    };

    if (isMocked) {
      const allTasks = BrowserDatabase.getTasks();
      const newId = allTasks.length > 0 ? Math.max(...allTasks.map(t => t.id)) + 1 : 1;
      const mockTask: Task = {
        id: newId,
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assigned_to_details: {
          id: 10,
          username: `demo_${taskAssignedRole.toLowerCase()}`,
          email: `${taskAssignedRole.toLowerCase()}@construct.ai`,
          role: taskAssignedRole,
          first_name: 'Assigned',
          last_name: 'Member'
        }
      };
      const updatedAll = [...allTasks, mockTask];
      BrowserDatabase.saveTasks(updatedAll);
      setTasks(updatedAll.filter(t => t.project === Number(id)));

      // Recalculate progress and update Gantt
      const newProgress = BrowserDatabase.updateProjectProgress(Number(id));
      const gantt = BrowserDatabase.getGantt();
      const proj = BrowserDatabase.getProjects().find(p => p.id === Number(id)) || project;
      if (proj) {
        const ganttTask = gantt.find(g => g.id === proj.id || g.name === proj.name);
        if (ganttTask) {
          ganttTask.progress = newProgress;
        } else {
          gantt.push({
            id: proj.id,
            name: proj.name,
            start: proj.start_date || new Date().toISOString().split('T')[0],
            dur: 12,
            progress: newProgress
          });
        }
        BrowserDatabase.saveGantt(gantt);
      }

      setShowTaskModal(false);
      resetTaskForm();
      return;
    }

    try {
      const response = await api.post('/api/tasks/', payload);
      setTasks([...tasks, response.data]);
      setShowTaskModal(false);
      resetTaskForm();
    } catch (err) {
      alert("Failed to create task on live API.");
    }
  };

  const resetTaskForm = () => {
    setTaskName('');
    setTaskDesc('');
    setTaskPriority('MEDIUM');
    setTaskDueDate('');
    setTaskAssignedRole('LABOR');
  };

  const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus) => {
    if (isMocked) {
      const allTasks = BrowserDatabase.getTasks();
      const updatedAll = allTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      BrowserDatabase.saveTasks(updatedAll);
      setTasks(updatedAll.filter(t => t.project === Number(id)));

      // Recalculate progress, update Gantt, and notify site comm channel
      BrowserDatabase.syncProjectProgressAndNotify(Number(id), taskId, newStatus);
      return;
    }

    try {
      const response = await api.patch(`/api/tasks/${taskId}/`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
    } catch (err) {
      alert("Failed to update status on server.");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (isMocked) {
      const allTasks = BrowserDatabase.getTasks();
      const updatedAll = allTasks.filter(t => t.id !== taskId);
      BrowserDatabase.saveTasks(updatedAll);
      setTasks(updatedAll.filter(t => t.project === Number(id)));

      // Recalculate progress and update Gantt
      const newProgress = BrowserDatabase.updateProjectProgress(Number(id));
      const gantt = BrowserDatabase.getGantt();
      const proj = BrowserDatabase.getProjects().find(p => p.id === Number(id)) || project;
      if (proj) {
        const ganttTask = gantt.find(g => g.id === proj.id || g.name === proj.name);
        if (ganttTask) {
          ganttTask.progress = newProgress;
        } else {
          gantt.push({
            id: proj.id,
            name: proj.name,
            start: proj.start_date || new Date().toISOString().split('T')[0],
            dur: 12,
            progress: newProgress
          });
        }
        BrowserDatabase.saveGantt(gantt);
      }
      return;
    }

    try {
      await api.delete(`/api/tasks/${taskId}/`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete task.");
    }
  };

  const getPriorityLabel = (p: TaskPriority) => {
    switch (p) {
      case 'HIGH': return t.high;
      case 'MEDIUM': return t.medium;
      default: return t.low;
    }
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'HIGH': return 'bg-rose-500';
      case 'MEDIUM': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  const renderColumn = (colStatus: TaskStatus, label: string) => {
    const colTasks = tasks.filter(t => t.status === colStatus);
    const statuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const colIndex = statuses.indexOf(colStatus);

    return (
      <div className="flex-1 min-w-[280px] bg-slate-900/40 rounded-xl border border-slate-800 p-4 flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {colStatus === 'DONE' && <CheckCircle size={16} className="text-emerald-400" />}
            {colStatus === 'REVIEW' && <AlertCircle size={16} className="text-purple-400" />}
            {colStatus === 'IN_PROGRESS' && <Clock size={16} className="text-blue-400 animate-spin" />}
            {colStatus === 'TODO' && <Clock size={16} className="text-slate-400" />}
            <span className="font-semibold text-sm text-slate-200">{label}</span>
          </div>
          <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs text-slate-400 font-medium">
            {colTasks.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {colTasks.map(task => (
            <div key={task.id} className="glass p-4 rounded-lg hover:border-slate-700 transition-colors shadow relative group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(task.priority)}`} />
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{getPriorityLabel(task.priority)}</span>
                </div>
                
                {(user?.role === 'ADMIN' || user?.role === 'CONTRACTOR') && (
                  <button 
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-rose-400 p-0.5 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <h5 className="font-bold text-slate-200 mt-2 text-sm line-clamp-1">{task.name}</h5>
              <p className="text-slate-400 text-xs mt-1 line-clamp-3">{task.description}</p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <User size={12} />
                  <span className="truncate max-w-[80px]">
                    {task.assigned_to_details?.first_name || task.assigned_to_details?.username || 'Unassigned'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar size={12} />
                  <span>{task.due_date || 'No due date'}</span>
                </div>
              </div>

              {/* Status Mover Quick Controls */}
              {user?.role !== 'CLIENT' && (
                <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-slate-800/30">
                  {colIndex > 0 && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, statuses[colIndex - 1])}
                      className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <ChevronLeft size={12} />
                    </button>
                  )}
                  {colIndex < 3 && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, statuses[colIndex + 1])}
                      className="p-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {colTasks.length === 0 && (
            <div className="h-24 rounded-lg border border-dashed border-slate-800/80 flex items-center justify-center text-xs text-slate-600">
              No tasks
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg-root flex items-center justify-center">
        <span className="text-slate-400 dark:text-slate-500 animate-pulse text-sm">Loading construction plans...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen theme-bg-root flex flex-col items-center justify-center p-6">
        <h4 className="text-xl font-bold mb-2">Project Not Found</h4>
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-root p-6 md:p-8 flex flex-col transition-colors duration-200">
      {/* Header breadcrumb */}
      <div className="max-w-7xl w-full mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Language selector in project view */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg text-xs text-slate-800 dark:text-slate-300">
            <Globe size={14} className="text-blue-500 dark:text-blue-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent border-none text-black dark:text-white outline-none cursor-pointer focus:ring-0 text-xs font-semibold"
            >
              <option value="en" className="bg-white dark:bg-slate-900 text-black dark:text-white">English</option>
              <option value="hi" className="bg-white dark:bg-slate-900 text-black dark:text-white">हिन्दी</option>
              <option value="mr" className="bg-white dark:bg-slate-900 text-black dark:text-white">मराठी</option>
              <option value="gu" className="bg-white dark:bg-slate-900 text-black dark:text-white">ગુજરાતી</option>
              <option value="bn" className="bg-white dark:bg-slate-900 text-black dark:text-white">বাংলা</option>
            </select>
          </div>

          {(user?.role === 'ADMIN' || user?.role === 'CONTRACTOR') && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={14} /> {t.createTask}
            </button>
          )}
        </div>
      </div>

      {/* Project Meta Details */}
      <div className="max-w-7xl w-full mx-auto glass p-6 rounded-xl border border-slate-800/80 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {project.name}
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-3xl">
              {project.description || 'No project description added yet.'}
            </p>
          </div>

          <div className="flex items-center gap-6 self-start md:self-auto shrink-0 bg-slate-900/40 p-4 rounded-lg border border-slate-850">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1 justify-end">
                {t.budget}
              </span>
              <span className="text-lg font-bold text-slate-200">
                ₹{parseFloat(project.budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="border-l border-slate-850 h-10" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1 justify-end">
                {t.startDate}
              </span>
              <span className="text-sm font-semibold text-slate-300">
                {project.start_date}
              </span>
            </div>
            <div className="border-l border-slate-850 h-10" />
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1 justify-end">
                Progress
              </span>
              <span className="text-sm font-bold text-emerald-400">
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : (project.status === 'COMPLETED' ? 100 : 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Task Columns Container */}
      <div className="max-w-7xl w-full mx-auto flex-1 overflow-x-auto pb-6">
        <div className="flex gap-6 min-w-[1100px] h-full">
          {renderColumn('TODO', t.todo)}
          {renderColumn('IN_PROGRESS', t.inProgress)}
          {renderColumn('REVIEW', t.review)}
          {renderColumn('DONE', t.done)}
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass w-full max-w-md rounded-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-100 mb-4">{t.createTask}</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g. Lay foundation mesh rebar"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Task Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Detail step instructions..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.priority}</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="LOW">{t.low}</option>
                    <option value="MEDIUM">{t.medium}</option>
                    <option value="HIGH">{t.high}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.dueDate}</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Assign to Role Type</label>
                <select
                  value={taskAssignedRole}
                  onChange={(e) => setTaskAssignedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="LABOR">Labor Squad</option>
                  <option value="VENDOR">Vendor Supplies</option>
                  <option value="CONTRACTOR">Contractor Lead</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
