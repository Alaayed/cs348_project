"use client"

import {useState} from "react"
import {ChevronDown, Database, Table} from "lucide-react"
import {cn} from "@/lib/utils"

type TableDataMap = Record<string, Record<string, any>[]>

export default function Tables({data}: { data: TableDataMap }) {
    const tableNames = Object.keys(data)
    const [activeTab, setActiveTab] = useState(tableNames[0])

    if (tableNames.length === 0)
        return (
            <div className="flex items-center justify-center h-64 rounded-lg bg-card text-card-foreground">
                <p className="text-muted-foreground flex items-center gap-2">
                    <Database className="h-5 w-5"/>
                    No data found
                </p>
            </div>
        )

    return (
        <div className="w-full p-4 space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Table className="h-5 w-5 text-primary"/>
                <h2 className="text-xl font-semibold">Database Tables</h2>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-border">
                {tableNames.map((name) => (
                    <button
                        key={name}
                        onClick={() => setActiveTab(name)}
                        className={cn(
                            "px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all relative",
                            "hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            activeTab === name
                                ? "bg-background text-primary border-x border-t border-border"
                                : "text-muted-foreground",
                        )}
                    >
                        {name}
                        {activeTab === name && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"/>}
                    </button>
                ))}
            </div>

            {/* Active Table */}
            <div className="w-full bg-card rounded-lg shadow-sm">
                <GenericTable title={activeTab} data={data[activeTab]}/>
            </div>
            <div>
                <InsertMatch onInsert={(newMatch) => {
                    data["matches"] = [...data["matches"], newMatch]
                    setActiveTab("matches") // Ensure matches is shown
                }}/>

            </div>
        </div>
    )
}

function GenericTable({title, data}: { title: string; data: Record<string, any>[] }) {
    if (!data || data.length === 0)
        return <div className="flex items-center justify-center h-40 text-muted-foreground">No {title} found</div>

    const headers = Object.keys(data[0]).filter((header) => !header.toLowerCase().includes("id"))
    // Function to format cell content based on value type
    const formatCell = (value: never) => {
        if (value === null || value === undefined) return "-"
        if (typeof value === "boolean") return value ? "Yes" : "No"
        return String(value)
    }

    return (
        <div className="overflow-x-auto rounded-lg bg-black">
            <table className="w-full text-sm border-collapse bg-black">
                <thead>
                <tr className="bg-neutral-800 text-black">

                    {headers.map((header) => (
                        <th key={header} className="px-6 py-3 text-left font-medium border-b border-border">
                            <div className="flex items-center gap-1 capitalize">
                                {header.replace(/_/g, " ")}
                                <ChevronDown className="h-3 w-3 text-muted-foreground/50"/>
                            </div>
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.map((row, rowIndex) => (
                    <tr
                        key={rowIndex}
                        className={cn(
                            "transition-colors",
                            "hover:bg-muted/50",
                            rowIndex % 2 === 0 ? "bg-black text-white" : "bg-neutral-800 text-white",
                        )}
                    >
                        {headers.map((header) => {
                            const value = formatCell(row[header])

                            return (
                                <td key={header} className="px-6 py-4 border-b border-border">
                      <span
                          className={cn(
                              header.toLowerCase().includes("id") && "font-mono text-xs",
                              header.toLowerCase().includes("price") && "font-medium",
                          )}
                      >
                        {value}
                      </span>
                                </td>
                            )
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

function InsertMatch({onInsert}: { onInsert: (match: Record<string, any>) => void }) {
    const [matchDate, setMatchDate] = useState("")
    const [homeTeam, setHomeTeam] = useState("")
    const [awayTeam, setAwayTeam] = useState("")
    const [homeScore, setHomeScore] = useState("")
    const [awayScore, setAwayScore] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newMatch = {
            match_date: matchDate,
            home_team_name: homeTeam,
            away_team_name: awayTeam,
            home_score: Number(homeScore),
            away_score: Number(awayScore),
        }

        onInsert(newMatch)
        try {
            const response = await fetch("http://localhost:4000/insert-match", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newMatch),
            });

            if (!response.ok) {
                const error = await response.text();
                console.error("Failed to insert match:", error);
            } else {
                const result = await response.json();
                console.log("Match inserted:", result);
            }
        } catch (err) {
            console.error("Error calling insert-match API:", err);
        }

        // Reset form
        setMatchDate("")
        setHomeTeam("")
        setAwayTeam("")
        setHomeScore("")
        setAwayScore("")
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6 p-4 bg-black rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Insert New Match</h3>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Match Date</label>
                <input
                    type="date"
                    value={matchDate}
                    onChange={(e) => setMatchDate(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm bg-black"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Home Team</label>
                    <input
                        type="text"
                        value={homeTeam}
                        onChange={(e) => setHomeTeam(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm bg-black"
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Away Team</label>
                    <input
                        type="text"
                        value={awayTeam}
                        onChange={(e) => setAwayTeam(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm bg-black"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Home Score</label>
                    <input
                        type="number"
                        value={homeScore}
                        onChange={(e) => setHomeScore(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm bg-black"
                        required
                        min="0"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Away Score</label>
                    <input
                        type="number"
                        value={awayScore}
                        onChange={(e) => setAwayScore(e.target.value)}
                        className="border rounded-md px-3 py-2 text-sm bg-black"
                        required
                        min="0"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="mt-4 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Add Match
            </button>
        </form>
    )
}

