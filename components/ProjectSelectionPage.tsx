import React, { useState, useContext } from 'react';
import { Project } from '../types';
import { saveProjects } from '../services/dataService';
import { ProjectContext } from '../contexts/ProjectContext';
import { Building, User, HardHat, Plus, Save } from 'lucide-react';

interface Props {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const ProjectSelectionPage: React.FC<Props> = ({ projects, setProjects }) => {
  const projectContext = useContext(ProjectContext);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({
    name: '',
    code: '',
    location: '',
    client: '',
    engineer: '',
    contractor: '',
    contractNo: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    currency: '$',
  });

  if (!projectContext) {
    return null;
  }

  const { setSelectedProject } = projectContext;

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleAddProject = () => {
    setIsAddProjectModalOpen(true);
  };

  const handleSaveNewProject = () => {
    if (newProjectData.name && newProjectData.code) {
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: newProjectData.name!,
        code: newProjectData.code!,
        location: newProjectData.location || 'Unknown',
        client: newProjectData.client || 'Unknown',
        engineer: newProjectData.engineer || 'Unknown',
        contractor: newProjectData.contractor || 'Unknown',
        engineerName: newProjectData.engineerName || 'Unknown',
        contractorName: newProjectData.contractorName || 'Unknown',
        contractNo: newProjectData.contractNo || 'N/A',
        startDate: newProjectData.startDate!,
        endDate: newProjectData.endDate!,
        currency: newProjectData.currency || '$',
        boq: [],
        rfis: [],
        labTests: [],
        schedule: [],
        inventory: [],
        vehicles: [],
        documents: [],
        correspondence: [],
        dailyReports: [],
      };
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
      setIsAddProjectModalOpen(false);
      setNewProjectData({ name: '', code: '', location: '', client: '', engineer: '', contractor: '', contractNo: '', startDate: new Date().toISOString().split('T')[0], endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] });
      setSelectedProject(newProject);
    } else {
      alert("Please fill in Project Name and Code.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-extrabold mb-10">Select a Project</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-gray-800 rounded-2xl shadow-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:bg-indigo-600"
            onClick={() => handleProjectSelect(project)}
          >
            <div className="flex items-center mb-4">
              <Building size={24} className="text-indigo-400 mr-4" />
              <h2 className="text-2xl font-bold">{project.name}</h2>
            </div>
            <div className="space-y-3 text-lg">
              <div className="flex items-center">
                <User size={20} className="text-gray-400 mr-3" />
                <span><span className="font-semibold">Engineer:</span> {project.engineerName}</span>
              </div>
              <div className="flex items-center">
                <HardHat size={20} className="text-gray-400 mr-3" />
                <span><span className="font-semibold">Contractor:</span> {project.contractorName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <button onClick={handleAddProject} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Add New Project</span>
        </button>
      </div>
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-border">
            <h3 className="text-xl font-bold text-text">Add New Project</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
              <input type="text" value={newProjectData.name} onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Project Code</label>
              <input type="text" value={newProjectData.code} onChange={(e) => setNewProjectData({...newProjectData, code: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
              <input type="text" value={newProjectData.location} onChange={(e) => setNewProjectData({...newProjectData, location: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Client</label>
              <input type="text" value={newProjectData.client} onChange={(e) => setNewProjectData({...newProjectData, client: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Engineer</label>
              <input type="text" value={newProjectData.engineerName} onChange={(e) => setNewProjectData({...newProjectData, engineerName: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Contractor</label>
              <input type="text" value={newProjectData.contractorName} onChange={(e) => setNewProjectData({...newProjectData, contractorName: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
              <input type="date" value={newProjectData.startDate} onChange={(e) => setNewProjectData({...newProjectData, startDate: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
              <input type="date" value={newProjectData.endDate} onChange={(e) => setNewProjectData({...newProjectData, endDate: e.target.value})} className="w-full px-4 py-2 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="p-6 border-t border-border flex gap-4">
            <button onClick={handleSaveNewProject} className="btn btn-primary flex-1">
              <Save size={18} /> Create Project
            </button>
            <button onClick={() => setIsAddProjectModalOpen(false)} className="btn flex-1">Cancel</button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ProjectSelectionPage;
