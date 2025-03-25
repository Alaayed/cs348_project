"use client";

import { useState } from "react";

type TableDataMap = Record<string, Record<string, any>[]>;

export default function Tables({ data }: { data: TableDataMap }) {
  const tableNames = Object.keys(data);
  const [activeTab, setActiveTab] = useState(tableNames[0]);

  if (tableNames.length === 0) return <p className="text-white">No data found.</p>;

  return (
    <div className="w-full p-4">
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {tableNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 rounded-t-lg text-sm font-semibold transition-all
              ${activeTab === name
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"}
            `}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Active Table */}
      <div className="w-full">
        <GenericTable title={activeTab} data={data[activeTab]} />
      </div>
    </div>
  );
}

// Still reuse your generic table view
function GenericTable({ title, data }: { title: string; data: Record<string, any>[] }) {
  if (!data || data.length === 0) return <p className="text-white">No {title} found.</p>;

  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-white border border-gray-600">
        <thead className="bg-gray-800 text-white uppercase">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-6 py-3 border border-gray-700">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
              {headers.map((header) => (
                <td key={header} className="px-6 py-4 border border-gray-700">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
