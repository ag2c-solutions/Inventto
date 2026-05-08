import { useMemo, useState } from 'react';

import type { Category } from '@/features/categories';
import {
  useCategoriesQuery,
  useCategoryAddMutation
} from '@/features/categories';

export function useCategoryField() {
  const { data: categories = [] } = useCategoriesQuery();
  const { mutateAsync: createCategoryMutate } = useCategoryAddMutation();

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = useMemo(() => {
    if (!normalizedSearchQuery) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().startsWith(normalizedSearchQuery)
    );
  }, [categories, normalizedSearchQuery]);

  const exactMatch = useMemo(() => {
    if (!normalizedSearchQuery) {
      return false;
    }

    return categories.some(
      (category) => category.name.toLowerCase() === normalizedSearchQuery
    );
  }, [categories, normalizedSearchQuery]);

  const showCreateOption = normalizedSearchQuery.length > 0 && !exactMatch;

  const handleCreateCategory = async (): Promise<Category | undefined> => {
    const categoryName = searchQuery.trim();

    if (!categoryName) return;

    setIsCreating(true);

    try {
      const newCategory = await createCategoryMutate(categoryName);

      setOpen(false);
      setSearchQuery('');

      return newCategory;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(error);
      }

      return undefined;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    filteredCategories,
    showCreateOption,
    isCreating,
    handleCreateCategory
  };
}
