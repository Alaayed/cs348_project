package dbconn

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() error {
	dsn := "salehAlaayed:1410@tcp(127.0.0.1:3306)/cs348_project"
	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return fmt.Errorf("failed to open DB: %v", err)
	}
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping DB: %v", err)
	}
	fmt.Println("Successfully connected to database!")
	return nil
}
