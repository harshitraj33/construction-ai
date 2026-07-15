import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Project, Task, UserRole, ProjectStatus, TaskStatus } from '../types';
import { BrowserDatabase } from '../services/db';
import * as XLSX from 'xlsx';
import { 
  Plus, HardHat, Users, Globe, Building,
  Calendar, CheckSquare, LogOut, ArrowRight,
  ShieldCheck, Activity, TrendingUp, Sparkles,
  FileText, DollarSign, MessageSquare, BarChart2,
  ShoppingBag, Truck, RefreshCw, Upload,
  Pencil, Trash2, Eye, EyeOff, Clock
} from 'lucide-react';



interface ChatMessage {
  id: number;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
}

interface LaborAttendance {
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

interface MarketplaceItem {
  id: number;
  name: string;
  type: 'MATERIAL' | 'RENTAL';
  price: number;
  unit: string;
  supplier: string;
}

interface ProcurementOrder {
  id: number;
  clientProjectName: string;
  itemName: string;
  quantity: number;
  standardPrice: number;
  contractorOfferPrice: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const Dashboard: React.FC = () => {
  const { user, logout, api, isMocked, setMockRole, registerNewUser, getRegisteredUsers } = useAuth();
  const { language, t, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Admin User Creation Form State
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [adminNewUsername, setAdminNewUsername] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminNewRole, setAdminNewRole] = useState<UserRole>('CLIENT');
  const [adminNewFirstName, setAdminNewFirstName] = useState('');
  const [adminNewLastName, setAdminNewLastName] = useState('');
  const [adminNewCompany, setAdminNewCompany] = useState('');
  const [adminNewEmail, setAdminNewEmail] = useState('');
  const [adminNewPhone, setAdminNewPhone] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminNewAssignedProject, setAdminNewAssignedProject] = useState('');

  // Pending Registration Request States & Handlers
  const [pendingRequests, setPendingRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('pending_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  const handleRejectRequest = (id: number) => {
    const saved = localStorage.getItem('pending_registrations');
    const list = saved ? JSON.parse(saved) : [];
    const updated = list.filter((r: any) => r.id !== id);
    setPendingRequests(updated);
    localStorage.setItem('pending_registrations', JSON.stringify(updated));
  };

  const handleApproveRequest = (req: any) => {
    const generatedUsername = req.fullName.toLowerCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 90 + 10);
    const generatedPassword = 'temp_' + Math.floor(Math.random() * 9000 + 1000);
    
    // Read current users from localStorage
    const savedUsers = localStorage.getItem('registered_users');
    const list = savedUsers ? JSON.parse(savedUsers) : [];
    
    const newUser = {
      id: list.length + 1,
      username: generatedUsername,
      password: generatedPassword,
      role: req.role as UserRole,
      email: req.email,
      phone_number: req.phone,
      company_name: req.companyName,
      first_name: req.fullName.split(' ')[0] || req.fullName,
      last_name: req.fullName.split(' ').slice(1).join(' ') || '',
    };
    
    const updatedUsers = [...list, newUser];
    localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    setRegisteredUsers(updatedUsers);
    
    alert(`Request approved!\n\nUser Profile Created:\nUsername: ${generatedUsername}\nPassword: ${generatedPassword}\nRole: ${req.role}\n\nPlease email these credentials to ${req.email}.`);
    
    // Remove from pending requests
    handleRejectRequest(req.id);
  };

  useEffect(() => {
    setRegisteredUsers(getRegisteredUsers());
    const saved = localStorage.getItem('pending_registrations');
    setPendingRequests(saved ? JSON.parse(saved) : []);
  }, [activeTab, getRegisteredUsers]);

  // Shared Data States
  const [projects, setProjects] = useState<Project[]>(() => BrowserDatabase.getProjects());
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Project Form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('');
  const [newProjectStart, setNewProjectStart] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>('PLANNING');
  const [newProjectContractorId, setNewProjectContractorId] = useState('');
  const [newProjectVendorId, setNewProjectVendorId] = useState('');
  const [newProjectClientId, setNewProjectClientId] = useState('');

  // Interactive Feature: Gantt Chart State
  const [ganttTasks, setGanttTasks] = useState(() => BrowserDatabase.getGantt());

  const [labors, setLabors] = useState<LaborAttendance[]>(() => BrowserDatabase.getLabors());

  // Interactive Feature: AI Tools
  const [estimateQuery, setEstimateQuery] = useState('');
  const [aiEstimateResult, setAiEstimateResult] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProjectType, setAiProjectType] = useState('RESIDENTIAL');
  const [aiArea, setAiArea] = useState('2500');
  const [aiFloors, setAiFloors] = useState('2');
  const [aiConcreteGrade, setAiConcreteGrade] = useState('M25');
  const [aiFoundationType, setAiFoundationType] = useState('RAFT');
  
  const [blueprintName, setBlueprintName] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Contractor Labor Management form states
  const [cLaborName, setCLaborName] = useState('');
  const [cLaborGender, setCLaborGender] = useState('Male');
  const [cLaborAge, setCLaborAge] = useState('');
  const [cLaborAddress, setCLaborAddress] = useState('');
  const [cLaborContact, setCLaborContact] = useState('');
  const [cLaborEmergencyContact, setCLaborEmergencyContact] = useState('');
  const [cLaborWageRate, setCLaborWageRate] = useState('800');
  
  const [excelLaborFileName, setExcelLaborFileName] = useState<string | null>(null);
  const [excelUploading, setExcelUploading] = useState(false);
  const [excelProgress, setExcelProgress] = useState(0);

  // Interactive Feature: Marketplace & Negotiation Offers
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>(() => BrowserDatabase.getMarketplace());
  const [cart, setCart] = useState<Record<number, number>>({});
  
  // Procurement and negotiations
  const [vendorOrders, setVendorOrders] = useState<ProcurementOrder[]>(() => BrowserDatabase.getOrders());
  const [orderProjectId, setOrderProjectId] = useState('1');
  const [negotiationOffers, setNegotiationOffers] = useState<Record<number, number>>({}); // maps item ID to offer price per unit

  // Vendor inventory form states
  const [vNewProdName, setVNewProdName] = useState('');
  const [vNewProdType, setVNewProdType] = useState<'MATERIAL' | 'RENTAL'>('MATERIAL');
  const [vNewProdPrice, setVNewProdPrice] = useState('');
  const [vNewProdUnit, setVNewProdUnit] = useState('Bag');

  // Interactive Feature: Material Procurement & Rental Invoice Generator (for Vendor role)
  const [financeContractor, setFinanceContractor] = useState('');
  const [financeProject, setFinanceProject] = useState('');
  const [financeItemName, setFinanceItemName] = useState('UltraTech Cement Bags');
  const [financeItemType, setFinanceItemType] = useState<'MATERIAL' | 'RENTAL'>('MATERIAL');
  const [financeQuantity, setFinanceQuantity] = useState('500');
  const [financeUnitPrice, setFinanceUnitPrice] = useState('450');
  const [financeUnit, setFinanceUnit] = useState('Bags');

  // Interactive Feature: GST Invoice Generator (for Admin & Contractor roles)
  const [invoiceClient, setInvoiceClient] = useState('Horizon Realty Group');
  const [invoiceItem, setInvoiceItem] = useState('Reinforcement steel foundation pour');
  const [invoiceAmount, setInvoiceAmount] = useState('450000');
  const [invoiceGstRate, setInvoiceGstRate] = useState<number>(18);
  const [invoiceSupplierGstin, setInvoiceSupplierGstin] = useState('27AAAAA1111A1Z1');
  const [invoiceClientGstin, setInvoiceClientGstin] = useState('27BBBBB2222B2Z2');
  const [invoicePlaceOfSupply, setInvoicePlaceOfSupply] = useState('Maharashtra');
  const [invoiceSupplierState, setInvoiceSupplierState] = useState('Maharashtra');
  const [invoiceIsRcm, setInvoiceIsRcm] = useState(false);

  const [invoices, setInvoices] = useState<any[]>(() => []);
  const [selectedInvoiceIndex, setSelectedInvoiceIndex] = useState<number>(0);
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);

  // Interactive Feature: Site Chat
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => BrowserDatabase.getChat());

  // Tasks state
  const [allTasks, setAllTasks] = useState<Task[]>(() => BrowserDatabase.getTasks());

  // Selected Laborers state for bulk deletion
  const [selectedLaborIds, setSelectedLaborIds] = useState<number[]>([]);

  const toggleSelectLabor = (id: number) => {
    setSelectedLaborIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllLabors = () => {
    if (selectedLaborIds.length === labors.length) {
      setSelectedLaborIds([]);
    } else {
      setSelectedLaborIds(labors.map(l => l.id));
    }
  };

  const handleDeleteSelectedLabors = () => {
    if (window.confirm(`Are you sure you want to remove the ${selectedLaborIds.length} selected laborers from the roster?`)) {
      setLabors(prev => prev.filter(l => !selectedLaborIds.includes(l.id)));
      setSelectedLaborIds([]);
      alert("Selected laborers removed successfully.");
    }
  };

  const handleToggleLaborTask = (taskId: number, newStatus: TaskStatus) => {
    const updated = allTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    BrowserDatabase.saveTasks(updated);
    setAllTasks(updated);
    
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
      BrowserDatabase.syncProjectProgressAndNotify(task.project, taskId, newStatus);
      setProjects(BrowserDatabase.getProjects());
      setChatMessages(BrowserDatabase.getChat());
    }
  };

  // Sync state loops to BrowserDatabase
  useEffect(() => { BrowserDatabase.saveProjects(projects); }, [projects]);
  useEffect(() => { BrowserDatabase.saveLabors(labors); }, [labors]);
  useEffect(() => { BrowserDatabase.saveMarketplace(marketplace); }, [marketplace]);
  useEffect(() => { BrowserDatabase.saveOrders(vendorOrders); }, [vendorOrders]);
  useEffect(() => { BrowserDatabase.saveChat(chatMessages); }, [chatMessages]);
  useEffect(() => { BrowserDatabase.saveTasks(allTasks); }, [allTasks]);
  useEffect(() => { BrowserDatabase.saveGantt(ganttTasks); }, [ganttTasks]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (isMocked) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/api/projects/');
        setProjects(response.data);
      } catch (err) {
        console.warn("Failed fetching live projects, displaying mock dataset.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [isMocked, api]);

  // Handle Tab changes automatically based on role switch to avoid invalid tabs
  useEffect(() => {
    setActiveTab('overview');
  }, [user?.role]);

  // Dynamically set default contractor and project selections from loaded databases
  useEffect(() => {
    const contractors = registeredUsers.filter(u => u.role === 'CONTRACTOR');
    if (contractors.length > 0 && !financeContractor) {
      setFinanceContractor(contractors[0].company_name || `${contractors[0].first_name} ${contractors[0].last_name}`);
    }
    if (projects.length > 0 && !financeProject) {
      setFinanceProject(projects[0].name);
    }
  }, [registeredUsers, projects, financeContractor, financeProject]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const contractorUser = registeredUsers.find(u => u.id === Number(newProjectContractorId)) || (user?.role === 'CONTRACTOR' ? user : undefined);
    const vendorUser = registeredUsers.find(u => u.id === Number(newProjectVendorId));
    const clientUser = registeredUsers.find(u => u.id === Number(newProjectClientId));

    const payload = {
      name: newProjectName,
      description: newProjectDesc,
      budget: newProjectBudget,
      start_date: newProjectStart,
      status: newProjectStatus,
    };

    if (isMocked) {
      const mockProj: Project = {
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        ...payload,
        owner: contractorUser?.id || user?.id || 1,
        client: clientUser?.id,
        vendor: vendorUser?.id,
        owner_details: contractorUser || undefined,
        client_details: clientUser || undefined,
        vendor_details: vendorUser || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProjects([mockProj, ...projects]);
      setShowAddModal(false);
      resetForm();
      return;
    }

    try {
      const livePayload = {
        ...payload,
        owner: contractorUser?.id,
        client: clientUser?.id,
        vendor: vendorUser?.id
      };
      const response = await api.post('/api/projects/', livePayload);
      setProjects([response.data, ...projects]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      alert("Failed to create project on live backend.");
    }
  };

  const handleAdminDeleteProject = async (projectId: number) => {
    const confirm1 = window.confirm("Are you sure you want to delete this project? (Confirmation 1 of 3)");
    if (!confirm1) return;
    const confirm2 = window.confirm("WARNING: This will permanently wipe all project details and logs! Are you sure? (Confirmation 2 of 3)");
    if (!confirm2) return;
    const confirm3 = window.confirm("FINAL CHECK: Click OK to delete the project. (Confirmation 3 of 3)");
    if (!confirm3) return;

    if (isMocked) {
      setProjects(projects.filter(p => p.id !== projectId));
      alert("Project deleted from local database.");
      return;
    }

    try {
      await api.delete(`/api/projects/${projectId}/`);
      setProjects(projects.filter(p => p.id !== projectId));
      alert("Project deleted from live database.");
    } catch (err) {
      alert("Failed to delete project on live backend.");
    }
  };

  const handleAdminCompleteProject = async (projectId: number) => {
    if (isMocked) {
      const updated = projects.map(p => p.id === projectId ? { ...p, status: 'COMPLETED' as ProjectStatus } : p);
      setProjects(updated);
      BrowserDatabase.saveProjects(updated);
      
      const targetProj = updated.find(p => p.id === projectId);
      if (targetProj) {
        const gantt = BrowserDatabase.getGantt();
        const ganttTask = gantt.find(g => g.id === projectId || g.name === targetProj.name);
        if (ganttTask) {
          ganttTask.progress = 100;
        } else {
          gantt.push({
            id: projectId,
            name: targetProj.name,
            start: targetProj.start_date || new Date().toISOString().split('T')[0],
            dur: 12,
            progress: 100
          });
        }
        BrowserDatabase.saveGantt(gantt);
        setGanttTasks(gantt);
      }
      alert("Project status marked as COMPLETED.");
      return;
    }

    try {
      const response = await api.patch(`/api/projects/${projectId}/`, { status: 'COMPLETED' });
      const updated = projects.map(p => p.id === projectId ? response.data : p);
      setProjects(updated);
      alert("Project status marked as COMPLETED on live backend.");
    } catch (err) {
      alert("Failed to update project status on live backend.");
    }
  };

  const handleAdminCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNewUsername || !adminNewPassword) return;

    registerNewUser({
      username: adminNewUsername,
      password: adminNewPassword,
      role: adminNewRole,
      first_name: adminNewFirstName,
      last_name: adminNewLastName,
      company_name: adminNewCompany,
      email: adminNewEmail,
      phone_number: adminNewPhone,
      assignedProjectId: adminNewAssignedProject ? Number(adminNewAssignedProject) : null
    });

    setRegisteredUsers(getRegisteredUsers());
    
    // Reset admin user form fields
    setAdminNewUsername('');
    setAdminNewPassword('');
    setAdminNewFirstName('');
    setAdminNewLastName('');
    setAdminNewCompany('');
    setAdminNewEmail('');
    setAdminNewPhone('');
    setAdminNewAssignedProject('');
    
    alert("New user account created successfully! They can now log in using these credentials.");
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    const targetLower = usernameToDelete.toLowerCase();
    if (targetLower === 'harshit_raj' || (user && user.username.toLowerCase() === targetLower)) {
      alert("Error: You cannot delete the active Administrator account!");
      return;
    }
    const saved = localStorage.getItem('registered_users');
    if (saved) {
      const list = JSON.parse(saved);
      const updatedList = list.filter((u: any) => u.username !== targetLower);
      localStorage.setItem('registered_users', JSON.stringify(updatedList));
      setRegisteredUsers(updatedList);
      setDeletingUser(null);
      
      if (editingUser && editingUser.username.toLowerCase() === targetLower) {
        cancelEditingUser();
      }
    }
  };

  const startEditingUser = (u: any) => {
    setEditingUser(u);
    setAdminNewUsername(u.username);
    setAdminNewPassword(u.password || 'password123');
    setAdminNewRole(u.role);
    setAdminNewFirstName(u.first_name || '');
    setAdminNewLastName(u.last_name || '');
    setAdminNewCompany(u.company_name || '');
    setAdminNewEmail(u.email || '');
    setAdminNewPhone(u.phone_number || '');
    setAdminNewAssignedProject(u.assignedProjectId ? String(u.assignedProjectId) : '');
  };

  const cancelEditingUser = () => {
    setEditingUser(null);
    setAdminNewUsername('');
    setAdminNewPassword('');
    setAdminNewFirstName('');
    setAdminNewLastName('');
    setAdminNewCompany('');
    setAdminNewEmail('');
    setAdminNewPhone('');
    setAdminNewAssignedProject('');
  };

  const handleAdminEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const saved = localStorage.getItem('registered_users');
    if (saved) {
      const list = JSON.parse(saved);
      const updatedList = list.map((u: any) => {
        if (u.id === editingUser.id || u.username === editingUser.username) {
          return {
            ...u,
            username: adminNewUsername.toLowerCase(),
            password: adminNewPassword,
            role: adminNewRole,
            first_name: adminNewFirstName,
            last_name: adminNewLastName,
            company_name: adminNewCompany,
            email: adminNewEmail,
            phone_number: adminNewPhone,
            assignedProjectId: adminNewAssignedProject ? Number(adminNewAssignedProject) : null
          };
        }
        return u;
      });

      localStorage.setItem('registered_users', JSON.stringify(updatedList));
      setRegisteredUsers(updatedList);
      cancelEditingUser();
      alert("User account updated successfully!");
    }
  };

  const resetForm = () => {
    setNewProjectName('');
    setNewProjectDesc('');
    setNewProjectBudget('');
    setNewProjectStart('');
    setNewProjectStatus('PLANNING');
    setNewProjectContractorId('');
    setNewProjectVendorId('');
    setNewProjectClientId('');
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE': return t.active;
      case 'PLANNING': return t.planning;
      case 'ON_HOLD': return t.onHold;
      case 'COMPLETED': return t.completed;
      default: return status;
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'PLANNING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ON_HOLD': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'COMPLETED': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // 1. AI Estimate Logic
  const handleGenerateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiEstimateResult(null);

    setTimeout(() => {
      const areaVal = parseFloat(aiArea) || 1000;
      const floorsVal = parseFloat(aiFloors) || 1;
      
      // Calculate material quantities dynamically based on inputs
      const cementBags = Math.round(areaVal * floorsVal * 0.42);
      const steelTons = parseFloat((areaVal * floorsVal * 0.0052).toFixed(2));
      
      let concreteFactor = 0.06;
      if (aiConcreteGrade === 'M30') concreteFactor = 0.07;
      else if (aiConcreteGrade === 'M20') concreteFactor = 0.052;
      const concreteCuM = Math.round(areaVal * floorsVal * concreteFactor);
      
      const sandTons = Math.round(areaVal * floorsVal * 0.021);
      const bricksCount = Math.round(areaVal * floorsVal * 12.5);
      const laborCount = Math.round(floorsVal * 6 + (areaVal / 450));
      const durationDays = Math.round((areaVal * floorsVal) / 220 + 12);

      // Unit rates (₹)
      const cementRate = 430;
      const steelRate = 62000;
      const concreteRate = 4600;
      const sandRate = 1750;
      const bricksRate = 8.5;

      const materials = [
        { name: "OPC Cement", quantity: cementBags, unit: "Bags", rate: cementRate, cost: cementBags * cementRate },
        { name: `Reinforcement Steel (Fe 550)`, quantity: steelTons, unit: "Tons", rate: steelRate, cost: Math.round(steelTons * steelRate) },
        { name: `Ready Mix Concrete (${aiConcreteGrade})`, quantity: concreteCuM, unit: "cu.m", rate: concreteRate, cost: concreteCuM * concreteRate },
        { name: "Fine River Sand", quantity: sandTons, unit: "Tons", rate: sandRate, cost: sandTons * sandRate },
        { name: "Clay Red Bricks", quantity: bricksCount, unit: "Pcs", rate: bricksRate, cost: Math.round(bricksCount * bricksRate) }
      ];

      const baseCost = materials.reduce((sum, item) => sum + item.cost, 0);
      
      // Foundation multiplier
      let foundationMultiplier = 1.0;
      if (aiFoundationType === 'PILE') foundationMultiplier = 1.25;
      else if (aiFoundationType === 'RAFT') foundationMultiplier = 1.12;

      const adjustedBaseCost = Math.round(baseCost * foundationMultiplier);
      const gstAmount = Math.round(adjustedBaseCost * 0.18);
      const totalCost = adjustedBaseCost + gstAmount;
      
      setAiLoading(false);
      setAiEstimateResult({
        projectType: aiProjectType,
        area: areaVal,
        floors: floorsVal,
        concreteGrade: aiConcreteGrade,
        foundationType: aiFoundationType,
        customPrompt: estimateQuery || "None specified",
        materials,
        laborCount,
        durationDays,
        baseCost: adjustedBaseCost,
        gstAmount,
        totalAmount: totalCost,
        confidence: Math.round(91 + Math.random() * 7)
      });
    }, 1500);
  };

  // 2. AI Blueprint OCR Mock
  const handleUploadBlueprint = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBlueprintName(file.name);
      setOcrResult(null);
      setOcrProgress(0);

      // Simulate Scanning
      const interval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setOcrResult({
              model: "YOLO v8-OCR Construction Layout Engine",
              scale: "1:100",
              elements: [
                { id: 1, name: "Pillar Foundations (Grade M25)", count: 24, volume: "72 cu.m" },
                { id: 2, name: "Reinforcement Girders (Fe 500)", count: 48, weight: "8.2 Tons" },
                { id: 3, name: "Internal Drywalls (Gypsum)", count: 112, area: "380 sq.m" },
                { id: 4, name: "Window Structural Panels", count: 18, countUnit: "Units" }
              ]
            });
            return 100;
          }
          return prev + 20;
        });
      }, 300);
    }
  };

  // 3. Labor Attendance Toggle
  const toggleAttendance = (id: number) => {
    setLabors(labors.map(l => {
      if (l.id === id) {
        const nextPresent = !l.present;
        return { 
          ...l, 
          present: nextPresent,
          salaryDue: nextPresent ? l.salaryDue + l.wageRate : Math.max(0, l.salaryDue - l.wageRate)
        };
      }
      return l;
    }));
  };

  const handlePayLaborWage = (id: number) => {
    setLabors(labors.map(l => {
      if (l.id === id) {
        return {
          ...l,
          salaryPaid: l.salaryPaid + l.salaryDue,
          salaryDue: 0
        };
      }
      return l;
    }));
  };

  const handleDeleteLabor = (id: number) => {
    if (!window.confirm("Are you sure you want to remove this laborer from the roster?")) return;
    setLabors(labors.filter(l => l.id !== id));
    setSelectedLaborIds(prev => prev.filter(x => x !== id));
  };

  const handleCLaborSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cLaborName) return;
    const newL: LaborAttendance = {
      id: labors.length + 1,
      name: cLaborName,
      gender: cLaborGender,
      age: parseInt(cLaborAge) || 25,
      address: cLaborAddress || "Not specified",
      contact: cLaborContact || "+91 XXXXX XXXXX",
      emergencyContact: cLaborEmergencyContact || "+91 XXXXX XXXXX",
      present: false,
      wageRate: parseInt(cLaborWageRate) || 800,
      salaryPaid: 0,
      salaryDue: 0
    };
    setLabors([...labors, newL]);
    setCLaborName('');
    setCLaborGender('Male');
    setCLaborAge('');
    setCLaborAddress('');
    setCLaborContact('');
    setCLaborEmergencyContact('');
    setCLaborWageRate('800');
    alert("New laborer added to roster successfully!");
  };

  const handleCLaborExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelLaborFileName(file.name);
      setExcelUploading(true);
      setExcelProgress(0);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          if (!data) {
            setExcelUploading(false);
            alert("Unable to read file.");
            return;
          }

          // Use SheetJS to read binary Excel or CSV text
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert sheet to JSON rows array of arrays
          const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
          if (rows.length < 2) {
            setExcelUploading(false);
            alert("Roster sheet does not contain enough rows (must have a header and at least one data row).");
            return;
          }

          const headers = (rows[0] as any[]).map(h => String(h || '').trim().toLowerCase());

          // Find header columns index
          const nameIdx = headers.findIndex(h => h.includes('name'));
          const genderIdx = headers.findIndex(h => h.includes('gender') || h.includes('sex'));
          const ageIdx = headers.findIndex(h => h.includes('age'));
          const addressIdx = headers.findIndex(h => h.includes('address') || h.includes('location'));
          const contactIdx = headers.findIndex(h => h.includes('contact') || h.includes('phone') || h.includes('mobile'));
          const emergencyIdx = headers.findIndex(h => h.includes('emergency'));

          const parsed: LaborAttendance[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i] as any[];
            if (!row || row.length === 0) continue;

            // Get values using mapped indexes, or fallbacks
            const name = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : (row[0] ? String(row[0]).trim() : 'Unknown');
            const gender = genderIdx !== -1 && row[genderIdx] ? String(row[genderIdx]).trim() : (row[1] ? String(row[1]).trim() : 'Male');
            const age = ageIdx !== -1 && row[ageIdx] ? parseInt(String(row[ageIdx])) || 30 : (row[2] ? parseInt(String(row[2])) || 30 : 30);
            const address = addressIdx !== -1 && row[addressIdx] ? String(row[addressIdx]).trim() : (row[3] ? String(row[3]).trim() : 'N/A');
            const contact = contactIdx !== -1 && row[contactIdx] ? String(row[contactIdx]).trim() : (row[4] ? String(row[4]).trim() : 'N/A');
            const emergencyContact = emergencyIdx !== -1 && row[emergencyIdx] ? String(row[emergencyIdx]).trim() : (row[5] ? String(row[5]).trim() : 'N/A');

            parsed.push({
              id: labors.length + parsed.length + 1,
              name,
              gender,
              age,
              address,
              contact,
              emergencyContact,
              present: false,
              wageRate: 850,
              salaryPaid: 0,
              salaryDue: 0
            });
          }

          // Increment loading progress beautifully
          let progress = 0;
          const progressInterval = setInterval(() => {
            progress += 25;
            setExcelProgress(progress);
            if (progress >= 100) {
              clearInterval(progressInterval);
              setExcelUploading(false);
              if (parsed.length > 0) {
                setLabors(prev => [...prev, ...parsed]);
                alert(`Successfully imported ${parsed.length} laborers from roster sheet!`);
              } else {
                alert("Could not parse any valid laborer entries from the spreadsheet. Please verify it matches headers: Name, Gender, Age, Address, Contact, Emergency Contact.");
              }
            }
          }, 100);

        } catch (err) {
          setExcelUploading(false);
          alert("Failed to parse sheet file. Please verify it is a valid Excel or CSV spreadsheet.");
        }
      };

      reader.onerror = () => {
        setExcelUploading(false);
        alert("Failed to read file.");
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // 4. Cart Functions
  const addToCart = (itemId: number) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const handleCheckoutCart = () => {
    const selectedProj = projects.find(p => p.id === Number(orderProjectId));
    const projName = selectedProj ? selectedProj.name : "Downtown Horizon Commercial Tower";
    
    const newOrders: ProcurementOrder[] = Object.entries(cart).map(([idStr, qty]) => {
      const item = marketplace.find(m => m.id === Number(idStr))!;
      const offerPrice = negotiationOffers[item.id] !== undefined ? negotiationOffers[item.id] : item.price;
      return {
        id: vendorOrders.length + Math.floor(Math.random() * 1000) + 1,
        clientProjectName: projName,
        itemName: item.name,
        quantity: qty,
        standardPrice: item.price,
        contractorOfferPrice: offerPrice,
        status: 'PENDING'
      };
    });

    setVendorOrders([...vendorOrders, ...newOrders]);
    setCart({});
    setNegotiationOffers({});
    alert("Order checkout complete! Your pricing offers have been submitted to the Vendors for approval.");
  };

  // Vendor Portal Catalog and Order Handlers
  const handleAddVendorProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vNewProdName || !vNewProdPrice) return;
    const newItem: MarketplaceItem = {
      id: marketplace.length + Math.floor(Math.random() * 1000) + 1,
      name: vNewProdName,
      type: vNewProdType,
      price: parseFloat(vNewProdPrice) || 100,
      unit: vNewProdUnit,
      supplier: user?.company_name || 'Elite Supplies Ltd'
    };
    setMarketplace([...marketplace, newItem]);
    setVNewProdName('');
    setVNewProdPrice('');
    alert("Product added to catalog successfully!");
  };

  const handleDeleteVendorProduct = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setMarketplace(marketplace.filter(m => m.id !== id));
  };

  const handleApproveOrder = (id: number) => {
    setVendorOrders(vendorOrders.map(o => o.id === id ? { ...o, status: 'APPROVED' } : o));
    alert("Order and price negotiation approved!");
  };

  const handleRejectOrder = (id: number) => {
    setVendorOrders(vendorOrders.map(o => o.id === id ? { ...o, status: 'REJECTED' } : o));
    alert("Order and price negotiation disapproved!");
  };

  // 5. Invoice Generator
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'VENDOR') {
      const price = parseFloat(financeUnitPrice);
      const qty = parseFloat(financeQuantity);
      if (isNaN(price) || isNaN(qty)) return;
      const total = price * qty;

      const newInvoice = {
        type: 'MATERIAL',
        invoiceNo: `INV-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        contractor: financeContractor,
        projectName: financeProject,
        item: financeItemName,
        itemType: financeItemType,
        quantity: qty,
        unit: financeUnit,
        unitPrice: price,
        totalAmount: total,
        date: new Date().toLocaleDateString('en-IN'),
        vendor: user?.company_name || 'Elite Supplies Ltd'
      };

      setInvoices([newInvoice, ...invoices]);
      setSelectedInvoiceIndex(0);
      setGeneratedInvoice(newInvoice);
      alert("Procurement Invoice generated and logged successfully!");
    } else {
      const base = parseFloat(invoiceAmount);
      if (isNaN(base)) return;
      const rate = invoiceGstRate;
      const gstAmount = Math.round(base * (rate / 100));
      const total = base + gstAmount;

      const newInvoice = {
        type: 'GST',
        invoiceNo: `INV-2026-${Math.floor(Math.random() * 9000) + 1000}`,
        client: invoiceClient,
        item: invoiceItem,
        baseAmount: base,
        gstRate: rate,
        gstAmount,
        totalAmount: total,
        date: new Date().toLocaleDateString('en-IN'),
        supplierGstin: invoiceSupplierGstin,
        clientGstin: invoiceClientGstin,
        placeOfSupply: invoicePlaceOfSupply,
        supplierState: invoiceSupplierState,
        isRcm: invoiceIsRcm
      };

      setInvoices([newInvoice, ...invoices]);
      setSelectedInvoiceIndex(0);
      setGeneratedInvoice(newInvoice);
      alert("GST Invoice generated and logged successfully!");
    }
  };

  // 6. Dynamic AI Chatbot Response Generator based on actual portal data
  const generateAIResponse = (userQuery: string): string => {
    const query = userQuery.toLowerCase();
    
    // Check if query targets a specific project
    const matchedProject = projects.find(p => 
      query.includes(p.name.toLowerCase()) || 
      p.name.toLowerCase().split(' ').some(word => word.length > 5 && query.includes(word))
    );

    if (matchedProject) {
      // Find progress tasks for this project
      const projTasks = allTasks.filter(t => t.project === matchedProject.id);
      const total = projTasks.length;
      const done = projTasks.filter(t => t.status === 'DONE').length;
      const progress = total > 0 ? Math.round((done / total) * 100) : (matchedProject.status === 'COMPLETED' ? 100 : 0);
      
      let responseText = '';
      if (language === 'hi') {
        responseText = `परियोजना '${matchedProject.name}' वर्तमान में '${getStatusLabel(matchedProject.status)}' स्थिति में है। इसमें कुल ${total} कार्य हैं जिनमें से ${done} पूर्ण हो चुके हैं (${progress}% प्रगति)। इसका कुल बजट ₹${parseFloat(matchedProject.budget).toLocaleString('en-IN')} है।`;
      } else if (language === 'mr') {
        responseText = `प्रकल्प '${matchedProject.name}' सध्या '${getStatusLabel(matchedProject.status)}' स्थितीत आहे. यामध्ये एकूण ${total} कामे आहेत ज्यापैकी ${done} पूर्ण झाली आहेत (${progress}% प्रगती). याचे एकूण बजेट ₹${parseFloat(matchedProject.budget).toLocaleString('en-IN')} आहे.`;
      } else if (language === 'gu') {
        responseText = `પ્રોજેક્ટ '${matchedProject.name}' હાલમાં '${getStatusLabel(matchedProject.status)}' સ્થિતિમાં છે. તેમાં કુલ ${total} કાર્યો છે જેમાંથી ${done} પૂર્ણ થયા છે (${progress}% પ્રગતિ). આ પ્રોજેક્ટનું કુલ બજેટ ₹${parseFloat(matchedProject.budget).toLocaleString('en-IN')} છે.`;
      } else if (language === 'bn') {
        responseText = `প্রকল্প '${matchedProject.name}' বর্তমানে '${getStatusLabel(matchedProject.status)}' অবস্থায় আছে। এতে মোট ${total}টি কাজ আছে যার মধ্যে ${done}টি সম্পন্ন হয়েছে (${progress}% অগ্রগতি)। মোট বাজেট ₹${parseFloat(matchedProject.budget).toLocaleString('en-IN')}।`;
      } else {
        responseText = `Project '${matchedProject.name}' is currently in '${getStatusLabel(matchedProject.status)}' status. Out of its ${total} logged tasks, ${done} are completed, showing an overall progress of ${progress}%. The allocated budget is ₹${parseFloat(matchedProject.budget).toLocaleString('en-IN')}.`;
      }
      return responseText;
    }

    // Check if query is about general status / updates
    if (query.includes('status') || query.includes('progress') || query.includes('काम') || query.includes('प्रगति') || query.includes('अद्यतन') || query.includes('સ્થિતિ') || query.includes('অবস্থা') || query.includes('চলমান')) {
      const totalProjs = projects.length;
      const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
      const planningCount = projects.filter(p => p.status === 'PLANNING').length;
      const totalBudget = projects.reduce((sum, p) => sum + parseFloat(p.budget), 0);

      if (language === 'hi') {
        return `पोर्टल पर दर्ज प्रगति के अनुसार: आपके पास ${totalProjs} परियोजनाएं हैं। इसमें से ${activeCount} सक्रिय साइटें हैं और ${planningCount} योजना में हैं। कुल संचित बजट ₹${totalBudget.toLocaleString('en-IN')} है।`;
      } else if (language === 'mr') {
        return `पोर्टलवर नोंदवलेल्या प्रगतीनुसार: तुमच्याकडे एकूण ${totalProjs} प्रकल्प आहेत. त्यापैकी ${activeCount} सक्रिय साइट्स आहेत आणि ${planningCount} नियोजनात आहेत. एकूण संचित बजेट ₹${totalBudget.toLocaleString('en-IN')} आहे.`;
      } else if (language === 'gu') {
        return `પોર્ટલ પર નોંધાયેલ પ્રગતિ મુજબ: તમારી પાસે કુલ ${totalProjs} પ્રોજેક્ટ્સ છે. જેમાંથી ${activeCount} સક્રિય સાઇટ્સ છે અને ${planningCount} આયોજન હેઠળ છે. કુલ સંચિત બજેટ ₹${totalBudget.toLocaleString('en-IN')} છે.`;
      } else if (language === 'bn') {
        return `পোর্টাল আপডেট অনুযায়ী: বর্তমানে আপনার মোট ${totalProjs}টি প্রকল্প আছে। এর মধ্যে ${activeCount}টি সক্রিয় সাইট এবং ${planningCount}টি পরিকল্পনাধীন। মোট বাজেট ₹${totalBudget.toLocaleString('en-IN')}।`;
      } else {
        return `According to the portal updates: You are managing ${totalProjs} construction sites. There are currently ${activeCount} active sites and ${planningCount} in planning. The consolidated budget across all sites is ₹${totalBudget.toLocaleString('en-IN')}.`;
      }
    }

    // Default fallback responses
    if (language === 'hi') {
      return "मैं आपके पोर्टल की प्रगति के अनुसार जानकारी दे सकता हूँ। कृपया पूछें: 'Horizon Tower प्रोजेक्ट की स्थिति क्या है?' या 'प्रगति का विवरण दें'।";
    } else if (language === 'mr') {
      return "मी तुमच्या पोर्टलच्या प्रगतीनुसार माहिती देऊ शकतो. कृपया विचारा: 'Horizon Tower प्रकल्पाची स्थिती काय आहे?' किंवा 'प्रगतीचा तपशील द्या'.";
    } else if (language === 'gu') {
      return "હું તમારા પોર્ટલની પ્રગતિ અનુસાર માહિતી આપી શકું છું. કૃપા કરીને પૂછો: 'Horizon Tower પ્રોજેક્ટની સ્થિતિ શું છે?' અથવા 'પ્રગતિની માહિતી આપો'.";
    } else if (language === 'bn') {
      return "আমি আপনার পোর্টালের রিয়েল-টাইম অগ্রগতি বিশ্লেষণ করে তথ্য দিতে পারি। অনুগ্রহ করে জিজ্ঞাসা করুন: 'Horizon Tower প্রকল্পের অবস্থা কি?' বা 'সাইটের অগ্রগতি বলুন'।";
    } else {
      return "I query the portal's databases in real-time. Try asking: 'What is the status of Downtown Horizon Commercial Tower?' or 'Provide general site progress updates'.";
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    
    const newMsg: ChatMessage = {
      id: chatMessages.length + 1,
      sender: `${user?.username || 'You'} (${user?.role || 'CLIENT'})`,
      role: user?.role || 'CLIENT',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    const savedInput = chatInput;
    setChatInput('');

    // Dynamic AI response calculation
    setTimeout(() => {
      const responseText = generateAIResponse(savedInput);
      const aiMsg: ChatMessage = {
        id: chatMessages.length + 2,
        sender: "AI Site Assistant",
        role: "AI",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  // Sidebar Tabs Config based on role
  const getSidebarTabs = () => {
    const role = user?.role || 'CLIENT';
    
    const baseTabs = [
      { id: 'overview', label: t.overview, icon: BarChart2 }
    ];

    if (role === 'ADMIN') {
      return [
        ...baseTabs,
        { id: 'users', label: t.userDirectory, icon: Users },
        { id: 'finance', label: t.gstAnalytics, icon: DollarSign },
        { id: 'ai', label: t.aiEngineNodes, icon: ShieldCheck }
      ];
    }

    if (role === 'CONTRACTOR') {
      return [
        ...baseTabs,
        { id: 'gantt', label: t.ganttSchedule, icon: Calendar },
        { id: 'ai', label: t.aiEstimateOcr, icon: Sparkles },
        { id: 'labor', label: t.labourPayroll, icon: HardHat },
        { id: 'finance', label: t.gstInvoicing, icon: FileText },
        { id: 'marketplace', label: t.marketplaceShop, icon: ShoppingBag },
        { id: 'chat', label: t.siteCommChannel, icon: MessageSquare }
      ];
    }

    if (role === 'CLIENT') {
      return [
        ...baseTabs,
        { id: 'chat', label: t.siteAssistantChat, icon: MessageSquare }
      ];
    }

    if (role === 'VENDOR') {
      return [
        ...baseTabs,
        { id: 'listings', label: t.manageInventory, icon: ShoppingBag },
        { id: 'orders', label: t.incomingOrders, icon: Truck },
        { id: 'finance', label: t.billsInvoices, icon: DollarSign }
      ];
    }

    if (role === 'LABOR') {
      return [
        ...baseTabs,
        { id: 'tasks', label: t.assignedTasks, icon: CheckSquare },
        { id: 'attendance_punch', label: t.shiftCheckIn, icon: HardHat }
      ];
    }

    return baseTabs;
  };

  const renderStats = () => {
    const role = user?.role || 'CLIENT';
    const cardClass = "glass p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-white/20 shadow-lg backdrop-blur-md";
    const iconClass = "p-3 rounded-xl border border-white/10 text-sm mb-4 inline-block bg-white/5";

    if (role === 'ADMIN') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in-50 duration-200">
          <div className={cardClass}>
            <div className={`${iconClass} text-blue-400`}><Building size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.projects}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">{projects.length}</h4>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-emerald-400`}><Users size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.activeUsers}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">{registeredUsers.length}</h4>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-cyan-400`}><span className="text-lg font-bold">₹</span></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.gstCollected}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">
              ₹{Math.round(invoices.reduce((acc, curr) => acc + ((curr.totalAmount || 0) * 18 / 118), 0)).toLocaleString('en-IN')}
            </h4>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-purple-400`}><ShieldCheck size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.aiModulesStatus}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">
              {projects.filter(p => p.status === 'ACTIVE').length} {t.active}
            </h4>
          </div>
        </div>
      );
    }

    if (role === 'CONTRACTOR') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in-50 duration-200">
          <div className={cardClass}>
            <div className={`${iconClass} text-blue-400`}><Building size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.managedSites}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">{projects.filter(p => p.status === 'ACTIVE').length} {t.sites}</h4>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-purple-400`}><CheckSquare size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.pendingTasks}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">
              {allTasks.filter(t => t.status !== 'DONE').length} {t.pending}
            </h4>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-cyan-400`}><TrendingUp size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.budgetBurnRate}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">{t.optimal} (0%)</h4>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-emerald-400`}><Users size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.laborOnsite}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">
              {labors.filter(l => l.present).length} {t.workers}
            </h4>
          </div>
        </div>
      );
    }

    if (role === 'CLIENT') {
      const clientProj = projects.find(p => p.client === user?.id || p.id === user?.assignedProjectId || p.client_details?.username === user?.username);
      const clientProjId = clientProj?.id || user?.assignedProjectId || null;
      const clientTasks = clientProjId ? allTasks.filter(t => t.project === clientProjId) : [];
      const completedTasks = clientTasks.filter(t => t.status === 'DONE').length;
      const progressPct = clientTasks.length > 0 ? Math.round((completedTasks / clientTasks.length) * 100) : 0;
      
      const activeWorkers = labors.filter(l => l.present).length;
      const laborExpense = labors.reduce((sum, l) => sum + l.salaryPaid + l.salaryDue, 0);

      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-in fade-in-50 duration-200">
          <div className={cardClass}>
            <div className={`${iconClass} text-blue-400`}><Building size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.projectProgress}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">{progressPct}% {t.complete}</h4>
            <span className="text-[10px] text-slate-500 font-semibold">{completedTasks} {t.of} {clientTasks.length} {t.milestones}</span>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-cyan-400`}><span className="text-lg font-bold">₹</span></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.projectBudget}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">
              ₹{clientProj ? parseFloat(clientProj.budget).toLocaleString('en-IN') : '0'}
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">{t.totalAllocation}</span>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-emerald-400`}><Users size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.activeWorkersOnsite}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">{activeWorkers} {t.workers}</h4>
            <span className="text-[10px] text-slate-500 font-semibold">{t.onShiftToday}</span>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-purple-400`}><span className="text-lg font-bold">₹</span></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.laborExpenses}</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">₹{laborExpense.toLocaleString('en-IN')}</h4>
            <span className="text-[10px] text-slate-500 font-semibold">{t.accumulatedSalary}</span>
          </div>
        </div>
      );
    }

    if (role === 'VENDOR') {
      const vendorItems = marketplace.filter(item => item.supplier === (user?.company_name || 'Elite Supplies Ltd')).length;
      const incomingOrders = vendorOrders.filter(order => order.status === 'PENDING').length;
      const totalRevenue = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in-50 duration-200">
          <div className={cardClass}>
            <div className={`${iconClass} text-indigo-400`}><ShoppingBag size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Catalog Listings</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">{vendorItems} Items</h4>
            <span className="text-[10px] text-slate-500 font-semibold">Active in Marketplace</span>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-blue-400`}><Truck size={20} /></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Orders</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">{incomingOrders} Orders</h4>
            <span className="text-[10px] text-slate-500 font-semibold">Awaiting Dispatches</span>
          </div>
          <div className={cardClass}>
            <div className={`${iconClass} text-emerald-400`}><span className="text-lg font-bold">₹</span></div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Sales (GST Inc.)</p>
            <h4 className="text-2xl font-bold mt-1 text-slate-100">₹{totalRevenue.toLocaleString('en-IN')}</h4>
            <span className="text-[10px] text-slate-500 font-semibold">Invoiced TurnOver</span>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in-50 duration-200">
        <div className={cardClass}>
          <div className={`${iconClass} text-indigo-400`}><Activity size={20} /></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.tasks}</p>
          <h4 className="text-2xl font-bold mt-1 text-slate-100">8</h4>
        </div>
        <div className={cardClass}>
          <div className={`${iconClass} text-blue-400`}><CheckSquare size={20} /></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.completedTasks}</p>
          <h4 className="text-2xl font-bold mt-1 text-slate-100">12</h4>
        </div>
        <div className={cardClass}>
          <div className={`${iconClass} text-emerald-400`}><Calendar size={20} /></div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t.attendanceLogged}</p>
          <h4 className="text-2xl font-bold mt-1 text-slate-100">98% {t.compliance}</h4>
        </div>
      </div>
    );
  };

  // Render Page Content based on tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
            {/* List of Users */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="font-bold text-lg mb-4 text-slate-100">Platform User Directory</h3>
              <p className="text-slate-400 text-xs mb-6">Manage roles, profiles and corporate registrations.</p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">System Role</th>
                      <th className="py-3 px-4">Corporate Entity</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {registeredUsers.map((u: any) => (
                      <tr key={u.id || u.username} className={editingUser && editingUser.username === u.username ? "bg-blue-500/5" : ""}>
                        <td className="py-3 px-4 font-semibold">{u.first_name} {u.last_name} ({u.username})</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[9px] ${
                            u.role === 'ADMIN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            u.role === 'CONTRACTOR' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            u.role === 'CLIENT' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            u.role === 'VENDOR' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{u.company_name || 'Individual'}</td>
                        <td className="py-3 px-4 text-slate-400">{u.email}</td>
                        <td className="py-3 px-4">
                          {deletingUser === u.username ? (
                            <div className="flex items-center justify-center gap-1.5 animate-in fade-in zoom-in-95 duration-100">
                              <span className="text-[10px] text-rose-400 font-bold uppercase">Delete?</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteUser(u.username);
                                }}
                                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeletingUser(null);
                                }}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-755 text-slate-300 font-bold text-[9px] cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  startEditingUser(u);
                                }}
                                className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                                title="Edit User"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeletingUser(u.username);
                                }}
                                disabled={u.username === 'harshit_raj' || !!(user && user.username === u.username)}
                                className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Form (Reused for Register / Edit) */}
            <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md h-fit">
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
                {editingUser ? `Edit User: ${editingUser.username}` : "Register New User"}
              </h3>
              <form onSubmit={editingUser ? handleAdminEditUser : handleAdminCreateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={adminNewUsername}
                    onChange={(e) => setAdminNewUsername(e.target.value)}
                    placeholder="e.g. rajesh_mason"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showAdminPassword || !!editingUser ? 'text' : 'password'}
                      required
                      value={adminNewPassword}
                      onChange={(e) => setAdminNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showAdminPassword || !!editingUser ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">First Name</label>
                    <input
                      type="text"
                      value={adminNewFirstName}
                      onChange={(e) => setAdminNewFirstName(e.target.value)}
                      placeholder="Rajesh"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      value={adminNewLastName}
                      onChange={(e) => setAdminNewLastName(e.target.value)}
                      placeholder="Kumar"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">System Role *</label>
                  <select
                    value={adminNewRole}
                    onChange={(e) => setAdminNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {adminNewRole === 'CLIENT' && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-150">
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Assigned Project *</label>
                    <select
                      required
                      value={adminNewAssignedProject}
                      onChange={(e) => setAdminNewAssignedProject(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">-- Select Project --</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Company Entity</label>
                  <input
                    type="text"
                    value={adminNewCompany}
                    onChange={(e) => setAdminNewCompany(e.target.value)}
                    placeholder="e.g. Kumar Masonry"
                    className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={adminNewEmail}
                      onChange={(e) => setAdminNewEmail(e.target.value)}
                      placeholder="rajesh@kumar.com"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Phone</label>
                    <input
                      type="text"
                      value={adminNewPhone}
                      onChange={(e) => setAdminNewPhone(e.target.value)}
                      placeholder="+91 99990 00000"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer shadow-lg shadow-blue-500/10 mt-2"
                  >
                    {editingUser ? "Save Changes" : "Create User Account"}
                  </button>

                  {editingUser && (
                    <button 
                      type="button"
                      onClick={cancelEditingUser}
                      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Pending Access Requests */}
            <div className="mt-8 lg:col-span-3 glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
              <h3 className="font-bold text-lg mb-2 text-slate-100 flex items-center gap-2">
                <span>Incoming Registration Requests</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                  CRM Requests
                </span>
              </h3>
              <p className="text-slate-400 text-xs mb-6">Review access requests submitted via the public landing page. Approving generates login credentials.</p>

              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-slate-900">
                  No pending registration requests.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">Contact Detail</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Requested Role</th>
                        <th className="py-3 px-4">Reason / Business Justification</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {pendingRequests.map((req: any) => (
                        <tr key={req.id}>
                          <td className="py-3 px-4 font-semibold">{req.fullName}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span>{req.email}</span>
                              <span className="text-[10px] text-slate-500">{req.phone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">{req.companyName}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                              {req.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApproveRequest(req)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/30"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req.id)}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer shadow-md shadow-rose-950/30"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'gantt':
        return (
          <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-bold text-lg mb-4 text-slate-100">Project Gantt Schedule</h3>
            <p className="text-slate-400 text-xs mb-6">Interactive timeline chart displaying active project milestones.</p>
            <div className="space-y-6">
              {ganttTasks.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No active Gantt milestones logged.
                </div>
              ) : (
                ganttTasks.map(gt => (
                  <div key={gt.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 text-xs">
                    <div className="font-semibold text-slate-200">{gt.name}</div>
                    <div className="text-slate-400">Start: {gt.start} ({gt.dur} Weeks)</div>
                    <div className="col-span-2 bg-zinc-900 h-6 rounded-lg overflow-hidden border border-zinc-800/80 relative">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full rounded-l-lg transition-all" 
                        style={{ width: `${gt.progress}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-white">
                        {gt.progress}% Complete
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
            {/* Left Column: Form specifications */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-cyan-400 animate-pulse" size={20} />
                  <h3 className="font-bold text-lg text-slate-100">AI Estimate Generator</h3>
                </div>
                <p className="text-slate-400 text-xs mb-4">Input specifications to generate material estimates.</p>
                <form onSubmit={handleGenerateEstimate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Project Type</label>
                    <select
                      value={aiProjectType}
                      onChange={(e) => setAiProjectType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="RESIDENTIAL">Residential Villa / Complex</option>
                      <option value="COMMERCIAL">Commercial Office Tower</option>
                      <option value="INDUSTRIAL">Industrial Warehouse / Plant</option>
                      <option value="INFRASTRUCTURE">Civil Infrastructure / Roadway</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Area (Sq.Ft)</label>
                      <input
                        type="number"
                        required
                        value={aiArea}
                        onChange={(e) => setAiArea(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Floors / Levels</label>
                      <input
                        type="number"
                        required
                        value={aiFloors}
                        onChange={(e) => setAiFloors(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Concrete Grade</label>
                      <select
                        value={aiConcreteGrade}
                        onChange={(e) => setAiConcreteGrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="M20">M20 (Standard)</option>
                        <option value="M25">M25 (Heavy Duty)</option>
                        <option value="M30">M30 (Reinforced)</option>
                        <option value="M35">M35 (High Strength)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Foundation Type</label>
                      <select
                        value={aiFoundationType}
                        onChange={(e) => setAiFoundationType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="SHALLOW">Shallow Strip Footing</option>
                        <option value="RAFT">Raft / Mat Foundation</option>
                        <option value="PILE">Deep Pile Foundation</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Custom Scope / Prompts</label>
                    <textarea
                      value={estimateQuery}
                      onChange={(e) => setEstimateQuery(e.target.value)}
                      placeholder="e.g. Concrete mix concrete columns for 12 residential villa walls..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 text-slate-200 h-20 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={aiLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    {aiLoading ? <RefreshCw className="animate-spin" size={12}/> : null}
                    {aiLoading ? 'Forecasting Estimate...' : 'Generate Structural Estimate'}
                  </button>
                </form>
              </div>

              {/* Blueprint OCR */}
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="text-blue-400" size={20} />
                  <h3 className="font-bold text-base text-slate-100">AI Blueprint OCR Surveyor</h3>
                </div>
                <p className="text-slate-400 text-xs mb-4">Upload architectural blueprints to parse dimensions automatically.</p>
                
                <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-xl p-4 text-center cursor-pointer transition-colors relative">
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={handleUploadBlueprint}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  <Upload size={20} className="mx-auto text-slate-500 mb-2" />
                  <span className="text-xs text-slate-300 font-semibold block truncate">
                    {blueprintName ? blueprintName : "Choose Image/PDF Blueprint"}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-0.5 block">Max size 10MB</span>
                </div>

                {blueprintName && !ocrResult && (
                  <div className="mt-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Scanning structural layers...</span>
                      <span>{ocrProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800/80">
                      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
                    </div>
                  </div>
                )}

                {ocrResult && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] animate-in slide-in-from-bottom-2 duration-200">
                    <p className="text-slate-400 text-[9px] uppercase font-bold tracking-wider mb-2">
                      {ocrResult.model} (Scale: {ocrResult.scale})
                    </p>
                    <div className="space-y-1.5">
                      {ocrResult.elements.map((el: any) => (
                        <div key={el.id} className="flex items-center justify-between border-b border-slate-800/40 pb-1">
                          <span className="text-slate-300">{el.name}</span>
                          <span className="font-semibold text-blue-400">{el.volume || el.weight || el.count + " " + el.countUnit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: AI Results Display */}
            <div className="lg:col-span-2 space-y-6">
              {aiEstimateResult ? (
                <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-blue-500/10 text-blue-400 border-blue-500/20">
                        {aiEstimateResult.projectType} Forecast
                      </span>
                      <h4 className="text-lg font-bold text-slate-100 mt-2">Material Quantity & Cost Forecast</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Accuracy Index</span>
                      <span className={`text-lg font-extrabold ${aiEstimateResult.confidence >= 95 ? 'text-emerald-400' : 'text-cyan-400'}`}>
                        {aiEstimateResult.confidence}%
                      </span>
                    </div>
                  </div>

                  {/* Specs grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-xl mb-6 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Area</span>
                      <span className="font-bold text-slate-200">{aiEstimateResult.area.toLocaleString()} Sq.Ft</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Floors</span>
                      <span className="font-bold text-slate-200">{aiEstimateResult.floors} Levels</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Concrete Grade</span>
                      <span className="font-bold text-slate-200">{aiEstimateResult.concreteGrade}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Foundation</span>
                      <span className="font-bold text-slate-200 truncate block">{aiEstimateResult.foundationType}</span>
                    </div>
                  </div>

                  {/* Materials breakdown table */}
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Forecasted Material Requirements</h5>
                  <div className="overflow-x-auto border border-slate-850 rounded-xl mb-6">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-850 bg-slate-900/30 text-slate-500 uppercase tracking-wider text-[9px]">
                          <th className="py-2.5 px-4">Material Description</th>
                          <th className="py-2.5 px-4 text-right">Qty / Vol</th>
                          <th className="py-2.5 px-4 text-right">Avg Unit Rate (₹)</th>
                          <th className="py-2.5 px-4 text-right">Base Cost (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/80 text-slate-300">
                        {aiEstimateResult.materials.map((mat: any, idx: number) => (
                          <tr key={idx} className="hover:bg-white/2 transition-colors">
                            <td className="py-2.5 px-4 font-medium text-slate-200">{mat.name}</td>
                            <td className="py-2.5 px-4 text-right font-bold">{mat.quantity} {mat.unit}</td>
                            <td className="py-2.5 px-4 text-right">₹{mat.rate.toLocaleString('en-IN')}</td>
                            <td className="py-2.5 px-4 text-right font-semibold text-slate-100">₹{mat.cost.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Labour and duration specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-850 pt-4 mb-6 text-xs">
                    <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                      <Users className="text-blue-400 shrink-0" size={18} />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Labor Resource Recommendation</span>
                        <span className="font-bold text-slate-200 text-sm">{aiEstimateResult.laborCount} Workers onsite daily</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/10 p-3 rounded-xl">
                      <Clock className="text-purple-400 shrink-0" size={18} />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Forecasted Project Duration</span>
                        <span className="font-bold text-slate-200 text-sm">{aiEstimateResult.durationDays} Calendar Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Total price forecast */}
                  <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold">Custom Instructions:</span>
                      <p className="text-slate-500 italic text-[11px] mt-1 max-w-md truncate" title={aiEstimateResult.customPrompt}>
                        "{aiEstimateResult.customPrompt}"
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex justify-between sm:justify-end gap-6 text-slate-400">
                        <span>Subtotal Base Cost:</span>
                        <span>₹{aiEstimateResult.baseCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between sm:justify-end gap-6 text-slate-400 mt-1">
                        <span>GST Forecast (@18%):</span>
                        <span>₹{aiEstimateResult.gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between sm:justify-end gap-6 text-base font-extrabold text-slate-100 border-t border-slate-800 pt-2 mt-2">
                        <span>GST Inclusive Forecast:</span>
                        <span className="text-cyan-400">₹{aiEstimateResult.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6 bg-slate-900/10">
                  <Sparkles className="text-slate-600 mb-3 animate-pulse" size={32} />
                  <span>Configure construction parameters in the side panel and click "Generate Structural Estimate"</span>
                  <span className="text-[10px] text-slate-600 mt-1">Estimations take soil mechanics and standard structural factors into account.</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'labor':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
            {/* Roster & Payroll */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-850 pb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-100">Labour Roster & Payroll Console</h3>
                    <p className="text-slate-400 text-xs">Register laborers, toggle daily attendance logs, and disperse wages.</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {selectedLaborIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelectedLabors}
                        className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-950/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 size={13} /> Delete Selected ({selectedLaborIds.length})
                      </button>
                    )}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-right shadow-sm">
                      <span className="text-[9px] text-black dark:text-white uppercase font-bold tracking-wider block">Total Wages Paid</span>
                      <span className="text-[10px] font-semibold text-black dark:text-white block">Total Paid</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{labors.reduce((acc, curr) => acc + curr.salaryPaid, 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-right shadow-sm">
                      <span className="text-[9px] text-black dark:text-white uppercase font-bold tracking-wider block">Total Wages Due</span>
                      <span className="text-[10px] font-semibold text-black dark:text-white block">Outstanding</span>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        ₹{labors.reduce((acc, curr) => acc + curr.salaryDue, 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
 
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4 w-10 text-center">
                          <input 
                            type="checkbox"
                            className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            onChange={toggleSelectAllLabors}
                            checked={selectedLaborIds.length === labors.length && labors.length > 0}
                          />
                        </th>
                        <th className="py-3 px-4">Worker Profile</th>
                        <th className="py-3 px-4">Contact Info</th>
                        <th className="py-3 px-4">Wages (Paid / Due)</th>
                        <th className="py-3 px-4 text-center">Attendance</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {labors.map(l => (
                        <tr key={l.id}>
                          <td className="py-3 px-4 text-center">
                            <input 
                              type="checkbox"
                              className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              checked={selectedLaborIds.includes(l.id)}
                              onChange={() => toggleSelectLabor(l.id)}
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-slate-200">{l.name}</p>
                              <span className="text-[9px] text-slate-500">{l.gender}, Age {l.age}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-slate-300">{l.contact}</p>
                              <span className="text-[9px] text-slate-500">Emergency: {l.emergencyContact}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="text-slate-300 font-semibold">Paid: ₹{l.salaryPaid.toLocaleString('en-IN')}</p>
                              <span className="text-[10px] text-amber-400 font-bold">Due: ₹{l.salaryDue.toLocaleString('en-IN')}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleAttendance(l.id)}
                              className={`px-2.5 py-1 rounded-full border text-[9px] font-bold transition-all cursor-pointer ${
                                l.present 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
                              }`}
                            >
                              {l.present ? 'Present' : 'Absent'}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                disabled={l.salaryDue === 0}
                                onClick={() => handlePayLaborWage(l.id)}
                                className="px-2 py-1 rounded bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/20 text-emerald-400 font-semibold text-[10px] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                Disperse
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLabor(l.id)}
                                className="p-1 rounded bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                title="Remove Worker"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Manual Form & Excel Import */}
            <div className="space-y-6">
              {/* Form Add Manual */}
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
                  Add Laborer Manually
                </h3>
                
                <form onSubmit={handleCLaborSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={cLaborName}
                      onChange={(e) => setCLaborName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Gender *</label>
                      <select
                        value={cLaborGender}
                        onChange={(e) => setCLaborGender(e.target.value)}
                        className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Age *</label>
                      <input
                        type="number"
                        required
                        value={cLaborAge}
                        onChange={(e) => setCLaborAge(e.target.value)}
                        placeholder="28"
                        className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Address *</label>
                    <input
                      type="text"
                      required
                      value={cLaborAddress}
                      onChange={(e) => setCLaborAddress(e.target.value)}
                      placeholder="e.g. Kurla East, Mumbai"
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Contact No. *</label>
                      <input
                        type="text"
                        required
                        value={cLaborContact}
                        onChange={(e) => setCLaborContact(e.target.value)}
                        placeholder="+91 99900 11100"
                        className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Emergency Contact *</label>
                      <input
                        type="text"
                        required
                        value={cLaborEmergencyContact}
                        onChange={(e) => setCLaborEmergencyContact(e.target.value)}
                        placeholder="+91 99900 22200"
                        className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Daily Wage Rate (₹) *</label>
                    <input
                      type="number"
                      required
                      value={cLaborWageRate}
                      onChange={(e) => setCLaborWageRate(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded shadow-lg transition-colors cursor-pointer"
                  >
                    Add Laborer to Roster
                  </button>
                </form>
              </div>

              {/* Excel Import */}
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-2 border-b border-slate-850 pb-2">
                  Excel Import (Roster Upload)
                </h3>
                <p className="text-slate-500 text-[10px] mb-4">
                  Upload an Excel template containing fields: Name, Gender, Age, Address, Contact, Emergency Contact.
                </p>

                <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/40 rounded-xl p-4 text-center cursor-pointer transition-colors relative">
                  <input 
                    type="file" 
                    accept=".xlsx,.xls,.csv"
                    onChange={handleCLaborExcelUpload}
                    disabled={excelUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                  />
                  <Upload size={20} className="mx-auto text-slate-500 mb-1" />
                  <span className="text-xs text-slate-300 font-semibold block">
                    {excelLaborFileName ? excelLaborFileName : "Choose Excel Roster File"}
                  </span>
                  <span className="text-[9px] text-slate-500 block">Supporting .xlsx, .xls, .csv templates</span>
                </div>

                {excelUploading && (
                  <div className="mt-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                      <span>Parsing rows and validating columns...</span>
                      <span>{excelProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${excelProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'finance':
        // Calculate dynamic ledger totals for GST (Admin/Contractor)
        const totalBaseInvoiced = invoices.filter(inv => inv.type === 'GST').reduce((acc, curr) => acc + (curr.baseAmount || 0), 0);
        
        let cgstTotal = 0;
        let sgstTotal = 0;
        let igstTotal = 0;
        let rcmTotal = 0;

        invoices.filter(inv => inv.type === 'GST').forEach(inv => {
          if (inv.isRcm) {
            rcmTotal += inv.gstAmount;
          }
          if (inv.supplierState === inv.placeOfSupply) {
            cgstTotal += inv.gstAmount / 2;
            sgstTotal += inv.gstAmount / 2;
          } else {
            igstTotal += inv.gstAmount;
          }
        });

        // Calculate dynamic ledger totals for materials & rentals (Vendor)
        const totalInvoicedValue = invoices.filter(inv => inv.type === 'MATERIAL').reduce((acc, curr) => acc + curr.totalAmount, 0);
        const materialSalesVal = invoices.filter(inv => inv.type === 'MATERIAL' && inv.itemType === 'MATERIAL').reduce((acc, curr) => acc + curr.totalAmount, 0);
        const equipmentRentalsVal = invoices.filter(inv => inv.type === 'MATERIAL' && inv.itemType === 'RENTAL').reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalUnitsDispatched = invoices.filter(inv => inv.type === 'MATERIAL').reduce((acc, curr) => acc + (curr.quantity || 0), 0);

        // Determine active invoice
        const activeInvoice = generatedInvoice || invoices[selectedInvoiceIndex] || null;

        const isVendor = user?.role === 'VENDOR';

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
            {/* Left Column: Form & Registry List */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                {isVendor ? (
                  <>
                    <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-800/80 pb-2 flex items-center gap-2">
                      <FileText className="text-blue-500" size={16} /> Material Invoice Generator
                    </h3>
                    <form onSubmit={handleCreateInvoice} className="space-y-4">
                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Billing Contractor</label>
                        <select
                          value={financeContractor}
                          onChange={(e) => setFinanceContractor(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="">-- Choose Contractor --</option>
                          {registeredUsers.filter(u => u.role === 'CONTRACTOR').map(u => (
                            <option key={u.id} value={u.company_name || `${u.first_name} ${u.last_name}`}>
                              {u.company_name || `${u.first_name} ${u.last_name}`} ({u.username})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Project Site</label>
                        <select
                          value={financeProject}
                          onChange={(e) => setFinanceProject(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                        >
                          <option value="">-- Choose Project Site --</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Select Item from Marketplace</label>
                        <select
                          onChange={(e) => {
                            const selectedItem = marketplace.find(m => String(m.id) === e.target.value);
                            if (selectedItem) {
                              setFinanceItemName(selectedItem.name);
                              setFinanceItemType(selectedItem.type);
                              setFinanceUnitPrice(String(selectedItem.price));
                              setFinanceUnit(selectedItem.unit);
                            }
                          }}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none mb-2"
                        >
                          <option value="">-- Choose Marketplace Item (Auto-fills details) --</option>
                          {marketplace.map(m => (
                            <option key={m.id} value={m.id}>{m.name} (₹{m.price}/{m.unit})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Item Description</label>
                        <input
                          type="text"
                          required
                          value={financeItemName}
                          onChange={(e) => setFinanceItemName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Item Type</label>
                          <select
                            value={financeItemType}
                            onChange={(e) => setFinanceItemType(e.target.value as 'MATERIAL' | 'RENTAL')}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="MATERIAL">MATERIAL (Buy)</option>
                            <option value="RENTAL">RENTAL (Rent)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Unit</label>
                          <input
                            type="text"
                            required
                            value={financeUnit}
                            onChange={(e) => setFinanceUnit(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Quantity</label>
                          <input
                            type="number"
                            required
                            value={financeQuantity}
                            onChange={(e) => setFinanceQuantity(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Unit Price (₹)</label>
                          <input
                            type="number"
                            required
                            value={financeUnitPrice}
                            onChange={(e) => setFinanceUnitPrice(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
                      >
                        Generate & Log Invoice
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-800/80 pb-2 flex items-center gap-2">
                      <FileText className="text-blue-500" size={16} /> GST Invoice Generator
                    </h3>
                    <form onSubmit={handleCreateInvoice} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Billing Client</label>
                          <input
                            type="text"
                            required
                            value={invoiceClient}
                            onChange={(e) => setInvoiceClient(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Scope Item</label>
                          <input
                            type="text"
                            required
                            value={invoiceItem}
                            onChange={(e) => setInvoiceItem(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Base Amount (₹)</label>
                          <input
                            type="number"
                            required
                            value={invoiceAmount}
                            onChange={(e) => setInvoiceAmount(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">GST Slab</label>
                          <select
                            value={invoiceGstRate}
                            onChange={(e) => setInvoiceGstRate(parseInt(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value={5}>5% (Sand, Aggregates)</option>
                            <option value={12}>12% (Contract work)</option>
                            <option value={18}>18% (Steel, Cement, Services)</option>
                            <option value={28}>28% (Lux fittings)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Supplier State</label>
                          <select
                            value={invoiceSupplierState}
                            onChange={(e) => setInvoiceSupplierState(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Karnataka">Karnataka</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Place of Supply</label>
                          <select
                            value={invoicePlaceOfSupply}
                            onChange={(e) => setInvoicePlaceOfSupply(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Supplier GSTIN</label>
                          <input
                            type="text"
                            required
                            value={invoiceSupplierGstin}
                            onChange={(e) => setInvoiceSupplierGstin(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Client GSTIN</label>
                          <input
                            type="text"
                            required
                            value={invoiceClientGstin}
                            onChange={(e) => setInvoiceClientGstin(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 py-1">
                        <input
                          type="checkbox"
                          id="isRcm"
                          checked={invoiceIsRcm}
                          onChange={(e) => setInvoiceIsRcm(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="isRcm" className="text-[10px] text-slate-300 font-semibold cursor-pointer uppercase select-none">
                          Enable Reverse Charge (RCM)
                        </label>
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
                      >
                        Generate & Log Invoice
                      </button>
                    </form>
                  </>
                )}
              </div>

              {/* Invoice Registry List */}
              <div className="glass rounded-2xl p-4 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Invoice History</h4>
                  {invoices.length > 0 && (
                    <button
                      onClick={() => {
                        setInvoices([]);
                        setGeneratedInvoice(null);
                        setSelectedInvoiceIndex(0);
                      }}
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {invoices.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-[11px] border border-dashed border-slate-800 rounded-xl">
                      No invoices logged.
                    </div>
                  ) : (
                    invoices.map((inv, index) => {
                      const isMaterial = inv.type === 'MATERIAL';
                      const title = isMaterial ? inv.contractor : inv.client;
                      return (
                        <div 
                          key={inv.invoiceNo}
                          onClick={() => {
                            setSelectedInvoiceIndex(index);
                            setGeneratedInvoice(inv);
                          }}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            activeInvoice?.invoiceNo === inv.invoiceNo 
                              ? 'bg-blue-600/10 border-blue-500/30' 
                              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-slate-200">{inv.invoiceNo}</span>
                            <span className="text-slate-500">{inv.date}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[11px]">
                            <span className="text-slate-400 font-medium truncate max-w-[120px]">{title}</span>
                            <span className="font-bold text-slate-200">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Ledger Analytics & active receipt preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Analytics Ledger Cards */}
              {isVendor ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass p-4 rounded-xl border border-white/10 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total TurnOver</span>
                    <span className="text-base font-bold text-slate-200 block mt-1">₹{totalInvoicedValue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/10 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Material Sales</span>
                    <span className="text-base font-bold text-emerald-400 block mt-1">₹{materialSalesVal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/10 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Equipment Rentals</span>
                    <span className="text-base font-bold text-cyan-400 block mt-1">₹{equipmentRentalsVal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/10 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Units Dispatched</span>
                    <span className="text-base font-bold text-amber-500 block mt-1">{totalUnitsDispatched.toLocaleString('en-IN')} Units</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="glass p-4 rounded-xl border border-white/10 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total TurnOver</span>
                    <span className="text-base font-bold text-slate-200 block mt-1">₹{totalBaseInvoiced.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/10 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">CGST / SGST</span>
                    <span className="text-base font-bold text-emerald-400 block mt-1">₹{(cgstTotal).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/10 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">IGST Collected</span>
                    <span className="text-base font-bold text-cyan-400 block mt-1">₹{igstTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="glass p-4 rounded-xl border border-white/10 text-xs">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">RCM Liabilities</span>
                    <span className="text-base font-bold text-amber-500 block mt-1">₹{rcmTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Active Receipt view */}
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                {activeInvoice ? (
                  activeInvoice.type === 'MATERIAL' ? (
                    <div className="border border-slate-800 bg-slate-950 p-6 rounded-lg text-xs leading-relaxed text-slate-300 shadow-inner animate-in zoom-in-95 duration-150 relative">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">PROCUREMENT INVOICE</h4>
                          <span className="text-[10px] text-slate-500">{activeInvoice.invoiceNo}</span>
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold text-blue-400 text-xs">Construct.ai Portal</h4>
                          <span className="text-[9px] text-slate-500">{activeInvoice.date}</span>
                        </div>
                      </div>

                      {/* Parties details */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Supplier (Billed From)</span>
                          <span className="font-bold text-slate-200 block">{activeInvoice.vendor || 'Elite Supplies Ltd'}</span>
                          <span className="text-slate-400 block">Material & Rental Supplies</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Recipient (Billed To)</span>
                          <span className="font-bold text-slate-200 block">{activeInvoice.contractor}</span>
                          <span className="text-slate-400 block">Project: {activeInvoice.projectName}</span>
                        </div>
                      </div>

                      <div className="border-t border-b border-slate-800 py-3 mb-6 text-xs">
                        <div className="grid grid-cols-5 font-bold text-slate-200 mb-2 uppercase tracking-wider text-[9px] border-b border-slate-800/50 pb-1.5">
                          <span className="col-span-2">Item Description</span>
                          <span className="text-center">Billing Mode</span>
                          <span className="text-center">Qty / Unit</span>
                          <span className="text-right">Total Price</span>
                        </div>
                        <div className="grid grid-cols-5 text-slate-400 mt-2">
                          <span className="col-span-2 font-semibold text-slate-300">{activeInvoice.item}</span>
                          <span className="text-center">{activeInvoice.itemType === 'MATERIAL' ? 'Material (Buy)' : 'Equipment (Rent)'}</span>
                          <span className="text-center">{activeInvoice.quantity} {activeInvoice.unit}</span>
                          <span className="text-right font-bold text-slate-200">₹{activeInvoice.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-right w-2/3 ml-auto text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Unit Rate:</span>
                          <span>₹{activeInvoice.unitPrice.toLocaleString('en-IN')} per {activeInvoice.unit}</span>
                        </div>
                        <div className="flex justify-between text-slate-100 font-bold border-t border-slate-800 pt-1.5 text-sm">
                          <span>Invoice Total:</span>
                          <span className="text-blue-400">₹{activeInvoice.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button 
                        disabled 
                        className="mt-6 w-full py-2 bg-slate-905 text-slate-500 border border-slate-850 font-semibold text-xs rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <FileText size={14} /> Download Disabled (Vendor Role)
                      </button>
                    </div>
                  ) : (
                    <div className="border border-slate-800 bg-slate-950 p-6 rounded-lg text-xs leading-relaxed text-slate-300 shadow-inner animate-in zoom-in-95 duration-150 relative">
                      {activeInvoice.isRcm && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-extrabold uppercase tracking-wider">
                          RCM Invoice
                        </div>
                      )}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">TAX INVOICE</h4>
                          <span className="text-[10px] text-slate-500">{activeInvoice.invoiceNo}</span>
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold text-blue-400 text-xs">{t.brandName} Portal</h4>
                          <span className="text-[9px] text-slate-500">{activeInvoice.date}</span>
                        </div>
                      </div>

                      {/* Parties details */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Supplier (Billed From)</span>
                          <span className="font-bold text-slate-200 block">Construct.ai Core Corp</span>
                          <span className="text-slate-400 block">State: {activeInvoice.supplierState}</span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">GSTIN: {activeInvoice.supplierGstin || '27AAAAA1111A1Z1'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 uppercase block font-semibold">Recipient (Billed To)</span>
                          <span className="font-bold text-slate-200 block">{activeInvoice.client}</span>
                          <span className="text-slate-400 block">Place of Supply: {activeInvoice.placeOfSupply}</span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">GSTIN: {activeInvoice.clientGstin || '27BBBBB2222B2Z2'}</span>
                        </div>
                      </div>

                      <div className="border-t border-b border-slate-800 py-3 mb-6">
                        <div className="flex items-center justify-between font-bold text-slate-200 mb-1 uppercase tracking-wider text-[10px]">
                          <span>Scope Description</span>
                          <span>Total Base</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 mt-2">
                          <span>{activeInvoice.item}</span>
                          <span>₹{(activeInvoice.baseAmount || activeInvoice.totalAmount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-right w-2/3 ml-auto">
                        <div className="flex justify-between text-slate-400">
                          <span>Tax Rate Category:</span>
                          <span>
                            {activeInvoice.supplierState === activeInvoice.placeOfSupply ? (
                              `CGST (${(activeInvoice.gstRate || 18) / 2}%) + SGST (${(activeInvoice.gstRate || 18) / 2}%)`
                            ) : (
                              `IGST (${activeInvoice.gstRate || 18}%)`
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Tax Computed Amount:</span>
                          <span>₹{(activeInvoice.gstAmount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-slate-100 font-bold border-t border-slate-800 pt-1.5 text-sm">
                          <span>Total (GST Inc.):</span>
                          <span className="text-blue-400">₹{activeInvoice.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => alert("Invoice PDF downloaded successfully!")} 
                        className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                      >
                        <FileText size={14} /> Download Invoice (PDF)
                      </button>
                    </div>
                  )
                ) : (
                  <div className="h-full min-h-[300px] flex items-center justify-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl p-6">
                    Generate an invoice from the side panel to view invoice details.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'marketplace':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
            {/* Store Listing */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-200 text-sm">{t.brandName} Construction Marketplace</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marketplace.map(item => (
                  <div key={item.id} className="glass p-4 rounded-xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all shadow hover:shadow-lg">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          item.type === 'MATERIAL' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-500">{item.supplier}</span>
                      </div>
                      <h4 className="font-bold text-slate-200 mt-2 text-sm">{item.name}</h4>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-850">
                      <span className="font-bold text-slate-100 text-xs">
                        ₹{item.price.toLocaleString('en-IN')} / {item.unit}
                      </span>
                      <button
                        onClick={() => addToCart(item.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shopping Cart Summary */}
            <div className="glass p-6 rounded-xl border border-white/10 h-fit backdrop-blur-md">
              <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2 flex items-center gap-2">
                <ShoppingBag size={16} className="text-blue-400" />
                Procurement Cart
              </h3>
              
              {Object.keys(cart).length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-6">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 text-xs">
                  {Object.entries(cart).map(([idStr, qty]) => {
                    const item = marketplace.find(m => m.id === Number(idStr));
                    if (!item) return null;
                    return (
                      <div key={item.id} className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <div>
                          <p className="font-semibold text-slate-200">{item.name}</p>
                          <span className="text-[9px] text-slate-500">₹{item.price.toLocaleString('en-IN')} x {qty}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => removeFromCart(item.id)} className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-300 cursor-pointer">-</button>
                          <span className="font-bold text-slate-200">{qty}</span>
                          <button onClick={() => addToCart(item.id)} className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-slate-300 cursor-pointer">+</button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    {/* Project Assignment */}
                    <div>
                      <label className="block text-[9px] text-slate-400 uppercase font-semibold mb-1">Link to Site/Project</label>
                      <select
                        value={orderProjectId}
                        onChange={(e) => setOrderProjectId(e.target.value)}
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-850 text-[10px] text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Negotiation Offers */}
                    <div className="space-y-1.5 bg-slate-900/50 p-2 rounded border border-slate-800/40">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Propose Negotiation Price (Per Unit)</p>
                      {Object.entries(cart).map(([idStr, _qty]) => {
                        const item = marketplace.find(m => m.id === Number(idStr));
                        if (!item) return null;
                        const offerVal = negotiationOffers[item.id] !== undefined ? negotiationOffers[item.id] : item.price;
                        return (
                          <div key={item.id} className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-300 truncate max-w-[120px]">{item.name}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-500">₹</span>
                              <input
                                type="number"
                                value={offerVal}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setNegotiationOffers(prev => ({ ...prev, [item.id]: val }));
                                }}
                                className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-[10px] text-slate-200 text-right focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between font-bold text-slate-200 text-xs pt-1">
                      <span>Standard Amount:</span>
                      <span className="text-slate-400">
                        ₹{Object.entries(cart).reduce((acc, [idStr, qty]) => {
                          const item = marketplace.find(m => m.id === Number(idStr));
                          return acc + (item ? item.price * qty : 0);
                        }, 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button 
                      onClick={handleCheckoutCart}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded transition-colors mt-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                    >
                      Checkout & Submit Negotiation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="glass rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col h-[550px] backdrop-blur-md animate-in fade-in-50 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/35 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Site Communication Console</h3>
                <p className="text-slate-500 text-[10px]">Active Room: Site A Tower Core Coordination</p>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
                <Sparkles size={10} className="animate-pulse" />
                AI Assistant Active (Reads portal progress database)
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatMessages.map(msg => {
                const isAI = msg.role === 'AI';
                return (
                  <div key={msg.id} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-1 duration-150`}>
                    <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-400">{msg.sender}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className={`p-3 rounded-lg max-w-md text-xs leading-relaxed shadow-md ${
                      isAI 
                        ? 'bg-blue-600/15 border border-blue-500/20 text-cyan-300 rounded-tl-none font-medium' 
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tr-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-slate-800 bg-slate-900/20 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type messages... Ask: 'What is the progress of Horizon Tower?'"
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-md"
              >
                Send
              </button>
            </form>
          </div>
        );

      case 'listings':
        const vendorCompany = user?.company_name || 'Elite Supplies Ltd';
        const myProducts = marketplace.filter(m => m.supplier === vendorCompany || m.supplier === 'Elite Supplies Ltd' || m.supplier === 'Shree Distributors');
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-200">
            {/* Table */}
            <div className="lg:col-span-2">
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
                <h3 className="font-bold text-lg mb-2 text-black dark:text-white">Manage Material & Rental Catalog</h3>
                <p className="text-slate-200 dark:text-white text-xs mb-6 font-semibold">List supplies or heavy machinery available for contractors to lease/buy.</p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                        <th className="py-3 px-4">Catalog Item</th>
                        <th className="py-3 px-4">Supply Type</th>
                        <th className="py-3 px-4">Price (INR)</th>
                        <th className="py-3 px-4">Supplier Entity</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-black dark:text-white">
                      {myProducts.map(item => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 font-semibold text-black dark:text-white">{item.name}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] border font-bold ${
                              item.type === 'MATERIAL' 
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
                                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                            }`}>
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-black dark:text-white">₹{item.price.toLocaleString('en-IN')} / {item.unit}</td>
                          <td className="py-3 px-4 text-black dark:text-white">{item.supplier}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteVendorProduct(item.id)}
                              className="p-1 rounded bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Add Product Form */}
            <div>
              <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md h-fit">
                <h3 className="font-bold text-sm text-black dark:text-white uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-850 pb-2">
                  Add Catalog Product
                </h3>
                
                <form onSubmit={handleAddVendorProduct} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] text-black dark:text-white uppercase font-bold mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={vNewProdName}
                      onChange={(e) => setVNewProdName(e.target.value)}
                      placeholder="e.g. UltraTech Cement Premium"
                      className="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-white placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-black dark:text-white uppercase font-bold mb-1">Type *</label>
                      <select
                        value={vNewProdType}
                        onChange={(e) => setVNewProdType(e.target.value as 'MATERIAL' | 'RENTAL')}
                        className="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-white focus:outline-none"
                      >
                        <option value="MATERIAL">Material</option>
                        <option value="RENTAL">Rental</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-black dark:text-white uppercase font-bold mb-1">Pricing Unit *</label>
                      <input
                        type="text"
                        required
                        value={vNewProdUnit}
                        onChange={(e) => setVNewProdUnit(e.target.value)}
                        placeholder="e.g. Bag, Ton, Day"
                        className="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-white placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-black dark:text-white uppercase font-bold mb-1">Wholesale Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={vNewProdPrice}
                      onChange={(e) => setVNewProdPrice(e.target.value)}
                      placeholder="450"
                      className="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-black dark:text-white placeholder-slate-450 dark:placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded shadow-lg transition-colors cursor-pointer"
                  >
                    Publish to Marketplace
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'orders':
        const activeSites = Array.from(new Set(
          vendorOrders
            .filter(o => o.status === 'APPROVED')
            .map(o => o.clientProjectName)
        ));

        return (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Active Projects Block */}
            <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
              <h3 className="font-bold text-lg mb-2 text-black dark:text-white">Integrated Construction Projects</h3>
              <p className="text-slate-200 dark:text-white text-xs mb-4 font-semibold">Sites currently utilising your inventory assets.</p>
              
              {activeSites.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-900/5 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-855 text-slate-650 dark:text-slate-400 text-xs">
                  No active project integrations. Approve pending procurement orders to bind your products to construction sites.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeSites.map((siteName, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <Building size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-black dark:text-white text-xs truncate max-w-[200px]">{siteName}</h4>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Product Supplies Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders Ledger Block */}
            <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
              <h3 className="font-bold text-lg mb-2 text-black dark:text-white">Incoming Procurement Orders & Pricing Negotiations</h3>
              <p className="text-slate-200 dark:text-white text-xs mb-6 font-semibold">Review proposed purchase values, standard catalog quotes, and grant approvals.</p>
              
              {vendorOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-600 dark:text-slate-500 text-xs font-medium">
                  No pending contractor orders found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
                        <th className="py-3 px-4">Site / Project</th>
                        <th className="py-3 px-4">Item & Qty</th>
                        <th className="py-3 px-4">Standard Price</th>
                        <th className="py-3 px-4 text-emerald-600 dark:text-emerald-400">Proposed Offer</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-black dark:text-white">
                      {vendorOrders.map(ord => {
                        const standardTotal = ord.standardPrice * ord.quantity;
                        const offerTotal = ord.contractorOfferPrice * ord.quantity;
                        const diffPct = Math.round(((standardTotal - offerTotal) / standardTotal) * 100);
                        
                        return (
                          <tr key={ord.id}>
                            <td className="py-3 px-4 font-semibold text-black dark:text-white">{ord.clientProjectName}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-semibold text-black dark:text-white">{ord.itemName}</p>
                                <span className="text-[10px] text-black dark:text-white font-medium">Qty: {ord.quantity} units</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-black dark:text-white">₹{standardTotal.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-emerald-600 dark:text-emerald-400 font-bold">₹{offerTotal.toLocaleString('en-IN')}</p>
                                {diffPct > 0 && <span className="text-[9px] text-amber-500 font-semibold">{diffPct}% Discount Offered</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${
                                ord.status === 'APPROVED' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                                  : ord.status === 'REJECTED' 
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {ord.status === 'PENDING' ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleApproveOrder(ord.id)}
                                    className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectOrder(ord.id)}
                                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                                  >
                                    Disapprove
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-black dark:text-white block text-center italic font-bold">Resolved</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
            <h3 className="font-bold text-lg mb-2 text-slate-100">My Assigned Construction Tasks</h3>
            <p className="text-slate-400 text-xs mb-6">Check your duty card and mark task progress.</p>
            <div className="space-y-4">
              {allTasks.map(task => {
                const projName = projects.find(p => p.id === task.project)?.name || "Active Site";
                return (
                  <div key={task.id} className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={task.status === 'DONE'} 
                        onChange={() => {
                          const newStatus: TaskStatus = task.status === 'DONE' ? 'IN_PROGRESS' : 'DONE';
                          const updated: Task[] = allTasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
                          setAllTasks(updated);
                          BrowserDatabase.saveTasks(updated);
                          
                          // Recalculate progress, update Gantt, and notify the site comm channel
                          BrowserDatabase.syncProjectProgressAndNotify(task.project, task.id, newStatus);
                          
                          // Update local states in dashboard to refresh views immediately
                          setGanttTasks(BrowserDatabase.getGantt());
                          setChatMessages(BrowserDatabase.getChat());
                          
                          const updatedProjects = projects.map(p => {
                            if (p.id === task.project) {
                              const projectTasks = updated.filter(t => t.project === p.id);
                              const completedTasks = projectTasks.filter(t => t.status === 'DONE').length;
                              const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
                              return { ...p, progress };
                            }
                            return p;
                          });
                          setProjects(updatedProjects);
                        }}
                        className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                      />
                      <div>
                        <h4 className={`font-bold ${task.status === 'DONE' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{task.name}</h4>
                        <span className="text-[10px] text-slate-500 block mt-0.5">Project: {projName}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${
                      task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                    }`}>
                      {task.status === 'DONE' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'attendance_punch':
        return (
          <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden backdrop-blur-md text-center max-w-sm mx-auto">
            <h3 className="font-bold text-lg mb-2 text-slate-100">Labour Shift Punch</h3>
            <p className="text-slate-400 text-xs mb-6">Punch check-in/out to register attendance and wages.</p>
            
            <button
              onClick={() => {
                const myName = `${user?.first_name || 'Steve'} ${user?.last_name || 'Smith'}`;
                const exist = labors.find(l => l.name === myName);
                if (exist) {
                  if (exist.present) {
                    alert("You have already punched in for today's shift!");
                    return;
                  }
                  const updated = labors.map(l => l.name === myName ? { ...l, present: true, salaryDue: l.salaryDue + l.wageRate } : l);
                  setLabors(updated);
                  alert(`Attendance punched successfully! Daily wage rate of ₹${exist.wageRate} added to unpaid salary dues.`);
                } else {
                  const newLabor = {
                    id: labors.length > 0 ? Math.max(...labors.map(l => l.id)) + 1 : 1,
                    name: myName,
                    gender: "Male",
                    age: 26,
                    address: "Noida Sector 62, UP",
                    contact: user?.phone_number || "+91 66666 66666",
                    emergencyContact: "+91 66666 77777",
                    present: true,
                    wageRate: 850,
                    salaryPaid: 0,
                    salaryDue: 850
                  };
                  setLabors([...labors, newLabor]);
                  alert("Attendance punched successfully! Created your labor profile in the system database with a daily wage rate of ₹850.");
                }
              }}
              className="w-32 h-32 rounded-full border-4 border-blue-500/30 hover:border-blue-500 bg-blue-600/10 hover:bg-blue-600/20 transition-all text-xs font-bold text-blue-400 hover:text-blue-300 mx-auto flex items-center justify-center uppercase tracking-wider mb-4 cursor-pointer shadow-lg animate-pulse"
            >
              Punch Shift
            </button>
            <span className="text-[10px] text-slate-500 block">Last punch: Today at 8:02 AM</span>
          </div>
        );

      default:
        // Overview Tab (Projects List + Stats)
        if (user?.role === 'LABOR') {
          const myName = `${user?.first_name || 'Steve'} ${user?.last_name || 'Smith'}`;
          const myProfile = labors.find(l => l.name === myName) || {
            name: myName,
            wageRate: 850,
            salaryPaid: 0,
            salaryDue: 0,
            present: false
          };

          const laborProj = projects.find(p => p.id === user?.assignedProjectId) || projects.find(p => p.status === 'ACTIVE') || projects[0];
          const laborTasks = allTasks.filter(t => t.assigned_to === user?.id && t.project === laborProj?.id);

          return (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Labor Stats Deck */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit mb-3">
                    <HardHat size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Shift Status</p>
                  <h4 className="text-2xl font-bold mt-1 text-slate-100">{myProfile.present ? 'Punched In' : 'Punched Out'}</h4>
                  <span className="text-[10px] text-slate-500 block mt-1">Today at 8:02 AM</span>
                </div>

                <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-3">
                    <TrendingUp size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Daily Wage Rate</p>
                  <h4 className="text-2xl font-bold mt-1 text-slate-100">₹{myProfile.wageRate}</h4>
                  <span className="text-[10px] text-slate-500 block mt-1">Per 8-hour Shift</span>
                </div>

                <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-3">
                    <CheckSquare size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Salary Paid</p>
                  <h4 className="text-2xl font-bold mt-1 text-slate-100">₹{myProfile.salaryPaid.toLocaleString('en-IN')}</h4>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-1">Transferred to Bank</span>
                </div>

                <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-3">
                    <FileText size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Salary Due</p>
                  <h4 className="text-2xl font-bold mt-1 text-slate-100">₹{myProfile.salaryDue.toLocaleString('en-IN')}</h4>
                  <span className="text-[10px] text-amber-500/80 font-bold block mt-1">Next Payout Cycle</span>
                </div>
              </div>

              {/* Main Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Worksite Card */}
                <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2 flex items-center justify-between">
                    <span>Assigned Worksite</span>
                    <span className="text-[10px] bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold px-2 py-0.5 rounded">
                      ACTIVE SITE
                    </span>
                  </h3>
                  <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm">
                    {laborProj ? (
                      <>
                        <div>
                          <h4 className="font-bold text-black dark:text-white text-base">{laborProj.name}</h4>
                          <p className="text-xs text-slate-200 dark:text-slate-300 mt-1">
                            {laborProj.description} • Budget: ₹{Number(laborProj.budget).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 pt-2 text-[11px] text-slate-200 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                          <span>Shift Timings: 9:00 AM - 5:00 PM</span>
                          <span>Reporting Manager: {laborProj.owner_details?.first_name ? `${laborProj.owner_details.first_name} ${laborProj.owner_details.last_name}` : (laborProj.owner_details?.username || 'contractor-rajesh')}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-xs">
                        No active worksite assigned.
                      </div>
                    )}
                  </div>

                  {/* Quick Shift Punch Action */}
                  <div className="mt-6 p-4 rounded-xl bg-blue-600/5 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-200 text-sm">Need to punch today's shift?</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Quickly punch attendance from your phone or device terminal.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('attendance_punch')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white font-semibold rounded-lg text-xs shadow-md shadow-blue-900/30 cursor-pointer"
                    >
                      Go to Shift Punch →
                    </button>
                  </div>
                </div>

                {/* Tasks Snapshot */}
                <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2 flex items-center justify-between">
                    <span>Today's Tasks</span>
                    <button 
                      onClick={() => setActiveTab('tasks')} 
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      View All
                    </button>
                  </h3>
                  <div className="space-y-3">
                    {laborTasks.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
                        No tasks assigned for today.
                      </div>
                    ) : (
                      laborTasks.map(t => (
                        <div key={t.id} className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
                          <input 
                            type="checkbox" 
                            checked={t.status === 'DONE'} 
                            onChange={(e) => {
                              const nextStatus = e.target.checked ? 'DONE' : 'IN_PROGRESS';
                              handleToggleLaborTask(t.id, nextStatus);
                            }}
                            className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                          />
                          <div>
                            <p className={`font-semibold text-xs ${t.status === 'DONE' ? 'text-slate-450 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                              {t.name}
                            </p>
                            <span className={`text-[9px] font-semibold ${t.status === 'DONE' ? 'text-emerald-500' : 'text-blue-500 dark:text-blue-400'}`}>
                              {t.status === 'DONE' ? 'Completed' : t.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (user?.role === 'VENDOR') {
          const myCompany = user?.company_name || 'Elite Supplies Ltd';
          const myProducts = marketplace.filter(m => m.supplier === myCompany || m.supplier === 'Elite Supplies Ltd' || m.supplier === 'Shree Distributors');
          const approvedOrders = vendorOrders.filter(o => o.status === 'APPROVED');
          const pendingOrders = vendorOrders.filter(o => o.status === 'PENDING');
          const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.contractorOfferPrice * o.quantity), 0);

          return (
            <div className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Stats Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit mb-3">
                    <ShoppingBag size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Catalog Inventory</p>
                  <h4 className="text-2xl font-bold mt-1 text-slate-100">{myProducts.length} Items</h4>
                  <span className="text-[10px] text-slate-500 block mt-1">Listed in Wholesale Market</span>
                </div>

                <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit mb-3">
                    <FileText size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Orders</p>
                  <h4 className="text-2xl font-bold mt-1 text-slate-100">{pendingOrders.length} Offers</h4>
                  <span className="text-[10px] text-amber-500/80 font-bold block mt-1">Awaiting Negotiations</span>
                </div>

                <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-3">
                    <CheckSquare size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Approved Orders</p>
                  <h4 className="text-2xl font-bold mt-1 text-slate-100">{approvedOrders.length} Closed</h4>
                  <span className="text-[10px] text-slate-500 block mt-1">Ready for Delivery / Lease</span>
                </div>

                <div className="glass rounded-xl p-5 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-3">
                    <DollarSign size={18} />
                  </div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</p>
                  <h4 className="text-2xl font-bold mt-1 text-slate-100">₹{totalRevenue.toLocaleString('en-IN')}</h4>
                  <span className="text-[10px] text-slate-500 block mt-1">Accumulated Order Values</span>
                </div>
              </div>

              {/* Main Content Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hot Sellers Catalog */}
                <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2 flex items-center justify-between">
                    <span>Hot Selling Inventory</span>
                    <button 
                      onClick={() => setActiveTab('listings')} 
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      Manage Catalog →
                    </button>
                  </h3>
                  <div className="space-y-4">
                    {myProducts.slice(0, 3).map(prod => (
                      <div key={prod.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-200 text-sm">{prod.name}</h4>
                          <span className="text-[10px] text-slate-500">Unit: {prod.unit} • Supplier: {prod.supplier}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-100">₹{prod.price.toLocaleString('en-IN')}</p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold uppercase tracking-wider">{prod.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integration Partners & Activity */}
                <div className="glass rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
                  <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-850 pb-2">
                    Client Partners
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="font-semibold text-slate-200">Apex Construction Builders</p>
                      <span className="text-[10px] text-slate-500">Industry Partner • 8 Orders Placed</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="font-semibold text-slate-200">L&T Infrastructure Group</p>
                      <span className="text-[10px] text-slate-500">Contractor • 3 Orders Placed</span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="font-semibold text-slate-200">Shree Realty Developers</p>
                      <span className="text-[10px] text-slate-500">Active Lease Partner</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        const displayProjects = projects.filter(p => {
          if (user?.role === 'ADMIN') return true;
          if (user?.role === 'CLIENT') {
            return p.client === user?.id || p.id === user?.assignedProjectId || p.client_details?.username === user?.username;
          }
          if (user?.role === 'CONTRACTOR') {
            return p.owner === user?.id || p.owner_details?.username === user?.username;
          }
          if (user?.role === 'VENDOR') {
            return p.vendor === user?.id || p.vendor_details?.username === user?.username;
          }
          return true;
        });

        return (
          <>
            {renderStats()}

            {/* Admin Access Requests Notification Panel */}
            {user?.role === 'ADMIN' && pendingRequests.length > 0 && (
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-slate-900/30 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5">
                    <Users size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100 text-sm">New Access Request Awaiting Review</h4>
                      <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold rounded uppercase tracking-wider">
                        Latest
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">
                      Applicant: <span className="text-slate-200 font-semibold">{pendingRequests[pendingRequests.length - 1].fullName}</span> ({pendingRequests[pendingRequests.length - 1].role}) 
                      • Company: <span className="text-slate-200 font-semibold">{pendingRequests[pendingRequests.length - 1].companyName}</span>
                    </p>
                    <p className="text-slate-500 text-[10px] mt-1 italic">
                      "Reason: {pendingRequests[pendingRequests.length - 1].reason}"
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleApproveRequest(pendingRequests[pendingRequests.length - 1])}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/30"
                  >
                    Quick Approve
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-900/30"
                  >
                    Review All ({pendingRequests.length})
                  </button>
                </div>
              </div>
            )}

            {/* Projects Listing */}
            {true && (
              <div className="glass rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-md">
                <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/35 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200 text-sm">{t.projects}</h3>
                  <span className="text-xs text-slate-500">{displayProjects.length} Total</span>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-slate-500">Loading site assets...</div>
                ) : displayProjects.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No active construction sites found.</div>
                ) : (
                  <div className="divide-y divide-slate-800/80">
                    {displayProjects.map((proj) => (
                      <div 
                        key={proj.id} 
                        onClick={() => navigate(`/project/${proj.id}`)}
                        className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition-all group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors text-base">
                              {proj.name}
                            </h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getStatusColor(proj.status)}`}>
                              {getStatusLabel(proj.status)}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mt-1 max-w-2xl line-clamp-2">
                            {proj.description || 'No description provided.'}
                          </p>
                           <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {t.startDate}: {proj.start_date}</span>
                            {proj.client_details && (
                              <span className="flex items-center gap-1"><Users size={12} /> Client: {proj.client_details.company_name || proj.client_details.username}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <CheckSquare size={12} className="text-emerald-400" />
                              Progress: {(() => {
                                const projectTasks = allTasks.filter(t => t.project === proj.id);
                                const completedTasks = projectTasks.filter(t => t.status === 'DONE').length;
                                return projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : (proj.status === 'COMPLETED' ? 100 : 0);
                              })()}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6">
                          <div className="text-right">
                            <p className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider">{t.budget}</p>
                            <p className="text-base font-bold text-slate-200">
                              ₹{parseFloat(proj.budget).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          {user?.role === 'ADMIN' && (
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              {proj.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleAdminCompleteProject(proj.id)}
                                  title="Mark as Completed"
                                  className="p-2 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 cursor-pointer transition-colors"
                                >
                                  <CheckSquare size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleAdminDeleteProject(proj.id)}
                                title="Delete Project"
                                className="p-2 rounded bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 cursor-pointer transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-blue-400 group-hover:border-slate-700 transition-all">
                            <ArrowRight size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        );
    }
  };

  const sidebarTabs = getSidebarTabs();

  return (
    <div className="min-h-screen theme-bg-root flex flex-col relative overflow-hidden transition-colors duration-200">
      {/* Premium background glowing blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Banner mock info */}
      {isMocked && (
        <div className="bg-gradient-to-r from-amber-600/25 to-blue-600/25 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-xs text-amber-300 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>Running in <strong>Interactive Demo Mode</strong>. Changes are simulated dynamically in real-time.</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Simulate Role:</span>
            <select
              value={user?.role}
              onChange={(e) => setMockRole(e.target.value as UserRole)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-755 rounded px-2 py-0.5 text-xs text-black dark:text-white outline-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 focus:border-blue-500"
            >
              <option value="ADMIN" className="bg-white dark:bg-slate-900 text-black dark:text-white">Admin Portal</option>
              <option value="CONTRACTOR" className="bg-white dark:bg-slate-900 text-black dark:text-white">Contractor</option>
              <option value="CLIENT" className="bg-white dark:bg-slate-900 text-black dark:text-white">Client</option>
              <option value="VENDOR" className="bg-white dark:bg-slate-900 text-black dark:text-white">Vendor</option>
              <option value="LABOR" className="bg-white dark:bg-slate-900 text-black dark:text-white">Labor</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="glass border-b border-white/10 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-xl sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-600/20 border border-blue-500/20 rounded-xl text-blue-400 font-bold shadow-lg shadow-blue-500/10">
            <HardHat size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-100 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">{t.brandName}</h1>
            <p className="text-slate-500 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider">
              {user?.role ? (t[user.role.toLowerCase() as keyof typeof t] || user.role) : ''} {t.controlRoom}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-xs text-slate-900 dark:text-slate-100">
            <Globe size={12} className="text-blue-500 dark:text-blue-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="bg-transparent border-none text-black dark:text-white outline-none cursor-pointer focus:ring-0 text-[10px] sm:text-xs font-semibold"
            >
              <option value="en" className="bg-white dark:bg-slate-800 text-black dark:text-white">English</option>
              <option value="hi" className="bg-white dark:bg-slate-800 text-black dark:text-white">हिन्दी</option>
              <option value="mr" className="bg-white dark:bg-slate-800 text-black dark:text-white">मराठी</option>
              <option value="gu" className="bg-white dark:bg-slate-800 text-black dark:text-white">ગુજરાતી</option>
              <option value="bn" className="bg-white dark:bg-slate-800 text-black dark:text-white">বাংলা</option>
            </select>
          </div>

          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-black dark:text-white">{user?.username}</span>
            <span className="text-[11px] text-slate-500">{user?.company_name || 'Individual'}</span>
          </div>

          <button
            onClick={logout}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-880 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all shadow cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Sidebar + Main Grid Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1400px] w-full mx-auto p-4 md:p-6 gap-6 relative z-10">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-60 shrink-0">
          <div className="glass rounded-2xl p-2.5 flex flex-row overflow-x-auto gap-2 md:flex-col md:space-y-1 md:gap-0 border border-white/10 shadow-xl backdrop-blur-md scrollbar-none">
            {sidebarTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer md:w-full md:px-4 md:py-3 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold border border-blue-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                {sidebarTabs.find(tab => tab.id === activeTab)?.label || t.overview}
              </h2>
              <p className="text-slate-400 text-xs">{t.manageSystemDetails}</p>
            </div>

            {/* Quick action button only on overview tab */}
            {activeTab === 'overview' && (user?.role === 'ADMIN' || user?.role === 'CONTRACTOR') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Plus size={16} /> {t.addProject}
              </button>
            )}
          </div>

          <div className="flex-1">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* New Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-white/10">
            <h3 className="text-lg font-bold text-slate-100 mb-4">{t.addProject}</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.projectName}</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder={t.projectNamePlaceholder}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.description}</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder={t.projectDescPlaceholder}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors h-24 resize-none text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.budget} (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                    placeholder="500000"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.startDate}</label>
                  <input
                    type="date"
                    required
                    value={newProjectStart}
                    onChange={(e) => setNewProjectStart(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.status}</label>
                <select
                  value={newProjectStatus}
                  onChange={(e) => setNewProjectStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-200"
                >
                  <option value="PLANNING">{t.planning}</option>
                  <option value="ACTIVE">{t.active}</option>
                  <option value="ON_HOLD">{t.onHold}</option>
                </select>
              </div>

              {user?.role === 'ADMIN' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.leadContractor}</label>
                  <select
                    required
                    value={newProjectContractorId}
                    onChange={(e) => setNewProjectContractorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-200"
                  >
                    <option value="">{t.selectContractor}</option>
                    {registeredUsers.filter(u => u.role === 'CONTRACTOR').map(u => (
                      <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.company_name})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.assignedVendor}</label>
                <select
                  required
                  value={newProjectVendorId}
                  onChange={(e) => setNewProjectVendorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-200"
                >
                  <option value="">{t.selectVendor}</option>
                  {registeredUsers.filter(u => u.role === 'VENDOR').map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.company_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{t.clientOwner}</label>
                <select
                  required
                  value={newProjectClientId}
                  onChange={(e) => setNewProjectClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs focus:outline-none focus:border-blue-500 transition-colors text-slate-200"
                >
                  <option value="">{t.selectClient}</option>
                  {registeredUsers.filter(u => u.role === 'CLIENT').map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.company_name})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
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
