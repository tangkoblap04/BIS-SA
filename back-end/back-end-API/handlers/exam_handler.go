package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func SubmitExam(c *gin.Context) {
	var examResult struct {
		CourseID int      `json:"course_id"`
		Answers  []string `json:"answers"`
	}

	if err := c.BindJSON(&examResult); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Save exam result to database

	c.JSON(http.StatusOK, gin.H{
		"message": "Exam submitted successfully",
		"data":    examResult,
	})
}
