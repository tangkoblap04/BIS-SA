// courseService.js
import { authService } from './auth.service';

const BASE_URL = 'http://localhost:8080/api';

class CourseService {
    // สร้างคอร์สใหม่
    async createCourse(courseData) {
        try {
            const response = await fetch(`${BASE_URL}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify(courseData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create course');
            }

            return await response.json();
        } catch (error) {
            console.error('Create course error:', error);
            throw error;
        }
    }

    // ดึงข้อมูลคอร์สทั้งหมด
    async getAllCourses(userId = null) {
        try {
            let url = `${BASE_URL}/courses`;
            // If userId is provided, add it as query parameter for access filtering
            if (userId) {
                url += `?user_id=${userId}`;
            }

            const response = await fetch(url, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch courses');
            }

            return await response.json();
        } catch (error) {
            console.error('Get courses error:', error);
            throw error;
        }
    }

    // ดึงข้อมูลคอร์สตาม ID
    async getCourseById(courseId) {
        try {
            const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch course');
            }

            const data = await response.json();
            return data.course; // แกะข้อมูล course ออกมา
        } catch (error) {
            console.error('Get course error:', error);
            throw error;
        }
    }

    // อัปเดตคอร์ส
    async updateCourse(courseId, courseData) {
        try {
            const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify(courseData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update course');
            }

            return await response.json();
        } catch (error) {
            console.error('Update course error:', error);
            throw error;
        }
    }

    // ลบคอร์ส
    async deleteCourse(courseId) {
        try {
            const response = await fetch(`${BASE_URL}/courses/${courseId}`, {
                method: 'DELETE',
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete course');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete course error:', error);
            throw error;
        }
    }

    // ดึงข้อมูล course access (users who can access a course)
    async getCourseAccess(courseId) {
        try {
            const response = await fetch(`${BASE_URL}/courses/${courseId}/access`, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch course access');
            }

            return await response.json();
        } catch (error) {
            console.error('Get course access error:', error);
            throw error;
        }
    }

    // ดึงข้อมูล course positions (positions that can access a course)
    async getCoursePositions(courseId) {
        try {
            const response = await fetch(`${BASE_URL}/courses/${courseId}/positions`, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch course positions');
            }

            return await response.json();
        } catch (error) {
            console.error('Get course positions error:', error);
            throw error;
        }
    }

    // ดึงข้อมูล progress ของผู้ใช้
    async getUserProgress(userId) {
        try {
            const response = await fetch(`${BASE_URL}/users/${userId}/progress`, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch user progress');
            }

            return await response.json();
        } catch (error) {
            console.error('Get user progress error:', error);
            throw error;
        }
    }

    // อัปเดต progress ของผู้ใช้
    async updateUserProgress(courseId, progressData) {
        try {
            const response = await fetch(`${BASE_URL}/courses/${courseId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify(progressData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update progress');
            }

            return await response.json();
        } catch (error) {
            console.error('Update progress error:', error);
            throw error;
        }
    }
}

export const courseService = new CourseService();