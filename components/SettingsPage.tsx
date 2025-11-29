import React, { useState } from 'react';
import { User, Bell, Database, DollarSign } from 'lucide-react';

interface SettingsPageProps {
  onCurrencyChange: (currency: string) => void;
  currentCurrency: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onCurrencyChange, currentCurrency }) => {
  const [currency, setCurrency] = useState(currentCurrency);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(e.target.value);
    onCurrencyChange(e.target.value);
  };

  return (
    <div className="container mx-auto">
      <div className="card">
        <h2 className="text-3xl font-bold mb-8">Settings</h2>

        <div className="space-y-10">
          {/* Currency Settings */}
          <div className="border-b border-border pb-8">
            <div className="flex items-center gap-4 mb-6">
              <DollarSign size={28} className="text-primary" />
              <h3 className="text-2xl font-semibold">Currency</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Currency</label>
              <select value={currency} onChange={handleCurrencyChange} className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text focus:ring-2 focus:ring-primary">
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="₹">INR (₹)</option>
              </select>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="border-b border-border pb-8">
            <div className="flex items-center gap-4 mb-6">
              <User size={28} className="text-primary" />
              <h3 className="text-2xl font-semibold">Profile</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                <input type="text" value="project.manager" disabled className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input type="email" value="manager@roadmaster.pro" disabled className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text" />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-b border-border pb-8">
            <div className="flex items-center gap-4 mb-6">
              <Bell size={28} className="text-primary" />
              <h3 className="text-2xl font-semibold">Notifications</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p>Enable email notifications for RFIs</p>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <p>Notify me when a task is delayed</p>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Database size={28} className="text-primary" />
              <h3 className="text-2xl font-semibold">Data Management</h3>
            </div>
            <div className="flex gap-4">
              <button className="btn btn-secondary">Export Data</button>
              <button className="btn">Import Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

// Basic styling for the toggle switch
const styles = `
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}
.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider {
  background-color: var(--primary);
}
input:focus + .slider {
  box-shadow: 0 0 1px var(--primary);
}
input:checked + .slider:before {
  transform: translateX(26px);
}
.slider.round {
  border-radius: 34px;
}
.slider.round:before {
  border-radius: 50%;
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
