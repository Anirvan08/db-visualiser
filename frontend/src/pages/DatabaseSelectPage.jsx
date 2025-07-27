import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DATABASES = [
  {
    label: "PostgreSQL",
    value: "postgres",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  },
  {
    label: "MySQL / MariaDB",
    value: "mysql",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  {
    label: "SQLite",
    value: "sqlite",
    img: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg",
  },
  // Add more as needed
];

export default function DatabaseSelectPage({ selectedDb, setSelectedDb, onNext }) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">Select your database type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {DATABASES.map((db) => (
            <button
              key={db.value}
              type="button"
              onClick={() => setSelectedDb(db.value)}
              className={`group border rounded-xl p-6 flex flex-col items-center transition-all shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/60
                ${selectedDb === db.value ? "border-purple-600 bg-purple-50 shadow-lg" : "border-gray-200 bg-white hover:border-purple-400"}`}
            >
              <img src={db.img} alt={db.label} className="w-12 h-12 mb-3" />
              <span className={`text-lg font-semibold ${selectedDb === db.value ? "text-purple-700" : "text-gray-700"}`}>{db.label}</span>
            </button>
          ))}
        </div>
        <Button disabled={!selectedDb} onClick={onNext} className="w-full">
          Next
        </Button>
      </CardContent>
    </Card>
  );
} 