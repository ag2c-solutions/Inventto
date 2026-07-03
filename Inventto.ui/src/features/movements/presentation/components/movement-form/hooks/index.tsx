import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';

import type { IProduct } from '@/features/products';
import { useProductsQuery } from '@/features/products';

import type {
  CreateMovementInput,
  MovementType
} from '../../../../domain/entities';
import { useMovementCreateMutation } from '../../../hooks/use-mutations';
import { type MovementReason, ReasonOptions } from '../consts';
import { type MovementFormData, movementSchema } from '../schema';

type FormItem = MovementFormData['items'][number];

interface MovementFormContextType {
  form: UseFormReturn<MovementFormData>;
  reasonOptions: MovementReason[];
  products: IProduct[];
  isLoadingProducts: boolean;
  selectedProduct: IProduct | null;
  editingItem: FormItem | null;
  editingIndex: number | null;
  isDialogOpen: boolean;
  actions: {
    onChangeType: (type: MovementType) => void;
    addItem: (items: FormItem[]) => void;
    removeItem: (index: number) => void;
    selectProduct: (product: IProduct) => void;
    editItem: (index: number) => void;
    toggleDialog: (open: boolean) => void;
    submit: (data: MovementFormData) => Promise<void>;
    cancel: () => void;
  };
  isSubmitting: boolean;
}

const MovementFormContext = createContext<MovementFormContextType | null>(null);

interface MovementFormProviderProps {
  children: ReactNode;
  preselectProductId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MovementFormProvider({
  children,
  preselectProductId,
  onSuccess,
  onCancel
}: MovementFormProviderProps) {
  const createMutation = useMovementCreateMutation();

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [reasonOptions, setReasonOptions] = useState<MovementReason[]>([
    ...ReasonOptions.entry
  ] as MovementReason[]);

  const { data: products = [], isLoading: isLoadingProducts } =
    useProductsQuery();

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'entry',
      date: new Date(),
      time: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      reason: '',
      description: '',
      documentNumber: '',
      items: [],
      totalQuantity: 0
    }
  });

  const items = form.watch('items');
  const editingItem =
    editingIndex !== null ? (items[editingIndex] ?? null) : null;

  useEffect(() => {
    if (preselectProductId && products.length > 0 && !isLoadingProducts) {
      const found = products.find((p) => p.id === preselectProductId);

      if (found) {
        setSelectedProduct(found);
        setIsDialogOpen(true);
      }
    }
  }, [preselectProductId, products, isLoadingProducts]);

  const onChangeType = (type: MovementType) => {
    form.setValue('type', type);

    setReasonOptions([...ReasonOptions[type]] as MovementReason[]);
    form.setValue('reason', '');
  };

  const selectProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setEditingIndex(null);
    setIsDialogOpen(true);
  };

  const editItem = (index: number) => {
    const item = items[index];

    if (!item) return;

    const product = products.find((p) => p.id === item.productId);

    if (!product) return;

    setSelectedProduct(product);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const toggleDialog = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open) {
      setSelectedProduct(null);
      setEditingIndex(null);
    }
  };

  const addItem = (newItems: FormItem[]) => {
    const currentItems = form.getValues('items');
    const safeNewItems = newItems.map((item) => ({
      ...item,
      currentStock: item.currentStock ?? 0,
      unitCost: item.unitCost ?? 0,
      unitPrice: item.unitPrice ?? 0
    }));

    const updatedItems =
      editingIndex !== null
        ? currentItems.map((item, index) =>
            index === editingIndex ? (safeNewItems[0] ?? item) : item
          )
        : [...currentItems, ...safeNewItems];

    const totalQuantity = updatedItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    form.setValue('items', updatedItems, { shouldValidate: true });
    form.setValue('totalQuantity', totalQuantity);

    setIsDialogOpen(false);
    setSelectedProduct(null);
    setEditingIndex(null);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues('items');
    const updatedItems = currentItems.filter((_, i) => i !== index);
    const totalQuantity = updatedItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    form.setValue('items', updatedItems, { shouldValidate: true });
    form.setValue('totalQuantity', totalQuantity);
  };

  const handleSubmit = async (formData: MovementFormData) => {
    const [hours, minutes] = formData.time.split(':').map(Number);
    const executedAt = new Date(formData.date);
    executedAt.setHours(hours, minutes, 0, 0);

    const inputPayload: CreateMovementInput = {
      type: formData.type,
      reason: formData.reason as MovementReason,
      description:
        formData.reason === 'Outro' ? formData.description : undefined,
      documentNumber: formData.documentNumber || undefined,
      executedAt,
      items: formData.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice
      }))
    };

    await createMutation.mutateAsync(inputPayload);

    form.reset();
    onSuccess?.();
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  const value: MovementFormContextType = {
    form,
    reasonOptions,
    products,
    isLoadingProducts,
    isDialogOpen,
    selectedProduct,
    editingItem,
    editingIndex,
    isSubmitting: createMutation.isPending,
    actions: {
      onChangeType,
      addItem,
      removeItem,
      selectProduct,
      editItem,
      toggleDialog,
      submit: handleSubmit,
      cancel: handleCancel
    }
  };

  return (
    <MovementFormContext.Provider value={value}>
      <FormProvider {...form}>{children}</FormProvider>
    </MovementFormContext.Provider>
  );
}

export function useMovementForm() {
  const context = useContext(MovementFormContext);
  if (!context) {
    throw new Error(
      'useMovementForm deve ser usado dentro de um MovementFormProvider'
    );
  }
  return context;
}
