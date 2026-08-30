import type { HttpClient } from '@shlinkio/shlink-js-sdk';
import { useCallback, useEffect } from 'react';
import pack from '../../../package.json';
import { useDependencies } from '../../container/context';
import { useAppDispatch } from '../../store';
import { createAsyncThunk } from '../../store/helpers';
import { hasServerData } from '../data';
import { ensureUniqueIds } from '../helpers';
import { createServers } from './servers';

const responseToServersList = (data: any) => ensureUniqueIds({}, Array.isArray(data) ? data.filter(hasServerData) : []);

export const fetchServers = createAsyncThunk(
  'shlink/remoteServers/fetchServers',
  async (httpClient: HttpClient, { dispatch }): Promise<void> => {
    const resp = await httpClient.jsonRequest<any>(`${pack.homepage}/servers.json`);
    const result = responseToServersList(resp);

    dispatch(createServers(result));
  },
);

export const useRemoteServers = () => {
  const dispatch = useAppDispatch();
  const [httpClient] = useDependencies<[HttpClient]>('HttpClient');
  const dispatchFetchServer = useCallback(() => dispatch(fetchServers(httpClient)), [dispatch, httpClient]);

  return { fetchServers: dispatchFetchServer };
};

export const useLoadRemoteServers = () => {
  const { fetchServers } = useRemoteServers();

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);
};
