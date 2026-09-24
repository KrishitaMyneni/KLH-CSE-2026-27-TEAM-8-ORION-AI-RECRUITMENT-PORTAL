import { useState } from "react";

function ResumeUpload({ onUpload }) {
  const [file, setFile] = useState(null);

  const handleChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    if (onUpload) {
      onUpload(selectedFile);
    }
  };

  return (
    <div className="profile-card">
      <h3>Resume</h3>

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
      />

      {file && (
        <p className="profile-muted">
          Selected: {file.name}
        </p>
      )}
    </div>
  );
}

export default ResumeUpload;