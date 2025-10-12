package routes

import (
    "github.com/gorilla/mux"
    "github.com/tangkoblap04/BIS-SA/back-end/back-end-API/handlers"
    "gorm.io/gorm"
)

func SetupRoutes(router *mux.Router, db *gorm.DB) {
    // Public routes
    router.HandleFunc("/api/login", handlers.Login(db)).Methods("POST")
    
    // User routes
    router.HandleFunc("/api/users", handlers.CreateUser(db)).Methods("POST")
    router.HandleFunc("/api/users", handlers.GetAllUsers(db)).Methods("GET")
    router.HandleFunc("/api/users/{id}", handlers.GetUserByID(db)).Methods("GET")
    router.HandleFunc("/api/users/{id}", handlers.UpdateUser(db)).Methods("PUT")
    router.HandleFunc("/api/users/{id}", handlers.DeleteUser(db)).Methods("DELETE")

    // Health check route
    router.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK"))
    }).Methods("GET")

    // Add other routes here
}