import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Project } from '../types';
import seedProjects from '../database/projects.json';

const PROJECTS_FILE = 'projects.json';

export const loadProjects = async (): Promise<Project[]> => {
  try {
    const contents = await Filesystem.readFile({
      path: PROJECTS_FILE,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    return JSON.parse(contents.data);
  } catch (error) {
    console.warn('Could not read projects file, attempting to seed data.', error);
    try {
      await saveProjects(seedProjects);
      return seedProjects;
    } catch (seedError) {
      console.error('Error seeding projects data', seedError);
      return [];
    }
  }
};

export const saveProjects = async (projects: Project[]) => {
  try {
    await Filesystem.writeFile({
      path: PROJECTS_FILE,
      data: JSON.stringify(projects, null, 2),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
  } catch (error) {
    console.error('Error saving projects', error);
  }
};