import React from 'react';

function SimpleCoursePage() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">📚 หลักสูตรการอบรม</h1>

                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="text-6xl mb-4">🎓</div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">ระบบคอร์สออนไลน์</h2>
                    <p className="text-gray-600 mb-6">
                        หน้านี้กำลังอยู่ในระหว่างการพัฒนา เร็วๆ นี้จะมีคอร์สมากมายให้เลือกเรียน
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <div className="text-3xl mb-2">💼</div>
                            <h3 className="font-semibold text-blue-800">การจัดการ</h3>
                            <p className="text-blue-600 text-sm">หลักสูตรด้านการจัดการและภาวะผู้นำ</p>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg">
                            <div className="text-3xl mb-2">🤝</div>
                            <h3 className="font-semibold text-green-800">การบริการลูกค้า</h3>
                            <p className="text-green-600 text-sm">เทคนิคการให้บริการที่ประทับใจ</p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg">
                            <div className="text-3xl mb-2">⚙️</div>
                            <h3 className="font-semibold text-purple-800">เทคนิค</h3>
                            <p className="text-purple-600 text-sm">ทักษะเทคนิคและเครื่องมือการทำงาน</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            🔜 เร็วๆ นี้
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SimpleCoursePage;