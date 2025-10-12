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
    }

    port := getEnv("PORT", "8080")
    r.Run(":" + port)
}
