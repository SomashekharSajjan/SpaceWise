import "./StorageCard.css";

function StorageCard({ title, value }) {
  return (
    <div className="storage-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
        }}
      >
        <h3>{title}</h3>

        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "rgba(59,130,246,0.15)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "20px",
          }}
        >
          {title.split(" ")[0]}
        </div>
      </div>

      <h1>{value}</h1>

      <p
        style={{
          marginTop: "12px",
          color: "#94a3b8",
          fontSize: "14px",
        }}
      >
        Updated just now
      </p>
    </div>
  );
}

export default StorageCard;