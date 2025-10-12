import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

function FilterSidebar({ onFilterChange }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  const categories = [
    { id: 'management', label: 'การจัดการ' },
    { id: 'customer-service', label: 'การบริการลูกค้า' },
    { id: 'technical', label: 'เทคนิค' },
    { id: 'soft-skills', label: 'ทักษะส่วนบุคคล' },
    { id: 'compliance', label: 'การปฏิบัติตามกฎระเบียบ' }
  ];

  const handleCategoryChange = (categoryId) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedCategories);
    onFilterChange(updatedCategories);
  };

  return (
    <div className="sticky top-4 bg-white rounded-lg shadow-md h-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-lg font-semibold text-gray-800 hover:bg-gray-50"
      >
        <span>หมวดหมู่คอร์ส</span>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
            }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-100 space-y-3">
          {categories.map(category => (
            <label
              key={category.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-gray-700 select-none">{category.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterSidebar;