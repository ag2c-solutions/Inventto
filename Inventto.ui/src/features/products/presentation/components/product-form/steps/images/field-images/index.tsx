import { useWatch } from 'react-hook-form';

import {
  FilePicker,
  FilePickerInput
} from '@/shared/components/common/file-picker';
import { FormField } from '@/shared/components/ui/form';

import { useProductForm } from '../../../hook';

import { DropZone } from './drop-zone';
import { ImageGrid } from './image-grid';

const MAX_FILES = 10;
const MAX_SIZE_MB = 5;

export function ProductFormFieldImages() {
  const { form } = useProductForm();
  const hasVariants = useWatch({ control: form.control, name: 'hasVariants' });

  return (
    <FormField
      control={form.control}
      name="allImages"
      render={({ field }) => (
        <FilePicker
          files={field.value || []}
          onFilesChange={field.onChange}
          maxFiles={MAX_FILES}
          maxSizeMB={MAX_SIZE_MB}
          accept="image/png,image/jpeg,image/jpg,image/webp"
        >
          <FilePickerInput />
          <DropZone />
          <ImageGrid hasVariants={!!hasVariants} />
        </FilePicker>
      )}
    />
  );
}
