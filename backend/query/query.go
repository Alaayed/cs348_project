package query

import (
	"backend/DBCONFIG"
	"database/sql"
	"log"
)

type Team struct {
	TeamId   int    `json:"team_id"`
	TeamName string `json:"team_name"`
	Goals    int    `json:"goals"`
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
type NewMatch struct {
	Date         string `json:"match_date"`
	HomeTeamName string `json:"home_team_name"`
	AwayTeamName string `json:"away_team_name"`
	HomeScore    int    `json:"home_score"`
	AwayScore    int    `json:"away_score"`
}

type Match struct {
	MatchId    int    `json:"match_id"`
	Date       string `json:"match_date"`
	HomeTeamId int    `json:"home_team_id"`
	AwayTeamId int    `json:"away_team_id"`
	HomeScore  int    `json:"home_score"`
	AwayScore  int    `json:"away_score"`
}

func GetAll() ([]Team, []MatchWithName) {
	teams := GetTeams()
	matches := GetMatches()
	idMap := MapIdToName(teams)
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
func GetTeams() []Team {
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
		err = rows.Scan(&team.TeamId, &team.TeamName, &team.Goals)
		if err != nil {
			log.Fatal(err)
		}
		teams = append(teams, team)
	}
	for _, team := range teams {
		log.Printf("Team_id: %d", team.TeamId)
	}

	return teams
}
func GetMatches() []MatchWithName {
	db := dbconn.DB
	rows, err := db.Query("SELECT * FROM Matches")
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
	return matches
}
func MapIdToName(teams []Team) map[int]string {
	idMap := make(map[int]string)
	// Make a map of IDs to names
	for _, team := range teams {
		idMap[team.TeamId] = team.TeamName
	}
	return idMap
}
func MapNameToId(teams []Team) map[string]int {
	nameMap := make(map[string]int)
	for _, team := range teams {
		nameMap[team.TeamName] = team.TeamId
	}
	return nameMap
}
func (n NewMatch) InsertMatch() {
	teams := GetTeams()
	nameMap := MapNameToId(teams)
	homeID, homeExists := nameMap[n.HomeTeamName]
	awayID, awayExists := nameMap[n.AwayTeamName]
	if !homeExists {
		addTeamByName(n.HomeTeamName)
	}
	if !awayExists {
		addTeamByName(n.AwayTeamName)
	}
	if !awayExists || !homeExists {
		teams = GetTeams()
		nameMap = MapNameToId(teams)
		homeID = nameMap[n.HomeTeamName]
		awayID = nameMap[n.AwayTeamName]
	}
	matchWithID := Match{
		Date:       n.Date,
		HomeTeamId: homeID,
		AwayTeamId: awayID,
		HomeScore:  n.HomeScore,
		AwayScore:  n.AwayScore,
	}
	db := dbconn.DB
	_, err := db.Exec(`
    INSERT INTO Matches (match_date, home_team_id, away_team_id, home_score, away_score)
    VALUES (?, ?, ?, ?, ?)`,
		matchWithID.Date,
		matchWithID.HomeTeamId,
		matchWithID.AwayTeamId,
		matchWithID.HomeScore,
		matchWithID.AwayScore,
	)
	if err != nil {
		log.Println("Failed to insert match:", err)
	}
}

func addTeamByName(name string) {
	db := dbconn.DB
	_, err := db.Exec(`INSERT INTO Teams (team_name, goals) VALUES (?, ?)`, name, 0)
	if err != nil {
		log.Println("Failed to insert team:", err)
	}
}
