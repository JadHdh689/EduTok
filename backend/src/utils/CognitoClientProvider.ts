// src/utils/CognitoClientProvider.ts
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';

export const CognitoClientProvider = {
  provide: 'COGNITO_CLIENT',
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const region = config.get<string>('AWS_REGION');
    if (!region) throw new Error('AWS_REGION is not set');
    return new CognitoIdentityProviderClient({ region });
  },
};
