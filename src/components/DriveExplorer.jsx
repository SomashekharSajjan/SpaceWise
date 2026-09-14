function DriveExplorer({ files }) {
  if (!files || files.length === 0) {
    return (
      <div className="suggestion-box">
        <h2>📁 Recent Google Drive Files</h2>
        <p>No files found.</p>
      </div>
    );
  }

  return (
    <div className="suggestion-box">
      <h2>📁 Recent Google Drive Files</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "15px",
        }}
      >
        <thead>
          <tr>
            <th align="left">File Name</th>
            <th align="left">Type</th>
            <th align="left">Size</th>
            <th align="left">Modified</th>
          </tr>
        </thead>

        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.name}</td>

              <td>{file.mimeType}</td>

              <td>
                {file.size
                  ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                  : "-"}
              </td>

              <td>
                {new Date(file.modifiedTime).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DriveExplorer;