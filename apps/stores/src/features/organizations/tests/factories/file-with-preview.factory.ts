import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';

export const fileWithPreviewFactory = Factory.define<FileWithPreview>(() => ({
  id: faker.string.uuid(),
  file: new File(['x'], 'logo.png', { type: 'image/png' }),
  name: 'logo.png',
  url: 'blob:preview',
  type: 'image/png'
}));
