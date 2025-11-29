import React, { useState } from 'react';
import { Project, UserRole } from '../types';
import { Search, Plus, Trash2, Edit, CheckCircle } from 'lucide-react';

interface Props {
  projects: Project[];
  userRole: UserRole;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectsList: React.FC<Props> = ({ projects, userRole, onAddProject, onEditProject, onDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canDelete = userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER;

  return (
    <div className="container mx-auto">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, client, code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-lg bg-background border border-border text-text placeholder-gray-500 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button onClick={onAddProject} className="btn btn-primary mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto">
            <Plus size={20} /> New Project
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Client</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Engineer</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Contractor</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Start</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">End</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 text-center uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProjects.map(project => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-primary">
                    {project.name}
                    <div className="text-sm text-gray-400 font-normal">{project.location}</div>
                  </td>
                  <td className="px-6 py-4 text-text">{project.client}</td>
                  <td className="px-6 py-4 text-text">{project.engineerName}</td>
                  <td className="px-6 py-4 text-text">{project.contractorName}</td>
                  <td className="px-6 py-4 text-text">{project.startDate}</td>
                  <td className="px-6 py-4 text-text">{project.endDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onEditProject(project)} className="p-2 text-amber-500 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50" title="Edit">
                        <Edit size={18} />
                      </button>
                      {canDelete && (
                        <button onClick={() => onDeleteProject(project.id)} className="p-2 text-rose-500 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/50" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pt-6 flex justify-between items-center text-sm text-gray-500">
          <span>{filteredProjects.length} projects</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-lg border border-border bg-surface hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 text-sm">Prev</button>
            <button className="px-4 py-2 rounded-lg border border-border bg-surface hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProjectsList;
