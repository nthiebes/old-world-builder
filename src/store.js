import { configureStore } from "@reduxjs/toolkit";

import listsReducer from "./state/lists";
import armyReducer from "./state/army";
import itemsReducer from "./state/items";
import errorsReducer from "./state/errors";
import rulesIndexReducer from "./state/rules-index";

export default configureStore({
  reducer: {
    lists: listsReducer,
    army: armyReducer,
    items: itemsReducer,
    errors: errorsReducer,
    rulesIndex: rulesIndexReducer,
  },
});
