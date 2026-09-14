function LargestFiles({ files }) {
  if (!files || files.length === 0) {
    return (
      <div className="suggestion-box">
        <h2>📁 Largest Files</h2>
        <p>No files found.</p>
      </div>
    );
  }

  const formatSize = (bytes) => {
    const mb = bytes / 1024 / 1024;

    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }

    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="suggestion-box">
      <h2>📁 Largest Files</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "15px",
        }}
      >
        <thead>
          <tr>
            <th align="left">File</th>
            <th align="left">Size</th>
            <th align="left">Type</th>
          </tr>
        </thead>

        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.name}</td>

              <td>{formatSize(Number(file.size))}</td>

              <td>{file.mimeType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LargestFiles;