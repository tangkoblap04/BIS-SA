package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	// Swagger imports
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/tangkoblap04/BIS-SA/back-end/back-end-API/docs"
)

var db *sql.DB

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func initDB() {
	var err error
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "postgres")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(20)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Retry connection with exponential backoff
	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		err = db.Ping()
		if err == nil {
			log.Println("Successfully connected to database")
			return
		}

		log.Printf("Failed to ping database (attempt %d/%d): %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			sleepTime := time.Duration(i+1) * 2 * time.Second
			log.Printf("Retrying in %v...", sleepTime)
			time.Sleep(sleepTime)
		}
	}

	log.Fatal("Failed to connect to database after all retries")
}

func main() {
	initDB()
	defer db.Close()

	r := gin.Default()

	// CORS configuration
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = false // Set to false when AllowAllOrigins is true
	r.Use(cors.New(config))

	// Health check endpoint
	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Routes
	api := r.Group("/api")
	{
		api.POST("/users", func(c *gin.Context) {
			var user struct {
				Name     string `json:"name"`
				Email    string `json:"email"`
				Password string `json:"password"`
				Role     string `json:"role"`
			}

			if err := c.BindJSON(&user); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Validate role
			if user.Role != "HR" && user.Role != "employee" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role. Must be 'HR' or 'employee'"})
				return
			}

			// Check if email already exists
			var existingCount int
			checkQuery := "SELECT COUNT(*) FROM users WHERE email = $1"
			err := db.QueryRow(checkQuery, user.Email).Scan(&existingCount)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
				return
			}
			if existingCount > 0 {
				c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
				return
			}

			query := `
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, $4)
                RETURNING id`

			var id int
			err = db.QueryRow(query, user.Name, user.Email, user.Password, user.Role).Scan(&id)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
				return
			}

			c.JSON(http.StatusCreated, gin.H{
				"id":      id,
				"name":    user.Name,
				"email":   user.Email,
				"role":    user.Role,
				"message": "User created successfully",
			})
		})

		// GET all users (for HR)
		api.GET("/users", func(c *gin.Context) {
			rows, err := db.Query(`
                SELECT id, name, email, role, created_at 
                FROM users 
                ORDER BY created_at DESC
            `)
			if err != nil {
				log.Printf("Error fetching users: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
				return
			}
			defer rows.Close()

			var users []map[string]interface{}
			for rows.Next() {
				var user struct {
					ID        int       `json:"id"`
					Name      string    `json:"name"`
					Email     string    `json:"email"`
					Role      string    `json:"role"`
					CreatedAt time.Time `json:"created_at"`
				}

				err := rows.Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)
				if err != nil {
					continue
				}

				users = append(users, map[string]interface{}{
					"id":         user.ID,
					"name":       user.Name,
					"email":      user.Email,
					"role":       user.Role,
					"created_at": user.CreatedAt,
				})
			}

			if users == nil {
				users = []map[string]interface{}{}
			}

			c.JSON(http.StatusOK, gin.H{"users": users})
		})

		// GET user by ID
		api.GET("/users/:id", func(c *gin.Context) {
			userID := c.Param("id")

			var user struct {
				ID        int       `json:"id"`
				Name      string    `json:"name"`
				Email     string    `json:"email"`
				Role      string    `json:"role"`
				CreatedAt time.Time `json:"created_at"`
			}

			err := db.QueryRow(`
                SELECT id, name, email, role, created_at 
                FROM users 
                WHERE id = $1
            `, userID).Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.CreatedAt)

			if err != nil {
				log.Printf("Error fetching user: %v", err)
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}

			c.JSON(http.StatusOK, user)
		})

		// PUT (Update) user by ID
		api.PUT("/users/:id", func(c *gin.Context) {
			userID := c.Param("id")

			var updateData struct {
				Name     string `json:"name"`
				Email    string `json:"email"`
				Role     string `json:"role"`
				Password string `json:"password,omitempty"`
			}

			if err := c.BindJSON(&updateData); err != nil {
				log.Printf("Error binding JSON: %v", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Validate role
			if updateData.Role != "HR" && updateData.Role != "employee" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role. Must be 'HR' or 'employee'"})
				return
			}

			// Check if email already exists for other users
			var existingCount int
			checkQuery := "SELECT COUNT(*) FROM users WHERE email = $1 AND id != $2"
			err := db.QueryRow(checkQuery, updateData.Email, userID).Scan(&existingCount)
			if err != nil {
				log.Printf("Error checking email: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
				return
			}
			if existingCount > 0 {
				c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
				return
			}

			// Build update query based on whether password is being changed
			var query string
			var args []interface{}

			if updateData.Password != "" {
				query = `
                    UPDATE users 
                    SET name = $1, email = $2, role = $3, password = $4, updated_at = NOW()
                    WHERE id = $5
                `
				args = []interface{}{updateData.Name, updateData.Email, updateData.Role, updateData.Password, userID}
			} else {
				query = `
                    UPDATE users 
                    SET name = $1, email = $2, role = $3, updated_at = NOW()
                    WHERE id = $4
                `
				args = []interface{}{updateData.Name, updateData.Email, updateData.Role, userID}
			}

			result, err := db.Exec(query, args...)
			if err != nil {
				log.Printf("Error updating user: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
				return
			}

			rowsAffected, err := result.RowsAffected()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify update"})
				return
			}

			if rowsAffected == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "User updated successfully",
				"id":      userID,
			})
		})

		// DELETE user by ID (hard delete)
		api.DELETE("/users/:id", func(c *gin.Context) {
			userID := c.Param("id")

			// Start a transaction
			tx, err := db.Begin()
			if err != nil {
				log.Printf("Error starting transaction: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
				return
			}
			defer tx.Rollback()

			// Delete related records first (to handle foreign key constraints)

			// 1. Delete exam results
			_, err = tx.Exec("DELETE FROM exam_results WHERE user_id = $1", userID)
			if err != nil {
				log.Printf("Error deleting exam results: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user data"})
				return
			}

			// 2. Delete course access
			_, err = tx.Exec("DELETE FROM course_access WHERE user_id = $1", userID)
			if err != nil {
				log.Printf("Error deleting course access: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user data"})
				return
			}

			// 3. Delete course progress (if exists)
			_, err = tx.Exec("DELETE FROM course_progress WHERE user_id = $1", userID)
			if err != nil {
				log.Printf("Error deleting course progress: %v", err)
				// Continue anyway as this table might not have data
			}

			// 4. Finally, delete the user
			result, err := tx.Exec("DELETE FROM users WHERE id = $1", userID)
			if err != nil {
				log.Printf("Error deleting user: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
				return
			}

			rowsAffected, err := result.RowsAffected()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify deletion"})
				return
			}

			if rowsAffected == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}

			// Commit the transaction
			if err = tx.Commit(); err != nil {
				log.Printf("Error committing transaction: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
				return
			}

			log.Printf("User %s deleted successfully with all related data", userID)
			c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
		})

		api.POST("/login", func(c *gin.Context) {
			log.Printf("Login request from origin: %s", c.GetHeader("Origin"))
			log.Printf("Login request method: %s", c.Request.Method)

			var loginReq struct {
				Email    string `json:"email"`
				Password string `json:"password"`
			}

			if err := c.BindJSON(&loginReq); err != nil {
				log.Printf("Login bind error: %v", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			log.Printf("Login attempt for email: %s", loginReq.Email)

			// Get user from database
			var user struct {
				ID       int    `json:"id"`
				Name     string `json:"name"`
				Email    string `json:"email"`
				Password string `json:"password"`
				Role     string `json:"role"`
			}

			query := "SELECT id, name, email, password, role FROM users WHERE email = $1"
			err := db.QueryRow(query, loginReq.Email).Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.Role)
			if err != nil {
				if err == sql.ErrNoRows {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
					return
				}
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
				return
			}

			// Compare password (direct comparison, no hashing)
			if user.Password != loginReq.Password {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
				return
			}

			// Generate JWT token
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
				"user_id": user.ID,
				"email":   user.Email,
				"role":    user.Role,
				"exp":     time.Now().Add(time.Hour * 24).Unix(),
			})

			tokenString, err := token.SignedString([]byte("your-secret-key"))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
				return
			}

			// Return user data (without password)
			c.JSON(http.StatusOK, gin.H{
				"token": tokenString,
				"user": gin.H{
					"id":    user.ID,
					"name":  user.Name,
					"email": user.Email,
					"role":  user.Role,
				},
				"message": "Login successful",
			})
		})

		// Course endpoints
		api.POST("/courses", func(c *gin.Context) {
			var req struct {
				Title         string `json:"title"`
				Description   string `json:"description"`
				Category      string `json:"category"`
				Duration      int    `json:"duration"`
				VideoURL      string `json:"video_url"`
				Visibility    string `json:"visibility"`    // 'all' or 'specific'
				SelectedUsers []int  `json:"selectedUsers"` // Array of user IDs
				Quiz          struct {
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

			if err := c.BindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Validate required fields
			if req.Title == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
				return
			}

			// Default visibility to 'all' if not specified
			if req.Visibility == "" {
				req.Visibility = "all"
			}

			// For now, set created_by to 1 (first user)
			// In production, get this from JWT token
			createdBy := 1

			// Begin transaction
			tx, err := db.Begin()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to begin transaction"})
				return
			}
			defer tx.Rollback()

			// Create course with visibility
			query := `
                INSERT INTO courses (title, description, category, duration, video_url, visibility, created_by, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING id, created_at`

			var courseID int
			var createdAt time.Time
			err = tx.QueryRow(query, req.Title, req.Description, req.Category,
				req.Duration, req.VideoURL, req.Visibility, createdBy).Scan(&courseID, &createdAt)
			if err != nil {
				log.Printf("Failed to create course: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
				return
			}

			// If visibility is 'specific', add course_access entries
			if req.Visibility == "specific" && len(req.SelectedUsers) > 0 {
				accessQuery := `INSERT INTO course_access (course_id, user_id, granted_by, created_at) VALUES ($1, $2, $3, NOW())`
				for _, userID := range req.SelectedUsers {
					_, err = tx.Exec(accessQuery, courseID, userID, createdBy)
					if err != nil {
						log.Printf("Failed to create course access for user %d: %v", userID, err)
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set course access"})
						return
					}
				}
			}

			// Create multiple choice exam if quiz questions exist
			if len(req.Quiz.Questions) > 0 {
				examQuery := `
                    INSERT INTO exams (course_id, title, type, description, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, NOW(), NOW())
                    RETURNING id`

				var mcExamID int
				err = tx.QueryRow(examQuery, courseID, "แบบทดสอบปรนัย", "multiple_choice", "แบบทดสอบปรนัยสำหรับหลักสูตรนี้").Scan(&mcExamID)
				if err != nil {
					log.Printf("Failed to create multiple choice exam: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create multiple choice exam"})
					return
				}

				// Create quiz questions
				for _, q := range req.Quiz.Questions {
					if q.Question != "" { // Only create non-empty questions
						optionsJSON, _ := json.Marshal(q.Options)
						questionQuery := `
                            INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, created_at, updated_at, points)
                            VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), 1)`

						_, err = tx.Exec(questionQuery, mcExamID, q.Question, "multiple_choice", string(optionsJSON), q.CorrectAnswer)
						if err != nil {
							log.Printf("Failed to create quiz question: %v", err)
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create quiz question"})
							return
						}
					}
				}
			}

			// Create written exam if written questions exist
			if len(req.WrittenExam.Questions) > 0 {
				examQuery := `
                    INSERT INTO exams (course_id, title, type, description, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, NOW(), NOW())
                    RETURNING id`

				var writtenExamID int
				err = tx.QueryRow(examQuery, courseID, "แบบทดสอบเขียน", "written", "แบบทดสอบเขียนสำหรับหลักสูตรนี้").Scan(&writtenExamID)
				if err != nil {
					log.Printf("Failed to create written exam: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create written exam"})
					return
				}

				// Create written questions
				for _, q := range req.WrittenExam.Questions {
					if q.Question != "" { // Only create non-empty questions
						questionQuery := `
                            INSERT INTO questions (exam_id, question_text, question_type, created_at, updated_at, points)
                            VALUES ($1, $2, $3, NOW(), NOW(), 1)`

						_, err = tx.Exec(questionQuery, writtenExamID, q.Question, "written")
						if err != nil {
							log.Printf("Failed to create written question: %v", err)
							c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create written question"})
							return
						}
					}
				}
			}

			// Commit transaction
			err = tx.Commit()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
				return
			}

			c.JSON(http.StatusCreated, gin.H{
				"id":          courseID,
				"title":       req.Title,
				"description": req.Description,
				"category":    req.Category,
				"duration":    req.Duration,
				"video_url":   req.VideoURL,
				"created_by":  createdBy,
				"created_at":  createdAt,
				"message":     "Course created successfully",
			})
		})

		api.GET("/courses", func(c *gin.Context) {
			// Get user_id from query parameter (optional, for filtering by access)
			userIDStr := c.Query("user_id")

			var query string
			var args []interface{}

			if userIDStr != "" {
				// If user_id is provided, filter courses based on visibility (exclude hidden courses)
				query = `
					SELECT DISTINCT c.id, c.title, c.description, c.category, c.duration, c.video_url, 
						   c.visibility, c.created_by, c.created_at, u.name as creator_name
					FROM courses c
					LEFT JOIN users u ON c.created_by = u.id
					LEFT JOIN course_access ca ON c.id = ca.course_id
					WHERE (c.visibility = 'all' 
					   OR (c.visibility = 'specific' AND ca.user_id = $1))
					   AND c.visibility != 'hidden'
					ORDER BY c.created_at DESC`
				args = append(args, userIDStr)
			} else {
				// If no user_id, return all courses (for HR)
				query = `
					SELECT c.id, c.title, c.description, c.category, c.duration, c.video_url, 
						   c.visibility, c.created_by, c.created_at, u.name as creator_name
					FROM courses c
					LEFT JOIN users u ON c.created_by = u.id
					ORDER BY c.created_at DESC`
			}

			var rows *sql.Rows
			var err error

			if len(args) > 0 {
				rows, err = db.Query(query, args...)
			} else {
				rows, err = db.Query(query)
			}

			if err != nil {
				log.Printf("Failed to fetch courses: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
				return
			}
			defer rows.Close()

			var courses []gin.H
			for rows.Next() {
				var course struct {
					ID          int       `json:"id"`
					Title       string    `json:"title"`
					Description string    `json:"description"`
					Category    string    `json:"category"`
					Duration    int       `json:"duration"`
					VideoURL    string    `json:"video_url"`
					Visibility  string    `json:"visibility"`
					CreatedBy   int       `json:"created_by"`
					CreatedAt   time.Time `json:"created_at"`
					CreatorName string    `json:"creator_name"`
				}

				err := rows.Scan(&course.ID, &course.Title, &course.Description, &course.Category,
					&course.Duration, &course.VideoURL, &course.Visibility, &course.CreatedBy, &course.CreatedAt, &course.CreatorName)
				if err != nil {
					log.Printf("Failed to scan course: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan course"})
					return
				}

				courses = append(courses, gin.H{
					"id":           course.ID,
					"title":        course.Title,
					"description":  course.Description,
					"category":     course.Category,
					"duration":     course.Duration,
					"video_url":    course.VideoURL,
					"visibility":   course.Visibility,
					"created_by":   course.CreatedBy,
					"created_at":   course.CreatedAt,
					"creator_name": course.CreatorName,
				})
			}

			c.JSON(http.StatusOK, gin.H{
				"courses": courses,
			})
		})

		api.GET("/courses/:id", func(c *gin.Context) {
			id := c.Param("id")

			query := `
                SELECT c.id, c.title, c.description, c.category, c.duration, c.video_url, 
                       c.created_by, c.created_at, u.name as creator_name
                FROM courses c
                LEFT JOIN users u ON c.created_by = u.id
                WHERE c.id = $1`

			var course struct {
				ID          int       `json:"id"`
				Title       string    `json:"title"`
				Description string    `json:"description"`
				Category    string    `json:"category"`
				Duration    int       `json:"duration"`
				VideoURL    string    `json:"video_url"`
				CreatedBy   int       `json:"created_by"`
				CreatedAt   time.Time `json:"created_at"`
				CreatorName string    `json:"creator_name"`
			}

			err := db.QueryRow(query, id).Scan(&course.ID, &course.Title, &course.Description,
				&course.Category, &course.Duration, &course.VideoURL, &course.CreatedBy,
				&course.CreatedAt, &course.CreatorName)
			if err != nil {
				if err == sql.ErrNoRows {
					c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
					return
				}
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch course"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"course": gin.H{
					"id":           course.ID,
					"title":        course.Title,
					"description":  course.Description,
					"category":     course.Category,
					"duration":     course.Duration,
					"video_url":    course.VideoURL,
					"created_by":   course.CreatedBy,
					"created_at":   course.CreatedAt,
					"creator_name": course.CreatorName,
				},
			})
		})

		// Get course access (users who can access a specific course)
		api.GET("/courses/:id/access", func(c *gin.Context) {
			courseID := c.Param("id")

			query := `
				SELECT ca.user_id, u.name, u.email
				FROM course_access ca
				JOIN users u ON ca.user_id = u.id
				WHERE ca.course_id = $1
				ORDER BY u.name`

			rows, err := db.Query(query, courseID)
			if err != nil {
				log.Printf("Failed to fetch course access: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch course access"})
				return
			}
			defer rows.Close()

			var users []int
			for rows.Next() {
				var userID int
				var name, email string
				if err := rows.Scan(&userID, &name, &email); err != nil {
					log.Printf("Failed to scan course access: %v", err)
					continue
				}
				users = append(users, userID)
			}

			c.JSON(http.StatusOK, gin.H{
				"users": users,
			})
		})

		// Update course endpoint
		api.PUT("/courses/:id", func(c *gin.Context) {
			id := c.Param("id")

			var req struct {
				Title         string `json:"title"`
				Description   string `json:"description"`
				Category      string `json:"category"`
				Duration      int    `json:"duration"`
				VideoURL      string `json:"video_url"`
				Visibility    string `json:"visibility"`
				SelectedUsers []int  `json:"selectedUsers"`
			}

			if err := c.BindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Validate required fields
			if req.Title == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
				return
			}

			// Default visibility to 'all' if not specified
			if req.Visibility == "" {
				req.Visibility = "all"
			}

			// Begin transaction
			tx, err := db.Begin()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to begin transaction"})
				return
			}
			defer tx.Rollback()

			// Update course
			query := `
                UPDATE courses 
                SET title = $1, description = $2, category = $3, duration = $4, video_url = $5, visibility = $6, updated_at = NOW()
                WHERE id = $7`

			result, err := tx.Exec(query, req.Title, req.Description, req.Category, req.Duration, req.VideoURL, req.Visibility, id)
			if err != nil {
				log.Printf("Failed to update course: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update course"})
				return
			}

			rowsAffected, err := result.RowsAffected()
			if err != nil || rowsAffected == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
				return
			}

			// Update course access if visibility is 'specific'
			// First, delete existing access entries
			_, err = tx.Exec(`DELETE FROM course_access WHERE course_id = $1`, id)
			if err != nil {
				log.Printf("Failed to delete old course access: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update course access"})
				return
			}

			// Then, insert new access entries if visibility is 'specific'
			if req.Visibility == "specific" && len(req.SelectedUsers) > 0 {
				createdBy := 1 // TODO: Get from JWT token
				accessQuery := `INSERT INTO course_access (course_id, user_id, granted_by, created_at) VALUES ($1, $2, $3, NOW())`
				for _, userID := range req.SelectedUsers {
					_, err = tx.Exec(accessQuery, id, userID, createdBy)
					if err != nil {
						log.Printf("Failed to create course access for user %d: %v", userID, err)
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set course access"})
						return
					}
				}
			}

			// Commit transaction
			if err = tx.Commit(); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "Course updated successfully",
			})
		})

		// Delete course endpoint
		api.DELETE("/courses/:id", func(c *gin.Context) {
			id := c.Param("id")

			// Begin transaction
			tx, err := db.Begin()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to begin transaction"})
				return
			}
			defer tx.Rollback()

			// Delete exam_results first (foreign key constraint)
			_, err = tx.Exec(`
                DELETE FROM exam_results 
                WHERE exam_id IN (SELECT id FROM exams WHERE course_id = $1)
            `, id)
			if err != nil {
				log.Printf("Failed to delete exam results: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course exam results"})
				return
			}

			// Delete course_progress
			_, err = tx.Exec(`DELETE FROM course_progress WHERE course_id = $1`, id)
			if err != nil {
				log.Printf("Failed to delete course progress: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course progress"})
				return
			}

			// Delete questions (foreign key constraint)
			_, err = tx.Exec(`
                DELETE FROM questions 
                WHERE exam_id IN (SELECT id FROM exams WHERE course_id = $1)
            `, id)
			if err != nil {
				log.Printf("Failed to delete questions: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course questions"})
				return
			}

			// Delete exams
			_, err = tx.Exec(`DELETE FROM exams WHERE course_id = $1`, id)
			if err != nil {
				log.Printf("Failed to delete exams: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course exams"})
				return
			}

			// Delete course
			result, err := tx.Exec(`DELETE FROM courses WHERE id = $1`, id)
			if err != nil {
				log.Printf("Failed to delete course: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
				return
			}

			rowsAffected, err := result.RowsAffected()
			if err != nil || rowsAffected == 0 {
				c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
				return
			}

			// Commit transaction
			err = tx.Commit()
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "Course deleted successfully",
			})
		})

		// Exam endpoints
		api.GET("/exams/course/:courseId", func(c *gin.Context) {
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
						ID            int            `json:"id"`
						QuestionText  string         `json:"question_text"`
						QuestionType  string         `json:"question_type"`
						Options       sql.NullString `json:"options"`
						CorrectAnswer sql.NullString `json:"correct_answer"`
						Points        int            `json:"points"`
					}

					err := questionRows.Scan(&question.ID, &question.QuestionText, &question.QuestionType,
						&question.Options, &question.CorrectAnswer, &question.Points)
					if err != nil {
						continue
					}

					// Parse options JSON for multiple choice questions
					var parsedOptions []string
					if question.QuestionType == "multiple_choice" && question.Options.Valid && question.Options.String != "" {
						json.Unmarshal([]byte(question.Options.String), &parsedOptions)
					}

					// Handle correct answer
					var correctAnswer interface{}
					if question.CorrectAnswer.Valid {
						correctAnswer = question.CorrectAnswer.String
					}

					questions = append(questions, map[string]interface{}{
						"id":            question.ID,
						"question":      question.QuestionText,
						"options":       parsedOptions,
						"correctAnswer": correctAnswer,
						"points":        question.Points,
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
		})

		api.POST("/exam-results", func(c *gin.Context) {
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

			// Calculate score for multiple choice exams
			score := 0.0

			// Get exam type
			var examType string
			err = db.QueryRow("SELECT type FROM exams WHERE id = $1", examResult.ExamID).Scan(&examType)
			if err != nil {
				log.Printf("Error fetching exam type: %v", err)
			}

			// If it's multiple choice, calculate the score
			if examType == "multiple_choice" {
				// Get all questions and correct answers for this exam
				questionQuery := `
					SELECT id, correct_answer 
					FROM questions 
					WHERE exam_id = $1 AND deleted_at IS NULL
				`
				questionRows, err := db.Query(questionQuery, examResult.ExamID)
				if err != nil {
					log.Printf("Error fetching questions: %v", err)
				} else {
					defer questionRows.Close()

					totalQuestions := 0
					correctAnswers := 0

					for questionRows.Next() {
						var questionID int
						var correctAnswer string

						if err := questionRows.Scan(&questionID, &correctAnswer); err != nil {
							log.Printf("Error scanning question: %v", err)
							continue
						}

						totalQuestions++

						// Check if user's answer matches correct answer
						questionIDStr := fmt.Sprintf("%d", questionID)
						if userAnswer, ok := examResult.Answers[questionIDStr]; ok {
							isCorrect := false

							// Handle both string and number answers
							switch v := userAnswer.(type) {
							case string:
								isCorrect = (v == correctAnswer)
							case float64:
								// Convert number to string for comparison
								isCorrect = (fmt.Sprintf("%.0f", v) == correctAnswer)
							case int:
								isCorrect = (fmt.Sprintf("%d", v) == correctAnswer)
							}

							if isCorrect {
								correctAnswers++
								log.Printf("Question %d: Correct! User answer: %v, Correct answer: %s",
									questionID, userAnswer, correctAnswer)
							} else {
								log.Printf("Question %d: Wrong. User answer: %v, Correct answer: %s",
									questionID, userAnswer, correctAnswer)
							}
						}
					}

					// Calculate percentage score
					if totalQuestions > 0 {
						score = (float64(correctAnswers) / float64(totalQuestions)) * 100.0
					}

					log.Printf("Score calculation: %d correct out of %d questions = %.2f%%",
						correctAnswers, totalQuestions, score)
				}
			}

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
				"message":   "Exam submitted successfully",
				"result_id": resultID,
				"score":     score,
			})
		})

		// Get all exam answers by course (both multiple choice and written)
		api.GET("/exam-answers/:courseId", func(c *gin.Context) {
			courseID := c.Param("courseId")

			// Query to get all exam results grouped by user
			query := `
				SELECT 
					er.id,
					er.user_id,
					u.name as user_name,
					er.exam_id,
					e.title as exam_title,
					e.type as exam_type,
					er.answers,
					er.score,
					er.created_at
				FROM exam_results er
				JOIN users u ON er.user_id = u.id
				JOIN exams e ON er.exam_id = e.id
				WHERE er.course_id = $1 
					AND e.deleted_at IS NULL
				ORDER BY er.user_id, e.type, er.created_at DESC
			`

			rows, err := db.Query(query, courseID)
			if err != nil {
				log.Printf("Error fetching exam answers: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch answers"})
				return
			}
			defer rows.Close()

			// Group results by user
			userResultsMap := make(map[int]map[string]interface{})

			for rows.Next() {
				var result struct {
					ID        int
					UserID    int
					UserName  string
					ExamID    int
					ExamTitle string
					ExamType  string
					Answers   string
					Score     float64
					CreatedAt time.Time
				}

				err := rows.Scan(&result.ID, &result.UserID, &result.UserName, &result.ExamID,
					&result.ExamTitle, &result.ExamType, &result.Answers, &result.Score, &result.CreatedAt)
				if err != nil {
					log.Printf("Error scanning row: %v", err)
					continue
				}

				// Initialize user entry if not exists
				if _, exists := userResultsMap[result.UserID]; !exists {
					userResultsMap[result.UserID] = map[string]interface{}{
						"user_id":         result.UserID,
						"user_name":       result.UserName,
						"submitted_at":    result.CreatedAt,
						"multiple_choice": nil,
						"written":         nil,
					}
				}

				// Parse answers JSON
				var answersMap map[string]interface{}
				if err := json.Unmarshal([]byte(result.Answers), &answersMap); err != nil {
					log.Printf("Error parsing answers JSON: %v", err)
					continue
				}

				if result.ExamType == "multiple_choice" {
					// For multiple choice, calculate score
					questionQuery := `
						SELECT id, correct_answer
						FROM questions
						WHERE exam_id = $1 AND deleted_at IS NULL
						ORDER BY id
					`
					questionRows, err := db.Query(questionQuery, result.ExamID)
					if err != nil {
						log.Printf("Error fetching MC questions: %v", err)
						continue
					}

					totalQuestions := 0
					correctAnswers := 0
					for questionRows.Next() {
						var qID int
						var correctAnswer sql.NullString
						if err := questionRows.Scan(&qID, &correctAnswer); err != nil {
							continue
						}
						totalQuestions++

						// Check if answer is correct
						qIDStr := fmt.Sprintf("%d", qID)
						if userAnswer, ok := answersMap[qIDStr]; ok {
							// Convert user answer to int
							var userAnswerInt int
							switch v := userAnswer.(type) {
							case float64:
								userAnswerInt = int(v)
							case int:
								userAnswerInt = v
							}

							// Convert correct answer to int
							if correctAnswer.Valid {
								var correctAnswerInt int
								fmt.Sscanf(correctAnswer.String, "%d", &correctAnswerInt)
								if userAnswerInt == correctAnswerInt {
									correctAnswers++
								}
							}
						}
					}
					questionRows.Close()

					score := 0.0
					if totalQuestions > 0 {
						score = (float64(correctAnswers) / float64(totalQuestions)) * 100
					}

					userResultsMap[result.UserID]["multiple_choice"] = map[string]interface{}{
						"exam_id":         result.ExamID,
						"exam_title":      result.ExamTitle,
						"score":           score,
						"total_questions": totalQuestions,
						"correct_answers": correctAnswers,
						"submitted_at":    result.CreatedAt,
					}

				} else if result.ExamType == "written" {
					// For written exam, get questions and answers
					questionQuery := `
						SELECT id, question_text, points
						FROM questions
						WHERE exam_id = $1 AND deleted_at IS NULL
						ORDER BY id
					`
					questionRows, err := db.Query(questionQuery, result.ExamID)
					if err != nil {
						log.Printf("Error fetching written questions: %v", err)
						continue
					}

					var questionAnswers []map[string]interface{}
					for questionRows.Next() {
						var q struct {
							ID           int
							QuestionText string
							Points       int
						}
						if err := questionRows.Scan(&q.ID, &q.QuestionText, &q.Points); err != nil {
							continue
						}

						// Get answer for this question from answers map
						questionIDStr := fmt.Sprintf("%d", q.ID)
						answer := ""
						if answerVal, ok := answersMap[questionIDStr]; ok {
							if answerStr, ok := answerVal.(string); ok {
								answer = answerStr
							}
						}

						questionAnswers = append(questionAnswers, map[string]interface{}{
							"question_id":   q.ID,
							"question_text": q.QuestionText,
							"answer":        answer,
							"points":        q.Points,
						})
					}
					questionRows.Close()

					userResultsMap[result.UserID]["written"] = map[string]interface{}{
						"exam_id":          result.ExamID,
						"exam_title":       result.ExamTitle,
						"question_answers": questionAnswers,
						"submitted_at":     result.CreatedAt,
					}
				}
			}

			// Convert map to array
			var results []map[string]interface{}
			for _, userResult := range userResultsMap {
				results = append(results, userResult)
			}

			if results == nil {
				results = []map[string]interface{}{}
			}

			c.JSON(http.StatusOK, gin.H{
				"answers": results,
			})
		})

		// Dashboard endpoint - Get user dashboard data
		api.GET("/dashboard/:userId", func(c *gin.Context) {
			userID := c.Param("userId")

			// Get user info
			var user struct {
				ID   int    `json:"id"`
				Name string `json:"name"`
				Role string `json:"role"`
			}

			err := db.QueryRow("SELECT id, name, role FROM users WHERE id = $1", userID).Scan(&user.ID, &user.Name, &user.Role)
			if err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}

			// Get course progress data
			progressRows, err := db.Query(`
                SELECT c.id, c.title, c.category, c.duration, c.description,
                       COALESCE(cp.progress, 0) as progress,
                       cp.completed_at,
                       u.name as creator_name
                FROM courses c
                LEFT JOIN course_progress cp ON c.id = cp.course_id AND cp.user_id = $1
                LEFT JOIN users u ON c.created_by = u.id
                ORDER BY c.created_at DESC
            `, userID)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch progress data"})
				return
			}
			defer progressRows.Close()

			var courses []map[string]interface{}
			totalCourses := 0
			completedCourses := 0
			inProgressCourses := 0
			totalHours := 0.0
			completedHours := 0.0

			for progressRows.Next() {
				var course struct {
					ID          int            `json:"id"`
					Title       string         `json:"title"`
					Category    string         `json:"category"`
					Duration    int            `json:"duration"`
					Description string         `json:"description"`
					Progress    float64        `json:"progress"`
					CompletedAt sql.NullTime   `json:"completed_at"`
					CreatorName sql.NullString `json:"creator_name"`
				}

				err := progressRows.Scan(&course.ID, &course.Title, &course.Category, &course.Duration,
					&course.Description, &course.Progress, &course.CompletedAt, &course.CreatorName)
				if err != nil {
					continue
				}

				totalCourses++
				hours := float64(course.Duration) / 60.0
				totalHours += hours
				completedHours += hours * (course.Progress / 100.0)

				if course.Progress >= 100 {
					completedCourses++
				} else if course.Progress > 0 {
					inProgressCourses++
				}

				var creatorName string
				if course.CreatorName.Valid {
					creatorName = course.CreatorName.String
				}

				var completedAt interface{}
				if course.CompletedAt.Valid {
					completedAt = course.CompletedAt.Time
				}

				courses = append(courses, map[string]interface{}{
					"id":           course.ID,
					"title":        course.Title,
					"category":     course.Category,
					"duration":     course.Duration,
					"description":  course.Description,
					"progress":     course.Progress,
					"completed_at": completedAt,
					"creator_name": creatorName,
				})
			}

			// Get recent exam results
			examRows, err := db.Query(`
                SELECT er.score, er.created_at, c.title as course_title, e.title as exam_title
                FROM exam_results er
                JOIN courses c ON er.course_id = c.id
                JOIN exams e ON er.exam_id = e.id
                WHERE er.user_id = $1
                ORDER BY er.created_at DESC
                LIMIT 5
            `, userID)

			var recentExams []map[string]interface{}
			if err == nil {
				defer examRows.Close()
				for examRows.Next() {
					var exam struct {
						Score       float64   `json:"score"`
						CreatedAt   time.Time `json:"created_at"`
						CourseTitle string    `json:"course_title"`
						ExamTitle   string    `json:"exam_title"`
					}

					err := examRows.Scan(&exam.Score, &exam.CreatedAt, &exam.CourseTitle, &exam.ExamTitle)
					if err != nil {
						continue
					}

					recentExams = append(recentExams, map[string]interface{}{
						"score":        exam.Score,
						"created_at":   exam.CreatedAt,
						"course_title": exam.CourseTitle,
						"exam_title":   exam.ExamTitle,
					})
				}
			}

			// Generate weekly progress (mock data for now - could be enhanced with real tracking)
			weeklyProgress := []map[string]interface{}{
				{"day": "จ", "hours": 2.0},
				{"day": "อ", "hours": 1.5},
				{"day": "พ", "hours": 3.0},
				{"day": "พฤ", "hours": 2.5},
				{"day": "ศ", "hours": 1.0},
				{"day": "ส", "hours": 0.0},
				{"day": "อา", "hours": 2.0},
			}

			// Calculate achievements
			achievements := []map[string]interface{}{}
			if completedCourses > 0 {
				achievements = append(achievements, map[string]interface{}{
					"id":          1,
					"title":       "นักเรียนดีเด่น",
					"description": fmt.Sprintf("เรียนจบ %d คอร์สแล้ว", completedCourses),
					"icon":        "🏆",
					"type":        "completion",
				})
			}
			if inProgressCourses >= 2 {
				achievements = append(achievements, map[string]interface{}{
					"id":          2,
					"title":       "กำลังใจดี",
					"description": fmt.Sprintf("กำลังเรียน %d คอร์สพร้อมกัน", inProgressCourses),
					"icon":        "📚",
					"type":        "progress",
				})
			}
			if completedHours >= 10 {
				achievements = append(achievements, map[string]interface{}{
					"id":          3,
					"title":       "ผู้เรียนรู้",
					"description": fmt.Sprintf("เรียนไปแล้ว %.0f ชั่วโมง", completedHours),
					"icon":        "⏰",
					"type":        "hours",
				})
			}

			c.JSON(http.StatusOK, gin.H{
				"user": map[string]interface{}{
					"id":   user.ID,
					"name": user.Name,
					"role": user.Role,
				},
				"stats": map[string]interface{}{
					"total_courses":       totalCourses,
					"completed_courses":   completedCourses,
					"in_progress_courses": inProgressCourses,
					"total_hours":         int(totalHours),
					"completed_hours":     int(completedHours),
				},
				"courses":         courses,
				"recent_exams":    recentExams,
				"weekly_progress": weeklyProgress,
				"achievements":    achievements,
			})
		})

		// HR Dashboard Stats endpoint
		api.GET("/hr/dashboard-stats", func(c *gin.Context) {
			// Get total employees (role = 'employee')
			var totalEmployees int
			err := db.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'employee'").Scan(&totalEmployees)
			if err != nil {
				log.Printf("Error counting employees: %v", err)
				totalEmployees = 0
			}

			// Get employees with course assignments
			var assignedEmployees int
			assignQuery := `
				SELECT COUNT(DISTINCT user_id) 
				FROM course_access 
				WHERE user_id IN (SELECT id FROM users WHERE role = 'employee')
			`
			err = db.QueryRow(assignQuery).Scan(&assignedEmployees)
			if err != nil {
				log.Printf("Error counting assigned employees: %v", err)
				assignedEmployees = 0
			}

			// Get all exam scores from employees
			scoreQuery := `
				SELECT u.name, er.score, c.title as course_title, e.title as exam_title, er.created_at
				FROM exam_results er
				JOIN users u ON er.user_id = u.id
				JOIN courses c ON er.course_id = c.id
				JOIN exams e ON er.exam_id = e.id
				WHERE u.role = 'employee' 
					AND e.type = 'multiple_choice'
					AND e.deleted_at IS NULL
				ORDER BY er.created_at DESC
				LIMIT 10
			`
			rows, err := db.Query(scoreQuery)

			var scores []map[string]interface{}
			var totalScore float64 = 0
			var maxScore float64 = 0
			var minScore float64 = 100
			scoreCount := 0

			if err == nil {
				defer rows.Close()
				for rows.Next() {
					var name, courseTitle, examTitle string
					var score float64
					var createdAt time.Time

					if err := rows.Scan(&name, &score, &courseTitle, &examTitle, &createdAt); err != nil {
						continue
					}

					scores = append(scores, map[string]interface{}{
						"name":         name,
						"score":        score,
						"course_title": courseTitle,
						"exam_title":   examTitle,
						"created_at":   createdAt,
					})

					totalScore += score
					if score > maxScore {
						maxScore = score
					}
					if score < minScore {
						minScore = score
					}
					scoreCount++
				}
			}

			avgScore := 0.0
			if scoreCount > 0 {
				avgScore = totalScore / float64(scoreCount)
			} else {
				minScore = 0
			}

			// Get course progress statistics
			// Use course_access for enrollment count and exam_results for completion
			progressQuery := `
				SELECT 
					c.id,
					c.title,
					COUNT(DISTINCT ca.user_id) as total_enrolled,
					COUNT(DISTINCT er.user_id) as completed_count
				FROM courses c
				LEFT JOIN course_access ca ON c.id = ca.course_id
				LEFT JOIN exam_results er ON c.id = er.course_id 
					AND er.user_id IN (SELECT id FROM users WHERE role = 'employee')
				WHERE ca.user_id IN (SELECT id FROM users WHERE role = 'employee')
				GROUP BY c.id, c.title
				HAVING COUNT(DISTINCT ca.user_id) > 0
				ORDER BY total_enrolled DESC
				LIMIT 5
			`
			progressRows, err := db.Query(progressQuery)

			var courseProgress []map[string]interface{}
			if err == nil {
				defer progressRows.Close()
				for progressRows.Next() {
					var id, totalEnrolled, completedCount int
					var title string

					if err := progressRows.Scan(&id, &title, &totalEnrolled, &completedCount); err != nil {
						log.Printf("Error scanning course progress: %v", err)
						continue
					}

					courseProgress = append(courseProgress, map[string]interface{}{
						"id":        id,
						"name":      title,
						"total":     totalEnrolled,
						"completed": completedCount,
					})
				}
			} else {
				log.Printf("Error fetching course progress: %v", err)
			}

			c.JSON(http.StatusOK, gin.H{
				"employee_stats": map[string]interface{}{
					"total":      totalEmployees,
					"assigned":   assignedEmployees,
					"unassigned": totalEmployees - assignedEmployees,
				},
				"exam_scores": map[string]interface{}{
					"scores":      scores,
					"max_score":   maxScore,
					"min_score":   minScore,
					"avg_score":   avgScore,
					"score_count": scoreCount,
				},
				"course_progress": courseProgress,
			})
		})

		// Update course progress endpoint
		api.POST("/course-progress", func(c *gin.Context) {
			var progress struct {
				UserID   int     `json:"user_id"`
				CourseID int     `json:"course_id"`
				Progress float64 `json:"progress"`
			}

			if err := c.BindJSON(&progress); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			// Insert or update course progress
			query := `
                INSERT INTO course_progress (user_id, course_id, progress, updated_at, completed_at)
                VALUES ($1, $2, $3, NOW(), CASE WHEN $3 >= 100 THEN NOW() ELSE NULL END)
                ON CONFLICT (user_id, course_id)
                DO UPDATE SET 
                    progress = $3,
                    updated_at = NOW(),
                    completed_at = CASE WHEN $3 >= 100 THEN NOW() ELSE course_progress.completed_at END
            `

			_, err := db.Exec(query, progress.UserID, progress.CourseID, progress.Progress)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update progress"})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "Progress updated successfully",
			})
		})
	}

	port := getEnv("PORT", "8080")
	r.Run(":" + port)
}
