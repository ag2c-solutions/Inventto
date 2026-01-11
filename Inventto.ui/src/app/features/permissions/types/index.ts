export type PermissionAction = 
  | 'product:view'
  | 'product:create'
  | 'product:edit'
  | 'product:delete'
  | 'product:detail'
  | 'category:create'
  | 'stock:view'
  | 'stock:adjust'
  | 'stock:move'
  | 'stock:move_details'
  | 'sale:create'
  | 'team:manage'
  | 'metrics:view_costs';
