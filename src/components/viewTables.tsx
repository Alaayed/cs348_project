"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, Database, Table, X } from "lucide-react"
import { cn } from "@/lib/utils"

type TableDataMap = Record<string, Record<string, any>[]>

export default function Tables({ data }: { data: TableDataMap }) {
  const tableNames = Object.keys(data)
  const [activeTab, setActiveTab] = useState(tableNames[0])
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null)
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})

  const handleRowClick = async (row: Record<string, any>, action?: string) => {
    if (action === "edit") {
      setEditingRow(row)
      // Initialize form values with current row data
      setFormValues({ ...row })
    }
  }

  const handleUpdateRow = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingRow) return

    // Find the ID field
    const idKey = Object.keys(editingRow).find((key) => key.toLowerCase().includes("id"))
    if (!idKey) return
    console.log(formValues)

    const updatedMatch = {
        match_id: formValues.match_id,
      match_date: formValues.match_date,
      home_team_name: formValues.home_team_name,
      away_team_name: formValues.away_team_name,
      home_score: Number(formValues.home_score),
      away_score: Number(formValues.away_score),
    }
    try {
      const response = await fetch(`http://localhost:4000/update-match`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMatch),
      })

      if (!response.ok) {
        console.error("Failed to update row")
        return
      }

      // Update the data in the UI
      const updatedData = [...data[activeTab]]
      const index = updatedData.findIndex((row) => row[idKey] === editingRow[idKey])

      if (index !== -1) {
        updatedData[index] = formValues
        data[activeTab] = updatedData
        // Force re-render
        setActiveTab(activeTab)
      }

      // Close the edit form
      setEditingRow(null)
      setFormValues({})
    } catch (err) {
      console.error("Error updating row:", err)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (tableNames.length === 0)
    return (
      <div className="flex items-center justify-center h-64 rounded-lg bg-card text-card-foreground">
        <p className="text-muted-foreground flex items-center gap-2">
          <Database className="h-5 w-5" />
          No data found
        </p>
      </div>
    )

  return (
    <div className="w-full p-4 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Table className="h-5 w-5 text-primary" />
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
            {activeTab === name && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {/* Active Table */}
      <div className="w-full bg-card rounded-lg shadow-sm">
        <GenericTable title={activeTab} data={data[activeTab]} onRowClick={handleRowClick} />
      </div>

      {/* Edit Form */}
      {editingRow && (
        <div className="mt-6 p-4 bg-black rounded-lg shadow-sm border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Row</h3>
            <button
              onClick={() => {
                setEditingRow(null)
                setFormValues({})
              }}
              className="p-1 rounded-full hover:bg-muted/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleUpdateRow} className="space-y-4">
            {Object.keys(editingRow).map((field) => {
              // Skip ID fields as they shouldn't be editable
              if (field.toLowerCase().includes("id")) return null

              const value = formValues[field] || ""
              const isNumber = typeof editingRow[field] === "number"
              const isDate = field.toLowerCase().includes("date")

              return (
                <div key={field} className="flex flex-col gap-2">
                  <label className="text-sm font-medium capitalize">{field.replace(/_/g, " ")}</label>
                  {isDate ? (
                    <input
                      type="date"
                      value={value}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm bg-black"
                    />
                  ) : isNumber ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleInputChange(field, Number(e.target.value))}
                      className="border rounded-md px-3 py-2 text-sm bg-black"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="border rounded-md px-3 py-2 text-sm bg-black"
                    />
                  )}
                </div>
              )
            })}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingRow(null)
                  setFormValues({})
                }}
                className="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <InsertMatch
          onInsert={(newMatch) => {
            data["matches"] = [...data["matches"], newMatch]
            setActiveTab("matches") // Ensure matches is shown
          }}
        />
      </div>
    </div>
  )
}

function GenericTable({
  title,
  data,
  onRowClick,
}: {
  title: string
  data: Record<string, any>[]
  onRowClick?: (row: Record<string, any>, action?: string) => void
}) {
  if (!data || data.length === 0)
    return <div className="flex items-center justify-center h-40 text-muted-foreground">No {title} found</div>

  const headers = Object.keys(data[0]).filter((header) => !header.toLowerCase().includes("id"))
  // Function to format cell content based on value type
  const formatCell = (value: never) => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "boolean") return value ? "Yes" : "No"
    return String(value)
  }
  const handleRowDelete = async (row: Record<string, any>) => {
    console.log(row)
    const id = row.match_id
    console.log(id)
    const res = await fetch(`http://localhost:4000/delete-match/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) {
      throw new Error("Failed to delete row")
    }
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
                  <ChevronDown className="h-3 w-3 text-muted-foreground/50" />
                </div>
              </th>
            ))}
            <th className="px-6 py-3 text-left font-medium border-b border-border">
              <div className="flex items-center gap-1">Actions</div>
            </th>
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
              <td className="px-6 py-4 border-b border-border">
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick?.(row, "edit")
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-900"
                    onClick={() => handleRowDelete(row)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InsertMatch({ onInsert }: { onInsert: (match: Record<string, any>) => void }) {
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
      })

      if (!response.ok) {
        const error = await response.text()
        console.error("Failed to insert match:", error)
      } else {
        const result = await response.json()
        console.log("Match inserted:", result)
      }
    } catch (err) {
      console.error("Error calling insert-match API:", err)
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

