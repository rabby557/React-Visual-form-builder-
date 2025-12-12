import { getFieldRegistry } from './registry';
import { textFieldDefinition } from './TextField';
import { textareaFieldDefinition } from './TextareaField';
import { selectFieldDefinition } from './SelectField';
import { checkboxFieldDefinition } from './CheckboxField';
import { radioFieldDefinition } from './RadioField';
import { fileUploadFieldDefinition } from './FileUploadField';
import { dateFieldDefinition } from './DateField';
import { timeFieldDefinition } from './TimeField';
import { richTextFieldDefinition } from './RichTextField';
import { sliderFieldDefinition } from './SliderField';

let isInitialized = false;

export function initializeFieldRegistry(): void {
  if (isInitialized) return;

  const registry = getFieldRegistry();

  registry.register('text', textFieldDefinition);
  registry.register('textarea', textareaFieldDefinition);
  registry.register('select', selectFieldDefinition);
  registry.register('checkbox', checkboxFieldDefinition);
  registry.register('radio', radioFieldDefinition);
  registry.register('file_upload', fileUploadFieldDefinition);
  registry.register('date', dateFieldDefinition);
  registry.register('time', timeFieldDefinition);
  registry.register('rich_text', richTextFieldDefinition);
  registry.register('slider', sliderFieldDefinition);

  isInitialized = true;
}
