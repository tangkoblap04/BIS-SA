import { authService } from './auth.service';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class DashboardService {
    async getDashboardData(userId) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Add JWT token if authenticated
            const token = authService.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${BASE_URL}/dashboard/${userId}`, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch dashboard data');
            }

            return await response.json();
        } catch (error) {
            console.error('Dashboard service error:', error);
            throw error;
        }
    }

    async updateCourseProgress(userId, courseId, progress) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            // Add JWT token if authenticated
            const token = authService.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${BASE_URL}/course-progress`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    user_id: parseInt(userId),
                    course_id: parseInt(courseId),
                    progress: parseFloat(progress)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update course progress');
            }

            return await response.json();
        } catch (error) {
            console.error('Update progress service error:', error);
            throw error;
        }
    }

    // Helper method to calculate total learning hours from courses
    calculateLearningStats(courses) {
        if (!courses || courses.length === 0) {
            return {
                totalHours: 0,
                completedHours: 0,
                completedCourses: 0,
                inProgressCourses: 0
            };
        }

        let totalHours = 0;
        let completedHours = 0;
        let completedCourses = 0;
        let inProgressCourses = 0;

        courses.forEach(course => {
            const hours = course.duration / 60; // Convert minutes to hours
            totalHours += hours;
            completedHours += hours * (course.progress / 100);

            if (course.progress >= 100) {
                completedCourses++;
            } else if (course.progress > 0) {
                inProgressCourses++;
            }
        });

        return {
            totalHours: Math.round(totalHours),
            completedHours: Math.round(completedHours),
            completedCourses,
            inProgressCourses
        };
    }

    // Format dashboard data for UI components
    formatDashboardData(rawData) {
        if (!rawData) return null;

        return {
            user: rawData.user,
            stats: rawData.stats,
            courses: rawData.courses || [],
            recentExams: rawData.recent_exams || [],
            weeklyProgress: rawData.weekly_progress || [],
            achievements: rawData.achievements || []
        };
    }
}

export const dashboardService = new DashboardService();