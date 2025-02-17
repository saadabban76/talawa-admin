import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import 'jest-location-mock';
import { I18nextProvider } from 'react-i18next';

import OrganizationDashboard from './OrganizationDashboard';
import {
  MOCKS_WITHOUT_IMAGE,
  MOCKS_WITH_IMAGE,
} from './OrganizationDashboardMocks';
import { store } from 'state/store';
import i18nForTest from 'utils/i18nForTest';
import { USER_ORGANIZATION_LIST } from 'GraphQl/Queries/Queries';

async function wait(ms = 0) {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}

const customRender = (userType: any) => {
  const mockedUser = {
    request: {
      query: USER_ORGANIZATION_LIST,
      variables: { id: localStorage.getItem('id') },
    },
    result: {
      data: {
        user: {
          userType,
        },
      },
    },
  };

  const mocks = [mockedUser, ...MOCKS_WITHOUT_IMAGE];

  return render(
    <MockedProvider addTypename={false} mocks={mocks}>
      <BrowserRouter>
        <Provider store={store}>
          <I18nextProvider i18n={i18nForTest}>
            <OrganizationDashboard />
          </I18nextProvider>
        </Provider>
      </BrowserRouter>
    </MockedProvider>
  );
};

describe('Organisation Dashboard Page', () => {
  test('should render props and text elements test for the screen', async () => {
    window.location.replace('/orglist');

    const { container } = render(
      <MockedProvider addTypename={false} mocks={MOCKS_WITHOUT_IMAGE}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationDashboard />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    expect(container.textContent).not.toBe('Loading data...');
    await wait();
    expect(container.textContent).toMatch('Location');
    expect(container.textContent).toMatch('About');
    expect(container.textContent).toMatch('Statistics');
    expect(window.location).toBeAt('/orglist');
  });

  test('should display delete button for SUPERADMIN', async () => {
    const { getByTestId, queryByTestId } = customRender('SUPERADMIN');
    await waitFor(() =>
      expect(queryByTestId('deleteClick')).toBeInTheDocument()
    );

    fireEvent.click(getByTestId('deleteClick'));
    fireEvent.click(getByTestId(/deleteOrganizationBtn/i));
    expect(window.location).not.toBeNull();
  });

  test('should not display delete button for non-SUPERADMIN', async () => {
    const { queryByTestId } = customRender('ADMIN');
    await waitFor(() =>
      expect(queryByTestId('deleteClick')).not.toBeInTheDocument()
    );
  });

  test('Should check if organisation image is present', async () => {
    const { container } = render(
      <MockedProvider addTypename={false} mocks={MOCKS_WITH_IMAGE}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationDashboard />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    expect(container.textContent).not.toBe('Loading data...');
    await wait();
    const image = screen.getByTestId(/orgDashImgPresent/i);
    expect(image).toBeInTheDocument();
  });
  test('Should check if organisation image is not present', async () => {
    const { container } = render(
      <MockedProvider addTypename={false} mocks={MOCKS_WITHOUT_IMAGE}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationDashboard />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    expect(container.textContent).not.toBe('Loading data...');
    await wait();
    const image = screen.getByTestId(/orgDashImgAbsent/i);
    expect(image).toBeInTheDocument();
  });
});
