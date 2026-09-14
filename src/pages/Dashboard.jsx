import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StorageCard from "../components/StorageCard";
import PieChart from "../components/PieChart";
import GmailAnalytics from "../components/GmailAnalytics";
import DriveExplorer from "../components/DriveExplorer";
import LargestFiles from "../components/LargestFiles";
import DuplicateFiles from "../components/DuplicateFiles";

import { getGmailProfile } from "../services/gmailApi";
import { getDriveAnalytics } from "../services/driveApi";
import { getStorageHealth } from "../services/aiApi";
import { getGmailCategories } from "../services/gmailCategoryApi";

import "../styles/dashboard.css";

function Dashboard() {
  console.log("DASHBOARD IS RUNNING");

  const [gmail, setGmail] = useState(null);
  const [drive, setDrive] = useState(null);
  const [health, setHealth] = useState(null);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const gmailRes = await getGmailProfile();
        const driveRes = await getDriveAnalytics();
        const healthRes = await getStorageHealth();
        const categoryRes = await getGmailCategories();

console.log("GMAIL CATEGORIES RESPONSE:", categoryRes);

setGmail(gmailRes.profile);
setDrive(driveRes.analytics);
setHealth(healthRes.health);
setLabels(categoryRes);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main-content">
        <Navbar />

        <div style={{ padding: "30px" }}>
          <h2>🚀 SpaceWise Dashboard</h2>

          {/* Summary Cards */}
          <div className="cards">
            <StorageCard
              title="📧 Gmail Account"
              value={gmail ? gmail.emailAddress : "Loading..."}
            />

            <StorageCard
              title="📨 Total Emails"
              value={gmail ? gmail.messagesTotal : "Loading..."}
            />

            <StorageCard
              title="💬 Threads"
              value={gmail ? gmail.threadsTotal : "Loading..."}
            />

            <StorageCard
              title="📁 Drive Files"
              value={drive ? drive.totalFiles : "Loading..."}
            />

            <StorageCard
              title="💾 Drive Storage"
              value={drive ? `${drive.storageUsedMB} MB` : "Loading..."}
            />

            <StorageCard
              title="🖼 Images"
              value={drive ? drive.images : "Loading..."}
            />

            <StorageCard
              title="📄 PDFs"
              value={drive ? drive.pdfs : "Loading..."}
            />

            <StorageCard
              title="📂 Folders"
              value={drive ? drive.folders : "Loading..."}
            />
          </div>

          {/* Charts */}
          <div className="chart-section">
            <div className="chart-box">
              <h3>📊 Gmail vs Drive</h3>

              <PieChart
                gmailStorage={gmail ? gmail.messagesTotal : 0}
                driveStorage={drive ? drive.totalFiles : 0}
              />
            </div>

            <div className="chart-box">
              <h3>🤖 Storage Health Score</h3>

              <h1
                style={{
                  color:
                    health && health.score >= 80
                      ? "green"
                      : health && health.score >= 60
                      ? "orange"
                      : "red",
                }}
              >
                {health ? `${health.score}/100` : "Loading..."}
              </h1>

              <ul>
                {health ? (
                  health.suggestions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>Loading...</li>
                )}
              </ul>
            </div>
          </div>

          {/* Gmail Analytics */}
          <GmailAnalytics labels={labels} />

          {/* Recent Drive Files */}
          <DriveExplorer
            files={drive ? drive.recentFiles : []}
          />

          {/* Largest Drive Files */}
          <LargestFiles
            files={drive ? drive.largestFiles : []}
          />
          <DuplicateFiles
  files={drive ? drive.duplicateFiles : []}
/>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;