package API_CALL

import (
	"backend/query"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

func GetTables(w http.ResponseWriter, r *http.Request) {
	teams, matches := query.GetAll()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	encoder := json.NewEncoder(w)
	response := map[string]interface{}{
		"teams":   teams,
		"matches": matches,
	}
	err := encoder.Encode(response)
	if err != nil {
		log.Fatal(err)
	}
	return
}
func InsertMatch(w http.ResponseWriter, r *http.Request) {
	log.Println("IN API CALL")
	var newMatch query.NewMatch
	err := json.NewDecoder(r.Body).Decode(&newMatch)
	if err != nil {
		log.Println("InsertMatch: Error decoding body")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	newMatch.InsertMatch()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	return
}
func TestHandler(w http.ResponseWriter, r *http.Request) {
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
	return
}
