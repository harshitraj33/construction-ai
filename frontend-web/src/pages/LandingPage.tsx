import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrowserDatabase } from '../services/db';
import { ThemeToggle } from '../components/ThemeToggle';
import { 
  Building, 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  HardHat, 
  ShoppingBag, 
  ArrowRight, 
  Mail, 
  Phone, 
  Briefcase,
  FileText
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const projects = BrowserDatabase.getProjects();
  const labors = BrowserDatabase.getLabors();
  const orders = BrowserDatabase.getOrders();

  const activeSitesCount = projects.length;
  const approvedOrders = orders.filter(o => o.status === 'APPROVED');
  const materialsDispatched = approvedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const aggregatePayroll = labors.reduce((sum, l) => sum + l.salaryPaid, 0);
  const averageDiscount = approvedOrders.length > 0 ? 12.4 : 0;

  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    role: 'CONTRACTOR',
    projectType: 'From Scratch',
    reason: ''
  });
  
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage so admin can see and approve
    const savedRequests = localStorage.getItem('pending_registrations');
    const list = savedRequests ? JSON.parse(savedRequests) : [];
    const newRequest = {
      id: Date.now(),
      ...formData,
      status: 'PENDING',
      timestamp: new Date().toLocaleString()
    };
    
    localStorage.setItem('pending_registrations', JSON.stringify([...list, newRequest]));
    setSubmitted(true);
    
    // Reset Form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      role: 'CONTRACTOR',
      projectType: 'From Scratch',
      reason: ''
    });
  };

  return (
    <div className="min-h-screen theme-bg-root selection:bg-blue-600/30 transition-colors duration-200">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-900/10 via-indigo-950/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 dark:border-white/8 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors duration-200">
        <nav className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building className="text-white" size={16} />
          </div>
          <span className="font-bold text-sm sm:text-lg tracking-wider bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            CONSTRUCT.AI
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[10px] sm:text-xs font-semibold shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-black dark:text-white text-[10px] sm:text-xs font-semibold transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/admin')}
                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-[10px] sm:text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all cursor-pointer"
              >
                Admin Desk
              </button>
            </>
          )}
        </div>
      </nav>
    </div>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-16 text-center">
        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
          Next-Gen Construction Command Centre
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 tracking-tight mt-6 max-w-4xl mx-auto leading-tight">
          Supercharge Project Delivery with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Integrated Intelligence</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-6 max-w-2xl mx-auto leading-relaxed">
          Manage supply negotiation matrices, labour attendance payrolls, dynamic client project milestones, and coordinate timeline compliance schedules in a unified ecosystem.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a 
            href="#registration-form"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
          >
            Request Access <ArrowRight size={14} />
          </a>
          <a 
            href="#benefits"
            className="px-6 py-3 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-slate-900/60 text-slate-300 text-xs font-bold transition-all"
          >
            Explore Services
          </a>
        </div>
      </header>

      {/* Services and Benefits Grid */}
      <section id="benefits" className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 text-center mb-12">
          Platform Architecture & Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Service 1: Contractor */}
          <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden backdrop-blur-md">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 w-fit mb-5">
              <HardHat size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-3">Contractor Hub</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Control payroll, roster templates, and manual attendance schedules. Disburse wages to active onsite crew instantly, while utilizing material marketplaces and negotiating order proposals.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2 border-t border-slate-900 pt-3">
              <li className="flex items-center gap-2">✓ Attendance Logs & Payroll Tracking</li>
              <li className="flex items-center gap-2">✓ Excel Labour Roster Importing</li>
              <li className="flex items-center gap-2">✓ Dynamic Gantt Timeline Planning</li>
            </ul>
          </div>

          {/* Service 2: Vendor */}
          <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden backdrop-blur-md">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 w-fit mb-5">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-3">Vendor Marketplace</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Manage product listings, wholesale prices, and delivery terms. Track incoming order proposals and approve/disapprove cost negotiation requests from contractors in real time.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2 border-t border-slate-900 pt-3">
              <li className="flex items-center gap-2">✓ Inventory Catalog Control</li>
              <li className="flex items-center gap-2">✓ Real-time Negotiations Ledger</li>
              <li className="flex items-center gap-2">✓ Site Integration Map</li>
            </ul>
          </div>

          {/* Service 3: Client */}
          <div className="glass rounded-2xl p-6 border border-white/10 relative overflow-hidden backdrop-blur-md">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit mb-5">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-3">Client Portal</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Get 100% transparency. View milestone completions, live worker counts, overall budget burn rates, material expenses, and chat with AI site coordinators.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-2 border-t border-slate-900 pt-3">
              <li className="flex items-center gap-2">✓ Custom Project Tracker views</li>
              <li className="flex items-center gap-2">✓ Financial & Burn Metrics</li>
              <li className="flex items-center gap-2">✓ Interactive AI Assistant Chat</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Platform Benefits */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Why Choose Construct.ai?</span>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2 mb-6">
              Streamline Operations, Eliminate Communication Gaps.
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 h-fit">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Enhanced Security & Access Boundaries</h4>
                  <p className="text-slate-400 text-xs mt-1">Role-isolated workspaces prevent data leaks. Clients see only their projects, vendors focus on orders, and laborers view tasks.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 h-fit">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Cost Optimizations & Cost Negotiation</h4>
                  <p className="text-slate-400 text-xs mt-1">Contractors request special pricing proposals directly in the app. Vendors approve deals on the fly, locking in project margins.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 h-fit">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Automated Labour Compliance</h4>
                  <p className="text-slate-400 text-xs mt-1">Import bulk rosters in seconds. Punched shift records sync hourly, updating budget totals for clients and managers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-4 flex items-center gap-2">
              <Building size={16} className="text-blue-400" /> Platform Deployment Overview
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-900">
                <span className="text-xs text-slate-600 dark:text-slate-300">Active Construction Sites</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {activeSitesCount} {activeSitesCount === 1 ? 'Project' : 'Projects'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-900">
                <span className="text-xs text-slate-600 dark:text-slate-300">Materials Dispatched</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {materialsDispatched.toLocaleString('en-IN')} Tons
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-900">
                <span className="text-xs text-slate-600 dark:text-slate-300">Aggregate Payroll Disbursed</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{aggregatePayroll.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-900">
                <span className="text-xs text-slate-600 dark:text-slate-300">Average Procurement Discount</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {averageDiscount}% Saved
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Request Form */}
      <section id="registration-form" className="relative z-10 max-w-3xl mx-auto px-6 py-16 border-t border-white/5 scroll-mt-20">
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden bg-slate-900/20 backdrop-blur-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-2xl font-bold text-slate-100 text-center mb-2">Request Account Access</h3>
          <p className="text-slate-400 text-xs text-center mb-8 max-w-md mx-auto">
            Submit your profile details and role preferences. Our system Administrator will inspect your request and issue login credentials shortly.
          </p>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 w-fit mx-auto">
                <ShieldCheck size={32} />
              </div>
              <h4 className="font-bold text-slate-200">Request Sent Successfully!</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                Your request is pending review by the platform administrator (<span className="text-blue-400 font-semibold">harshit_raj</span>). Once approved, you will receive your secure username and password to log in.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Send Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Users size={14} /></span>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Mail size={14} /></span>
                    <input 
                      type="email" 
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Phone size={14} /></span>
                    <input 
                      type="text" 
                      required
                      placeholder="+91 99999 88888"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Company / Enterprise *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Briefcase size={14} /></span>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Apex Builders"
                      value={formData.companyName}
                      onChange={e => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Desired Portal Role *</label>
                <select 
                  value={formData.role}
                  onChange={e => {
                    const newRole = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      role: newRole,
                      companyName: newRole === 'CLIENT' ? 'Personal' : (prev.companyName === 'Personal' ? '' : prev.companyName)
                    }));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 px-4 text-xs text-slate-200 outline-none transition-all"
                >
                  <option value="CONTRACTOR">CONTRACTOR PORTAL</option>
                  <option value="CLIENT">CLIENT PORTAL</option>
                  <option value="VENDOR">VENDOR PORTAL</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Type / Scope *</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.projectType === 'From Scratch' 
                      ? 'bg-blue-600/15 border-blue-500 text-slate-100' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input 
                      type="radio" 
                      name="projectType" 
                      value="From Scratch"
                      checked={formData.projectType === 'From Scratch'}
                      onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                      className="accent-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold">From Scratch</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.projectType === 'Renovate' 
                      ? 'bg-blue-600/15 border-blue-500 text-slate-100' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                    <input 
                      type="radio" 
                      name="projectType" 
                      value="Renovate"
                      checked={formData.projectType === 'Renovate'}
                      onChange={e => setFormData({ ...formData, projectType: e.target.value })}
                      className="accent-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold">Renovate</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Reason for Registration *</label>
                <div className="relative">
                  <span className="absolute top-3 left-3 text-slate-500"><FileText size={14} /></span>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Briefly state your role requirements, active worksite locations, or supply inventory listings..."
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-600 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs tracking-wider uppercase text-white shadow-lg shadow-blue-900/30 transition-all mt-2 cursor-pointer"
              >
                Submit Registration Request
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-slate-600 relative z-10 text-[10px]">
        <p>© 2026 Construct.ai platform. All rights reserved. Secure access managed under Harshit Raj administration.</p>
      </footer>
    </div>
  );
};
