export type UserRole = 'ADMIN' | 'CONTRACTOR' | 'CLIENT' | 'VENDOR' | 'LABOR';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  phone_number?: string;
  company_name?: string;
  first_name?: string;
  last_name?: string;
  assignedProjectId?: number | null;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: number;
  client?: number;
  vendor?: number;
  status: ProjectStatus;
  start_date: string;
  end_date?: string | null;
  budget: string;
  project_type?: string;
  created_at: string;
  updated_at: string;
  owner_details?: User;
  client_details?: User;
  vendor_details?: User;
  tasks?: Task[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  project: number;
  name: string;
  description: string;
  assigned_to?: number;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  assigned_to_details?: User;
}
