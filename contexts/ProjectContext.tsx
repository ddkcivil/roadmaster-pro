import React, { createContext, useState, ReactNode } from 'react';
import { Project } from '../types';

interface ProjectContextType {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
}

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <ProjectContext.Provider value={{ selectedProject, setSelectedProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
