/* -------------------------------------------------------------------------- */
/*                                   Models                                   */
/* -------------------------------------------------------------------------- */

export type ItemWithId<TIdType> = {
  id: TIdType;
}

/* -------------------------------------------------------------------------- */
/*                                   Creaate                                  */
/* -------------------------------------------------------------------------- */

export type CreateItemRequest<TItemType> = TItemType;

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

export type UpdateItemRequest<TItemType> = Partial<TItemType>;

export type UpdateItemResponse<TItemType> = Partial<TItemType>;

/* -------------------------------------------------------------------------- */
/*                                   Delete                                   */
/* -------------------------------------------------------------------------- */

export type DeleteItemResponse = {
  success: boolean;
}