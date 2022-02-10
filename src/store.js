import { configureStore } from "@reduxjs/toolkit";

import counterReducer from "./state/counter";
import listsReducer from "./state/lists";

export default configureStore({
  reducer: { counter: counterReducer, lists: listsReducer },
});
