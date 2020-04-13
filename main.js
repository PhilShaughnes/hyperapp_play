import { h, app } from "https://unpkg.com/hyperapp"

const Start = state =>
    state.mode === "stopped"
    ? { ...state, mode: "running" }
    : state
const Pause = state =>
    state.mode === "running"
    ? { ...state, mode: "paused" }
    : state
const Continue = state =>
    state.mode === "paused"
    ? { ...state, mode: "running" }
    : state
const Cancel = state => ({ ...state, mode: "stopped" })

app({
  init: { mode: "paused" },
  view: state =>
    h("div", {}, [
      h("p", {}, [`Current state: ${state.mode}`]),
    ]),
  node: document.getElementById("app")
})

