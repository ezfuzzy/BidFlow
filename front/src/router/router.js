import React from "react"
import { createHashRouter } from "react-router-dom"
import App from "../App"
import Home from "../pages/Home"
import GraphVisualizer from "../pages/apps/simulators/graph-simulator/GraphVisualizer"
import TicTacToe from "../pages/apps/sockets/tic-tac-toe/Tictactoe"
import MemorySimulator from "../pages/apps/simulators/memory-simulator/MemorySimulator"
import KakaoMap from "../pages/apps/simulators/map-api/KakaoMap"

const routes = [
  { path: "/", element: <Home /> },

  // Apps

  { path: "/A", element: <TicTacToe /> },
  { path: "/B", element: <GraphVisualizer /> },
  { path: "/C", element: <MemorySimulator /> },
  { path: "/D", element: <KakaoMap /> },
]

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: routes.map((route) => {
      return {
        index: route.path === "/",
        path: route.path === "/" ? undefined : route.path,
        element: route.element,
      }
    }),
  },
])

export default router
