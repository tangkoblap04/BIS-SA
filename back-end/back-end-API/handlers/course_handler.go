package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetHealth handles health check endpoint
func GetHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

// GetCurrentUser handles getting current user info
func GetCurrentUser(c *gin.Context) {
	// Get user from context (set by auth middleware)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// GetCourse handles getting course details
func GetCourse(c *gin.Context) {
	courseID := c.Param("id")
	// TODO: Implement getting course details from database
	c.JSON(http.StatusOK, gin.H{
		"id":          courseID,
		"name":        "Sample Course",
		"description": "Sample course description",
	})
}

// GetUserProgress handles getting user's course progress
func GetUserProgress(c *gin.Context) {
	userID, _ := c.Get("userID")
	// TODO: Implement getting user progress from database
	c.JSON(http.StatusOK, gin.H{
		"user_id": userID,
		"progress": []gin.H{
			{
				"course_id": 1,
				"progress":  75,
			},
		},
	})
}

// CreateProgress handles creating new progress record
func CreateProgress(c *gin.Context) {
	var progress struct {
		CourseID int     `json:"course_id"`
		Progress float64 `json:"progress"`
	}

	if err := c.BindJSON(&progress); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement saving progress to database
	c.JSON(http.StatusCreated, progress)
}

// SubmitQuizResults handles quiz submission
func SubmitQuizResults(c *gin.Context) {
	var results struct {
		CourseID int     `json:"course_id"`
		Score    float64 `json:"score"`
		Answers  []struct {
			QuestionID int    `json:"question_id"`
			Answer     string `json:"answer"`
		} `json:"answers"`
	}

	if err := c.BindJSON(&results); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement saving quiz results to database
	c.JSON(http.StatusCreated, results)
}

// SubmitWrittenExam handles written exam submission
func SubmitWrittenExam(c *gin.Context) {
	var exam struct {
		CourseID int    `json:"course_id"`
		Answer   string `json:"answer"`
	}

	if err := c.BindJSON(&exam); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement saving written exam to database
	c.JSON(http.StatusCreated, exam)
}
