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
  init: { mode: "stopped" },
  view: state => h("div", {}, [
    h("p", {}, [
      state.mode == "stopped"
      ? h("button", { onclick: Start }, "START")
      : h("button", { onclick: Cancel }, "CANCEL"),

      state.mode === "paused"
      ? h("button", { onclick: Continue }, "CONTINUE")
      : h(
        "button",
        {
          disabled: state.mode === "stopped",
          onclick: Pause
        },
        "PAUSE"
      )
    ]),
    h("p", {}, [`Current state: ${state.mode}`]),
  ]),
  node: document.getElementById("app")
})

