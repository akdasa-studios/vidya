/* -------------------------------------------------------------------------- */
/*                                   Creaate                                  */
/* -------------------------------------------------------------------------- */

/**
 * Request to create an item.
 */
export type CreateItemRequest<TItemType> = TItemType;

/**
 * Response to creating an item.
 */
export type CreateItemResponse<TIdentityType> = {
  id: TIdentityType;
}

/* -------------------------------------------------------------------------- */
/*                                    Read                                    */
/* -------------------------------------------------------------------------- */

/**
 * Generic response for retrieving a list of
 * items of a certain type.
 */
export type GetItemsListResponse<TItemType> = {
  items: TItemType[];
}

/**
 * Generic response for retrieving a single item of
 * a certain type.
 */
export type GetItemResponse<TItemType> = TItemType;

/* -------------------------------------------------------------------------- */
/*                                   Update                                   */
/* -------------------------------------------------------------------------- */

/**
 * Request to update an item.
 */
export type UpdateItemRequest<TItemType> = Partial<TItemType>;

/**
 * Response to updating an item.
 */
export type UpdateItemResponse<TItemType> = Partial<TItemType>;

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

/**
 * Request to delete an item.
 */
export type DeleteItemResponse = {
  success: boolean;
}