package main

import (
    "database/sql"
    "log"
)

func seedUsers(db *sql.DB) error {
    users := []struct {
        username string
        password string
        role     string
    }{
        {"admin", "admin123", "admin"},
        {"waiter1", "pass123", "waiter"},
        {"cashier1", "pass123", "cashier"},
        {"manager1", "pass123", "manager"},
    }

    query := `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`
    
    for _, user := range users {
        _, err := db.Exec(query, user.username, user.password, user.role)
        if err != nil {
            return err
        }
    }
    return nil
}

func seedCourses(db *sql.DB) error {
    courses := []struct {
        name        string
        description string
        role        string
    }{
        {
            "การบริการลูกค้าเบื้องต้น",
            "หลักสูตรพื้นฐานสำหรับการให้บริการลูกค้า",
            "waiter",
        },
        {
            "การจัดการข้อร้องเรียน",
            "การรับมือกับข้อร้องเรียนของลูกค้า",
            "waiter",
        },
        {
            "การจัดการร้านอาหาร",
            "การบริหารจัดการร้านอาหารเบื้องต้น",
            "manager",
        },
        {
            "การใช้งานระบบแคชเชียร์",
            "การใช้งานระบบการเงินและการคิดเงิน",
            "cashier",
        },
    }

    query := `INSERT INTO courses (name, description, role) VALUES ($1, $2, $3)`
    
    for _, course := range courses {
        _, err := db.Exec(query, course.name, course.description, course.role)
        if err != nil {
            return err
        }
    }
    return nil
}

func seedCourseProgress(db *sql.DB) error {
    progress := []struct {
        userID    int
        courseID  int
        progress  float64
        quizScore *float64
    }{
        {2, 1, 75.5, &[]float64{80.0}[0]},
        {2, 2, 30.0, nil},
        {3, 4, 100.0, &[]float64{95.0}[0]},
    }

    query := `INSERT INTO course_progress (user_id, course_id, progress, quiz_score) 
             VALUES ($1, $2, $3, $4)`
    
    for _, p := range progress {
        _, err := db.Exec(query, p.userID, p.courseID, p.progress, p.quizScore)
        if err != nil {
            return err
        }
    }
    return nil
}

func seedData(db *sql.DB) {
    if err := seedUsers(db); err != nil {
        log.Printf("Error seeding users: %v", err)
        return
    }
    
    if err := seedCourses(db); err != nil {
        log.Printf("Error seeding courses: %v", err)
        return
    }
    
    if err := seedCourseProgress(db); err != nil {
        log.Printf("Error seeding course progress: %v", err)
        return
    }
    
    log.Println("Successfully seeded database")
}