import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { signInBasic } from '@/apis/sign-in';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import Input, { PasswordInput } from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi, { ErrorHandlers } from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import useTerms from '@/hooks/use-terms';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { requiredValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type FieldState = {
  username: string;
  password: string;
};

type Props = {
  className?: string;
};

const defaultState: FieldState = {
  username: '',
  password: '',
};

const UsernameSignin = ({ className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { termsValidation } = useTerms();
  const {
    fieldValue,
    formErrorMessage,
    setFieldValue,
    register,
    validateForm,
    setFormErrorMessage,
  } = useForm(defaultState);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.invalid_credentials': (error) => {
        setFormErrorMessage(error.message);
      },
    }),
    [setFormErrorMessage]
  );

  const { result, run: asyncSignInBasic } = useApi(signInBasic, errorHandlers);

  const onSubmitHandler = useCallback(async () => {
    setFormErrorMessage(undefined);

    if (!validateForm()) {
      return;
    }

    if (!(await termsValidation())) {
      return;
    }

    const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

    void asyncSignInBasic(fieldValue.username, fieldValue.password, socialToBind);
  }, [
    setFormErrorMessage,
    validateForm,
    termsValidation,
    asyncSignInBasic,
    fieldValue.username,
    fieldValue.password,
  ]);

  useEffect(() => {
    if (result?.redirectTo) {
      window.location.assign(result.redirectTo);
    }
  }, [result]);

  return (
    <form className={classNames(styles.form, className)}>
      <Input
        className={styles.inputField}
        name="username"
        autoComplete="username"
        placeholder={t('input.username')}
        {...register('username', (value) => requiredValidation('username', value))}
        onClear={() => {
          setFieldValue((state) => ({ ...state, username: '' }));
        }}
      />
      <PasswordInput
        className={styles.inputField}
        name="password"
        autoComplete="current-password"
        placeholder={t('input.password')}
        {...register('password', (value) => requiredValidation('password', value))}
      />
      {formErrorMessage && (
        <ErrorMessage className={styles.formErrors}>{formErrorMessage}</ErrorMessage>
      )}
      <TermsOfUse className={styles.terms} />

      <Button onClick={onSubmitHandler}>{t('action.sign_in')}</Button>
    </form>
  );
};

export default UsernameSignin;
