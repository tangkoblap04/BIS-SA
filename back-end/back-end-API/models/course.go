package models

import (
	"time"
	"gorm.io/gorm"
)

type Course struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"not null"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Duration    int       `json:"duration"` // in minutes
	VideoURL    string    `json:"video_url" gorm:"column:video_url"`
	Visibility  string    `json:"visibility" gorm:"default:'all'"` // 'all', 'specific', 'position', 'hidden'
	CreatedBy   uint      `json:"created_by"`
	Creator     *User     `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CourseProgress struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"user_id" gorm:"not null"`
	CourseID   uint      `json:"course_id" gorm:"not null"`
	Progress   float64   `json:"progress" gorm:"default:0"` // 0-100
	Completed  bool      `json:"completed" gorm:"default:false"`
	StartedAt  time.Time `json:"started_at"`
	CompletedAt *time.Time `json:"completed_at"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	
	// Relations
	User       User      `json:"user" gorm:"foreignKey:UserID"`
	Course     Course    `json:"course" gorm:"foreignKey:CourseID"`
}