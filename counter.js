import { h, app } from "https://unpkg.com/hyperapp"

let posClick = (state) => {
  return {...state, posClicks: state.posClicks + 1, count: state.count + 1};
}

let negClick = (state) => {
  return {...state, negClicks: state.negClicks + 1, count: state.count - 1};
}

app({
  init: {
    posClicks: 0,
    negClicks: 0,
    count: 0
  },
  view: state =>
    h("main", {}, [
      h("h1", {}, state.count),
      h("button", { onClick: negClick(state) }, `- (${state.negClicks})`),
      h("button", { onClick: posClick(state) }, `+ (${state.posClicks})`)
    ]),
  node: document.getElementById("counter")
})

