import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import appSlice from "./slices/appSlice";
import candidateSlice from "./slices/candidateSlice";
import interviewSlice from "./slices/interviewSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["app", "candidates", "interview"],
};

const rootReducer = combineReducers({
  app: appSlice,
  candidates: candidateSlice,
  interview: interviewSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

//Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
