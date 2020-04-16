import { h, app } from "https://unpkg.com/hyperapp"
// import { onAnimationFrame } from "https://unpkg.com/@hyperapp/events@0.0.3"

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

const onAnimationFrame = (() => {
    const subFn = (dispatch, options) => {
        let id = requestAnimationFrame(function frame(timestamp) {
            id = requestAnimationFrame(frame)
            dispatch(options.action, timestamp)
        }) 
        return () => cancelAnimationFrame(id)
    }
    return action => [subFn, { action }]
})()

const Controls = state => h("p", {}, [
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
])

const Gauge = state => h("div", { class: "gauge" }, [
  h("div", {
    class: "gauge-meter",
    style: {
      width:
        state.mode !== "stopped"
          ? (100 * state.remainingTime) / DURATION + "%"
          : "100%"
    }
  }),
  state.mode !== "stopped" &&
  h("p", { class: "gauge-text" }, [
    Math.ceil(state.remainingTime / 1000),
    " s"
  ])
])

app({
  init: { mode: "stopped" },
  subscriptions: state => [
    state.mode === "running" && onAnimationFrame(UpdateTime)
  ],
  view: state => h("div", {}, [
    h("p", {}, [`Current state: ${state.mode}`]),
    h("p", {}, "timer 1: "),
    Controls(state),
    Gauge(state),
    h("hr"),
    h("p", {}, "timer 2: "),
    Controls(state),
    Gauge(state)
  ]),
  node: document.getElementById("app")
})

