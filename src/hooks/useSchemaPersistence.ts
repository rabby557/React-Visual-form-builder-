import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearSchema, setSchema } from '../store/builderSlice';
import {
  clearSchemaStorage,
  loadSchemaFromStorage,
  parseSchemaJson,
  saveSchemaToStorage,
  serializeSchemaV1,
} from '../utils/schemaStorage';

export const useSchemaPersistence = () => {
  const dispatch = useAppDispatch();
  const components = useAppSelector((state) => state.builder.schema.present);

  const save = useCallback(() => {
    saveSchemaToStorage(components);
  }, [components]);

  const load = useCallback(() => {
    const loaded = loadSchemaFromStorage();
    if (!loaded) return false;
    dispatch(setSchema(loaded));
    return true;
  }, [dispatch]);

  const clear = useCallback(() => {
    clearSchemaStorage();
    dispatch(clearSchema());
  }, [dispatch]);

  const exportJson = useCallback(() => {
    return JSON.stringify(serializeSchemaV1(components), null, 2);
  }, [components]);

  const importJson = useCallback(
    (json: string) => {
      const next = parseSchemaJson(json);
      dispatch(setSchema(next));
    },
    [dispatch]
  );

  return { save, load, clear, exportJson, importJson };
};
