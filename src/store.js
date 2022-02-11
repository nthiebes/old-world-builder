import { configureStore } from "@reduxjs/toolkit";

import listsReducer from "./state/lists";

export default configureStore({
  reducer: { lists: listsReducer },
});
