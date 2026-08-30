import type { TagColorsStorage } from '@shlinkio/shlink-web-component';
import {
  ShlinkSidebarToggleButton,
  ShlinkSidebarVisibilityProvider,
  ShlinkWebComponent,
} from '@shlinkio/shlink-web-component';
import type { FC } from 'react';
import { memo, useMemo } from 'react';
import type { ShlinkApiClientBuilder } from '../api/services/ShlinkApiClientBuilder';
import { withDependencies } from '../container/context';
import { isReachableServer } from '../servers/data';
import { ServerError } from '../servers/helpers/ServerError';
import { withSelectedServer } from '../servers/helpers/withSelectedServer';
import { useSelectedServer } from '../servers/reducers/selectedServer';
import { useSettings } from '../settings/reducers/settings';
import { NotFound } from './NotFound';

export type ShlinkWebComponentContainerProps = {
  TagColorsStorage: TagColorsStorage;
  buildShlinkApiClient: ShlinkApiClientBuilder;
};

const ShlinkWebComponentContainerBase: FC<ShlinkWebComponentContainerProps> =
  withSelectedServer(
    memo(({ buildShlinkApiClient, TagColorsStorage: tagColorsStorage }) => {
      const { selectedServer } = useSelectedServer();
      const { settings } = useSettings();

      const effectiveSettings = useMemo(() => {
        if (isReachableServer(selectedServer)) {
          const defaultTag = (selectedServer as any).defaultTag;
          if (defaultTag) {
            const currentDefaultTags = settings?.shortUrlCreation?.defaultTags;
            if (!currentDefaultTags || currentDefaultTags.length === 0) {
              return {
                ...settings,
                shortUrlCreation: {
                  ...settings?.shortUrlCreation,
                  defaultTags: [defaultTag],
                },
              };
            }
          }
        }
        return settings;
      }, [selectedServer, settings]);

      if (!isReachableServer(selectedServer)) {
        return <ServerError />;
      }

      const routesPrefix = `/server/${selectedServer.id}`;
      return (
        <ShlinkSidebarVisibilityProvider>
          <ShlinkSidebarToggleButton className="fixed top-3.5 left-3 z-901" />
          <ShlinkWebComponent
            serverVersion={selectedServer.version}
            apiClient={buildShlinkApiClient(selectedServer)}
            settings={effectiveSettings}
            routesPrefix={routesPrefix}
            tagColorsStorage={tagColorsStorage}
            createNotFound={(nonPrefixedHomePath: string) => (
              <NotFound to={`${routesPrefix}${nonPrefixedHomePath}`}>List short URLs</NotFound>
            )}
            autoSidebarToggle={false}
          />
        </ShlinkSidebarVisibilityProvider>
      );
    }),
  );

export const ShlinkWebComponentContainer = withDependencies(ShlinkWebComponentContainerBase, [
  'buildShlinkApiClient',
  'TagColorsStorage',
]);
