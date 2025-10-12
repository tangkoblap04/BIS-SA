package models

import (
	"time"
	"gorm.io/gorm"
)

// Exam model สำหรับเก็บข้อสอบ
type Exam struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	CourseID    uint      `json:"course_id" gorm:"not null"`
	Title       string    `json:"title" gorm:"not null"`
	Type        string    `json:"type" gorm:"not null"` // "multiple_choice" หรือ "written"
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relations
	Course    Course     `json:"course" gorm:"foreignKey:CourseID"`
	Questions []Question `json:"questions" gorm:"foreignKey:ExamID"`
}

// Question model สำหรับเก็บคำถาม
type Question struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	ExamID        uint      `json:"exam_id" gorm:"not null"`
	QuestionText  string    `json:"question_text" gorm:"not null"`
	QuestionType  string    `json:"question_type" gorm:"not null"` // "multiple_choice" หรือ "written"
	Options       string    `json:"options"` // JSON string สำหรับตัวเลือก (สำหรับ multiple choice)
	CorrectAnswer string    `json:"correct_answer"` // คำตอบที่ถูกต้อง
	Points        int       `json:"points" gorm:"default:1"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relations
	Exam Exam `json:"exam" gorm:"foreignKey:ExamID"`
}

type ExamResult struct {
	ID       int     `json:"id"`
	UserID   int     `json:"user_id"`
	CourseID int     `json:"course_id"`
	ExamID   int     `json:"exam_id"`
	Score    float64 `json:"score"`
	Answers  string  `json:"answers"`
	CreatedAt time.Time `json:"created_at"`
	
	// Relations
	User   User   `json:"user" gorm:"foreignKey:UserID"`
	Course Course `json:"course" gorm:"foreignKey:CourseID"`
	Exam   Exam   `json:"exam" gorm:"foreignKey:ExamID"`
}
