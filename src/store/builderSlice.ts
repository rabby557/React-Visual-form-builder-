import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BuilderState, Component, FormSchema, FormStep } from '../types';

const DEFAULT_STEP_ID = 'step_1';

const normalizeSteps = (steps: FormStep[]): FormStep[] => {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  return sorted.map((step, index) => ({ ...step, order: index }));
};

const normalizeComponents = (components: Component[], steps: FormStep[]): Component[] => {
  const stepIds = new Set(steps.map((s) => s.id));
  const fallbackStepId = steps[0]?.id ?? DEFAULT_STEP_ID;

  const byStep = new Map<string, Component[]>();

  for (const component of components) {
    const stepId = component.stepId && stepIds.has(component.stepId) ? component.stepId : fallbackStepId;
    const list = byStep.get(stepId) ?? [];
    list.push({ ...component, stepId });
    byStep.set(stepId, list);
  }

  const normalized: Component[] = [];

  for (const step of steps) {
    const list = byStep.get(step.id) ?? [];
    const sorted = [...list].sort((a, b) => a.order - b.order);
    normalized.push(...sorted.map((component, index) => ({ ...component, order: index })));
  }

  return normalized;
};

const normalizeSchema = (schema: FormSchema): FormSchema => {
  const steps = normalizeSteps(schema.steps.length > 0 ? schema.steps : [{
    id: DEFAULT_STEP_ID,
    title: 'Step 1',
    order: 0,
  }]);

  const components = normalizeComponents(schema.components, steps);
  return { steps, components };
};

const commitSchema = (state: BuilderState, nextPresent: FormSchema) => {
  state.schema.past.push(state.schema.present);
  state.schema.present = normalizeSchema(nextPresent);
  state.schema.future = [];

  if (
    state.selectedStepId &&
    !state.schema.present.steps.some((step) => step.id === state.selectedStepId)
  ) {
    state.selectedStepId = state.schema.present.steps[0]?.id ?? null;
  }
};

const initialSchema: FormSchema = {
  steps: [{ id: DEFAULT_STEP_ID, title: 'Step 1', order: 0 }],
  components: [],
};

const initialState: BuilderState = {
  schema: {
    past: [],
    present: initialSchema,
    future: [],
  },
  selectedComponentId: null,
  selectedStepId: DEFAULT_STEP_ID,
  isDragging: false,
};

const builderSlice = createSlice({
  name: 'builder',
  initialState,
  reducers: {
    addStep: (state, action: PayloadAction<{ step: FormStep }>) => {
      const nextSteps = [...state.schema.present.steps, action.payload.step];
      commitSchema(state, { ...state.schema.present, steps: nextSteps });
      state.selectedStepId = action.payload.step.id;
    },
    removeStep: (state, action: PayloadAction<string>) => {
      const stepId = action.payload;
      const steps = state.schema.present.steps;
      if (steps.length <= 1) return;
      if (!steps.some((s) => s.id === stepId)) return;

      const remainingSteps = steps.filter((s) => s.id !== stepId);
      const fallbackStepId = remainingSteps[0]?.id ?? DEFAULT_STEP_ID;

      const nextComponents = state.schema.present.components.map((component) =>
        component.stepId === stepId ? { ...component, stepId: fallbackStepId } : component
      );

      commitSchema(state, { steps: remainingSteps, components: nextComponents });

      if (state.selectedStepId === stepId) {
        state.selectedStepId = fallbackStepId;
      }
    },
    updateStep: (state, action: PayloadAction<{ id: string; updates: Partial<FormStep> }>) => {
      const nextSteps = state.schema.present.steps.map((step) =>
        step.id === action.payload.id ? { ...step, ...action.payload.updates } : step
      );
      commitSchema(state, { ...state.schema.present, steps: nextSteps });
    },
    selectStep: (state, action: PayloadAction<string | null>) => {
      const id = action.payload;
      if (id === null) {
        state.selectedStepId = null;
        return;
      }

      if (state.schema.present.steps.some((step) => step.id === id)) {
        state.selectedStepId = id;
      }
    },

    addComponent: (state, action: PayloadAction<{ component: Component; index?: number }>) => {
      const fallbackStepId = state.selectedStepId ?? state.schema.present.steps[0]?.id ?? DEFAULT_STEP_ID;
      const stepId = action.payload.component.stepId ?? fallbackStepId;

      const existing = state.schema.present.components.filter((c) => c.stepId === stepId);
      const insertIndex = action.payload.index ?? existing.length;

      const updatedExisting = existing.map((component) =>
        component.order >= insertIndex ? { ...component, order: component.order + 1 } : component
      );

      const nextComponent: Component = {
        ...action.payload.component,
        stepId,
        order: insertIndex,
      };

      const nextComponents = [
        ...state.schema.present.components.filter((c) => c.stepId !== stepId),
        ...updatedExisting,
        nextComponent,
      ];

      commitSchema(state, { ...state.schema.present, components: nextComponents });
    },
    removeComponent: (state, action: PayloadAction<string>) => {
      const nextComponents = state.schema.present.components.filter((c) => c.id !== action.payload);
      commitSchema(state, { ...state.schema.present, components: nextComponents });

      if (state.selectedComponentId === action.payload) {
        state.selectedComponentId = null;
      }
    },
    updateComponent: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Component> }>
    ) => {
      const index = state.schema.present.components.findIndex((c) => c.id === action.payload.id);
      if (index === -1) return;

      const current = state.schema.present.components[index];
      const updates = action.payload.updates;
      const nextComponent: Component = {
        ...current,
        ...updates,
        props: {
          ...current.props,
          ...(updates.props ?? {}),
        },
      };

      if (updates.stepId && updates.stepId !== current.stepId) {
        const targetStepComponents = state.schema.present.components.filter(
          (c) => c.stepId === updates.stepId && c.id !== current.id
        );
        const maxOrder = Math.max(-1, ...targetStepComponents.map((c) => c.order));
        nextComponent.order = maxOrder + 1;
      }

      const nextComponents = state.schema.present.components.map((component) =>
        component.id === action.payload.id ? nextComponent : component
      );

      commitSchema(state, { ...state.schema.present, components: nextComponents });
    },
    reorderComponents: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const active = state.schema.present.components.find((c) => c.id === action.payload.activeId);
      const over = state.schema.present.components.find((c) => c.id === action.payload.overId);
      if (!active || !over) return;
      if (active.stepId !== over.stepId) return;

      const stepId = active.stepId;
      if (!stepId) return;

      const inStep = state.schema.present.components
        .filter((c) => c.stepId === stepId)
        .sort((a, b) => a.order - b.order);

      const activeIndex = inStep.findIndex((c) => c.id === active.id);
      const overIndex = inStep.findIndex((c) => c.id === over.id);
      if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) return;

      const nextInStep = [...inStep];
      const [moved] = nextInStep.splice(activeIndex, 1);
      nextInStep.splice(overIndex, 0, moved);

      const reordered = nextInStep.map((component, i) => ({ ...component, order: i }));

      const nextComponents = [
        ...state.schema.present.components.filter((c) => c.stepId !== stepId),
        ...reordered,
      ];

      commitSchema(state, { ...state.schema.present, components: nextComponents });
    },
    setSchema: (state, action: PayloadAction<FormSchema>) => {
      state.schema = {
        past: [],
        present: normalizeSchema(action.payload),
        future: [],
      };
      state.selectedComponentId = null;
      state.selectedStepId = state.schema.present.steps[0]?.id ?? null;
    },
    clearSchema: (state) => {
      state.schema = {
        past: [],
        present: initialSchema,
        future: [],
      };
      state.selectedComponentId = null;
      state.selectedStepId = initialSchema.steps[0]?.id ?? null;
    },
    undo: (state) => {
      const previous = state.schema.past[state.schema.past.length - 1];
      if (!previous) return;

      const newPast = state.schema.past.slice(0, -1);
      state.schema.future = [state.schema.present, ...state.schema.future];
      state.schema.past = newPast;
      state.schema.present = normalizeSchema(previous);

      if (
        state.selectedComponentId &&
        !state.schema.present.components.some((c) => c.id === state.selectedComponentId)
      ) {
        state.selectedComponentId = null;
      }

      if (
        state.selectedStepId &&
        !state.schema.present.steps.some((step) => step.id === state.selectedStepId)
      ) {
        state.selectedStepId = state.schema.present.steps[0]?.id ?? null;
      }
    },
    redo: (state) => {
      const next = state.schema.future[0];
      if (!next) return;

      state.schema.past = [...state.schema.past, state.schema.present];
      state.schema.future = state.schema.future.slice(1);
      state.schema.present = normalizeSchema(next);

      if (
        state.selectedComponentId &&
        !state.schema.present.components.some((c) => c.id === state.selectedComponentId)
      ) {
        state.selectedComponentId = null;
      }

      if (
        state.selectedStepId &&
        !state.schema.present.steps.some((step) => step.id === state.selectedStepId)
      ) {
        state.selectedStepId = state.schema.present.steps[0]?.id ?? null;
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
  addStep,
  removeStep,
  updateStep,
  selectStep,
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
