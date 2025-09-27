import type { FormEvent } from "react";
import { useEffect } from "react";
import { gemini } from "./config/envConfig";
import { resumeParser } from "./utils/resumeParser";

function App() {
  useEffect(() => {
    resumeParser.initialize(gemini.GEMINI_API_KEY);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem(
      "file"
    ) as HTMLInputElement | null;
    if (!fileInput || !fileInput.files?.length) {
      console.log("No file selected");
      return;
    }
    const file = fileInput.files[0];
    console.log("Selected file:", file);

    try {
      const response = await resumeParser.parseResume(file);
      console.log("Parsed resume:", response);
      // Optionally update UI or state with results
    } catch (error) {
      console.error("Error parsing resume:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="file">Upload</label>
        <input type="file" id="file" name="file" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
