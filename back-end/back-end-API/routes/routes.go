package routes

import (
    "github.com/gorilla/mux"
    "github.com/tangkoblap04/BIS-SA/back-end/back-end-API/handlers"
    "gorm.io/gorm"
)

func SetupRoutes(router *mux.Router, db *gorm.DB) {
    // Public routes
    router.HandleFunc("/api/login", handlers.Login(db)).Methods("POST")

    // Add other routes here
}