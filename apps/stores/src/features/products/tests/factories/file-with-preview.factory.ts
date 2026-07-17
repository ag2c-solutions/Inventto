import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type { FileWithPreview } from '@/shared/components/common/file-picker/types';

export const fileWithPreviewFactory = Factory.define<FileWithPreview>(() => ({
  id: faker.string.uuid(),
  name: faker.system.fileName(),
  url: faker.image.url(),
  type: 'image/png',
  publicId: faker.string.alphanumeric(12),
  isPrimary: false
}));
