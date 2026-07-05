import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

import type {
  ConfirmFirstAccessPayload,
  CreateUserMetadataDTO,
  SignUpFirstAccessPayload
} from '../../data/dtos';
import type {
  RecoverPasswordPayload,
  ResendOtpPayload,
  ResetPasswordPayload,
  SignInPayload,
  SignUpPayload,
  VerifyOtpPayload
} from '../../domain/entities';
import type { ResetPasswordFormValues } from '../../domain/validators';

export const signInPayloadFactory = Factory.define<SignInPayload>(() => ({
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 })
}));

export const signUpPayloadFactory = Factory.define<SignUpPayload>(() => ({
  companyName: faker.company.name(),
  document: faker.string.numeric(11),
  fullName: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.internet.password({ length: 12 }),
  businessAreaCode: 'clothing',
  acceptedTerms: true
}));

export const verifyOtpPayloadFactory = Factory.define<VerifyOtpPayload>(() => ({
  email: faker.internet.email(),
  token: faker.string.numeric(6)
}));

export const resendOtpPayloadFactory = Factory.define<ResendOtpPayload>(() => ({
  email: faker.internet.email()
}));

export const recoverPasswordPayloadFactory =
  Factory.define<RecoverPasswordPayload>(() => ({
    email: faker.internet.email()
  }));

export const resetPasswordPayloadFactory = Factory.define<ResetPasswordPayload>(
  () => ({
    newPassword: faker.internet.password({ length: 12 })
  })
);

export const signUpFirstAccessPayloadFactory =
  Factory.define<SignUpFirstAccessPayload>(() => ({
    email: faker.internet.email()
  }));

export const confirmFirstAccessPayloadFactory =
  Factory.define<ConfirmFirstAccessPayload>(() => ({
    userId: faker.string.uuid(),
    orgId: faker.string.uuid()
  }));

export const resetPasswordFormValuesFactory =
  Factory.define<ResetPasswordFormValues>(() => {
    const password = faker.internet.password({ length: 12 });
    return { password, confirmPassword: password };
  });

export const createUserMetadataDTOFactory =
  Factory.define<CreateUserMetadataDTO>(() => ({
    full_name: faker.person.fullName(),
    company_name: faker.company.name(),
    company_document: faker.string.numeric(11),
    business_area_code: 'clothing',
    terms_accepted_at: faker.date.recent().toISOString()
  }));
