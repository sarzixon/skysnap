import { css } from "@emotion/react"
import Button from "@mui/material/Button"
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
      <div css={css`
          text-align: center;
        `}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="geoportal"
          sx={{
            ":visited": {
              color: 'initial'
            }
          }}
        >
          Go to Geoportal
        </Button>
      </div>
    </>
  )
}

export default App
