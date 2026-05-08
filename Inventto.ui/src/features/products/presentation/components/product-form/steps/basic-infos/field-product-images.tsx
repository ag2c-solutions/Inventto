import { ImageIcon } from 'lucide-react';

import {
  FilePicker,
  FilePickerAddMoreButton,
  FilePickerButton,
  FilePickerContent,
  FilePickerCount,
  FilePickerDrag,
  FilePickerEmpty,
  FilePickerError,
  FilePickerHeader,
  FilePickerInput,
  FilePickerRemoveAllButton
} from '@/shared/components/common/file-picker';
import { FormField, FormMessage } from '@/shared/components/ui/form';

import { useProductForm } from '../../hook';

const MAX_FILES = 10;
const MAX_SIZE_MB = 5;

export function ProductFormFieldImages() {
  const { form } = useProductForm();

  return (
    <FormField
      control={form.control}
      name={'allImages'}
      render={({ field }) => (
        <FilePicker
          files={field.value || []}
          onFilesChange={field.onChange}
          maxFiles={MAX_FILES}
          maxSizeMB={MAX_SIZE_MB}
          accept="image/png,image/jpeg,image/jpg"
        >
          <FilePickerInput />
          <FilePickerDrag>
            <FilePickerHeader>
              <div className="w-full flex items-center justify-between gap-2 mb-3">
                <div>
                  <FilePickerCount label="Imagens" />
                </div>
                <div className="flex gap-2">
                  <FilePickerAddMoreButton label="Adicionar imagens" />
                  <FilePickerRemoveAllButton label="Remover todas" />
                </div>
              </div>
            </FilePickerHeader>
            <FilePickerEmpty>
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">
                Solte a imagem dos produtos aqui
              </p>
              <p className="text-xs text-muted-foreground">
                Máximo de imagens {MAX_FILES} ∙ Até {MAX_SIZE_MB}MB
              </p>
              <FilePickerButton label="Selecionar imagens" />
            </FilePickerEmpty>
            <FilePickerContent className="md:grid-cols-5" />
            <FilePickerError />
          </FilePickerDrag>
          <FormMessage />
        </FilePicker>
      )}
    />
  );
}
