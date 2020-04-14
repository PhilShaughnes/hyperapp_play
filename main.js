import { h, app } from "https://unpkg.com/hyperapp"
import { onAnimationFrame } from "https://unpkg.com/@hyperapp/events@0.0.3"

const DURATION = 15000 //ms = 15s

const Start = state =>
  state.mode === "stopped"
  ? {
    mode: "running",
    startedTime: event.timeStamp,
    remainingTime: DURATION,
    duration: DURATION
  }
  : state

const Pause = state =>
  state.mode === "running"
  ? {
    ...state,
    mode: "paused"
  }
  : state

const Continue = state =>
  state.mode === "paused"
  ? {
    ...state,
    mode: "running",
    startedTime: event.timeStamp,
    duration: state.remainingTime
  }
  : state

const Cancel = state => ({
  ...state,
  mode: "stopped"
})

const UpdateTime = (state, timestamp) =>
  state.mode !== "running"
    ? state
    : state.remainingTime < 0
      ? Cancel(state)
      : {
        ...state,
        remainingTime: state.duration + state.startedTime - timestamp
      }

app({
  init: { mode: "stopped" },
  subscriptions: state => [
    state.mode === "running" && onAnimationFrame(UpdateTime)
  ],
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

    state.remainingTime
    && h("p", {}, ["Remaining: ", state.remainingTime, " ms"])
  ]),
  node: document.getElementById("app")
})

