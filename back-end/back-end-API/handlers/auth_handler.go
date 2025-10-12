package handlers

import (
    "encoding/json"
    "net/http"
    "github.com/tangkoblap04/BIS-SA/back-end/back-end-API/models"
    "golang.org/x/crypto/bcrypt"
    "github.com/dgrijalva/jwt-go"
    "gorm.io/gorm"
    "time"
)

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type LoginResponse struct {
    Token string      `json:"token"`
    User  models.User `json:"user"`
}

func Login(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req LoginRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        var user models.User
        if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
            http.Error(w, "Invalid credentials", http.StatusUnauthorized)
            return
        }

        // Simple password comparison without bcrypt
        if user.Password != req.Password {
            http.Error(w, "Invalid credentials", http.StatusUnauthorized)
            return
        }

        // Create JWT token
        token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
            "user_id": user.ID,
            "role":    user.Role,
            "exp":     time.Now().Add(time.Hour * 24).Unix(),
        })

        tokenString, err := token.SignedString([]byte("your-secret-key")) // Replace with your secret key
        if err != nil {
            http.Error(w, "Error generating token", http.StatusInternalServerError)
            return
        }

        // Hide password in response
        user.Password = ""

        response := LoginResponse{
            Token: tokenString,
            User:  user,
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    }
}