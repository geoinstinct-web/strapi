import React from 'react';

import { lightTheme, ThemeProvider } from '@strapi/design-system';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';

import NpsSurvey from '..';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
const originalLocalStorage = global.localStorage;

const user = userEvent.setup();

const setup = () =>
  render(<NpsSurvey />, {
    wrapper({ children }) {
      return (
        <IntlProvider locale="en" defaultLocale="en">
          <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
        </IntlProvider>
      );
    },
  });

describe('NPS survey', () => {
  beforeAll(() => {
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders survey if enabled', () => {
    localStorageMock.getItem.mockReturnValueOnce({ enabled: true });
    setup();
    expect(screen.getByRole('button', { name: 0 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 10 })).toBeInTheDocument();
    expect(screen.getByText(/not at all likely/i)).toBeInTheDocument();
    expect(screen.getByText(/extremely likely/i)).toBeInTheDocument();
  });

  it('does not render survey if disabled', () => {
    localStorageMock.getItem.mockReturnValueOnce({ enabled: false });
    setup();
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();
  });

  it('saves user response', async () => {
    localStorageMock.getItem.mockReturnValueOnce({ enabled: true });
    setup();

    await user.click(screen.getByRole('button', { name: 10 }));
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    const storedData = JSON.parse(localStorageMock.setItem.mock.calls.at(-1).at(1));
    expect(storedData).toEqual({
      enabled: true,
      lastResponseDate: expect.any(String),
      firstDismissalDate: null,
      lastDismissalDate: null,
    });
    expect(new Date(storedData.lastResponseDate)).toBeInstanceOf(Date);
  });

  it('saves first user dismissal', async () => {
    localStorageMock.getItem.mockReturnValueOnce({ enabled: true });
    setup();

    await user.click(screen.getByText(/dismiss survey/i));
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    const storedData = JSON.parse(localStorageMock.setItem.mock.calls.at(-1).at(1));
    expect(storedData).toEqual({
      enabled: true,
      lastResponseDate: null,
      firstDismissalDate: expect.any(String),
    });
    expect(new Date(storedData.firstDismissalDate)).toBeInstanceOf(Date);
  });

  it('saves subsequent user dismissal', async () => {
    const firstDismissalDate = '2000-07-20T09:28:51.963Z';
    localStorageMock.getItem.mockReturnValueOnce({
      enabled: true,
      firstDismissalDate,
    });
    setup();
    await user.click(screen.getByText(/dismiss survey/i));
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    const storedData = JSON.parse(localStorageMock.setItem.mock.calls.at(-1).at(1));
    expect(storedData).toEqual({
      enabled: true,
      lastResponseDate: null,
      firstDismissalDate,
      lastDismissalDate: expect.any(String),
    });
    expect(new Date(storedData.lastDismissalDate)).toBeInstanceOf(Date);
  });

  it('respects the delay after user submission', async () => {
    const initialDate = new Date('2020-01-01');
    const withinDelay = new Date('2020-01-31');
    const beyondDelay = new Date('2020-03-31');

    localStorageMock.getItem.mockReturnValue({ enabled: true, lastResponseDate: initialDate });

    jest.useFakeTimers();
    jest.setSystemTime(initialDate);

    // Survey should not show up right after submission
    setup();
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    // Survey should not show up during delay
    jest.advanceTimersByTime(withinDelay - initialDate);
    setup();
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    // Survey should show up again after delay
    jest.advanceTimersByTime(beyondDelay - withinDelay);
    setup();
    expect(screen.getByText(/not at all likely/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('respects the delay after first user dismissal', async () => {
    const initialDate = new Date('2020-01-01');
    const withinDelay = new Date('2020-01-04');
    const beyondDelay = new Date('2020-01-08');

    localStorageMock.getItem.mockReturnValue({
      enabled: true,
      firstDismissalDate: initialDate,
      lastDismissalDate: null,
      lastResponseDate: null,
    });

    jest.useFakeTimers();
    jest.setSystemTime(initialDate);

    // Survey should not show up right after dismissal
    setup();
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    // Survey should not show up during delay
    jest.advanceTimersByTime(withinDelay - initialDate);
    setup();
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    // Survey should show up again after delay
    jest.advanceTimersByTime(beyondDelay - withinDelay);
    setup();
    expect(screen.getByText(/not at all likely/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('respects the delay after subsequent user dismissal', async () => {
    const initialDate = new Date('2020-01-01');
    const withinDelay = new Date('2020-03-30');
    const beyondDelay = new Date('2020-04-01');

    localStorageMock.getItem.mockReturnValue({
      enabled: true,
      firstDismissalDate: initialDate,
      lastDismissalDate: initialDate,
      lastResponseDate: null,
    });

    jest.useFakeTimers();
    jest.setSystemTime(initialDate);

    // Survey should not show up right after dismissal
    setup();
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    // Survey should not show up during delay
    jest.advanceTimersByTime(withinDelay - initialDate);
    setup();
    expect(screen.queryByText(/not at all likely/i)).not.toBeInTheDocument();

    // Survey should show up again after delay
    jest.advanceTimersByTime(beyondDelay - withinDelay);
    setup();
    expect(screen.getByText(/not at all likely/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  afterAll(() => {
    global.localStorage = originalLocalStorage;
  });
});
