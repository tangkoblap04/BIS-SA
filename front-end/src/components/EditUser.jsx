import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { userService } from '../services/user.service';

function EditUser() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('id');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'employee',
        password: '' // Optional - only if changing password
    });

    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(userId || '');
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [changePassword, setChangePassword] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (selectedUserId) {
            fetchUserData(selectedUserId);
        }
    }, [selectedUserId]);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const data = await userService.getAllUsers();
            setUsers(data.users || data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('ไม่สามารถโหลดรายชื่อผู้ใช้ได้');
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchUserData = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const userData = await userService.getUserById(id);

            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                role: userData.role || 'employee',
                password: ''
            });
            setChangePassword(false);
        } catch (error) {
            console.error('Error fetching user:', error);
            setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (e) => {
        const id = e.target.value;
        setSelectedUserId(id);
        setSuccess(null);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedUserId) {
            setError('กรุณาเลือกผู้ใช้ที่ต้องการแก้ไข');
            return;
        }

        if (!formData.name || !formData.email) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const updateData = {
                name: formData.name,
                email: formData.email,
                role: formData.role
            };

            // Only include password if changing it
            if (changePassword && formData.password) {
                updateData.password = formData.password;
            }

            await userService.updateUser(selectedUserId, updateData);

            setSuccess('อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว');

            // Refresh user list
            await fetchUsers();

            // Clear password field
            setFormData(prev => ({ ...prev, password: '' }));
            setChangePassword(false);

            // Optional: Reset selection after update
            // setSelectedUserId('');
        } catch (error) {
            console.error('Error updating user:', error);
            setError(error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Just reset the form
        setFormData({
            name: '',
            email: '',
            role: 'employee',
            password: ''
        });
        setSelectedUserId('');
        setChangePassword(false);
        setError(null);
        setSuccess(null);
    };

    if (loadingUsers) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">แก้ไขข้อมูลผู้ใช้</h1>
                    <p className="mt-2 text-gray-600">เลือกผู้ใช้และแก้ไขข้อมูล</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* User Selection */}
                        <div>
                            <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-2">
                                เลือกผู้ใช้ที่ต้องการแก้ไข <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="userSelect"
                                value={selectedUserId}
                                onChange={handleUserSelect}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">-- เลือกผู้ใช้ --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email}) - {user.role === 'hr' ? 'HR' : 'พนักงาน'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedUserId && !loading && (
                            <>
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        ชื่อ-นามสกุล <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="กรอกชื่อ-นามสกุล"
                                        required
                                    />
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        อีเมล <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="example@company.com"
                                        required
                                    />
                                </div>

                                {/* Role Field */}
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                        ตำแหน่ง <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="employee">พนักงาน</option>
                                        <option value="HR">HR</option>
                                    </select>
                                </div>

                                {/* Change Password Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="changePassword"
                                        checked={changePassword}
                                        onChange={(e) => {
                                            setChangePassword(e.target.checked);
                                            if (!e.target.checked) {
                                                setFormData(prev => ({ ...prev, password: '' }));
                                            }
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-700">
                                        เปลี่ยนรหัสผ่าน
                                    </label>
                                </div>

                                {/* Password Field (conditional) */}
                                {changePassword && (
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            รหัสผ่านใหม่ <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="กรอกรหัสผ่านใหม่"
                                            required={changePassword}
                                            minLength="6"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-green-800">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {selectedUserId && !loading && (
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            กำลังบันทึก...
                                        </span>
                                    ) : (
                                        'บันทึกการแก้ไข'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={loading}
                                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-800">
                                <strong>หมายเหตุ:</strong> หากไม่ต้องการเปลี่ยนรหัสผ่าน ไม่จำเป็นต้องเลือก "เปลี่ยนรหัสผ่าน"
                                ระบบจะอัปเดตเฉพาะข้อมูลอื่นๆ เท่านั้น
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditUser;
