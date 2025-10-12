package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// StringSlice is a custom type for handling []string in GORM
type StringSlice []string

// Value implements the driver.Valuer interface for database storage
func (s StringSlice) Value() (driver.Value, error) {
	if len(s) == 0 {
		return nil, nil
	}
	return json.Marshal(s)
}

// Scan implements the sql.Scanner interface for database retrieval
func (s *StringSlice) Scan(value interface{}) error {
	if value == nil {
		*s = StringSlice{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, s)
	case string:
		return json.Unmarshal([]byte(v), s)
	default:
		return fmt.Errorf("cannot scan %T into StringSlice", value)
	}
}

// Exam represents an exam in the system
type Exam struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	CourseID    uint           `json:"course_id" gorm:"not null"`
	Title       string         `json:"title" gorm:"not null"`
	Type        string         `json:"type" gorm:"not null"` // "multiple_choice" or "written"
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relationships
	Course    Course     `json:"course" gorm:"foreignKey:CourseID"`
	Questions []Question `json:"questions" gorm:"foreignKey:ExamID"`
}

// Question represents a question in an exam
type Question struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	ExamID        uint           `json:"exam_id" gorm:"not null"`
	QuestionText  string         `json:"question" gorm:"column:question_text;not null"`
	QuestionType  string         `json:"type" gorm:"not null"` // "multiple_choice" or "written"
	Options       StringSlice    `json:"options" gorm:"type:json"`
	CorrectAnswer int            `json:"correctAnswer" gorm:"column:correct_answer"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at" gorm:"index"`

	// Relationships
	Exam Exam `json:"exam" gorm:"foreignKey:ExamID"`
}