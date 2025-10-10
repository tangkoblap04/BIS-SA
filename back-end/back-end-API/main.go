package main

import (
    "database/sql"
    "fmt"
    "log"
    "net/http"
    "os"
    "time"
    _ "back-end-API/docs"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
    _ "github.com/lib/pq"
    swaggerFiles "github.com/swaggo/files"
    ginSwagger "github.com/swaggo/gin-swagger"
    _ "github.com/swaggo/swag"
)

type ErrorResponse struct {
    Message string `json:"message"`
}

var db *sql.DB

// Models
type User struct {
    ID        int       `json:"id"`
    Username  string    `json:"username"`
    Password  string    `json:"-"` // ไม่แสดงในการ response
    Role      string    `json:"role"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type Course struct {
    ID          int       `json:"id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    Role        string    `json:"role"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

type CourseProgress struct {
    ID          int       `json:"id"`
    UserID      int       `json:"user_id"`
    CourseID    int       `json:"course_id"`
    Progress    float64   `json:"progress"`
    QuizScore   float64   `json:"quiz_score"`
    WrittenExam string    `json:"written_exam"`
    CompletedAt time.Time `json:"completed_at,omitempty"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// Database initialization
func initDB() {
	var err error
	host := getEnv("DB_HOST", "")
	name := getEnv("DB_NAME", "")
	user := getEnv("DB_USER", "")
	password := getEnv("DB_PASSWORD", "")
	port := getEnv("DB_PORT", "")

	conSt := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, name)

	db, err = sql.Open("postgres", conSt)
	if err != nil {
		log.Fatal("Failed to open database.")
	}

	//กำหนดจำนวน Connection สูงสุด
	db.SetMaxOpenConns(25)

	// กำหนดจำนวน Idle connection สูงสุด
	db.SetMaxIdleConns(20)

	// กำหนดอายุของ Connection
	db.SetConnMaxLifetime(5 * time.Minute)

	err = db.Ping()
	if err != nil {
		log.Fatal("Failed to Ping.", err)

	}

	log.Println("Successfully~~~")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Auth handlers
func login(c *gin.Context) {
    var loginData struct {
        Username string `json:"username"`
        Password string `json:"password"`
    }

    if err := c.ShouldBindJSON(&loginData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var user User
    err := db.QueryRow(
        "SELECT id, username, role FROM users WHERE username = $1 AND password = $2",
        loginData.Username, loginData.Password,
    ).Scan(&user.ID, &user.Username, &user.Role)

    if err == sql.ErrNoRows {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
        return
    } else if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "user": user,
        "token": "dummy-token", // TODO: implement JWT
    })
}

// Course handlers
func getCoursesByRole(c *gin.Context) {
    role := c.Query("role")
    
    var rows *sql.Rows
    var err error
    
    if role == "" {
        rows, err = db.Query("SELECT id, name, description, role FROM courses")
    } else {
        rows, err = db.Query("SELECT id, name, description, role FROM courses WHERE role = $1", role)
    }

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer rows.Close()

    var courses []Course
    for rows.Next() {
        var course Course
        err := rows.Scan(&course.ID, &course.Name, &course.Description, &course.Role)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
        courses = append(courses, course)
    }

    if courses == nil {
        courses = []Course{}
    }

    c.JSON(http.StatusOK, courses)
}

// Progress handlers
func updateCourseProgress(c *gin.Context) {
    var progress CourseProgress
    if err := c.ShouldBindJSON(&progress); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    err := db.QueryRow(
        `UPDATE course_progress 
         SET progress = $1, quiz_score = $2, written_exam = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4 AND course_id = $5
         RETURNING id, updated_at`,
        progress.Progress, progress.QuizScore, progress.WrittenExam, 
        progress.UserID, progress.CourseID,
    ).Scan(&progress.ID, &progress.UpdatedAt)

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, progress)
}

func main() {
    initDB()
    defer db.Close()
	// Seed data in development mode
	if os.Getenv("APP_ENV") == "development" {
        seedData(db)
    }
    r := gin.Default()
    
    // CORS configuration
    config := cors.DefaultConfig()
    config.AllowAllOrigins = true
    config.AllowHeaders = append(config.AllowHeaders, "Authorization")
    r.Use(cors.New(config))

    // Documentation
    r.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
    
    // Health check
    r.GET("/health", getHealth)

    // Public routes
    r.POST("/login", login)

    // API routes
    api := r.Group("/api/v1")
    // TODO: Add JWT middleware here
    {
        // User routes
        api.GET("/users/me", getCurrentUser)
        
        // Course routes
        api.GET("/courses", getCoursesByRole)
        api.GET("/courses/:id", getCourse)
        
        // Progress routes
        api.GET("/progress", getUserProgress)
        api.POST("/progress", createProgress)
        api.PUT("/progress", updateCourseProgress)
        
        // Quiz routes
        api.POST("/quiz-results", submitQuizResults)
        
        // Written exam routes
        api.POST("/written-exam", submitWrittenExam)
    }

    r.Run(":8080")
}