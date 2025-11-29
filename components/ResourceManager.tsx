import React, { useState } from 'react';
import { Project, InventoryItem, InventoryTransaction, VehicleLog } from '../types';
import { Package, Truck, Plus, Fuel, Search, Trash2, AlertTriangle, Filter, Wrench, AlertOctagon, MapPin } from 'lucide-react';

interface Props {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

const ResourceManager: React.FC<Props> = ({ project, onProjectUpdate }) => {
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
      itemName: '', quantity: 0, unit: '', location: '', category: 'Materials', minStock: 0
  });
  const [transaction, setTransaction] = useState<Partial<InventoryTransaction>>({
      type: 'In',
      quantity: 0,
      transactionType: 'Purchase',
      date: new Date().toISOString().split('T')[0]
  });
  const [vehicleLog, setVehicleLog] = useState<Partial<VehicleLog>>({
      date: new Date().toISOString().split('T')[0],
      logType: 'Fuel'
  });
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
      plateNumber: '',
      type: '',
      driver: '',
      status: 'Active'
  });

  const handleAddInventory = (e: React.FormEvent) => {
      e.preventDefault();
      const item: InventoryItem = {
          id: `inv-${Date.now()}`,
          itemName: newItem.itemName || 'New Item',
          quantity: newItem.quantity || 0,
          unit: newItem.unit || 'Units',
          location: newItem.location || 'Store',
          category: newItem.category || 'Materials',
          minStock: newItem.minStock || 0,
          transactions: [],
          lastUpdated: new Date().toISOString().split('T')[0]
      };
      onProjectUpdate({
          ...project,
          inventory: [...project.inventory, item]
      });
      setIsInvModalOpen(false);
      setNewItem({ itemName: '', quantity: 0, unit: '', location: '', category: 'Materials', minStock: 0 });
  };

  const deleteInventoryItem = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      onProjectUpdate({
        ...project,
        inventory: project.inventory.filter(item => item.id !== id)
      });
    }
  };

  // Filter inventory items
  const filteredInventory = project.inventory.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const updateStock = (id: string, change: number) => {
      const updatedInv = project.inventory.map(item =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change), lastUpdated: new Date().toISOString().split('T')[0] } : item
      );
      onProjectUpdate({ ...project, inventory: updatedInv });
  };

  const updateVehicleStatus = (id: string, status: 'Active' | 'Maintenance' | 'Idle') => {
      const updatedVehicles = project.vehicles.map(v =>
        v.id === id ? { ...v, status } : v
      );
      onProjectUpdate({ ...project, vehicles: updatedVehicles });
  };

  const openTransactionModal = (itemId: string) => {
      setSelectedItemId(itemId);
      setTransaction({
          type: 'In',
          quantity: 0,
          transactionType: 'Purchase',
          date: new Date().toISOString().split('T')[0]
      });
      setIsTxnModalOpen(true);
  };

  const handleTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedItemId || !transaction.quantity || !transaction.type) return;

      const newTxn: InventoryTransaction = {
          id: `txn-${Date.now()}`,
          itemId: selectedItemId,
          date: transaction.date || new Date().toISOString().split('T')[0],
          type: transaction.type as 'In' | 'Out',
          quantity: transaction.quantity,
          billNo: transaction.billNo || undefined,
          vendor: transaction.vendor || undefined,
          clientOrContractor: transaction.clientOrContractor || undefined,
          transactionType: transaction.transactionType as 'Purchase' | 'Sale' | 'Issue' | 'Return',
          notes: transaction.notes || undefined,
      };

      const updatedInventory = project.inventory.map(item => {
          if (item.id === selectedItemId) {
              const qtyChange = transaction.type === 'In' ? transaction.quantity : -transaction.quantity;
              return {
                  ...item,
                  quantity: Math.max(0, item.quantity + qtyChange),
                  transactions: [...(item.transactions || []), newTxn],
                  lastUpdated: new Date().toISOString().split('T')[0]
              };
          }
          return item;
      });

      onProjectUpdate({ ...project, inventory: updatedInventory });
      setIsTxnModalOpen(false);
      setSelectedItemId('');
      setTransaction({ type: 'In', quantity: 0, transactionType: 'Purchase', date: new Date().toISOString().split('T')[0] });
  };

  const openLogModal = (vehicleId: string, logType: 'Fuel' | 'Trip' | 'Maintenance' | 'Incident') => {
      setSelectedVehicleId(vehicleId);
      setVehicleLog({
          date: new Date().toISOString().split('T')[0],
          logType: logType,
          fuel: logType === 'Fuel' ? { liters: 0, cost: 0, odometer: 0 } : undefined,
          trip: logType === 'Trip' ? { from: '', to: '', distance: 0, purpose: '', hours: 0 } : undefined,
          maintenance: logType === 'Maintenance' ? { description: '', cost: 0 } : undefined,
          incident: logType === 'Incident' ? { description: '', severity: 'Low', reportedBy: '' } : undefined
      });
      setIsLogModalOpen(true);
  };

  const handleLogEntry = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedVehicleId) return;

      const newLog: VehicleLog = {
          id: `log-${Date.now()}`,
          vehicleId: selectedVehicleId,
          date: vehicleLog.date || new Date().toISOString().split('T')[0],
          logType: vehicleLog.logType as 'Fuel' | 'Trip' | 'Maintenance' | 'Incident',
          fuel: vehicleLog.logType === 'Fuel' ? vehicleLog.fuel : undefined,
          trip: vehicleLog.logType === 'Trip' ? vehicleLog.trip : undefined,
          maintenance: vehicleLog.logType === 'Maintenance' ? vehicleLog.maintenance : undefined,
          incident: vehicleLog.logType === 'Incident' ? vehicleLog.incident : undefined,
          notes: vehicleLog.notes
      };

      const updatedVehicles = project.vehicles.map(vehicle => {
          if (vehicle.id === selectedVehicleId) {
              return {
                  ...vehicle,
                  logs: [...(vehicle.logs || []), newLog]
              };
          }
          return vehicle;
      });

      onProjectUpdate({ ...project, vehicles: updatedVehicles });
      setIsLogModalOpen(false);
      setSelectedVehicleId('');
      setVehicleLog({ date: new Date().toISOString().split('T')[0], logType: 'Fuel' });
  };

  const handleAddVehicle = (e: React.FormEvent) => {
      e.preventDefault();
      const vehicle: Vehicle = {
          id: `vh-${Date.now()}`,
          plateNumber: newVehicle.plateNumber || 'NEW-PLATE',
          type: newVehicle.type || 'Truck',
          status: newVehicle.status as 'Active' | 'Maintenance' | 'Idle',
          driver: newVehicle.driver || 'Unassigned',
          logs: []
      };
      onProjectUpdate({
          ...project,
          vehicles: [...project.vehicles, vehicle]
      });
      setIsVehicleModalOpen(false);
      setNewVehicle({ plateNumber: '', type: '', driver: '', status: 'Active' });
  };

  return (
    <div className="space-y-8">
      {/* Inventory Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <Package className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-800">Store Inventory</h2>
            </div>
            <button
                onClick={() => setIsInvModalOpen(true)}
                className="text-sm bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2"
            >
                <Plus size={16} /> Add Item
            </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                />
            </div>
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
                <option value="All">All Categories</option>
                <option value="Materials">Materials</option>
                <option value="Equipment">Equipment</option>
                <option value="Consumables">Consumables</option>
                <option value="Tools">Tools</option>
                <option value="Fuel">Fuel</option>
                <option value="Other">Other</option>
            </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredInventory.length === 0 ? (
            <div className="p-6 text-center text-slate-400">No inventory items match the current filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Item Name</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Current Stock</th>
                    <th className="px-6 py-3">Min Stock</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => {
                    const lowStock = item.minStock && item.quantity <= item.minStock;

                    return (
                      <tr key={item.id} className={`hover:bg-slate-50 ${lowStock ? 'bg-orange-50' : ''}`}>
                        <td className="px-6 py-4 font-semibold text-slate-800">{item.itemName}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{item.category}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{item.location}</td>
                        <td className="px-6 py-4">
                          <span className={`text-lg font-bold ${lowStock ? 'text-red-700' : 'text-slate-900'}`}>
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {item.minStock ? item.minStock : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {lowStock ? (
                            <div className="flex items-center gap-1 text-orange-700">
                              <AlertTriangle size={14} />
                              <span className="text-xs font-medium">Low Stock</span>
                            </div>
                          ) : (
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">In Stock</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openTransactionModal(item.id)}
                              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 flex items-center gap-1"
                            >
                              <Plus size={12} />
                              Record Transaction
                            </button>
                            <button
                              onClick={() => deleteInventoryItem(item.id)}
                              className="text-xs text-red-600 hover:text-red-700 p-1"
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Vehicles Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="text-orange-600" />
            <h2 className="text-xl font-bold text-slate-800">Vehicle Fleet</h2>
          </div>
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="text-sm bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-50 flex items-center gap-2"
          >
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {project.vehicles.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No vehicles assigned to this project.</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Vehicle No</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Driver</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Quick Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono text-slate-700">{v.plateNumber}</td>
                    <td className="px-6 py-3">{v.type}</td>
                    <td className="px-6 py-3 text-slate-600">{v.driver}</td>
                    <td className="px-6 py-3">
                       <select
                         value={v.status}
                         onChange={(e) => updateVehicleStatus(v.id, e.target.value as any)}
                         className={`
                            px-2 py-1 rounded-lg text-xs font-semibold border-none focus:ring-1 cursor-pointer outline-none
                            ${v.status === 'Active' ? 'bg-green-100 text-green-700 focus:ring-green-500' :
                              v.status === 'Maintenance' ? 'bg-red-100 text-red-700 focus:ring-red-500' : 'bg-slate-100 text-slate-600 focus:ring-slate-500'}
                         `}
                       >
                         <option value="Active">Active</option>
                         <option value="Maintenance">Maintenance</option>
                         <option value="Idle">Idle</option>
                       </select>
                    </td>
                    <td className="px-6 py-3">
                       <div className="flex gap-1 justify-center">
                         <button onClick={() => openLogModal(v.id, 'Fuel')} className="p-1 hover:bg-blue-50 rounded" title="Log Fuel">
                           <Fuel size={16} className="text-blue-600" />
                         </button>
                         <button onClick={() => openLogModal(v.id, 'Trip')} className="p-1 hover:bg-green-50 rounded" title="Log Trip">
                           <MapPin size={16} className="text-green-600" />
                         </button>
                         <button onClick={() => openLogModal(v.id, 'Maintenance')} className="p-1 hover:bg-orange-50 rounded" title="Log Maintenance">
                           <Wrench size={16} className="text-orange-600" />
                         </button>
                         <button onClick={() => openLogModal(v.id, 'Incident')} className="p-1 hover:bg-red-50 rounded" title="Log Incident">
                           <AlertOctagon size={16} className="text-red-600" />
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
      </section>

       {/* Add Inventory Modal */}
       {isInvModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Inventory Item</h3>
             <form onSubmit={handleAddInventory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                  <input
                    required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    value={newItem.itemName} onChange={e => setNewItem({...newItem, itemName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Qty</label>
                        <input
                            required type="number" min="0" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                            value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                        <input
                            required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                            placeholder="e.g. Bags, Liters"
                            value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}
                        />
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Storage Location</label>
                  <input
                    required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                            value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value as InventoryItem['category']})}
                        >
                            <option value="Materials">Materials</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Consumables">Consumables</option>
                            <option value="Tools">Tools</option>
                            <option value="Fuel">Fuel</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock Level</label>
                        <input
                            type="number" min="0" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                            placeholder="Optional"
                            value={newItem.minStock} onChange={e => setNewItem({...newItem, minStock: Number(e.target.value) || 0})}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsInvModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Add Item</button>
                </div>
             </form>
          </div>
         </div>
      )}

      {/* Transaction Modal */}
      {isTxnModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Record Transaction</h3>
            <form onSubmit={handleTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="In"
                      checked={transaction.type === 'In'}
                      onChange={(e) => setTransaction({ ...transaction, type: e.target.value as 'In' | 'Out' })}
                      className="mr-2"
                    />
                    Stock In
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="Out"
                      checked={transaction.type === 'Out'}
                      onChange={(e) => setTransaction({ ...transaction, type: e.target.value as 'In' | 'Out' })}
                      className="mr-2"
                    />
                    Stock Out
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    required type="date" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    value={transaction.date} onChange={e => setTransaction({...transaction, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    required type="number" min="0" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    value={transaction.quantity} onChange={e => setTransaction({...transaction, quantity: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Category</label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={transaction.transactionType}
                  onChange={e => setTransaction({...transaction, transactionType: e.target.value as any})}
                >
                  <option value="Purchase">Purchase</option>
                  <option value="Sale">Sale</option>
                  <option value="Issue">Issue to Site</option>
                  <option value="Return">Return</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bill No</label>
                  <input
                    type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    value={transaction.billNo} onChange={e => setTransaction({...transaction, billNo: e.target.value})}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {transaction.transactionType === 'Purchase' ? 'Vendor' : 'Client/Contractor'}
                  </label>
                  <input
                    type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                    value={transaction.vendor || transaction.clientOrContractor}
                    onChange={e => setTransaction({...transaction,
                      vendor: transaction.transactionType === 'Purchase' ? e.target.value : undefined,
                      clientOrContractor: transaction.transactionType !== 'Purchase' ? e.target.value : undefined
                    })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  rows={2}
                  value={transaction.notes} onChange={e => setTransaction({...transaction, notes: e.target.value})}
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsTxnModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Record Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Log Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Log {vehicleLog.logType} Entry
            </h3>
            <form onSubmit={handleLogEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  required type="date" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={vehicleLog.date} onChange={e => setVehicleLog({...vehicleLog, date: e.target.value})}
                />
              </div>

              {vehicleLog.logType === 'Fuel' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Liters</label>
                    <input
                      required type="number" step="0.01" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={vehicleLog.fuel?.liters || 0}
                      onChange={e => setVehicleLog({...vehicleLog, fuel: {...vehicleLog.fuel!, liters: Number(e.target.value)}})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                    <input
                      required type="number" step="0.01" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={vehicleLog.fuel?.cost || 0}
                      onChange={e => setVehicleLog({...vehicleLog, fuel: {...vehicleLog.fuel!, cost: Number(e.target.value)}})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Odometer</label>
                    <input
                      required type="number" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={vehicleLog.fuel?.odometer || 0}
                      onChange={e => setVehicleLog({...vehicleLog, fuel: {...vehicleLog.fuel!, odometer: Number(e.target.value)}})}
                    />
                  </div>
                </div>
              )}

              {vehicleLog.logType === 'Trip' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                      <input
                        required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        value={vehicleLog.trip?.from || ''}
                        onChange={e => setVehicleLog({...vehicleLog, trip: {...vehicleLog.trip!, from: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                      <input
                        required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        value={vehicleLog.trip?.to || ''}
                        onChange={e => setVehicleLog({...vehicleLog, trip: {...vehicleLog.trip!, to: e.target.value}})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Distance (km)</label>
                      <input
                        required type="number" step="0.1" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        value={vehicleLog.trip?.distance || 0}
                        onChange={e => setVehicleLog({...vehicleLog, trip: {...vehicleLog.trip!, distance: Number(e.target.value)}})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                      <input
                        required type="number" step="0.1" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        value={vehicleLog.trip?.hours || 0}
                        onChange={e => setVehicleLog({...vehicleLog, trip: {...vehicleLog.trip!, hours: Number(e.target.value)}})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Purpose</label>
                    <input
                      required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={vehicleLog.trip?.purpose || ''}
                      onChange={e => setVehicleLog({...vehicleLog, trip: {...vehicleLog.trip!, purpose: e.target.value}})}
                    />
                  </div>
                </div>
              )}

              {vehicleLog.logType === 'Maintenance' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <input
                      required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={vehicleLog.maintenance?.description || ''}
                      onChange={e => setVehicleLog({...vehicleLog, maintenance: {...vehicleLog.maintenance!, description: e.target.value}})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                    <input
                      required type="number" step="0.01" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={vehicleLog.maintenance?.cost || 0}
                      onChange={e => setVehicleLog({...vehicleLog, maintenance: {...vehicleLog.maintenance!, cost: Number(e.target.value)}})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Next Service Date</label>
                    <input
                      type="date" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      value={vehicleLog.maintenance?.nextServiceDate || ''}
                      onChange={e => setVehicleLog({...vehicleLog, maintenance: {...vehicleLog.maintenance!, nextServiceDate: e.target.value}})}
                    />
                  </div>
                </div>
              )}

              {vehicleLog.logType === 'Incident' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      required className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      rows={3}
                      value={vehicleLog.incident?.description || ''}
                      onChange={e => setVehicleLog({...vehicleLog, incident: {...vehicleLog.incident!, description: e.target.value}})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                      <select
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        value={vehicleLog.incident?.severity || 'Low'}
                        onChange={e => setVehicleLog({...vehicleLog, incident: {...vehicleLog.incident!, severity: e.target.value as 'Low' | 'Medium' | 'High'}})}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Reported By</label>
                      <input
                        required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                        value={vehicleLog.incident?.reportedBy || ''}
                        onChange={e => setVehicleLog({...vehicleLog, incident: {...vehicleLog.incident!, reportedBy: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  rows={2}
                  value={vehicleLog.notes} onChange={e => setVehicleLog({...vehicleLog, notes: e.target.value})}
                  placeholder="Optional additional notes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Save Log Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Vehicle</h3>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number</label>
                <input
                  required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  placeholder="e.g. ABC-123, XYZ-456"
                  value={newVehicle.plateNumber} onChange={e => setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
                >
                  <option value="Truck">Truck</option>
                  <option value="Pickup">Pickup Truck</option>
                  <option value="Van">Van</option>
                  <option value="Excavator">Excavator</option>
                  <option value="Bulldozer">Bulldozer</option>
                  <option value="Roller">Roller</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Driver Name</label>
                <input
                  required type="text" className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                  placeholder="Driver's name or Unassigned"
                  value={newVehicle.driver} onChange={e => setNewVehicle({...newVehicle, driver: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsVehicleModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Add Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;
