import { configureStore } from "@reduxjs/toolkit";

import listsReducer from "./state/lists";
import armyReducer from "./state/army";

export default configureStore({
  reducer: { lists: listsReducer, army: armyReducer },
});
