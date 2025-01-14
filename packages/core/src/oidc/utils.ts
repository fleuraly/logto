import {
  ApplicationType,
  CustomClientMetadata,
  customClientMetadataGuard,
  OidcClientMetadata,
} from '@logto/schemas';
import { errors } from 'oidc-provider';

export const getApplicationTypeString = (type: ApplicationType) =>
  type === ApplicationType.Native ? 'native' : 'web';

export const buildOidcClientMetadata = (metadata?: OidcClientMetadata): OidcClientMetadata => ({
  redirectUris: [],
  postLogoutRedirectUris: [],
  ...metadata,
});

export const validateCustomClientMetadata = (key: string, value: unknown) => {
  const result = customClientMetadataGuard.pick({ [key]: true }).safeParse({ [key]: value });

  if (!result.success) {
    throw new errors.InvalidClientMetadata(key);
  }
};

export const isOriginAllowed = (origin: string, customClientMetadata: CustomClientMetadata) =>
  Boolean(customClientMetadata.corsAllowedOrigins?.includes(origin));
