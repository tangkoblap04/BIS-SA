// userService.js
import { authService } from './auth.service';

const BASE_URL = 'http://localhost:8080/api';

class UserService {
    // เพิ่มผู้ใช้ใหม่
    async createUser(userData) {
        try {
            const response = await fetch(`${BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create user');
            }

            return await response.json();
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับ HR)
    async getAllUsers() {
        try {
            const response = await fetch(`${BASE_URL}/users`, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch users');
            }

            return await response.json();
        } catch (error) {
            console.error('Get users error:', error);
            throw error;
        }
    }

    // ดึงข้อมูลผู้ใช้ตาม ID
    async getUserById(userId) {
        try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch user');
            }

            return await response.json();
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }

    // อัพเดทข้อมูลผู้ใช้
    async updateUser(userId, userData) {
        try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update user');
            }

            return await response.json();
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }

    // ลบผู้ใช้
    async deleteUser(userId) {
        try {
            const response = await fetch(`${BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete user');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }
}

export const userService = new UserService();