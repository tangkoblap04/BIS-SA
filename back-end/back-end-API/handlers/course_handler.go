package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/tangkoblap04/BIS-SA/back-end/back-end-API/models"
	"gorm.io/gorm"
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

// CreateCourse handles creating new course
func CreateCourse(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			Title             string   `json:"title" binding:"required"`
			Description       string   `json:"description"`
			Category          string   `json:"category"`
			Duration          int      `json:"duration"`
			VideoURL          string   `json:"video_url"`
			Visibility        string   `json:"visibility"`
			SelectedUsers     []uint   `json:"selectedUsers"`
			SelectedPositions []string `json:"selectedPositions"`
			Quiz              struct {
				Questions []struct {
					ID            int      `json:"id"`
					Question      string   `json:"question"`
					Options       []string `json:"options"`
					CorrectAnswer int      `json:"correctAnswer"`
				} `json:"questions"`
			} `json:"quiz"`
			WrittenExam struct {
				Questions []struct {
					ID       string `json:"id"`
					Question string `json:"question"`
				} `json:"questions"`
			} `json:"writtenExam"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Get user ID from JWT token (assuming middleware sets it)
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		// Begin transaction
		tx := db.Begin()

		// Create course
		course := models.Course{
			Title:       req.Title,
			Description: req.Description,
			Category:    req.Category,
			Duration:    req.Duration,
			VideoURL:    req.VideoURL,
			Visibility:  req.Visibility,
			CreatedBy:   userID.(uint),
		}

		if err := tx.Create(&course).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
			return
		}

		// Handle course access by specific users
		if req.Visibility == "specific" && len(req.SelectedUsers) > 0 {
			for _, userID := range req.SelectedUsers {
				access := struct {
					CourseID  uint `gorm:"column:course_id"`
					UserID    uint `gorm:"column:user_id"`
					GrantedBy uint `gorm:"column:granted_by"`
				}{
					CourseID:  course.ID,
					UserID:    userID,
					GrantedBy: course.CreatedBy,
				}
				if err := tx.Table("course_access").Create(&access).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set course access"})
					return
				}
			}
		}

		// Handle course access by position
		if req.Visibility == "position" && len(req.SelectedPositions) > 0 {
			for _, position := range req.SelectedPositions {
				posAccess := struct {
					CourseID uint   `gorm:"column:course_id"`
					Position string `gorm:"column:position"`
				}{
					CourseID: course.ID,
					Position: position,
				}
				if err := tx.Table("course_positions").Create(&posAccess).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set course position access"})
					return
				}
			}
		}

		// Create multiple choice exam if quiz questions exist
		if len(req.Quiz.Questions) > 0 {
			mcExam := models.Exam{
				CourseID:    course.ID,
				Title:       "แบบทดสอบปรนัย",
				Type:        "multiple_choice",
				Description: "แบบทดสอบปรนัยสำหรับหลักสูตรนี้",
			}

			if err := tx.Create(&mcExam).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create multiple choice exam"})
				return
			}

			// Create quiz questions
			for _, q := range req.Quiz.Questions {
				if q.Question != "" { // Only create non-empty questions
					question := models.Question{
						ExamID:        mcExam.ID,
						QuestionText:  q.Question,
						QuestionType:  "multiple_choice",
						Options:       q.Options,
						CorrectAnswer: q.CorrectAnswer,
					}

					if err := tx.Create(&question).Error; err != nil {
						tx.Rollback()
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create quiz question"})
						return
					}
				}
			}
		}

		// Create written exam if written questions exist
		if len(req.WrittenExam.Questions) > 0 {
			writtenExam := models.Exam{
				CourseID:    course.ID,
				Title:       "แบบทดสอบเขียน",
				Type:        "written",
				Description: "แบบทดสอบเขียนสำหรับหลักสูตรนี้",
			}

			if err := tx.Create(&writtenExam).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create written exam"})
				return
			}

			// Create written questions
			for _, q := range req.WrittenExam.Questions {
				if q.Question != "" { // Only create non-empty questions
					question := models.Question{
						ExamID:       writtenExam.ID,
						QuestionText: q.Question,
						QuestionType: "written",
					}

					if err := tx.Create(&question).Error; err != nil {
						tx.Rollback()
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create written question"})
						return
					}
				}
			}
		}

		// Commit transaction
		tx.Commit()

		// Load creator info
		if err := db.Preload("Creator").First(&course, course.ID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load course creator"})
			return
		}

		c.JSON(http.StatusCreated, gin.H{
			"message": "Course created successfully",
			"course":  course,
		})
	}
}

// GetAllCourses handles getting all courses
func GetAllCourses(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var courses []models.Course
		
		if err := db.Preload("Creator").Find(&courses).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"courses": courses,
		})
	}
}

// GetCourseByID handles getting course by ID
func GetCourseByID(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
			return
		}

		var course models.Course
		if err := db.Preload("Creator").First(&course, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch course"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"course": course,
		})
	}
}

// UpdateCourse handles updating course
func UpdateCourse(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
			return
		}

		var req struct {
			Title             string   `json:"title"`
			Description       string   `json:"description"`
			Category          string   `json:"category"`
			Duration          int      `json:"duration"`
			VideoURL          string   `json:"video_url"`
			Visibility        string   `json:"visibility"`
			SelectedUsers     []uint   `json:"selectedUsers"`
			SelectedPositions []string `json:"selectedPositions"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var course models.Course
		if err := db.First(&course, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find course"})
			return
		}

		// Begin transaction
		tx := db.Begin()

		// Update course fields
		course.Title = req.Title
		course.Description = req.Description
		course.Category = req.Category
		course.Duration = req.Duration
		course.VideoURL = req.VideoURL
		course.Visibility = req.Visibility

		if err := tx.Save(&course).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update course"})
			return
		}

		// Delete existing course access and positions
		tx.Exec("DELETE FROM course_access WHERE course_id = ?", course.ID)
		tx.Exec("DELETE FROM course_positions WHERE course_id = ?", course.ID)

		// Handle course access by specific users
		if req.Visibility == "specific" && len(req.SelectedUsers) > 0 {
			for _, userID := range req.SelectedUsers {
				access := struct {
					CourseID  uint `gorm:"column:course_id"`
					UserID    uint `gorm:"column:user_id"`
					GrantedBy uint `gorm:"column:granted_by"`
				}{
					CourseID:  course.ID,
					UserID:    userID,
					GrantedBy: course.CreatedBy,
				}
				if err := tx.Table("course_access").Create(&access).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set course access"})
					return
				}
			}
		}

		// Handle course access by position
		if req.Visibility == "position" && len(req.SelectedPositions) > 0 {
			for _, position := range req.SelectedPositions {
				posAccess := struct {
					CourseID uint   `gorm:"column:course_id"`
					Position string `gorm:"column:position"`
				}{
					CourseID: course.ID,
					Position: position,
				}
				if err := tx.Table("course_positions").Create(&posAccess).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set course position access"})
					return
				}
			}
		}

		// Commit transaction
		tx.Commit()

		c.JSON(http.StatusOK, gin.H{
			"message": "Course updated successfully",
			"course":  course,
		})
	}
}

// DeleteCourse handles deleting course
func DeleteCourse(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
			return
		}

		if err := db.Delete(&models.Course{}, id).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Course deleted successfully",
		})
	}
}

// GetCoursePositions handles getting positions that can access a course
func GetCoursePositions(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		courseID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
			return
		}

		var positions []struct {
			Position string `gorm:"column:position"`
		}

		if err := db.Table("course_positions").
			Where("course_id = ?", courseID).
			Select("position").
			Find(&positions).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch course positions"})
			return
		}

		// Extract position strings
		positionList := make([]string, len(positions))
		for i, p := range positions {
			positionList[i] = p.Position
		}

		c.JSON(http.StatusOK, gin.H{
			"positions": positionList,
		})
	}
}
