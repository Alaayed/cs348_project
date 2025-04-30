package main

import (
	"backend/API_CALL"
	dbconn "backend/DBCONFIG"
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func setupRouter() (*mux.Router, *cors.Cors) {
	router := mux.NewRouter()
	if router == nil {
		log.Fatal("Error creating router")
	}
	fmt.Println("Hello World")
	router.HandleFunc("/test", API_CALL.TestHandler).Methods("POST")
	router.HandleFunc("/get-stats", API_CALL.GetTables).Methods("Get")
	router.HandleFunc("/insert-match", API_CALL.InsertMatch).Methods("POST")
	router.HandleFunc("/delete-match/{id}", API_CALL.DeleteMatch).Methods("DELETE")
	router.HandleFunc("/update-match", API_CALL.UpdateMatch).Methods("PUT")
	router.HandleFunc("/get-date-filtered", API_CALL.GetFiltered).Methods("POST")
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	return router, c
}

// Main
func main() {
	err := dbconn.InitDB()
	db := dbconn.DB
	if err != nil {
		log.Fatal(err)
		return
	}
	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(db)
	router, c := setupRouter()
	handler := c.Handler(router)
	log.Println("Server is running on port 4000")
	err = http.ListenAndServe(":4000", handler)
	if err != nil {
		log.Fatalf("Error starting server: %v", err)
	}

}
