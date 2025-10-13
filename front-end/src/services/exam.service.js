// examService.js
import { authService } from './auth.service';

const BASE_URL = 'http://localhost:8080/api';

class ExamService {
    // ดึงข้อสอบทั้งหมดของ course
    async getExamsByCourseId(courseId) {
        try {
            const response = await fetch(`${BASE_URL}/exams/course/${courseId}`, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch exams');
            }

            const data = await response.json();
            return data.exams || [];
        } catch (error) {
            console.error('Get exams error:', error);
            throw error;
        }
    }

    // ส่งผลสอบ
    async submitExamResult(examResult) {
        try {
            const response = await fetch(`${BASE_URL}/exam-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify(examResult)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit exam result');
            }

            return await response.json();
        } catch (error) {
            console.error('Submit exam result error:', error);
            throw error;
        }
    }

    // ดึงคำตอบข้อสอบข้อเขียนตาม course ID
    async getWrittenExamAnswers(courseId) {
        try {
            const response = await fetch(`${BASE_URL}/written-exam-answers/${courseId}`, {
                headers: authService.getAuthHeader()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch written exam answers');
            }

            const data = await response.json();
            return data.answers || [];
        } catch (error) {
            console.error('Get written exam answers error:', error);
            throw error;
        }
    }
}

export const examService = new ExamService();