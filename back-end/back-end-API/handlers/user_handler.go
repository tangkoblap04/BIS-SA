package handlers

import (
    "encoding/json"
    "net/http"
    "strconv"
    "github.com/gorilla/mux"
    "github.com/tangkoblap04/BIS-SA/back-end/back-end-API/models"
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

type CreateUserRequest struct {
    Name     string `json:"name"`
    Email    string `json:"email"`
    Password string `json:"password"`
    Role     string `json:"role"`
}

// CreateUser สร้างผู้ใช้ใหม่
func CreateUser(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req CreateUserRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        // Validate role
        if req.Role != "HR" && req.Role != "employee" {
            http.Error(w, "Invalid role. Must be 'HR' or 'employee'", http.StatusBadRequest)
            return
        }

        // Check if email already exists
        var existingUser models.User
        if err := db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
            http.Error(w, "Email already exists", http.StatusConflict)
            return
        }

        // Hash password
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
            http.Error(w, "Error hashing password", http.StatusInternalServerError)
            return
        }

        // Create user
        user := models.User{
            Name:     req.Name,
            Email:    req.Email,
            Password: string(hashedPassword),
            Role:     req.Role,
        }

        if err := db.Create(&user).Error; err != nil {
            http.Error(w, "Error creating user", http.StatusInternalServerError)
            return
        }

        // Hide password in response
        user.Password = ""

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusCreated)
        json.NewEncoder(w).Encode(user)
    }
}

// GetAllUsers ดึงข้อมูลผู้ใช้ทั้งหมด (สำหรับ HR)
func GetAllUsers(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var users []models.User
        if err := db.Find(&users).Error; err != nil {
            http.Error(w, "Error fetching users", http.StatusInternalServerError)
            return
        }

        // Hide passwords in response
        for i := range users {
            users[i].Password = ""
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(users)
    }
}

// GetUserByID ดึงข้อมูลผู้ใช้ตาม ID
func GetUserByID(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        vars := mux.Vars(r)
        userID, err := strconv.Atoi(vars["id"])
        if err != nil {
            http.Error(w, "Invalid user ID", http.StatusBadRequest)
            return
        }

        var user models.User
        if err := db.First(&user, userID).Error; err != nil {
            if err == gorm.ErrRecordNotFound {
                http.Error(w, "User not found", http.StatusNotFound)
                return
            }
            http.Error(w, "Error fetching user", http.StatusInternalServerError)
            return
        }

        // Hide password in response
        user.Password = ""

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    }
}

// UpdateUser อัปเดตข้อมูลผู้ใช้
func UpdateUser(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        vars := mux.Vars(r)
        userID, err := strconv.Atoi(vars["id"])
        if err != nil {
            http.Error(w, "Invalid user ID", http.StatusBadRequest)
            return
        }

        var req CreateUserRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        // Validate role
        if req.Role != "HR" && req.Role != "employee" {
            http.Error(w, "Invalid role. Must be 'HR' or 'employee'", http.StatusBadRequest)
            return
        }

        var user models.User
        if err := db.First(&user, userID).Error; err != nil {
            if err == gorm.ErrRecordNotFound {
                http.Error(w, "User not found", http.StatusNotFound)
                return
            }
            http.Error(w, "Error fetching user", http.StatusInternalServerError)
            return
        }

        // Update fields
        user.Name = req.Name
        user.Email = req.Email
        user.Role = req.Role

        // Update password if provided
        if req.Password != "" {
            hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
            if err != nil {
                http.Error(w, "Error hashing password", http.StatusInternalServerError)
                return
            }
            user.Password = string(hashedPassword)
        }

        if err := db.Save(&user).Error; err != nil {
            http.Error(w, "Error updating user", http.StatusInternalServerError)
            return
        }

        // Hide password in response
        user.Password = ""

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(user)
    }
}

// DeleteUser ลบผู้ใช้
func DeleteUser(db *gorm.DB) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        vars := mux.Vars(r)
        userID, err := strconv.Atoi(vars["id"])
        if err != nil {
            http.Error(w, "Invalid user ID", http.StatusBadRequest)
            return
        }

        if err := db.Delete(&models.User{}, userID).Error; err != nil {
            http.Error(w, "Error deleting user", http.StatusInternalServerError)
            return
        }

        w.WriteHeader(http.StatusNoContent)
    }
}