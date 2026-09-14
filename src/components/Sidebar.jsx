import "./Sidebar.css";

function Sidebar() {
  const menus = [
    { icon: "🏠", title: "Dashboard" },
    { icon: "📧", title: "Gmail" },
    { icon: "📁", title: "Drive" },
    { icon: "🤖", title: "AI Insights" },
    { icon: "⚙️", title: "Settings" },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="logo">
          <div className="logo-icon">🚀</div>

          <div>
            <h2>SpaceWise</h2>
            <span>Storage Intelligence</span>
          </div>
        </div>

        <nav className="menu">
          {menus.map((item, index) => (
            <div
              key={index}
              className={`menu-item ${
                index === 0 ? "active" : ""
              }`}
            >
              <span className="menu-icon">{item.icon}</span>

              <span>{item.title}</span>
            </div>
          ))}
        </nav>
      </div>

      <div className="profile-card">
        <div className="avatar">S</div>

        <div>
          <h4>Somu Sajjan</h4>
          <p>Free Plan</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;