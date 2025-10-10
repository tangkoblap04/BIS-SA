package models

type User struct {
    ID       uint   `json:"id" gorm:"primary_key"`
    Email    string `json:"email" gorm:"unique;not null"`
    Password string `json:"password" gorm:"not null"`
    Role     string `json:"role" gorm:"not null"` // "HR" or "employee"
    Name     string `json:"name" gorm:"not null"`
}