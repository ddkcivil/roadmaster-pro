
export enum UserRole {
  ADMIN = 'Admin',
  PROJECT_MANAGER = 'Project Manager',
  SITE_ENGINEER = 'Site Engineer',
  SUPERVISOR = 'Supervisor',
  LAB_TECHNICIAN = 'Lab Technician'
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
}

export enum RFIStatus {
  OPEN = 'Open',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CLOSED = 'Closed'
}

export enum WorkCategory {
  EARTHWORK = 'Earthwork',
  PAVEMENT = 'Pavement',
  DRAINAGE = 'Drainage',
  STRUCTURES = 'Structures',
  FURNITURE = 'Road Furniture',
  GENERAL = 'General'
}

export interface BOQItem {
  id: string;
  itemNo: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  category: WorkCategory;
  completedQuantity: number;
}

export interface RFI {
  id: string;
  rfiNumber: string;
  date: string;
  location: string;
  description: string;
  status: RFIStatus;
  requestedBy: string;
  inspectionDate: string;
}

export interface LabTest {
  id: string;
  testName: string;
  sampleId: string;
  date: string;
  location: string;
  result: 'Pass' | 'Fail' | 'Pending';
  technician: string;
}

export interface ScheduleTask {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'On Track' | 'Delayed' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
  dependencies?: string[]; // IDs of dependent tasks
  assignedResources?: string[]; // IDs of resources (inventory items, vehicles, or personnel)
  estimatedDays?: number;
  actualDays?: number;
  associatedQuantity?: number; // For linking to BOQ quantities
  boqItemId?: string; // Optional: Links to a BOQItem by its ID
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  date: string;
  type: 'In' | 'Out'; // Quantity in or out
  quantity: number;
  billNo?: string; // Bill/Purchase order number
  vendor?: string; // Vendor/Supplier name
  clientOrContractor?: string; // Client/Contractor name for quantity out
  transactionType: 'Purchase' | 'Sale' | 'Issue' | 'Return'; // Type of transaction
  notes?: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  location: string;
  category: 'Materials' | 'Equipment' | 'Consumables' | 'Tools' | 'Fuel' | 'Other';
  minStock?: number; // minimum stock level for alerts
  lastUpdated: string;
  transactions: InventoryTransaction[]; // Transaction history
}

export interface VehicleLog {
  id: string;
  vehicleId: string;
  date: string;
  logType: 'Fuel' | 'Trip' | 'Maintenance' | 'Incident';
  fuel?: {
    liters: number;
    cost: number;
    odometer: number;
  };
  trip?: {
    from: string;
    to: string;
    distance: number;
    purpose: string;
    hours: number;
  };
  maintenance?: {
    description: string;
    cost: number;
    nextServiceDate?: string;
  };
  incident?: {
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    reportedBy: string;
  };
  notes?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  status: 'Active' | 'Maintenance' | 'Idle';
  driver: string;
  logs: VehicleLog[]; // Vehicle log history
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'XLSX';
  date: string;
  size: string;
  path: string;
}

export interface CorrespondenceItem {
  id: string;
  type: 'Incoming' | 'Outgoing';
  referenceNumber: string;
  date: string;
  subject: string;
  sender: string; // For outgoing: recipient
  file?: File;
  fileName?: string;
  fileSize?: string;
  extractedData?: {
    referenceNumber?: string;
    date?: string;
    subject?: string;
    sender?: string;
  };
  status: 'Draft' | 'Sent' | 'Received' | 'Archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyWorkItem {
  id: string;
  boqItemId: string;
  location: string; // e.g. Chainage 10+000 to 10+200
  quantity: number;
  description: string;
  links?: string[]; // For associated photo/doc links
}

export interface DailyReport {
  id: string;
  date: string;
  reportNumber: string;
  items: DailyWorkItem[];
  status: 'Draft' | 'Submitted' | 'Approved';
  submittedBy: string;
  approvedBy?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  client: string;
  engineer: string;
  contractor: string;
  engineerName: string;
  contractorName: string;
  contractNo: string;
  startDate: string;
  endDate: string;
  currency: string;
  boq: BOQItem[];
  rfis: RFI[];
  labTests: LabTest[];
  schedule: ScheduleTask[];
  inventory: InventoryItem[];
  vehicles: Vehicle[];
  documents: ProjectDocument[];
  correspondence: CorrespondenceItem[];
  dailyReports: DailyReport[];
}
