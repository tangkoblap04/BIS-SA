import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/user.service';

export default function AddUser() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        position: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const backendHealth = await fetch('http://localhost:8080/api/health').catch(() => null);
            if (!backendHealth) {
                throw new Error('ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบการเชื่อมต่อ');
            }

            if (formData.password.length < 6) {
                throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            }

            const response = await userService.createUser(formData);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'employee',
                position: ''
            });

            setTimeout(() => setSuccess(false), 3000);
            console.log('User created successfully:', response);
        } catch (error) {
            console.error('Error creating user:', error);
            setError(error.message || 'ไม่สามารถเพิ่มผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">เพิ่มผู้ใช้งานใหม่</h1>
                <p className="text-sm text-gray-600">กรอกข้อมูลผู้ใช้งานเพื่อสร้างบัญชีใหม่ในระบบ</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            ชื่อ-นามสกุล
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="กรอกชื่อ-นามสกุล"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            อีเมล
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="example@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            รหัสผ่าน
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                        />
                        <p className="mt-1 text-xs text-gray-500">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                            บทบาท
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            required
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            <option value="employee">พนักงาน (Employee)</option>
                            <option value="HR">HR (Human Resources)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                            ตำแหน่ง
                            {formData.role === 'employee' && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <select
                            id="position"
                            name="position"
                            required={formData.role === 'employee'}
                            value={formData.position}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            disabled={formData.role === 'HR'}
                        >
                            <option value="">-- เลือกตำแหน่ง --</option>
                            <option value="Manager">Manager (ผู้จัดการ)</option>
                            <option value="Waiter">Waiter (พนักงานเสิร์ฟ)</option>
                            <option value="Barista">Barista (บาริสต้า)</option>
                            <option value="Cashier">Cashier (แคชเชียร์)</option>
                            <option value="Service">Service (พนักงานบริการ)</option>
                        </select>
                        {formData.role === 'employee' && (
                            <p className="mt-1 text-xs text-gray-500">เลือกตำแหน่งงานของพนักงาน</p>
                        )}
                        {formData.role === 'HR' && (
                            <p className="mt-1 text-xs text-gray-500">HR ไม่ต้องระบุตำแหน่ง</p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-green-700">เพิ่มผู้ใช้สำเร็จ!</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md font-medium text-white ${loading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    กำลังดำเนินการ...
                                </>
                            ) : (
                                'เพิ่มผู้ใช้'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    คำแนะนำ
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                    <li>• กรอกข้อมูลให้ครบถ้วนและถูกต้อง</li>
                    <li>• รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษรเพื่อความปลอดภัย</li>
                    <li>• เลือกบทบาทที่เหมาะสม: พนักงานสำหรับผู้ใช้ทั่วไป, HR สำหรับผู้ดูแลระบบ</li>
                </ul>
            </div>
        </div>
    );
}
