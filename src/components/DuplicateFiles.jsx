function DuplicateFiles({ files }) {
  if (!files || files.length === 0) {
    return (
      <div className="suggestion-box">
        <h2>📑 Duplicate Files</h2>
        <p>No duplicate files found 🎉</p>
      </div>
    );
  }

  return (
    <div className="suggestion-box">
      <h2>📑 Duplicate Files</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th align="left">File Name</th>
            <th align="center">Copies</th>
            <th align="center">Type</th>
          </tr>
        </thead>

        <tbody>
          {files.map((file, index) => (
            <tr key={index}>
              <td>{file.name}</td>

              <td align="center">
                <span
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {file.count}
                </span>
              </td>

              <td align="center">
                {file.files[0].mimeType}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DuplicateFiles;