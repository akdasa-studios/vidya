import { AccessToken, UserPermission } from '@vidya/protocol';
import { Request } from 'express';

export type VidyaRequest = Request & {
  accessToken: AccessToken;
  userPermissions: UserPermission[];
  userId: string;
};
