import { describe, expect, it } from 'vitest';
import reducer, {
  addComponent,
  removeComponent,
  reorderComponents,
  undo,
  redo,
  updateComponent,
  addStep,
} from './builderSlice';
import type { BuilderState, Component, FormSchema } from '../types';

const makeComponent = (overrides: Partial<Component> = {}): Component => {
  return {
    id: overrides.id ?? 'id',
    type: overrides.type ?? 'text',
    props: overrides.props ?? { label: 'Label', name: 'name', required: false },
    order: overrides.order ?? 0,
    stepId: overrides.stepId ?? 'step_1',
  };
};

const makeSchema = (overrides: Partial<FormSchema> = {}): FormSchema => {
  return {
    steps: overrides.steps ?? [{ id: 'step_1', title: 'Step 1', order: 0 }],
    components: overrides.components ?? [],
  };
};

describe('builderSlice (smoke)', () => {
  it('adds a component and normalizes order within a step', () => {
    const state = reducer(undefined, addComponent({ component: makeComponent({ id: 'a', order: 10 }) }));

    expect(state.schema.present.components).toHaveLength(1);
    expect(state.schema.present.components[0].id).toBe('a');
    expect(state.schema.present.components[0].order).toBe(0);
    expect(state.schema.past).toHaveLength(1);
  });

  it('inserts a component at index within the active step (template drop)', () => {
    const first = makeComponent({ id: 'first', order: 0 });
    const second = makeComponent({ id: 'second', order: 1 });

    const seeded = reducer(undefined, addComponent({ component: first }));

    const next = reducer(seeded, addComponent({ component: second, index: 0 }));

    expect(next.schema.present.components.map((c) => c.id)).toEqual(['second', 'first']);
    expect(next.schema.present.components.map((c) => c.order)).toEqual([0, 1]);
  });

  it('reorders components within a step (sortable drag)', () => {
    const seeded: BuilderState = {
      schema: {
        past: [],
        present: makeSchema({
          components: [makeComponent({ id: 'a', order: 0 }), makeComponent({ id: 'b', order: 1 })],
        }),
        future: [],
      },
      selectedComponentId: null,
      selectedStepId: 'step_1',
      isDragging: false,
    };

    const next = reducer(seeded, reorderComponents({ activeId: 'a', overId: 'b' }));

    expect(next.schema.present.components.map((c) => c.id)).toEqual(['b', 'a']);
    expect(next.schema.present.components.map((c) => c.order)).toEqual([0, 1]);
  });

  it('supports undo/redo across add/remove/update', () => {
    const first = makeComponent({ id: 'a', order: 0 });
    const second = makeComponent({ id: 'b', order: 1 });

    const afterAddA = reducer(undefined, addComponent({ component: first }));
    const afterAddB = reducer(afterAddA, addComponent({ component: second }));
    const afterUpdate = reducer(
      afterAddB,
      updateComponent({ id: 'a', updates: { props: { label: 'Updated' } } })
    );
    const afterRemove = reducer(afterUpdate, removeComponent('b'));

    const undone = reducer(afterRemove, undo());
    expect(undone.schema.present.components.map((c) => c.id)).toEqual(['a', 'b']);

    const undoneTwice = reducer(undone, undo());
    expect(undoneTwice.schema.present.components.find((c) => c.id === 'a')?.props.label).toBe('Label');

    const redone = reducer(undoneTwice, redo());
    expect(redone.schema.present.components.find((c) => c.id === 'a')?.props.label).toBe('Updated');
  });

  it('tracks steps inside schema history', () => {
    const withStep = reducer(
      undefined,
      addStep({ step: { id: 'step_2', title: 'Step 2', order: 1 } })
    );

    expect(withStep.schema.present.steps).toHaveLength(2);

    const undone = reducer(withStep, undo());
    expect(undone.schema.present.steps).toHaveLength(1);
  });
});
