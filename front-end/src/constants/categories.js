// Shared categories for courses
export const COURSE_CATEGORIES = [
    { value: 'management', label: 'การจัดการ', icon: '📊' },
    { value: 'customer-service', label: 'การบริการลูกค้า', icon: '🤝' },
    { value: 'technical', label: 'เทคนิค', icon: '⚙️' },
    { value: 'soft-skills', label: 'ทักษะส่วนบุคคล', icon: '💡' },
    { value: 'compliance', label: 'การปฏิบัติตามกฎระเบียบ', icon: '📋' }
];

// Helper function to get category label
export const getCategoryLabel = (categoryValue) => {
    const category = COURSE_CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
};

// Helper function to get category icon
export const getCategoryIcon = (categoryValue) => {
    const category = COURSE_CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.icon : '📚';
};
