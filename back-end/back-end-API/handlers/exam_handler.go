package handlers

import (
	"database/sql"
	"net/http"
	"encoding/json"
	"time"

	"github.com/gin-gonic/gin"
)

var db *sql.DB

func SetDB(database *sql.DB) {
	db = database
}

// GetExamsByCourseID ดึงข้อสอบตาม Course ID
func GetExamsByCourseID(c *gin.Context) {
	courseID := c.Param("courseId")
	
	// Query exams
	examRows, err := db.Query(`
		SELECT id, course_id, title, type, description, created_at 
		FROM exams 
		WHERE course_id = $1 AND deleted_at IS NULL
	`, courseID)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch exams"})
		return
	}
	defer examRows.Close()

	var exams []map[string]interface{}
	
	for examRows.Next() {
		var exam struct {
			ID          int       `json:"id"`
			CourseID    int       `json:"course_id"`
			Title       string    `json:"title"`
			Type        string    `json:"type"`
			Description string    `json:"description"`
			CreatedAt   time.Time `json:"created_at"`
		}
		
		err := examRows.Scan(&exam.ID, &exam.CourseID, &exam.Title, &exam.Type, &exam.Description, &exam.CreatedAt)
		if err != nil {
			continue
		}

		// Query questions for this exam
		questionRows, err := db.Query(`
			SELECT id, question_text, question_type, options, correct_answer, points
			FROM questions 
			WHERE exam_id = $1 AND deleted_at IS NULL
		`, exam.ID)
		
		if err != nil {
			continue
		}

		var questions []map[string]interface{}
		for questionRows.Next() {
			var question struct {
				ID            int    `json:"id"`
				QuestionText  string `json:"question_text"`
				QuestionType  string `json:"question_type"`
				Options       string `json:"options"`
				CorrectAnswer string `json:"correct_answer"`
				Points        int    `json:"points"`
			}
			
			err := questionRows.Scan(&question.ID, &question.QuestionText, &question.QuestionType, 
				&question.Options, &question.CorrectAnswer, &question.Points)
			if err != nil {
				continue
			}
			
			// Parse options JSON for multiple choice questions
			var parsedOptions []string
			if question.QuestionType == "multiple_choice" && question.Options != "" {
				json.Unmarshal([]byte(question.Options), &parsedOptions)
			}
			
			questions = append(questions, map[string]interface{}{
				"id":             question.ID,
				"question":       question.QuestionText,
				"question_text":  question.QuestionText,
				"question_type":  question.QuestionType,
				"options":        parsedOptions,
				"correctAnswer":  question.CorrectAnswer,
				"points":         question.Points,
			})
		}
		questionRows.Close()

		examMap := map[string]interface{}{
			"id":          exam.ID,
			"course_id":   exam.CourseID,
			"title":       exam.Title,
			"type":        exam.Type,
			"description": exam.Description,
			"created_at":  exam.CreatedAt,
			"questions":   questions,
		}
		
		exams = append(exams, examMap)
	}

	c.JSON(http.StatusOK, gin.H{
		"exams": exams,
	})
}

// CreateExam สร้างข้อสอบใหม่
func CreateExam(c *gin.Context) {
	var examData struct {
		CourseID    int    `json:"course_id"`
		Title       string `json:"title"`
		Type        string `json:"type"`
		Description string `json:"description"`
		Questions   []struct {
			QuestionText  string   `json:"question_text"`
			QuestionType  string   `json:"question_type"`
			Options       []string `json:"options"`
			CorrectAnswer string   `json:"correct_answer"`
			Points        int      `json:"points"`
		} `json:"questions"`
	}

	if err := c.BindJSON(&examData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// สร้าง exam
	var examID int
	err := db.QueryRow(`
		INSERT INTO exams (course_id, title, type, description, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, NOW(), NOW()) 
		RETURNING id
	`, examData.CourseID, examData.Title, examData.Type, examData.Description).Scan(&examID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create exam"})
		return
	}

	// สร้าง questions
	for _, question := range examData.Questions {
		optionsJSON, _ := json.Marshal(question.Options)
		
		_, err := db.Exec(`
			INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, points, created_at, updated_at) 
			VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		`, examID, question.QuestionText, question.QuestionType, string(optionsJSON), question.CorrectAnswer, question.Points)
		
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create question"})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Exam created successfully",
		"exam_id": examID,
	})
}

// SubmitExamResult ส่งผลสอบ
func SubmitExamResult(c *gin.Context) {
	var examResult struct {
		UserID   int                    `json:"user_id"`
		CourseID int                    `json:"course_id"`
		ExamID   int                    `json:"exam_id"`
		Answers  map[string]interface{} `json:"answers"`
	}

	if err := c.BindJSON(&examResult); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert answers to JSON string
	answersJSON, err := json.Marshal(examResult.Answers)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process answers"})
		return
	}

	// คำนวณคะแนน (ตอนนี้ให้ 0 ก่อน สามารถปรับปรุงการคำนวณได้)
	score := 0.0

	var resultID int
	err = db.QueryRow(`
		INSERT INTO exam_results (user_id, course_id, exam_id, score, answers, created_at) 
		VALUES ($1, $2, $3, $4, $5, NOW()) 
		RETURNING id
	`, examResult.UserID, examResult.CourseID, examResult.ExamID, score, string(answersJSON)).Scan(&resultID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save exam result"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Exam submitted successfully",
		"result_id": resultID,
		"score": score,
	})
}
