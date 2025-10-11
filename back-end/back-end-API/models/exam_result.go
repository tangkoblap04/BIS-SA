package models

type ExamResult struct {
	ID       int     `json:"id"`
	UserID   int     `json:"user_id"`
	CourseID int     `json:"course_id"`
	Score    float64 `json:"score"`
	Answers  string  `json:"answers"`
}
