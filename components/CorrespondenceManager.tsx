import React, { useState } from 'react';
import { Project, CorrespondenceItem, ProjectDocument } from '../types';
import { Mail, MailOpen, FileText, Upload, Download, Eye, Edit2, Trash2, Plus, Send, Inbox, Archive } from 'lucide-react';
import { saveFile, loadFileAsBase64, deleteFile } from '../services/fileService';

interface Props {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

const safeResponseJson = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    }
  }
  return null;
};

const CorrespondenceManager: React.FC<Props> = ({ project, onProjectUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Incoming' | 'Outgoing'>('Incoming');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [newCorrespondence, setNewCorrespondence] = useState<Partial<CorrespondenceItem>>({
    type: 'Incoming',
    referenceNumber: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    sender: '',
    status: 'Draft',
    notes: ''
  });
  const [documents, setDocuments] = useState<ProjectDocument[]>(project.documents || []);

  const handleAddCorrespondence = (type: 'Incoming' | 'Outgoing') => {
    setModalType(type);
    setNewCorrespondence({
      type: type,
      referenceNumber: '',
      date: new Date().toISOString().split('T')[0],
      subject: '',
      sender: '',
      status: type === 'Incoming' ? 'Received' : 'Draft',
      notes: ''
    });
    setSelectedFile(null);
    setExtractionError(null);
    setIsModalOpen(true);
  };

  const extractCorrespondenceFromPDF = async (file: File): Promise<Partial<CorrespondenceItem>> => {
    setExtractionError(null);
    setExtractionLoading(true);
    try {
      // Mock extraction for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // Generate mock data based on file name and current date
      const fileName = file.name.toLowerCase().includes('invoice') ? 'Invoice' : 'Correspondence';

      return {
        referenceNumber: `REF-${Date.now().toString().slice(-4)}`,
        date: new Date().toISOString().split('T')[0],
        subject: `Sample ${fileName} Subject - ${file.name.replace(/\.[^/.]+$/, "")}`,
        sender: fileName === 'Invoice' ? 'Supplier Company Ltd.' : 'Client Engineering Dept.',
        notes: `This is extracted content from ${file.name}. Full content would include OCR-processed text from the uploaded PDF or Word document.`,
      };
    } catch (error: any) {
      setExtractionError(error.message || 'Extraction error');
      return {};
    } finally {
      setExtractionLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleExtractData = async () => {
    if (!selectedFile) return;

    // Perform extraction from backend API
    const extractedData = await extractCorrespondenceFromPDF(selectedFile);

    // Update form fields with extracted data, preserving type and status
    setNewCorrespondence(prev => ({
      ...prev,
      referenceNumber: extractedData.referenceNumber ?? prev.referenceNumber,
      date: extractedData.date ?? prev.date,
      subject: extractedData.subject ?? prev.subject,
      sender: extractedData.sender ?? prev.sender,
      notes: extractedData.notes ?? prev.notes,
    }));
  };

  const handleSaveCorrespondence = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!selectedFile) {
        alert('Please select a file');
        return;
      }

      const filePath = await saveFile(project.id, selectedFile);

      const newItem: CorrespondenceItem = {
        id: `corresp-${Date.now()}`,
        type: newCorrespondence.type as 'Incoming' | 'Outgoing',
        referenceNumber: newCorrespondence.referenceNumber!,
        date: newCorrespondence.date!,
        subject: newCorrespondence.subject!,
        sender: newCorrespondence.sender!,
        fileName: selectedFile.name,
        fileSize: `${(selectedFile.size / 1024).toFixed(2)} KB`,
        status: newCorrespondence.status!,
        notes: newCorrespondence.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedCorrespondence = [...(project.correspondence || []), newItem];

      const updatedProject = {
        ...project,
        correspondence: updatedCorrespondence,
      };

      onProjectUpdate(updatedProject);
      setIsModalOpen(false);
      setSelectedFile(null);
      setNewCorrespondence({
        type: 'Incoming',
        referenceNumber: '',
        date: new Date().toISOString().split('T')[0],
        subject: '',
        sender: '',
        status: 'Draft',
        notes: ''
      });

    } catch (error: any) {
      console.error('Error saving correspondence:', error);
      alert(`Error saving correspondence: ${error.message}`);
    }
  };

  const updateStatus = (id: string, status: CorrespondenceItem['status']) => {
    const updatedCorrespondence = (project.correspondence || []).map(item =>
      item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
    );

    onProjectUpdate({
      ...project,
      correspondence: updatedCorrespondence
    });
  };

  const deleteCorrespondence = (id: string) => {
    if (confirm("Are you sure you want to delete this correspondence?")) {
      onProjectUpdate({
        ...project,
        correspondence: (project.correspondence || []).filter(item => item.id !== id)
      });
    }
  };

  const handleViewDocument = async (path: string) => {
    try {
      const base64 = await loadFileAsBase64(path);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe src="${base64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    } catch (error) {
      console.error('Error viewing document', error);
    }
  };

  const handleDeleteDocument = async (id: string, path: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteFile(path);
        const updatedDocuments = documents.filter(doc => doc.id !== id);
        const updatedProject = {
          ...project,
          documents: updatedDocuments,
        };
        onProjectUpdate(updatedProject);
        setDocuments(updatedDocuments);
      } catch (error) {
        console.error('Error deleting document', error);
      }
    }
  };


  const filteredCorrespondence = project.correspondence || [];

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Documents and Correspondence</h2>
        </div>

        <button
          onClick={() => handleAddCorrespondence('Incoming')}
          className="text-base font-semibold bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 flex items-center gap-3 shadow-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-white"
          title="Click to add new correspondence"
        >
          <Plus size={20} />
          Add Correspondence
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 p-4 border-b border-slate-200">Documents</h3>
        {documents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p>No documents yet.</p>
            <p className="text-sm">Add documents using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{doc.name}</td>
                    <td className="px-6 py-4">{doc.type}</td>
                    <td className="px-6 py-4">{new Date(doc.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{doc.size}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleViewDocument(doc.path)} className="text-slate-400 hover:text-blue-600 p-1">
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id, doc.path)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={14} />
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

      {/* Correspondence Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 p-4 border-b border-slate-200">Correspondence</h3>
        {filteredCorrespondence.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Mail size={48} className="mx-auto mb-4 opacity-50" />
            <p>No correspondence records yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Ref Number</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Sender/Recipient</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">File</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCorrespondence.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.type === 'Incoming' ? (
                          <Inbox size={16} className="text-blue-600" />
                        ) : (
                          <Send size={16} className="text-green-600" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.type === 'Incoming'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">{item.referenceNumber}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={item.subject}>
                      {item.subject}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{item.sender}</td>
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item.id, e.target.value as CorrespondenceItem['status'])}
                        className={`text-xs px-2 py-1 rounded-full cursor-pointer border-none flex items-center gap-1 ${
                          item.status === 'Draft' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                          item.status === 'Sent' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                          item.status === 'Received' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                          'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                        title={`Status: ${item.status}`}
                      >
                        <option value="Draft">📝 Draft</option>
                        <option value="Sent">📤 Sent</option>
                        <option value="Received">📩 Received</option>
                        <option value="Archived">📦 Archived</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {item.fileName ? (
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-red-600" />
                          <span className="text-xs text-slate-600">{item.fileSize}</span>
                          <button className="text-slate-400 hover:text-blue-600">
                            <Eye size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No file</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="text-slate-400 hover:text-blue-600 p-1">
                          <Eye size={14} />
                        </button>
                        <button className="text-slate-400 hover:text-green-600 p-1">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteCorrespondence(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={14} />
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

      {/* Add/Edit Correspondence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Add {modalType} Correspondence
            </h3>

            <form onSubmit={handleSaveCorrespondence} className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={newCorrespondence.type}
                  onChange={(e) => setNewCorrespondence({...newCorrespondence, type: e.target.value as 'Incoming' | 'Outgoing'})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Incoming">Incoming</option>
                  <option value="Outgoing">Outgoing</option>
                </select>
              </div>

              {/* File Upload Section */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <span className="text-sm text-slate-600 hover:text-blue-600">
                    {selectedFile ? selectedFile.name : 'Click to upload a PDF or Word document'}
                  </span>
                </label>
                <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX files</p>
                {selectedFile && (
                  <>
                    <div className="flex items-center justify-between gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className={`text-${selectedFile.name.split('.').pop() === 'pdf' ? 'red' : 'blue'}-600`} />
                        <span className="text-sm text-slate-700">{selectedFile.name}</span>
                      </div>
                      {selectedFile.type.startsWith('application/pdf') || selectedFile.name.toLowerCase().endsWith('.pdf') || selectedFile.name.toLowerCase().endsWith('.doc') || selectedFile.name.toLowerCase().endsWith('.docx') ? (
                        <button
                          type="button"
                          onClick={handleExtractData}
                          disabled={extractionLoading}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          {extractionLoading ? 'Extracting...' : 'Extract Data'}
                        </button>
                      ) : null}
                    </div>
                    {extractionError && (
                      <div className="mt-2 text-sm text-red-600">{extractionError}</div>
                    )}
                  </>
                )}
              </div>

              {/* Extracted Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Reference Number</label>
                  <input
                    type="text"
                    value={newCorrespondence.referenceNumber}
                    onChange={(e) => setNewCorrespondence({...newCorrespondence, referenceNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newCorrespondence.date}
                    onChange={(e) => setNewCorrespondence({...newCorrespondence, date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Subject</label>
                <input
                  type="text"
                  value={newCorrespondence.subject}
                  onChange={(e) => setNewCorrespondence({...newCorrespondence, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">{newCorrespondence.type === 'Incoming' ? 'Sender' : 'Recipient'}</label>
                <input
                  type="text"
                  value={newCorrespondence.sender}
                  onChange={(e) => setNewCorrespondence({...newCorrespondence, sender: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={newCorrespondence.notes}
                  onChange={(e) => setNewCorrespondence({...newCorrespondence, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Save Correspondence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrespondenceManager;
