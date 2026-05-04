import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
  isDialogOpen: boolean;
  actions: {
    onChangeType: (type: MovementType) => void;
    addItem: (items: FormItem[]) => void;
    removeItem: (index: number) => void;
    selectProduct: (product: IProduct) => void;
    toggleDialog: (open: boolean) => void;
    submit: (data: MovementFormData) => Promise<void>;
    cancel: () => void;
  };
  isSubmitting: boolean;
}

const MovementFormContext = createContext<MovementFormContextType | null>(null);

export function MovementFormProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const createMutation = useMovementCreateMutation();

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      documentNumber: '',
      items: [],
      totalQuantity: 0
    }
  });

  useEffect(() => {
    const preselectId = searchParams.get('preselect');
    if (preselectId && products.length > 0 && !isLoadingProducts) {
      const found = products.find((p) => p.id === preselectId);
      if (found) {
        setSelectedProduct(found);
        setIsDialogOpen(true);
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('preselect');
          return newParams;
        });
      }
    }
  }, [searchParams, products, isLoadingProducts, setSearchParams]);

  const onChangeType = (type: MovementType) => {
    form.setValue('type', type);
    setReasonOptions([...ReasonOptions[type]] as MovementReason[]);
    form.trigger();
  };

  const selectProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const toggleDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedProduct(null);
  };

  const addItem = (newItems: FormItem[]) => {
    const currentItems = form.getValues('items');

    const safeNewItems = newItems.map((item) => ({
      ...item,
      currentStock: item.currentStock ?? 0,
      unitCost: item.unitCost ?? 0,
      unitPrice: item.unitPrice ?? 0
    }));

    const updatedItems = [...currentItems, ...safeNewItems];
    const totalQuantity = updatedItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );

    form.setValue('items', updatedItems, { shouldValidate: true });
    form.setValue('totalQuantity', totalQuantity);

    setIsDialogOpen(false);
    setSelectedProduct(null);
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
    const inputPayload: CreateMovementInput = {
      type: formData.type,
      reason: formData.reason,
      documentNumber: formData.documentNumber || undefined,
      items: formData.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice
      }))
    };

    try {
      await createMutation.mutateAsync(inputPayload);

      form.reset();
      navigate('/movements');
    } catch (error) {
      console.error('Submit failed (handled globally):', error);
    }
  };

  const handleCancel = () => {
    form.reset();
    navigate('/movements');
  };

  const value: MovementFormContextType = {
    form,
    reasonOptions,
    products,
    isLoadingProducts,
    isDialogOpen,
    selectedProduct,
    isSubmitting: createMutation.isPending,
    actions: {
      onChangeType,
      addItem,
      removeItem,
      selectProduct,
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
