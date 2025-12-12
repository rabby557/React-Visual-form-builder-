import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BuilderState, Component } from '../types';

const initialState: BuilderState = {
  components: [],
  selectedComponentId: null,
  isDragging: false,
};

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    addComponent: (state, action: PayloadAction<Component>) => {
      state.components.push(action.payload);
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      state.components = state.components.filter((c) => c.id !== action.payload);
      if (state.selectedComponentId === action.payload) {
        state.selectedComponentId = null;
      }
    },
    updateComponent: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Component> }>
    ) => {
      const component = state.components.find((c) => c.id === action.payload.id);
      if (component) {
        Object.assign(component, action.payload.updates);
      }
    },
    selectComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
    reorderComponents: (state, action: PayloadAction<Component[]>) => {
      state.components = action.payload;
    },
  },
});

export const {
  addComponent,
  removeComponent,
  updateComponent,
  selectComponent,
  setDragging,
  reorderComponents,
} = builderSlice.actions;

export default builderSlice.reducer;
