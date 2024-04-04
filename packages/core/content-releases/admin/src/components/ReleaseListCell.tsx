import * as React from 'react';

import { Box, Flex, Popover, Typography } from '@strapi/design-system';
import { Link } from '@strapi/design-system/v2';
import { SortIcon } from '@strapi/helper-plugin';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { useIntl } from 'react-intl';

import type { CMAdminConfiguration, ListLayoutRow } from '@strapi/admin/strapi-admin';
import { useTypedSelector } from '../store/hooks';
import { useGetMappedEntriesInReleasesQuery } from '../services/release';

const Button = styled.button`
  svg {
    > g,
    path {
      fill: ${({ theme }) => theme.colors.neutral500};
    }
  }
  &:hover {
    svg {
      > g,
      path {
        fill: ${({ theme }) => theme.colors.neutral600};
      }
    }
  }
  &:active {
    svg {
      > g,
      path {
        fill: ${({ theme }) => theme.colors.neutral400};
      }
    }
  }
`;

const ActionWrapper = styled(Flex)`
  svg {
    height: ${4 / 16}rem;
  }
`;

/* -------------------------------------------------------------------------------------------------
 * useReleasesList
 * -----------------------------------------------------------------------------------------------*/

const useReleasesList = (entryId) => {
  const { uid: contentTypeUid } = useTypedSelector(
    (state) => state['content-manager_listView'].contentType
  );
  const listViewData = useTypedSelector((state) => state['content-manager_listView'].data);
  const entriesIds = listViewData.map((entry) => entry.id);

  const response = useGetMappedEntriesInReleasesQuery({ contentTypeUid, entriesIds });

  const mappedEntriesInReleases = response.data?.data || {};

  return mappedEntriesInReleases?.[entryId] || [];
};

/* -------------------------------------------------------------------------------------------------
 * addColumnToTableHook
 * -----------------------------------------------------------------------------------------------*/

interface AddColumnToTableHookArgs {
  layout: {
    components: Record<string, CMAdminConfiguration>;
    contentType: CMAdminConfiguration;
  };
  displayedHeaders: ListLayoutRow[];
}

const addColumnToTableHook = ({ displayedHeaders, layout }: AddColumnToTableHookArgs) => {
  const { contentType } = layout;

  if (!contentType.options.draftAndPublish) {
    return { displayedHeaders, layout };
  }

  return {
    displayedHeaders: [
      ...displayedHeaders,
      {
        key: '__release_key__',
        fieldSchema: { type: 'string' },
        metadatas: { label: 'To be released in', searchable: true, sortable: false },
        name: 'releasedAt',
        cellFormatter: (props: object) => <ReleaseListCell {...props} />,
      },
    ],
    layout,
  };
};

/* -------------------------------------------------------------------------------------------------
 * ReleaseListCell
 * -----------------------------------------------------------------------------------------------*/

interface ReleaseListCellProps {}

const ReleaseListCell = (props: any) => {
  const releases = useReleasesList(props.id);
  const [visible, setVisible] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const { formatMessage } = useIntl();

  const handleTogglePopover = () => setVisible((prev) => !prev);

  return (
    <Flex onClick={(e) => e.stopPropagation()}>
      <Button type="button" onClick={handleTogglePopover} ref={buttonRef}>
        <ActionWrapper height="2rem" width="2rem">
          <Typography style={{ maxWidth: '252px', cursor: 'pointer' }} textColor="neutral800">
            {formatMessage(
              {
                id: 'content-releases.content-manager.list-view.releases-number',
                defaultMessage: '{number} {number, plural, one {release} other {releases}}',
              },
              {
                number: releases.length,
              }
            )}
          </Typography>
          <Flex>
            <SortIcon />
            {visible && (
              <Popover
                onDismiss={handleTogglePopover}
                source={buttonRef as React.MutableRefObject<HTMLElement>}
                spacing={16}
              >
                <ul>
                  {releases.map(({ id, name }) => (
                    <Box key={id} padding={3} as="li">
                      {/* @ts-expect-error – error with inferring the props from the as component */}
                      <Link to={`/plugins/content-releases/${id}`} as={NavLink} isExternal={false}>
                        {name}
                      </Link>
                    </Box>
                  ))}
                </ul>
              </Popover>
            )}
          </Flex>
        </ActionWrapper>
      </Button>
    </Flex>
  );
};

export { ReleaseListCell, addColumnToTableHook };
export type { ReleaseListCellProps };
