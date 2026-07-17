import { useState } from 'react';

import type { Storefront } from '../../../../../../domain/entities';
import {
  usePublishStorefrontMutation,
  useUnpublishStorefrontMutation
} from '../../../../../hooks/use-mutations';

import { useCopyStorefrontLink } from './use-copy-storefront-link';

export function useRowActionsMenu(storefront: Storefront) {
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const { mutate: unpublish } = useUnpublishStorefrontMutation();
  const { mutate: publish } = usePublishStorefrontMutation();
  const { copyLink } = useCopyStorefrontLink();

  function handleUnpublish() {
    unpublish(storefront.id);
  }

  function handlePublish() {
    publish(storefront.id, {
      onSuccess: (result) => {
        if (!result.published) setIsPublishDialogOpen(true);
      }
    });
  }

  function handleCopyLink() {
    if (storefront.publicUrl) copyLink(storefront.publicUrl);
  }

  return {
    isPublishDialogOpen,
    setIsPublishDialogOpen,
    isRemoveDialogOpen,
    setIsRemoveDialogOpen,
    handleUnpublish,
    handlePublish,
    handleCopyLink
  };
}
