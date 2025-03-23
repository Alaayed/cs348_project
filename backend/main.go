package main

import (
	"backend/database"
	"database/sql"
	"encoding/json"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"log"
	"net/http"
)

func setUpDB() (*sql.DB, error) {
	dsn := "salehAlaayed:1410@tcp(127.0.0.1:3306)/cs348_project"
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	err = db.Ping()
	if err != nil {
		log.Fatal(err)
		return nil, err
	}
	fmt.Println("Successfully connected to database!")
	return db, nil
}
func setupRouter() (*mux.Router, *cors.Cors) {
	router := mux.NewRouter()
	if router == nil {
		fmt.Println("Error creating router")
	}
	fmt.Println("Hello World")
	router.HandleFunc("/test", testHandler).Methods("POST")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:2999"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	return router, c
}
func main() {
	db, err := setUpDB()
	if err != nil {
		log.Fatal(err)
		log.Println("Error setting up DB, crashing the whole system")
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

func testHandler(w http.ResponseWriter, r *http.Request) {
	var request map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		fmt.Println("Error decoding request:", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	fmt.Println(request)
	// Create a response object
	response := map[string]string{
		"message": "Ping Received",
		"status":  "success",
	}

	// Set the response headers
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK) // Optionally set status code

	// Write the JSON response
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println(err)
	}
	user := database.User{Id: 1}
	if user.Id == 1 {
		print(user.Id)
	}
	return
}
