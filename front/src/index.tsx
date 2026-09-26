import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { legacy_createStore as createStore, type StoreEnhancer } from "redux";
import App from "./App";
import rootReducer from "./reducers/combineReducer";

declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION__?: () => StoreEnhancer;
	}
}

const devtools = window.__REDUX_DEVTOOLS_EXTENSION__
	? window.__REDUX_DEVTOOLS_EXTENSION__()
	: undefined;

const store = createStore(rootReducer, undefined, devtools);

const container = document.querySelector("#root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</React.StrictMode>,
);
