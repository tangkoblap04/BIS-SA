package main

import (
    "database/sql"
    "log"
)

func seedUsers(db *sql.DB) error {
    users := []struct {
        email    string
        name     string
        password string
        role     string
    }{
        {"hr@example.com", "HR Admin", "hr123456", "HR"},
        {"employee@example.com", "Employee User", "emp123456", "employee"},
    }

    query := `INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)`
    
    for _, user := range users {
        _, err := db.Exec(query, user.email, user.name, user.password, user.role)
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

func seedExams(db *sql.DB) error {
    // สร้าง exam สำหรับแต่ละ course
    courses := []struct {
        courseID int
        category string
    }{
        {1, "customer-service"},
        {2, "management"},
    }

    for _, course := range courses {
        // สร้าง multiple choice exam
        var mcExamID int
        err := db.QueryRow(`
            INSERT INTO exams (course_id, title, type, description, created_at, updated_at) 
            VALUES ($1, $2, 'multiple_choice', $3, NOW(), NOW()) 
            RETURNING id
        `, course.courseID, "แบบทดสอบปรนัย", "แบบทดสอบปรนัยสำหรับหลักสูตรนี้").Scan(&mcExamID)
        if err != nil {
            return err
        }

        // สร้าง written exam
        var writtenExamID int
        err = db.QueryRow(`
            INSERT INTO exams (course_id, title, type, description, created_at, updated_at) 
            VALUES ($1, $2, 'written', $3, NOW(), NOW()) 
            RETURNING id
        `, course.courseID, "แบบทดสอบเขียน", "แบบทดสอบเขียนสำหรับหลักสูตรนี้").Scan(&writtenExamID)
        if err != nil {
            return err
        }

        // สร้าง questions สำหรับ multiple choice exam
        if err := seedQuestionsByCategory(db, mcExamID, course.category, "multiple_choice"); err != nil {
            return err
        }

        // สร้าง questions สำหรับ written exam
        if err := seedQuestionsByCategory(db, writtenExamID, course.category, "written"); err != nil {
            return err
        }
    }

    return nil
}

func seedQuestionsByCategory(db *sql.DB, examID int, category string, questionType string) error {
    if questionType == "multiple_choice" {
        questions := getMultipleChoiceQuestions(category)
        for _, q := range questions {
            _, err := db.Exec(`
                INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, points, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            `, examID, q.QuestionText, "multiple_choice", q.Options, q.CorrectAnswer, 1)
            if err != nil {
                return err
            }
        }
    } else if questionType == "written" {
        questions := getWrittenQuestions(category)
        for _, q := range questions {
            _, err := db.Exec(`
                INSERT INTO questions (exam_id, question_text, question_type, options, correct_answer, points, created_at, updated_at) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            `, examID, q.QuestionText, "written", "", "", 5)
            if err != nil {
                return err
            }
        }
    }
    return nil
}

func getMultipleChoiceQuestions(category string) []struct {
    QuestionText  string
    Options       string
    CorrectAnswer string
} {
    switch category {
    case "customer-service":
        return []struct {
            QuestionText  string
            Options       string
            CorrectAnswer string
        }{
            {
                "การให้บริการลูกค้าที่ดีควรเริ่มต้นจากอะไร?",
                `["การทักทาย", "การจดออเดอร์", "การแนะนำเมนู", "การนำที่นั่ง"]`,
                "0",
            },
            {
                "เมื่อลูกค้าร้องเรียนควรทำอย่างไร?",
                `["โต้แย้งเพื่อปกป้องร้าน", "ฟังและขอโทษ", "เพิกเฉยไม่สนใจ", "โยนความรับผิดชอบให้ผู้อื่น"]`,
                "1",
            },
        }
    case "management":
        return []struct {
            QuestionText  string
            Options       string
            CorrectAnswer string
        }{
            {
                "ข้อใดคือขั้นตอนแรกในการจัดการร้านอาหาร?",
                `["การตรวจสอบยอดขาย", "การวางแผนกำลังคน", "การตรวจสอบวัตถุดิบ", "การเปิดร้าน"]`,
                "1",
            },
            {
                "การบริหารต้นทุนที่ดีควรมี Food Cost ประมาณเท่าไร?",
                `["15-20%", "25-35%", "40-50%", "55-65%"]`,
                "1",
            },
        }
    default:
        return []struct {
            QuestionText  string
            Options       string
            CorrectAnswer string
        }{}
    }
}

func getWrittenQuestions(category string) []struct {
    QuestionText string
} {
    switch category {
    case "customer-service":
        return []struct {
            QuestionText string
        }{
            {"จงอธิบายขั้นตอนการให้บริการลูกค้าตั้งแต่ลูกค้าเข้าร้านจนกระทั่งชำระเงิน"},
            {"หากเกิดสถานการณ์ที่ลูกค้าไม่พอใจการบริการ คุณจะมีวิธีการจัดการอย่างไร"},
        }
    case "management":
        return []struct {
            QuestionText string
        }{
            {"จงอธิบายหลักการบริหารจัดการร้านอาหารในด้านการควบคุมต้นทุน"},
            {"หากพนักงานในทีมมีปัญหาการทำงาน คุณจะแก้ไขปัญหาอย่างไร"},
        }
    default:
        return []struct {
            QuestionText string
        }{}
    }
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
    
    if err := seedExams(db); err != nil {
        log.Printf("Error seeding exams: %v", err)
        return
    }
    
    log.Println("Successfully seeded database")
}