import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import themeReducer from "./themeSlice";
import authReducer from "./authSlice";
import storage from "redux-persist/lib/storage";
import { decryptState, encryptState } from "./config/encryption";

const encryptTransform = createTransform(
  (inboundState) => encryptState(inboundState),
  (outboundState) => decryptState(outboundState)
);

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "theme"],
  transforms: [encryptTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store, null, () => {
  // Handle any post-rehydration logic here if needed
});

export const RootState = store.getState();
export const AppDispatch = store.dispatch;