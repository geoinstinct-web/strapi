import { useEffect } from 'react';
import { request } from 'strapi-helper-plugin';
import { useSelector, useDispatch } from 'react-redux';
import { LOAD_LOCALES, RESOLVE_LOCALES } from '../../constants';

const fetchLocalesList = async () => {
  try {
    const data = await request('/i18n/locales', {
      method: 'GET',
    });

    return data;
  } catch (e) {
    strapi.notification.toggle({
      type: 'warning',
      message: { id: 'notification.error' },
    });

    return e;
  }
};

const useLocales = () => {
  const dispatch = useDispatch();
  const locales = useSelector(state => state.get('i18n_locales').locales);
  const isLoading = useSelector(state => state.get('i18n_locales').isLoading);

  useEffect(() => {
    dispatch({ type: LOAD_LOCALES });
    fetchLocalesList().then(locales => dispatch({ type: RESOLVE_LOCALES, locales }));
  }, [dispatch]);

  return { locales, isLoading, refetch: fetchLocalesList };
};

export default useLocales;
