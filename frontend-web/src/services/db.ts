// Local Persistent Database Service for Construct.ai
import { Project, Task, UserRole } from '../types';

export interface GanttTask {
  id: number;
  name: string;
  start: string;
  dur: number;
  progress: number;
}

export interface LaborAttendance {
  id: number;
  name: string;
  gender: string;
  age: number;
  address: string;
  contact: string;
  emergencyContact: string;
  present: boolean;
  wageRate: number;
  salaryPaid: number;
  salaryDue: number;
}

export interface MarketplaceItem {
  id: number;
  name: string;
  type: 'MATERIAL' | 'RENTAL';
  price: number;
  unit: string;
  supplier: string;
}

export interface ProcurementOrder {
  id: number;
  clientProjectName: string;
  itemName: string;
  quantity: number;
  standardPrice: number;
  contractorOfferPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ChatMessage {
  id: number;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface RegistrationRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  role: UserRole;
  reason: string;
  status: string;
  timestamp: string;
}

// Default Seed Datasets - Cleaned & emptied as requested for manual verification
const DEFAULT_USERS = [
  { id: 1, username: 'harshit_raj', password: 'password123', role: 'ADMIN' as UserRole, email: 'harshit@construct.ai', phone_number: '+91 99999 99999', company_name: 'Construct.ai Org', first_name: 'Harshit', last_name: 'Raj' },
  { id: 2, username: 'contractor', password: 'password123', role: 'CONTRACTOR' as UserRole, email: 'dave@apex.com', phone_number: '+91 98765 43210', company_name: 'Apex Builders Ltd', first_name: 'Dave', last_name: 'Contractor' },
  { id: 3, username: 'client', password: 'password123', role: 'CLIENT' as UserRole, email: 'contact@horizon.com', phone_number: '+91 88888 88888', company_name: 'Horizon Realty Group', first_name: 'Horizon', last_name: 'Realty', assignedProjectId: null },
  { id: 4, username: 'vendor', password: 'password123', role: 'VENDOR' as UserRole, email: 'supply@elite.com', phone_number: '+91 77777 77777', company_name: 'Elite Supplies Ltd', first_name: 'Elite', last_name: 'Supplies' },
  { id: 5, username: 'labor', password: 'password123', role: 'LABOR' as UserRole, email: 'steve@labor.com', phone_number: '+91 66666 66666', company_name: 'Individual', first_name: 'Steve', last_name: 'Smith' }
];

const DEFAULT_PROJECTS: Project[] = [];
const DEFAULT_TASKS: Task[] = [];
const DEFAULT_GANTT: GanttTask[] = [];

const DEFAULT_LABORS: LaborAttendance[] = [];

const DEFAULT_MARKETPLACE: MarketplaceItem[] = [];
const DEFAULT_ORDERS: ProcurementOrder[] = [];
const DEFAULT_CHAT: ChatMessage[] = [];

// Auto-clear active sessions holding old dummy projects or data
try {
  const oldProj = localStorage.getItem('db_projects');
  const oldLabors = localStorage.getItem('db_labors');
  const oldOrders = localStorage.getItem('db_vendor_orders');
  if (
    (oldProj && oldProj.includes("Downtown Horizon")) || 
    (oldLabors && (oldLabors.includes("Rajesh Kumar") || oldLabors.includes("Steve Smith"))) ||
    (oldOrders && (oldOrders.includes("UltraTech Cement") || oldOrders.includes("TMT Fe 550")))
  ) {
    localStorage.removeItem('db_projects');
    localStorage.removeItem('db_tasks');
    localStorage.removeItem('db_gantt_timeline');
    localStorage.removeItem('db_labors');
    localStorage.removeItem('db_marketplace');
    localStorage.removeItem('db_vendor_orders');
    localStorage.removeItem('db_chat_messages');
    localStorage.removeItem('pending_registrations');
  }
} catch (e) {
  console.warn("Storage flush check skipped:", e);
}

export class BrowserDatabase {
  static get<T>(key: string, defaults: T): T {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(data);
  }

  static set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Clear Database completely
  static resetToEmptyState(): void {
    localStorage.removeItem('db_projects');
    localStorage.removeItem('db_tasks');
    localStorage.removeItem('db_gantt_timeline');
    localStorage.removeItem('db_labors');
    localStorage.removeItem('db_marketplace');
    localStorage.removeItem('db_vendor_orders');
    localStorage.removeItem('db_chat_messages');
    localStorage.removeItem('pending_registrations');
    
    // Seed initial schemas to empty state
    this.saveProjects(DEFAULT_PROJECTS);
    this.saveTasks(DEFAULT_TASKS);
    this.saveGantt(DEFAULT_GANTT);
    this.saveLabors(DEFAULT_LABORS);
    this.saveMarketplace(DEFAULT_MARKETPLACE);
    this.saveOrders(DEFAULT_ORDERS);
    this.saveChat(DEFAULT_CHAT);
    this.savePendingRegistrations([]);
  }

  // Users Store
  static getUsers(): any[] {
    return this.get('registered_users', DEFAULT_USERS);
  }
  static saveUsers(users: any[]): void {
    this.set('registered_users', users);
  }

  // Projects Store
  static getProjects(): Project[] {
    return this.get('db_projects', DEFAULT_PROJECTS);
  }
  static saveProjects(projects: Project[]): void {
    this.set('db_projects', projects);
  }

  // Tasks Store
  static getTasks(): Task[] {
    return this.get('db_tasks', DEFAULT_TASKS);
  }
  static saveTasks(tasks: Task[]): void {
    this.set('db_tasks', tasks);
  }

  // Gantt Tasks Store
  static getGantt(): GanttTask[] {
    return this.get('db_gantt_timeline', DEFAULT_GANTT);
  }
  static saveGantt(gantt: GanttTask[]): void {
    this.set('db_gantt_timeline', gantt);
  }

  // Labors Store
  static getLabors(): LaborAttendance[] {
    return this.get('db_labors', DEFAULT_LABORS);
  }
  static saveLabors(labors: LaborAttendance[]): void {
    this.set('db_labors', labors);
  }

  // Marketplace Store
  static getMarketplace(): MarketplaceItem[] {
    return this.get('db_marketplace', DEFAULT_MARKETPLACE);
  }
  static saveMarketplace(items: MarketplaceItem[]): void {
    this.set('db_marketplace', items);
  }

  // Orders Store
  static getOrders(): ProcurementOrder[] {
    return this.get('db_vendor_orders', DEFAULT_ORDERS);
  }
  static saveOrders(orders: ProcurementOrder[]): void {
    this.set('db_vendor_orders', orders);
  }

  // Chat Store
  static getChat(): ChatMessage[] {
    return this.get('db_chat_messages', DEFAULT_CHAT);
  }
  static saveChat(messages: ChatMessage[]): void {
    this.set('db_chat_messages', messages);
  }

  // Registration Requests Store
  static getPendingRegistrations(): RegistrationRequest[] {
    return this.get('pending_registrations', []);
  }
  static savePendingRegistrations(requests: RegistrationRequest[]): void {
    this.set('pending_registrations', requests);
  }

  // Helper to calculate project progress percentage
  static updateProjectProgress(projectId: number): number {
    const projects = this.getProjects();
    const tasks = this.getTasks();
    const project = projects.find(p => p.id === projectId);
    if (!project) return 0;

    const projectTasks = tasks.filter(t => t.project === projectId);
    const completedTasks = projectTasks.filter(t => t.status === 'DONE').length;
    const progress = projectTasks.length > 0 
      ? Math.round((completedTasks / projectTasks.length) * 100) 
      : (project.status === 'COMPLETED' ? 100 : 0);

    return progress;
  }

  // Synchronize project progress, Gantt, and notify the site communication channel
  static syncProjectProgressAndNotify(projectId: number, taskId: number, newStatus: string): void {
    const projects = this.getProjects();
    const tasks = this.getTasks();
    const project = projects.find(p => p.id === projectId);
    const task = tasks.find(t => t.id === taskId);
    if (!project || !task) return;

    const progress = this.updateProjectProgress(projectId);

    // Update Gantt schedule progress
    const gantt = this.getGantt();
    let ganttTask = gantt.find(g => g.id === project.id || g.name === project.name);
    if (ganttTask) {
      ganttTask.progress = progress;
      ganttTask.name = project.name;
    } else {
      gantt.push({
        id: project.id,
        name: project.name,
        start: project.start_date || new Date().toISOString().split('T')[0],
        dur: 12, // default 12 weeks duration
        progress: progress
      });
    }
    this.saveGantt(gantt);

    // Add status message to site communication channel (chat messages list)
    const chat = this.getChat();
    const nextId = chat.length > 0 ? Math.max(...chat.map(c => c.id)) + 1 : 1;
    const updateMsg: ChatMessage = {
      id: nextId,
      sender: "System Notification",
      role: "ADMIN",
      text: `📢 Project '${project.name}' update: Task '${task.name}' status changed to '${newStatus}'. Project progress is now ${progress}%.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    chat.push(updateMsg);
    this.saveChat(chat);
  }
}
