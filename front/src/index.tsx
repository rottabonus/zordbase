import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import App from "./App";
import rootReducer from "./reducers/combineReducer";

const devtools = (window as any).__REDUX_DEVTOOLS_EXTENSION__
	? (window as any).__REDUX_DEVTOOLS_EXTENSION__()
	: (f: any) => f;

const store = createStore(rootReducer, devtools);

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
