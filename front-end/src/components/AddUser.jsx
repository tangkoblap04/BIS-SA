import React, { useState } from 'react';
import { userService } from '../services/user.service';

export default function AddUser() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'employee' // ค่าเริ่มต้นเป็น employee
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
            // Check if backend is running
            const backendHealth = await fetch('http://localhost:8080/api/health').catch(() => null);
            if (!backendHealth) {
                throw new Error('ไม่สามารถเชื่อมต่อกับ server ได้ กรุณาตรวจสอบการเชื่อมต่อ');
            }

            // Validate password
            if (formData.password.length < 6) {
                throw new Error('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            }

            const response = await userService.createUser(formData);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'employee'
            });
            console.log('User created successfully:', response);
        } catch (error) {
            console.error('Error creating user:', error);
            setError(error.message || 'ไม่สามารถเพิ่มผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full mx-auto">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    เพิ่มผู้ใช้ใหม่
                </h2>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                ชื่อ-นามสกุล
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="ชื่อ-นามสกุล"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                อีเมล
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                รหัสผ่าน
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="รหัสผ่าน"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                บทบาท
                            </label>
                            <select
                                id="role"
                                name="role"
                                required
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="employee">พนักงาน</option>
                                <option value="HR">HR</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="text-green-500 text-sm text-center">
                            เพิ่มผู้ใช้สำเร็จ
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                            {loading ? 'กำลังดำเนินการ...' : 'เพิ่มผู้ใช้'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}