import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BuilderState, Component } from '../types';

const normalizeOrders = (components: Component[]): Component[] => {
  return components.map((component, index) => ({ ...component, order: index }));
};

const commitSchema = (state: BuilderState, nextPresent: Component[]) => {
  state.schema.past.push(state.schema.present);
  state.schema.present = nextPresent;
  state.schema.future = [];
};

const initialState: BuilderState = {
  schema: {
    past: [],
    present: [],
    future: [],
  },
  selectedComponentId: null,
  isDragging: false,
};

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    addComponent: (state, action: PayloadAction<{ component: Component; index?: number }>) => {
      const next = [...state.schema.present];
      const index = action.payload.index ?? next.length;

      next.splice(index, 0, action.payload.component);
      commitSchema(state, normalizeOrders(next));
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      const next = state.schema.present.filter((c) => c.id !== action.payload);
      commitSchema(state, normalizeOrders(next));

      if (state.selectedComponentId === action.payload) {
        state.selectedComponentId = null;
      }
    },
    updateComponent: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Component> }>
    ) => {
      const index = state.schema.present.findIndex((c) => c.id === action.payload.id);
      if (index === -1) return;

      const current = state.schema.present[index];
      const updates = action.payload.updates;
      const nextComponent: Component = {
        ...current,
        ...updates,
        props: {
          ...current.props,
          ...(updates.props ?? {}),
        },
      };

      const next = state.schema.present.map((component) =>
        component.id === action.payload.id ? nextComponent : component
      );

      commitSchema(state, normalizeOrders(next));
    },
    reorderComponents: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const activeIndex = state.schema.present.findIndex((c) => c.id === action.payload.activeId);
      const overIndex = state.schema.present.findIndex((c) => c.id === action.payload.overId);
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;

      const next = [...state.schema.present];
      const [moved] = next.splice(activeIndex, 1);
      next.splice(overIndex, 0, moved);

      commitSchema(state, normalizeOrders(next));
    },
    setSchema: (state, action: PayloadAction<Component[]>) => {
      state.schema = {
        past: [],
        present: normalizeOrders(action.payload),
        future: [],
      };
      state.selectedComponentId = null;
    },
    clearSchema: (state) => {
      state.schema = {
        past: [],
        present: [],
        future: [],
      };
      state.selectedComponentId = null;
    },
    undo: (state) => {
      const previous = state.schema.past[state.schema.past.length - 1];
      if (!previous) return;

      const newPast = state.schema.past.slice(0, -1);
      state.schema.future = [state.schema.present, ...state.schema.future];
      state.schema.past = newPast;
      state.schema.present = previous;

      if (state.selectedComponentId && !previous.some((c) => c.id === state.selectedComponentId)) {
        state.selectedComponentId = null;
      }
    },
    redo: (state) => {
      const next = state.schema.future[0];
      if (!next) return;

      state.schema.past = [...state.schema.past, state.schema.present];
      state.schema.future = state.schema.future.slice(1);
      state.schema.present = next;

      if (state.selectedComponentId && !next.some((c) => c.id === state.selectedComponentId)) {
        state.selectedComponentId = null;
      }
    },
    selectComponent: (state, action: PayloadAction<string | null>) => {
      state.selectedComponentId = action.payload;
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
  },
});

export const {
  addComponent,
  removeComponent,
  updateComponent,
  reorderComponents,
  setSchema,
  clearSchema,
  undo,
  redo,
  selectComponent,
  setDragging,
} = builderSlice.actions;

export default builderSlice.reducer;
