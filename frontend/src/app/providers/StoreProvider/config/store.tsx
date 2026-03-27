import { combineReducers, configureStore } from '@reduxjs/toolkit';
import collectionReducer from 'widgets/CollectionList/model/slice/CollectionSlice';
import collectionsByMicrositeReducer from 'widgets/MicrositeCollectionList/model/slice/CollectionSlice';
import resourcesReducer from 'widgets/ResourcesList/model/slice/ResourcesSlice';
import collectionDetailsReducer from 'pages/CollectionDetails/model/slice/CollectionDetailsSlice';
import ItemsSlice from 'widgets/MyItems/model/slice/ItemsSlice';
import CasesSlice from 'pages/Cases/model/slice/CasesSlice';
import LtiSlice from 'pages/Lti/model/slice/LtiSlice';

const rootReducer = combineReducers({
  collectionReducer,
  collectionsByMicrositeReducer,
  resourcesReducer,
  collectionDetailsReducer,
  ItemsSlice,
  CasesSlice,
  LtiSlice,
});

export const setupStore = () => configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
