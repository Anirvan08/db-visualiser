import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UploadMetadataPage({ onBack, onNext, onFileLoaded }) {
  const [text, setText] = useState("");

  const handleChange = (e) => {
    setText(e.target.value);
    if (onFileLoaded) onFileLoaded(e.target.value);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">Paste your metadata output</CardTitle>
      </CardHeader>
      <CardContent>
        <textarea
          value={text}
          onChange={handleChange}
          rows={10}
          placeholder="Paste the output from your database console here..."
          className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm mb-4 resize-y"
        />
        <div className="flex justify-between mt-6">
          <Button variant="secondary" onClick={onBack} type="button">Back</Button>
          <Button onClick={onNext} type="button" disabled={!text}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
} 