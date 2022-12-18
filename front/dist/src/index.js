import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createStore } from "redux";
import rootReducer from "./reducers/combineReducer";
import { composeWithDevTools } from "redux-devtools-extension";
const store = createStore(rootReducer, composeWithDevTools());
import App from "./App";
const container = document.querySelector("#root");
const root = createRoot(container);
root.render(React.createElement(Provider, { store: store },
    React.createElement(App, null)));
