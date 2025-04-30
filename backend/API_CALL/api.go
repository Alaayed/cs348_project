package API_CALL

import (
	"backend/query"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
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
func DeleteMatch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	query.DeleteMatchID(id)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	return
}

func UpdateMatch(w http.ResponseWriter, r *http.Request) {
	var match query.NewMatchWithID
	err := json.NewDecoder(r.Body).Decode(&match)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	mapping := query.MapNameToId(query.GetTeams())
	removed_names := query.Match{
		MatchId:    match.MatchId,
		Date:       match.Date,
		HomeScore:  match.HomeScore,
		AwayScore:  match.AwayScore,
		HomeTeamId: mapping[match.HomeTeamName],
		AwayTeamId: mapping[match.AwayTeamName],
	}
	_, err = removed_names.UpdateMatch()
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	return
}
func GetFiltered(w http.ResponseWriter, r *http.Request) {
	//log.Println("HEY IN HERE")
	var dates query.Range
	// Get Dates
	err := json.NewDecoder(r.Body).Decode(&dates)
	if err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	data := dates.GetData()
	if data == nil {
		log.Println("Somethings fucked in GetFiltered :(")
		http.Error(w, "mb", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"matches": data,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		log.Fatal(err)
	}
	return
}
