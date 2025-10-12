package main

import (
    "database/sql"
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
    host := getEnv("DB_HOST", "postgres-db")
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

    // Health check
    r.GET("/api/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "ok"})
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
            var course struct {
                Title       string `json:"title"`
                Description string `json:"description"`
                Category    string `json:"category"`
                Duration    int    `json:"duration"`
                VideoURL    string `json:"video_url"`
            }

            if err := c.BindJSON(&course); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
            }

            // Validate required fields
            if course.Title == "" {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Title is required"})
                return
            }

            // For now, set created_by to 1 (first user)
            // In production, get this from JWT token
            createdBy := 1

            query := `
                INSERT INTO courses (title, description, category, duration, video_url, created_by, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING id, created_at`

            var id int
            var createdAt time.Time
            err := db.QueryRow(query, course.Title, course.Description, course.Category, 
                course.Duration, course.VideoURL, createdBy).Scan(&id, &createdAt)
            if err != nil {
                log.Printf("Failed to create course: %v", err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
                return
            }

            c.JSON(http.StatusCreated, gin.H{
                "id":          id,
                "title":       course.Title,
                "description": course.Description,
                "category":    course.Category,
                "duration":    course.Duration,
                "video_url":   course.VideoURL,
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
    }

    port := getEnv("PORT", "8080")
    r.Run(":" + port)
}
