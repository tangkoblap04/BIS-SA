function CourseFilter() {
  return (
    <div className="mb-6 flex flex-wrap gap-4">
      <input
        type="text"
        placeholder="ค้นหาหลักสูตร..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">ทุกหมวดหมู่</option>
        <option value="programming">การเขียนโปรแกรม</option>
        <option value="design">การออกแบบ</option>
        <option value="business">ธุรกิจ</option>
      </select>
      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        ค้นหา
      </button>
    </div>
  );
}

export default CourseFilter;