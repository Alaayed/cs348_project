package query

import (
	dbconn "backend/DBCONFIG"
	"database/sql"
	"log"
)

type Range struct {
	StartDate string `json:"startDate"`
	EndDate   string `json:"endDate"`
}
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
type NewMatchWithID struct {
	MatchId      int    `json:"match_id"`
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
func DeleteMatchID(id string) {
	db := dbconn.DB
	_, err := db.Exec(`DELETE FROM Matches WHERE match_id = ?`, id)
	if err != nil {
		log.Fatal(err)
	}
}

func (n Match) UpdateMatch() (sql.Result, error) {
	db := dbconn.DB
	return db.Exec(`UPDATE Matches
					SET match_date = ?, home_team_id = ?, away_team_id = ?, home_score = ?, away_score = ?
					WHERE match_id = ?`,
		n.Date,
		n.HomeTeamId,
		n.AwayTeamId,
		n.HomeScore,
		n.AwayScore,
		n.MatchId,
	)
}
func (r Range) GetData() []MatchWithName {
	db := dbconn.DB
	rows, err := db.Query(`
		SELECT m.match_id as match_id,
       m.match_date as match_date,
       t.team_name as home_team_name,
       t2.team_name as away_team_name,
       m.home_score as home_score,
       m.away_score as away_score
FROM Matches m
JOIN Teams t ON m.home_team_id = t.team_id
JOIN Teams t2 ON m.away_team_id = t2.team_id
WHERE m.match_date BETWEEN ? AND ?`,
		r.StartDate,
		r.EndDate)
	// Check errors
	if err != nil {
		log.Println(err)
		return nil
	}
	// Close Row
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Fatal(err)
		}
	}(rows)
	// Get matches
	var matches []MatchWithName
	for rows.Next() {
		var match MatchWithName
		err = rows.Scan(
			&match.MatchId,
			&match.Date,
			&match.HomeTeamName,
			&match.AwayTeamName,
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
