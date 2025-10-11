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
    config.AllowOrigins = []string{"http://localhost:3000"}
    config.AllowCredentials = true
    config.AddAllowHeaders("authorization")
    r.Use(cors.New(config))

    // Health check
    r.GET("/api/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "ok"})
    })

    // Routes
    api := r.Group("/api")
    {
        api.POST("/register", func(c *gin.Context) {
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

            query := `
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, $4)
                RETURNING id`

            var id int
            err := db.QueryRow(query, user.Name, user.Email, user.Password, user.Role).Scan(&id)
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
                return
            }

            c.JSON(http.StatusCreated, gin.H{
                "id": id,
                "message": "User created successfully",
            })
        })
    }

    port := getEnv("PORT", "8080")
    r.Run(":" + port)
}
