import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { sendRegisterSmsPasscode } from '@/apis/register';
import { sendSignInSmsPasscode } from '@/apis/sign-in';
import { defaultCountryCallingCode } from '@/hooks/use-phone-number';

import PhonePasswordless from './PhonePasswordless';

jest.mock('@/apis/sign-in', () => ({
  sendSignInSmsPasscode: jest.fn(async () => Promise.resolve()),
}));
jest.mock('@/apis/register', () => ({
  sendRegisterSmsPasscode: jest.fn(async () => Promise.resolve()),
}));

describe('<PhonePasswordless/>', () => {
  const phoneNumber = '18888888888';

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter>
        <PhonePasswordless type="sign-in" />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('render with terms settings enabled', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type="sign-in" />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('required phone with error message', () => {
    const { queryByText, container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <PhonePasswordless type="sign-in" />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_phone')).not.toBeNull();
    expect(sendSignInSmsPasscode).not.toBeCalled();

    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: '1113' } });
      expect(queryByText('invalid_phone')).not.toBeNull();

      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
      expect(queryByText('invalid_phone')).toBeNull();
    }
  });

  test('should call sign-in method properly', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type="sign-in" />
        </SettingsProvider>
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }
    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(sendSignInSmsPasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
  });

  test('should call register method properly', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type="register" />
        </SettingsProvider>
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }
    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(sendRegisterSmsPasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
  });
});
