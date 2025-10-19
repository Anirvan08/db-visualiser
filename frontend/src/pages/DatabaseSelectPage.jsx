import { useState } from "react";
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

export default function DatabaseSelectPage({ 
  selectedDb, 
  setSelectedDb, 
  projectName, 
  setProjectName, 
  onNext, 
  onBack,
  creatingProject = false
}) {
  const [nameError, setNameError] = useState("");

  const validateProjectName = (name) => {
    if (!name || name.trim().length === 0) {
      return "Project name is required";
    }
    if (name.trim().length < 3) {
      return "Project name must be at least 3 characters";
    }
    if (name.trim().length > 50) {
      return "Project name must be less than 50 characters";
    }
    return "";
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setProjectName(name);
    setNameError(validateProjectName(name));
  };

  const handleNext = () => {
    const error = validateProjectName(projectName);
    if (error) {
      setNameError(error);
      return;
    }
    onNext();
  };

  const isFormValid = selectedDb && projectName.trim() && !nameError;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">Create New Project</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Name Input */}
        <div>
          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            id="project-name"
            type="text"
            value={projectName}
            onChange={handleNameChange}
            placeholder="Enter a name for your project..."
            className={`w-full p-3 rounded border focus:outline-none focus:ring-2 focus:ring-purple-400/60 ${
              nameError ? "border-red-300" : "border-gray-300"
            }`}
          />
          {nameError && (
            <p className="text-red-600 text-sm mt-1">{nameError}</p>
          )}
        </div>

        {/* Database Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Select your database type *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button variant="secondary" onClick={onBack} type="button">
            ← Back to Projects
          </Button>
          <Button 
            disabled={!isFormValid || creatingProject} 
            onClick={handleNext} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            {creatingProject ? "Creating..." : "Next →"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 