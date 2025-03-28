"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronDown, Filter } from 'lucide-react'
import { cn } from "@/lib/utils"

type ReportFilters = {
  startDate: string
  endDate: string
  team?: string
  [key: string]: any
}

type ReportStats = {
  totalMatches: number
  averageHomeScore: number
  averageAwayScore: number
  homeWins: number
  awayWins: number
  draws: number
}

export default function ReportInterface({ data }: { data: Record<string, Record<string, any>[]> }) {
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: "",
    endDate: "",
    team: "",
  })

  const [filteredData, setFilteredData] = useState<Record<string, any>[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [availableTeams, setAvailableTeams] = useState<string[]>([])
  const [isReportGenerated, setIsReportGenerated] = useState(false)

  // Extract unique teams from the data
  useEffect(() => {
    if (data && data.matches) {
      const teams = new Set<string>()
      data.matches.forEach(match => {
        teams.add(match.home_team_name)
        teams.add(match.away_team_name)
      })
      setAvailableTeams(Array.from(teams).sort())
    }
  }, [data])

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateReport = () => {
    if (!data || !data.matches) return

    // Filter the data based on selected filters
    let filtered = [...data.matches]

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(match =>
        new Date(match.match_date) >= new Date(filters.startDate)
      )
    }

    if (filters.endDate) {
      filtered = filtered.filter(match =>
        new Date(match.match_date) <= new Date(filters.endDate)
      )
    }

    // Apply team filter
    if (filters.team) {
      filtered = filtered.filter(match =>
        match.home_team_name === filters.team || match.away_team_name === filters.team
      )
    }

    // Calculate statistics
    if (filtered.length > 0) {
      const totalHomeScore = filtered.reduce((sum, match) => sum + match.home_score, 0)
      const totalAwayScore = filtered.reduce((sum, match) => sum + match.away_score, 0)
      const homeWins = filtered.filter(match => match.home_score > match.away_score).length
      const awayWins = filtered.filter(match => match.away_score > match.home_score).length
      const draws = filtered.filter(match => match.home_score === match.away_score).length

      setStats({
        totalMatches: filtered.length,
        averageHomeScore: filtered.length ? +(totalHomeScore / filtered.length).toFixed(2) : 0,
        averageAwayScore: filtered.length ? +(totalAwayScore / filtered.length).toFixed(2) : 0,
        homeWins,
        awayWins,
        draws
      })
    } else {
      setStats(null)
    }

    setFilteredData(filtered)
    setIsReportGenerated(true)
  }

  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Match Report Generator</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-black pr-10"
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-black pr-10"
            />
            <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Team</label>
          <div className="relative">
            <select
              value={filters.team}
              onChange={(e) => handleFilterChange("team", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm bg-black appearance-none pr-10"
            >
              <option value="">All Teams</option>
              {availableTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex items-end">
          <button
            onClick={generateReport}
            className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Generate Report
          </button>
        </div>
      </div>

      {isReportGenerated && (
        <div className="space-y-6 mt-8">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-neutral-800 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Matches</div>
                <div className="text-2xl font-bold">{stats.totalMatches}</div>
              </div>
              <div className="bg-neutral-800 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Avg. Home Score</div>
                <div className="text-2xl font-bold">{stats.averageHomeScore}</div>
              </div>
              <div className="bg-neutral-800 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Avg. Away Score</div>
                <div className="text-2xl font-bold">{stats.averageAwayScore}</div>
              </div>
              <div className="bg-neutral-800 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Home Wins</div>
                <div className="text-2xl font-bold">{stats.homeWins}</div>
              </div>
              <div className="bg-neutral-800 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Away Wins</div>
                <div className="text-2xl font-bold">{stats.awayWins}</div>
              </div>
              <div className="bg-neutral-800 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Draws</div>
                <div className="text-2xl font-bold">{stats.draws}</div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Report Results ({filteredData.length} matches)</h3>
            {filteredData.length > 0 ? (
              <div className="overflow-x-auto rounded-lg bg-black">
                <table className="w-full text-sm border-collapse bg-black">
                  <thead>
                    <tr className="bg-neutral-800 text-black">
                      <th className="px-6 py-3 text-left font-medium border-b border-border">Date</th>
                      <th className="px-6 py-3 text-left font-medium border-b border-border">Home Team</th>
                      <th className="px-6 py-3 text-left font-medium border-b border-border">Away Team</th>
                      <th className="px-6 py-3 text-left font-medium border-b border-border">Score</th>
                      <th className="px-6 py-3 text-left font-medium border-b border-border">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((match, index) => {
                      const homeWin = match.home_score > match.away_score
                      const awayWin = match.away_score > match.home_score
                      const draw = match.home_score === match.away_score

                      return (
                        <tr
                          key={index}
                          className={cn(
                            "transition-colors",
                            "hover:bg-muted/50",
                            index % 2 === 0 ? "bg-black text-white" : "bg-neutral-800 text-white",
                          )}
                        >
                          <td className="px-6 py-4 border-b border-border">
                            {new Date(match.match_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 border-b border-border">
                            <span className={homeWin ? "font-bold" : ""}>{match.home_team_name}</span>
                          </td>
                          <td className="px-6 py-4 border-b border-border">
                            <span className={awayWin ? "font-bold" : ""}>{match.away_team_name}</span>
                          </td>
                          <td className="px-6 py-4 border-b border-border">
                            {match.home_score} - {match.away_score}
                          </td>
                          <td className="px-6 py-4 border-b border-border">
                            {homeWin && <span className="text-green-500">Home Win</span>}
                            {awayWin && <span className="text-red-500">Away Win</span>}
                            {draw && <span className="text-yellow-500">Draw</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground bg-black rounded-lg">
                No matches found with the selected filters
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
