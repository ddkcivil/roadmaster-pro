import React, { useState, useEffect, useContext } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  HardHat,
  FlaskConical,
  Truck,
  FileText,
  Settings,
  Menu,
  X,
  Bot,
  CalendarClock,
  ClipboardCheck,
  FolderOpen,
  Save,
  LogOut,
  Users,
  Trash2
} from 'lucide-react';
import { UserRole, Project } from './types';
import { loadProjects, saveProjects } from './services/dataService';
import Dashboard from './components/Dashboard';
import BOQManager from './components/BOQManager';
import RFIModule from './components/RFIModule';
import LabModule from './components/LabModule';
import ResourceManager from './components/ResourceManager';
import CorrespondenceManager from './components/CorrespondenceManager';
import ScheduleModule from './components/ScheduleModule';
import DailyReportModule from './components/DailyReportModule';
import ProjectsList from './components/ProjectsList';
import AIChatModal from './components/AIChatModal';
import { ThemeToggle } from './components/ThemeToggle';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SettingsPage from './components/SettingsPage';
import { ProjectProvider, ProjectContext } from './contexts/ProjectContext';
import ProjectSelectionPage from './components/ProjectSelectionPage';

const AppWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>(UserRole.PROJECT_MANAGER);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showRegisterPage, setShowRegisterPage] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('$');

  const [projects, setProjects] = useState<Project[]>([]);
  const projectContext = useContext(ProjectContext);
  const selectedProject = projectContext?.selectedProject;
  const setSelectedProject = projectContext?.setSelectedProject;

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const loadedProjects = await loadProjects();
      setProjects(loadedProjects);
    };
    if (isAuthenticated) {
      fetchProjects();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedProject) {
      setCurrency(selectedProject.currency || '$');
      setActiveTab('dashboard');
    }
  }, [selectedProject]);


  const handleSaveChanges = async (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    await saveProjects(updatedProjects);
  };

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setUserName(username);
    setShowRegisterPage(false);
  };

  const handleRegister = (userData: { username: string, email: string, phone: string, role: UserRole }) => {
    console.log('New user registered:', userData);
    setIsAuthenticated(true);
    setUserName(userData.username);
    setShowRegisterPage(false);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName(null);
    if(setSelectedProject) {
      setSelectedProject(null);
    }
    setActiveTab('dashboard');
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    const updatedBoq = updatedProject.boq.map(boqItem => {
      let calculatedCompletedQuantity = 0;
      updatedProject.schedule.forEach(task => {
        if (task.boqItemId === boqItem.id && task.associatedQuantity) {
          calculatedCompletedQuantity += (task.progress / 100) * task.associatedQuantity;
        }
      });
      return {
        ...boqItem,
        completedQuantity: Math.min(calculatedCompletedQuantity, boqItem.quantity)
      };
    });

    const updatedProjects = projects.map(p => p.id === updatedProject.id ? { ...updatedProject, boq: updatedBoq } : p);
    handleSaveChanges(updatedProjects);
    if(setSelectedProject) {
      setSelectedProject(updatedProject);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.PROJECT_MANAGER) {
      alert("You don't have permission to delete projects.");
      return;
    }
    if (confirm("Are you sure you want to delete this project?")) {
       const updatedProjects = projects.filter(p => p.id !== id);
       handleSaveChanges(updatedProjects);
       if (setSelectedProject) {
        setSelectedProject(null);
       }
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleSaveEditProject = () => {
    if (editingProject) {
      const updatedProjects = projects.map(p => p.id === editingProject.id ? editingProject : p);
      handleSaveChanges(updatedProjects);
      setIsEditModalOpen(false);
      setEditingProject(null);
    }
  };
  
  const handleCurrencyChange = (newCurrency: string) => {
    if (selectedProject) {
      const updatedProject = { ...selectedProject, currency: newCurrency };
      handleProjectUpdate(updatedProject);
      setCurrency(newCurrency);
    }
  };

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule & Plan', icon: CalendarClock },
    { id: 'daily', label: 'Daily Work Reports', icon: ClipboardCheck },
    { id: 'boq', label: 'BOQ & Billing', icon: ClipboardList },
    { id: 'rfi', label: 'RFI Management', icon: HardHat },
    { id: 'lab', label: 'Lab & Quality', icon: FlaskConical },
    { id: 'resources', label: 'Resources', icon: Truck },
    { id: 'docs', label: 'Correspondence', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'userManagement', label: 'User Management', icon: Users },
  ];

  const getVisibleNavItems = () => {
    return allNavItems.filter(item => item.id !== 'settings' && item.id !== 'userManagement');
  };

  const navItems = getVisibleNavItems();

  const renderContent = () => {
    if (activeTab === 'projects') {
      return <ProjectsList
               projects={projects}
               userRole={userRole}
               onSelectProject={(id) => {
                if (setSelectedProject) {
                  const project = projects.find(p => p.id === id);
                  setSelectedProject(project || null);
                }
               }}
               onEditProject={handleEditProject}
               onDeleteProject={handleDeleteProject}
             />;
    }

    if (!selectedProject) {
      return <ProjectSelectionPage projects={projects} setProjects={setProjects} />;
    }

    const props = { project: selectedProject, userRole, onProjectUpdate: handleProjectUpdate };

    switch (activeTab) {
      case 'dashboard': return <Dashboard project={selectedProject} />;
      case 'schedule': return <ScheduleModule key={selectedProject.id} {...props} />;
      case 'daily': return <DailyReportModule key={selectedProject.id} {...props} />;
      case 'boq': return <BOQManager key={selectedProject.id} {...props} />;
      case 'rfi': return <RFIModule key={selectedProject.id} {...props} />;
      case 'lab': return <LabModule key={selectedProject.id} {...props} />;
      case 'resources': return <ResourceManager key={selectedProject.id} {...props} />;
      case 'docs': return <CorrespondenceManager key={selectedProject.id} {...props} />;
      case 'settings': return <SettingsPage onCurrencyChange={handleCurrencyChange} currentCurrency={currency} />;
      default: return <Dashboard project={selectedProject} />;
    }
  };

  if (!isAuthenticated) {
    return showRegisterPage ? <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setShowRegisterPage(false)} /> : <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setShowRegisterPage(true)} />;
  }

  if (!selectedProject) {
    return <ProjectSelectionPage projects={projects} setProjects={setProjects} />;
  }
  
  return (
    <div className="flex h-screen bg-background text-text transition-colors overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-surface text-text border-r border-border transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col shadow-lg`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary font-bold text-xl">R</div>
            <span className="font-bold text-xl">RoadMaster</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-text hover:text-primary p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-border">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Role</label>
          <div className="w-full bg-background border border-border text-text text-sm rounded-lg px-3 py-2">
            {userRole}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-6">
            {navItems.map((item) => (
              <li key={item.id}>
                <button onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${activeTab === item.id ? 'bg-primary text-on-primary shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                  <item.icon size={20} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {selectedProject && (
          <div className="px-6 py-4 border-t border-border">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Project Actions</h3>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setSelectedProject && setSelectedProject(null)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                  <FolderOpen size={20} />
                  Switch Project
                </button>
              </li>
              {(userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER) && (
                <>
                  <li>
                    <button onClick={() => handleEditProject(selectedProject)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Save size={20} />
                      Edit Project
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleDeleteProject(selectedProject.id)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500">
                      <Trash2 size={20} />
                      Delete Project
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-text">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
            {selectedProject && <span className="text-lg font-normal text-gray-500 ml-4">{selectedProject.name}</span>}
          </div>
          <div className="flex items-center gap-6">
             {userName && <span className="text-text text-sm font-medium">Hello, {userName}</span>}
             <ThemeToggle />
             <button onClick={() => setIsAIModalOpen(true)} className="btn btn-primary flex items-center gap-2">
               <Bot size={20} />
               <span className="hidden sm:inline">AI Assistant</span>
             </button>
             <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-full mx-auto">
            {renderContent()}
          </div>
        </div>
        
        {isAIModalOpen && selectedProject && <AIChatModal project={selectedProject} onClose={() => setIsAIModalOpen(false)} />}
        {isEditModalOpen && editingProject && (
           <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-surface rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-border">
               <h3 className="text-xl font-bold text-text">Edit Project</h3>
             </div>
             <div className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                 <input type="text" value={editingProject.name} onChange={(e) => setEditingProject({...editingProject, name: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">Client</label>
                 <input type="text" value={editingProject.client} onChange={(e) => setEditingProject({...editingProject, client: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                 <input type="text" value={editingProject.location} onChange={(e) => setEditingProject({...editingProject, location: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">Contract No</label>
                 <input type="text" value={editingProject.contractNo} onChange={(e) => setEditingProject({...editingProject, contractNo: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                 <input type="date" value={editingProject.startDate} onChange={(e) => setEditingProject({...editingProject, startDate: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                 <input type="date" value={editingProject.endDate} onChange={(e) => setEditingProject({...editingProject, endDate: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
               </div>
             </div>
             <div className="p-6 border-t border-border flex gap-4">
               <button onClick={handleSaveEditProject} className="btn btn-primary flex-1">
                 <Save size={18} /> Save Changes
               </button>
               <button onClick={() => { setIsEditModalOpen(false); setEditingProject(null); }} className="btn flex-1">Cancel</button>
             </div>
           </div>
         </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ProjectProvider>
      <AppWrapper />
    </ProjectProvider>
  );
}

export default App;