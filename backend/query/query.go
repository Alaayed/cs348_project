package query

import (
	"backend/DBCONFIG"
	"database/sql"
	"log"
)

type Team struct {
	TeamId     int    `json:"team_id"`
	TeamName   string `json:"team_name"`
	LeagueName string `json:"league_name"`
}
type Match struct {
	MatchId    int `json:"match_id"`
	HomeTeamId int `json:"home_team_id"`
	AwayTeamId int `json:"away_team_id"`
	HomeScore  int `json:"home_score"`
	AwayScore  int `json:"away_score"`
}

type MatchWithName struct {
	MatchId      int    `json:"match_id"`
	Date         string `json:"match_date"`
	HomeTeamId   int    `json:"home_team_id"`
	AwayTeamId   int    `json:"away_team_id"`
	HomeTeamName string `json:"home_team_name"`
	AwayTeamName string `json:"away_team_name"`
	HomeScore    int    `json:"home_score"`
	AwayScore    int    `json:"away_score"`
}

func GetAll() ([]Team, []MatchWithName) {
	// Get db point for config
	db := dbconn.DB
	rows, err := db.Query("SELECT * FROM Teams")
	if err != nil {
		log.Fatal(err)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(rows)
	var teams []Team
	for rows.Next() {
		var team Team
		err = rows.Scan(&team.TeamId, &team.TeamName, &team.LeagueName)
		if err != nil {
			log.Fatal(err)
		}
		teams = append(teams, team)
	}
	for _, team := range teams {
		log.Printf("Team_id: %d", team.TeamId)
	}
	rows, err = db.Query("SELECT * FROM Matches")
	if err != nil {
		log.Fatal(err)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(rows)
	var matches []MatchWithName
	for rows.Next() {
		var match MatchWithName
		err = rows.Scan(
			&match.MatchId,
			&match.Date,
			&match.HomeTeamId,
			&match.AwayTeamId,
			&match.HomeScore,
			&match.AwayScore,
		)
		if err != nil {
			log.Fatal(err)
		}
		matches = append(matches, match)
	}
	idMap := make(map[int]string)
	// Make a map of IDs to names
	for _, team := range teams {
		idMap[team.TeamId] = team.TeamName
	}
	// Modify the matches recieved from the db
	for i := range matches {
		var match = &matches[i]
		match.HomeTeamName = idMap[match.HomeTeamId]
		match.AwayTeamName = idMap[match.AwayTeamId]
		log.Printf("Match id: %d, Home name: %s , Away Name %s",
			match.HomeTeamId,
			match.HomeTeamName,
			match.AwayTeamName)
	}
	return teams, matches
}
