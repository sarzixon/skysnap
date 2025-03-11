import { Link } from "react-router"

function App() {
  return (
    <>
      <div style={{
        margin: "20vh auto",
        width: "fit-content",
        height: "40vh",
        padding: "0",
        display: "flex",
      }}>
        <img src="logo-skysnap-sq.webp" />
      </div>
      <h1 style={{
        textAlign: "center",
        fontFamily: "sans-serif, Arial",
      }}>SkySnap - Rekrutacja 2025 - Michał Sarzała</h1>
      <div>
        <Link to="geoportal">Go to Geoportal</Link>
      </div>
    </>
  )
}

export default App
