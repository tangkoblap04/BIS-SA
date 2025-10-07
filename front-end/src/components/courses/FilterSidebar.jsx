import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

function FilterSidebar({ onFilterChange }) {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const roles = [
    { id: 'manager', label: 'ผู้จัดการ (Manager)' },
    { id: 'waiter', label: 'พนักงานเสิร์ฟ (Waiter)' },
    { id: 'cashier', label: 'แคชเชียร์ (Cashier)' },
    { id: 'service', label: 'บริการทั่วไป (Service)' }
  ];

  const handleRoleChange = (roleId) => {
    const updatedRoles = selectedRoles.includes(roleId)
      ? selectedRoles.filter(id => id !== roleId)
      : [...selectedRoles, roleId];
    
    setSelectedRoles(updatedRoles);
    onFilterChange(updatedRoles);
  };

  return (
    <div className="sticky top-4 bg-white rounded-lg shadow-md h-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-lg font-semibold text-gray-800 hover:bg-gray-50"
      >
        <span>ตำแหน่งการอบรม</span>
        <ChevronDownIcon 
          className={`w-5 h-5 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      {isOpen && (
        <div className="p-4 border-t border-gray-100 space-y-3">
          {roles.map(role => (
            <label
              key={role.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.id)}
                onChange={() => handleRoleChange(role.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-700 select-none">{role.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterSidebar;