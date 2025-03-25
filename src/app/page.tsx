import Tables from "@/components/viewTables";

async function fetchTables() {
  const res = await fetch("http://localhost:4000/get-stats", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch table data");
  return res.json(); // Expecting { teams: [...], matches: [...] }
}

export default async function Page() {
  const data = await fetchTables(); // This is already a table map
  return (
    <div className="min-h-screen p-8 text-white bg-black">
      <h1 className="text-3xl font-bold mb-6">Tables</h1>
      <Tables data={data} />
    </div>
  );
}
