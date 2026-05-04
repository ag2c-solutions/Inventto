export {
  useGlobalAttributesQuery,
  useProductByIDQuery,
  useProductsQuery
} from './presentation/hooks/use-queries';
export {
  useCreateProductMutation,
  useUpdateProductMutation
} from './presentation/hooks/use-mutations';
export { CreateProductPage } from './pages/create-product';
export { EditProductPage } from './pages/edit-product';
export { ProductDetailsPage } from './pages/product-detail';
export { ProductsListPage } from './pages/product-list';
export type { IProduct } from './types/models';
