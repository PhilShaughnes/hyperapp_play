import { h, app } from "https://unpkg.com/hyperapp"
// import { onAnimationFrame } from "https://unpkg.com/@hyperapp/events@0.0.3"
/** @jsx h */

const DURATION = 15000 //ms = 15s

const Start = (state, event) =>
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


const handleStateFor = (action) => (state, {id, payload}) => ( {
    ...state,
    [id]: action(state[id], payload)
  })

/*
 * this one is weird to me.
 * if I don't move the call to handleStateFor to outside of the
 * generated returned function, we get some weird state behavior.
 *
 * The two timers cannot be updated at the same time - we can start
 * them both, but if timer1 is running, only timer1 shows the guage
 * updated
 */
const click = action => {
  var stateHandlingAction = handleStateFor(action)
  return id => [stateHandlingAction, payload => ({id, payload})]
}

const clickStart        = click(Start)
const clickPause        = click(Pause)
const clickContinue     = click(Continue)
const clickCancel       = click(Cancel)
const doUpdateTime      = click(UpdateTime)


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

const Controls = (state, id) => h("p", {}, [
  state.mode == "stopped"
  ? h("button", { onclick: clickStart(id)}, "START")
  : h("button", { onclick: clickCancel(id) }, "CANCEL"),

  state.mode === "paused"
  ? h("button", { onclick: clickContinue(id) }, "CONTINUE")
  : h(
    "button",
    {
      disabled: state.mode === "stopped",
      onclick: clickPause(id)
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

const withId = id  => payload => ({id, payload})

app({
  init: {
    timer1: { mode: "stopped" },
    timer2: { mode: "stopped" }
  },
  subscriptions: state => [
    state.timer1.mode === "running" && onAnimationFrame(doUpdateTime("timer1")),
    state.timer2.mode === "running" && onAnimationFrame(doUpdateTime("timer2")),
  ],
  view: state => h("div", {}, [
    h("p", {}, `timer 1: ${state.timer1.mode}`),
    Controls(state.timer1, "timer1"),
    Gauge(state.timer1),
    h("hr"),
    h("p", {}, `timer 2: ${state.timer2.mode}`),
    Controls(state.timer2, "timer2"),
    Gauge(state.timer2),
  ]),
  node: document.getElementById("app")
})

