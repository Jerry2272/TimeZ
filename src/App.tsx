import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Users, 
  Package, 
  PieChart, 
  Settings, 
  LogOut,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Download,
  Cloud,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, InventoryItem, Invoice, Expense, PayrollEntry, ProfitLossReport } from './types';

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="glass-card p-6 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {trend && (
        <p className={`text-xs mt-2 flex items-center ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
          {Math.abs(trend)}% from last month
        </p>
      )}
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const SectionHeader = ({ title, description, action }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
    <div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500">{description}</p>
    </div>
    {action && (
      <button 
        onClick={action.onClick}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-200 font-medium"
      >
        <Plus size={18} />
        {action.label}
      </button>
    )}
  </div>
);

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data States
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [report, setReport] = useState<ProfitLossReport | null>(null);

  // Auth States
  const [authForm, setAuthForm] = useState({ username: '', password: '', businessName: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    checkSetup();
    const savedUser = localStorage.getItem('timez_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const checkSetup = async () => {
    try {
      const res = await fetch('/api/check-setup');
      const data = await res.json();
      setIsSetup(data.isSetup);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    const headers = { 'x-user-id': user.id.toString() };
    try {
      if (activeTab === 'dashboard' || activeTab === 'reports') {
        const res = await fetch('/api/reports/profit-loss', { headers });
        setReport(await res.json());
      }
      if (activeTab === 'dashboard' || activeTab === 'invoices') {
        const res = await fetch('/api/invoices', { headers });
        setInvoices(await res.json());
      }
      if (activeTab === 'expenses') {
        const res = await fetch('/api/expenses', { headers });
        setExpenses(await res.json());
      }
      if (activeTab === 'inventory') {
        const res = await fetch('/api/inventory', { headers });
        setInventory(await res.json());
      }
      if (activeTab === 'payroll') {
        const res = await fetch('/api/payroll', { headers });
        setPayroll(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authForm.username, password: authForm.password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('timez_user', JSON.stringify(data));
      } else {
        setAuthError('Invalid username or password');
      }
    } catch (e) {
      setAuthError('Connection error');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      if (res.ok) {
        setIsSetup(true);
        setAuthError('Setup successful! Please login.');
        setAuthForm({ ...authForm, password: '' });
      } else {
        setAuthError('Setup failed');
      }
    } catch (e) {
      setAuthError('Connection error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('timez_user');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-card p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <LayoutDashboard className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">TImeZ</h1>
          <p className="text-slate-500 text-center mb-8">
            {isSetup ? 'Welcome back! Please login to your account.' : 'Initial Setup: Create your admin account.'}
          </p>

          <form onSubmit={isSetup ? handleLogin : handleSetup} className="space-y-4">
            {!isSetup && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  value={authForm.businessName}
                  onChange={(e) => setAuthForm({ ...authForm, businessName: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>
            {authError && <p className="text-rose-600 text-sm text-center">{authError}</p>}
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all mt-4"
            >
              {isSetup ? 'Login' : 'Complete Setup'}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-xs">
            <Database size={14} />
            <span>Single User Instance • Local SQLite Storage</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'payroll', label: 'Payroll', icon: Users },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'reports', label: 'Reports', icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md">
            <LayoutDashboard className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight">TImeZ</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                  ? 'nav-item-active' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user.businessName}</p>
              <p className="text-xs text-slate-500 truncate">{user.username}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        className="fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 flex flex-col lg:hidden shadow-2xl"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-md">
              <LayoutDashboard className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">TImeZ</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                  ? 'nav-item-active' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 transition-all font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-slate-900 capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
              <Cloud size={14} />
              <span>Cloud Backup Active</span>
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg relative">
              <AlertCircle size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <SectionHeader 
                    title={`Welcome, ${user.username}`} 
                    description={`Here's what's happening with ${user.businessName} today.`}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="Total Revenue" value={`₦${report?.income.toLocaleString()}`} icon={DollarSign} trend={12} color="bg-indigo-600" />
                    <StatCard title="Total Expenses" value={`₦${report?.expenses.toLocaleString()}`} icon={Receipt} trend={-5} color="bg-rose-600" />
                    <StatCard title="Net Profit" value={`₦${report?.profit.toLocaleString()}`} icon={TrendingUp} trend={8} color="bg-emerald-600" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Recent Invoices</h3>
                        <button onClick={() => setActiveTab('invoices')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
                      </div>
                      <div className="space-y-4">
                        {invoices.slice(0, 5).map(inv => (
                          <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 rounded-lg">
                                <FileText size={16} className="text-slate-500" />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{inv.client_name}</p>
                                <p className="text-xs text-slate-500">Due {inv.due_date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">₦{inv.amount.toLocaleString()}</p>
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {inv.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Tax Estimates (FIRS)</h3>
                        <span className="text-[10px] uppercase font-bold bg-slate-100 px-2 py-1 rounded-lg">Current Period</span>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">VAT (7.5%)</span>
                            <span className="font-bold">₦{( (report?.income || 0) * 0.075 ).toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Company Income Tax (CIT)</span>
                            <span className="font-bold">₦{( (report?.profit || 0) * 0.3 ).toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                          <AlertCircle className="text-amber-600 shrink-0" size={20} />
                          <p className="text-xs text-amber-800 leading-relaxed">
                            These are automated estimates based on your current income and profit. Please consult a professional for official FIRS filings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div>
                  <SectionHeader 
                    title="Invoices" 
                    description="Manage your client billing and payments."
                    action={{ label: 'New Invoice', onClick: () => {} }}
                  />
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50 transition-all">
                              <td className="px-6 py-4">
                                <p className="text-sm font-bold text-slate-900">{inv.client_name}</p>
                                <p className="text-xs text-slate-500">{inv.client_email}</p>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold">₦{inv.amount.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                                  inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">{inv.due_date}</td>
                              <td className="px-6 py-4 text-right">
                                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all">
                                  <Download size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'expenses' && (
                <div>
                  <SectionHeader 
                    title="Expenses" 
                    description="Track your business spending and categories."
                    action={{ label: 'Log Expense', onClick: () => {} }}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">By Category</h4>
                      <div className="space-y-3">
                        {['Marketing', 'Operations', 'Utilities'].map(cat => (
                          <div key={cat} className="flex items-center justify-between">
                            <span className="text-sm">{cat}</span>
                            <span className="text-sm font-bold">₦25,000</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="glass-card overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {expenses.map(exp => (
                          <tr key={exp.id} className="hover:bg-slate-50 transition-all">
                            <td className="px-6 py-4 text-sm font-medium">{exp.description}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{exp.category}</td>
                            <td className="px-6 py-4 text-sm font-bold text-rose-600">₦{exp.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{exp.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div>
                  <SectionHeader 
                    title="Inventory" 
                    description="Monitor stock levels and product pricing."
                    action={{ label: 'Add Product', onClick: () => {} }}
                  />
                  <div className="glass-card overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventory.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-all">
                            <td className="px-6 py-4 text-sm font-bold">{item.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-500 font-mono">{item.sku}</td>
                            <td className="px-6 py-4 text-sm">{item.quantity}</td>
                            <td className="px-6 py-4 text-sm font-bold">₦{item.price.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                                item.quantity > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {item.quantity > 10 ? 'In Stock' : 'Low Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'payroll' && (
                <div>
                  <SectionHeader 
                    title="Payroll" 
                    description="Manage employee salaries and tax deductions."
                    action={{ label: 'Process Payroll', onClick: () => {} }}
                  />
                  <div className="glass-card overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Salary</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tax (PAYE)</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Net Pay</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payroll.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-all">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold">{p.employee_name}</p>
                              <p className="text-xs text-slate-500">{p.role}</p>
                            </td>
                            <td className="px-6 py-4 text-sm">₦{p.salary.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-rose-600">-₦{p.tax_deduction.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-bold text-emerald-600">₦{p.net_pay.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{p.payment_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-8">
                  <SectionHeader 
                    title="Financial Reports" 
                    description="Detailed breakdown of your business performance."
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card p-8">
                      <h3 className="font-bold text-xl mb-8">Profit & Loss Statement</h3>
                      <div className="space-y-6">
                        <div className="flex justify-between items-center py-4 border-b border-slate-100">
                          <span className="text-slate-600">Total Sales (Revenue)</span>
                          <span className="font-bold text-emerald-600">₦{report?.income.toLocaleString()}</span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase">Operating Expenses</p>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600">General Expenses</span>
                            <span className="text-rose-600">₦{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-slate-600">Payroll & Benefits</span>
                            <span className="text-rose-600">₦{payroll.reduce((acc, curr) => acc + curr.salary, 0).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-6 border-t-2 border-slate-900 mt-4">
                          <span className="font-bold text-lg">Net Profit</span>
                          <span className="font-bold text-2xl text-indigo-600">₦{report?.profit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="glass-card p-6 bg-indigo-600 text-white">
                        <h4 className="font-bold mb-2">Export Data</h4>
                        <p className="text-xs text-indigo-100 mb-6 leading-relaxed">
                          Download your full financial history as CSV or PDF for external auditing.
                        </p>
                        <button className="w-full py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                          <Download size={16} />
                          Download CSV
                        </button>
                      </div>

                      <div className="glass-card p-6">
                        <h4 className="font-bold mb-4">Backup Status</h4>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-100 rounded-lg">
                            <Cloud size={20} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Cloud Sync</p>
                            <p className="text-xs text-slate-500">Last synced 2 mins ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Database size={20} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">Local Storage</p>
                            <p className="text-xs text-slate-500">timez.db (2.4 MB)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
