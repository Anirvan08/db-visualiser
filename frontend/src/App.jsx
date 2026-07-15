import { useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import DatabaseSelectPage from "@/pages/DatabaseSelectPage";
import ShowScriptPage from "@/pages/ShowScriptPage";
import UploadMetadataPage from "@/pages/UploadMetadataPage";
import ErdVisualizerPage from "@/pages/ErdVisualizerPage";

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedDb, setSelectedDb] = useState("");
  const [metadata, setMetadata] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <h1 className="text-4xl font-bold text-purple-700 mb-8">Database ERD Visualizer</h1>
      {step === 1 && (
        <DatabaseSelectPage
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <ShowScriptPage
          selectedDb={selectedDb}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <UploadMetadataPage
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          onFileLoaded={setMetadata}
        />
      )}
      {step === 4 && (
        <ErdVisualizerPage
          metadata={metadata}
          onBack={() => setStep(3)}
        />
      )}
      <Analytics />
    </div>
  );
} 