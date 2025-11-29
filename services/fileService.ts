import { Filesystem, Directory } from '@capacitor/filesystem';

export const saveFile = async (projectId: string, file: File): Promise<string> => {
  const fileName = `${Date.now()}_${file.name}`;
  const path = `documents/${projectId}/${fileName}`;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    reader.onloadend = async () => {
      try {
        await Filesystem.writeFile({
          path,
          data: reader.result as string,
          directory: Directory.Data,
          recursive: true
        });
        resolve(path);
      } catch (error) {
        console.error('Error saving file', error);
        reject(error);
      }
    };
  });
};

export const loadFileAsBase64 = async (path: string): Promise<string> => {
  try {
    const contents = await Filesystem.readFile({
      path,
      directory: Directory.Data,
    });
    return `data:application/octet-stream;base64,${contents.data}`;
  } catch (error) {
    console.error('Error loading file', error);
    throw error;
  }
};

export const deleteFile = async (path: string): Promise<void> => {
    try {
        await Filesystem.deleteFile({
            path,
            directory: Directory.Data,
        });
    } catch (error) {
        console.error('Error deleting file', error);
        throw error;
    }
};
