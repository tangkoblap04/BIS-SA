package main

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    "github.com/dgrijalva/jwt-go"
    _ "github.com/lib/pq"
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

    err = db.Ping()
    if err != nil {
        log.Fatal("Failed to ping database:", err)
    }

    log.Println("Successfully connected to database")
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

    // Seed endpoint
    r.POST("/seed", func(c *gin.Context) {
        seedData(db)
        c.JSON(http.StatusOK, gin.H{"message": "Database seeded successfully"})
    })

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
                "id": id,
                "name": user.Name,
                "email": user.Email,
                "role": user.Role,
                "message": "User created successfully",
            })
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
                    "id":   user.ID,
                    "name": user.Name,
                    "email": user.Email,
                    "role": user.Role,
                },
                "message": "Login successful",
            })
        })

        // Course endpoints
        api.POST("/courses", func(c *gin.Context) {
            var req struct {
                Title       string `json:"title"`
                Description string `json:"description"`
                Category    string `json:"category"`
                Duration    int    `json:"duration"`
                VideoURL    string `json:"video_url"`
                Quiz        struct {
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

            // Create course
            query := `
                INSERT INTO courses (title, description, category, duration, video_url, created_by, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING id, created_at`

            var courseID int
            var createdAt time.Time
            err = tx.QueryRow(query, req.Title, req.Description, req.Category, 
                req.Duration, req.VideoURL, createdBy).Scan(&courseID, &createdAt)
            if err != nil {
                log.Printf("Failed to create course: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
                return
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
            query := `
                SELECT c.id, c.title, c.description, c.category, c.duration, c.video_url, 
                       c.created_by, c.created_at, u.name as creator_name
                FROM courses c
                LEFT JOIN users u ON c.created_by = u.id
                ORDER BY c.created_at DESC`

            rows, err := db.Query(query)
            if err != nil {
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
                    CreatedBy   int       `json:"created_by"`
                    CreatedAt   time.Time `json:"created_at"`
                    CreatorName string    `json:"creator_name"`
                }

                err := rows.Scan(&course.ID, &course.Title, &course.Description, &course.Category,
                    &course.Duration, &course.VideoURL, &course.CreatedBy, &course.CreatedAt, &course.CreatorName)
                if err != nil {
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

        // Update course endpoint
        api.PUT("/courses/:id", func(c *gin.Context) {
            id := c.Param("id")
            
            var req struct {
                Title       string `json:"title"`
                Description string `json:"description"`
                Category    string `json:"category"`
                Duration    int    `json:"duration"`
                VideoURL    string `json:"video_url"`
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

            query := `
                UPDATE courses 
                SET title = $1, description = $2, category = $3, duration = $4, video_url = $5, updated_at = NOW()
                WHERE id = $6`

            result, err := db.Exec(query, req.Title, req.Description, req.Category, req.Duration, req.VideoURL, id)
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
                        "id":             question.ID,
                        "question":       question.QuestionText,
                        "options":        parsedOptions,
                        "correctAnswer":  correctAnswer,
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
        })
    }

    port := getEnv("PORT", "8080")
    r.Run(":" + port)
}
