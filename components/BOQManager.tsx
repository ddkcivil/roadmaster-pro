
import React, { useState, useRef } from 'react';
import { UserRole, Project, BOQItem, WorkCategory } from '../types';
import { Edit2, Save, AlertCircle, History, X, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  userRole: UserRole;
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

const BOQManager: React.FC<Props> = ({ userRole, project, onProjectUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<number>(0);
  const [historyModalItem, setHistoryModalItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Permission check: Only PM and Site Engineer can update progress
  const canEdit = [UserRole.PROJECT_MANAGER, UserRole.SITE_ENGINEER].includes(userRole);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      // Helper to find column value with flexible name matching
      const getCol = (row: any, ...names: string[]) => {
        for (const name of names) {
          if (row[name] !== undefined) return row[name];
          // Check case-insensitive
          const key = Object.keys(row).find(k => k.toLowerCase().replace(/[\s_-]/g, '') === name.toLowerCase().replace(/[\s_-]/g, ''));
          if (key) return row[key];
        }
        return undefined;
      };

      const boqItems: BOQItem[] = jsonData.map((row) => ({
        id: generateId(),
        itemNo: String(getCol(row, 'ItemNo', 'Item No', 'Item_No', 'Item Number', 'SN', 'S.N.', 'No', 'No.') || ''),
        description: String(getCol(row, 'Description', 'Desc', 'Item Description', 'Work Description', 'Particulars') || ''),
        unit: String(getCol(row, 'Unit', 'Units', 'UOM') || ''),
        quantity: parseFloat(getCol(row, 'Quantity', 'Qty', 'Total Qty', 'Total Quantity')) || 0,
        rate: parseFloat(getCol(row, 'Rate', 'Unit Rate', 'Price', 'Unit Price')) || 0,
        category: (getCol(row, 'Category') && Object.values(WorkCategory).includes(getCol(row, 'Category') as WorkCategory)) ? getCol(row, 'Category') as WorkCategory : WorkCategory.GENERAL,
        completedQuantity: 0,
      }));

      onProjectUpdate({ ...project, boq: boqItems });
    };
    reader.readAsBinaryString(file);
  };

  const handleEditClick = (id: string, current: number) => {
    if (!canEdit) return;
    setEditingId(id);
    setEditVal(current);
  };

  const handleSave = (id: string) => {
    const updatedBoq = project.boq.map(item => 
      item.id === id ? { ...item, completedQuantity: editVal } : item
    );
    onProjectUpdate({ ...project, boq: updatedBoq });
    setEditingId(null);
  };

  const psItems = project.boq.filter(item => item.unit.toUpperCase() === 'PS');
  const nonPsItems = project.boq.filter(item => item.unit.toUpperCase() !== 'PS');

  const psTotal = psItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const nonPsTotal = nonPsItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  
  const vatAmount = nonPsTotal * 0.13;
  const grandTotal = psTotal + nonPsTotal + vatAmount;

  // Get history for a specific item
  const getItemHistory = (boqItemId: string) => {
    const history: any[] = [];
    project.dailyReports.forEach(report => {
       report.items.forEach(item => {
          if (item.boqItemId === boqItemId) {
             history.push({
                date: report.date,
                qty: item.quantity,
                location: item.location,
                reportNo: report.reportNumber
             });
          }
       });
    });
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div className="space-y-3 relative">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-green-700 transition-colors text-xs font-medium"
          >
            <Upload size={14} /> Import Excel
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">PS Amount</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">${psTotal.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">Other Than PS</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">${nonPsTotal.toLocaleString()}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700">
                <div className="text-slate-400 text-[10px] uppercase font-semibold">VAT (13%)</div>
                <div className="font-bold text-slate-800 dark:text-slate-200">${vatAmount.toLocaleString()}</div>
            </div>
            <div className="bg-blue-600 p-2 rounded-md text-white">
                <div className="text-blue-200 text-[10px] uppercase font-semibold">Grand Total</div>
                <div className="font-bold">${grandTotal.toLocaleString()}</div>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-2 py-2 whitespace-nowrap">Item</th>
                <th className="px-2 py-2">Description</th>
                <th className="px-2 py-2">Unit</th>
                <th className="px-2 py-2 text-right">Rate</th>
                <th className="px-2 py-2 text-right">Qty</th>
                <th className="px-2 py-2 text-right">Boq Amount</th> {/* New column header */}
                <th className="px-2 py-2 text-right">Done</th>
                <th className="px-2 py-2 text-right">Completed Amount</th> {/* Renamed column header */}
                <th className="px-2 py-2 text-center w-24">Progress</th>
                <th className="px-2 py-2 text-center">Act</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {project.boq.map((item) => {
                const percent = item.quantity > 0 ? Math.min(100, Math.round((item.completedQuantity / item.quantity) * 100)) : 0;
                const isEditing = editingId === item.id;
                const hasHistory = getItemHistory(item.id).length > 0;
                const boqAmount = item.quantity * item.rate; {/* Calculate BOQ Amount */}
                const completedAmount = item.completedQuantity * item.rate; {/* Calculate Completed Amount */}
                
                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-2 py-1.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{item.itemNo}</td>
                    <td className="px-2 py-1.5 text-slate-600 dark:text-slate-400">
                      <div className="line-clamp-1" title={item.description}>{item.description}</div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-slate-500 dark:text-slate-400">{item.unit}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-600 dark:text-slate-400">{item.rate.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-600 dark:text-slate-400">{item.quantity.toLocaleString()}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-600 dark:text-slate-400"> {/* New BOQ Amount column */}
                      ${boqAmount.toLocaleString()}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editVal}
                          onChange={(e) => setEditVal(Number(e.target.value))}
                          className="w-16 text-right border border-blue-400 rounded px-1 py-0.5 text-xs outline-none focus:ring-1 focus:ring-blue-200 dark:bg-slate-700 dark:border-blue-500"
                        />
                      ) : (
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{item.completedQuantity.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-slate-600 dark:text-slate-400"> {/* Updated Completed Amount column */}
                      ${completedAmount.toLocaleString()}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden w-14">
                          <div 
                            className={`h-full transition-all ${percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500 w-7 text-right">{percent}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center justify-center gap-0.5">
                        <button 
                          onClick={() => setHistoryModalItem(item.id)}
                          className={`p-1 rounded transition-colors ${hasHistory ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                          disabled={!hasHistory}
                          title="History"
                        >
                          <History size={14} />
                        </button>
                        {canEdit && (
                          isEditing ? (
                            <button onClick={() => handleSave(item.id)} className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 p-1 rounded transition-colors" title="Save">
                              <Save size={14} />
                            </button>
                          ) : (
                            <button onClick={() => handleEditClick(item.id, item.completedQuantity)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1 rounded transition-colors" title="Edit">
                              <Edit2 size={14} />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compact History Modal */}
      {historyModalItem && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Work History</h3>
                      <button onClick={() => setHistoryModalItem(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={16}/></button>
                  </div>
                  <div className="max-h-[50vh] overflow-y-auto">
                      <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase sticky top-0">
                              <tr>
                                  <th className="px-3 py-2">Date</th>
                                  <th className="px-3 py-2">Report</th>
                                  <th className="px-3 py-2">Location</th>
                                  <th className="px-3 py-2 text-right">Qty</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                              {getItemHistory(historyModalItem).map((h, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{h.date}</td>
                                      <td className="px-3 py-2 font-mono text-blue-600">{h.reportNo}</td>
                                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{h.location}</td>
                                      <td className="px-3 py-2 text-right font-medium text-green-600">+{h.qty}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default BOQManager;
