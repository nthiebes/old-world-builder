import { configureStore } from "@reduxjs/toolkit";

import listsReducer from "./state/lists";
import armyReducer from "./state/army";
import itemsReducer from "./state/items";

export default configureStore({
  reducer: { lists: listsReducer, army: armyReducer, items: itemsReducer },
});
