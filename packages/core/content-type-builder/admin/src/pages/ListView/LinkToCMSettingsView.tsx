import { memo } from 'react';

import { Button } from '@strapi/design-system';
import { type Permission, useRBAC } from '@strapi/helper-plugin';
import { Layer } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

const cmPermissions: Record<string, Permission[]> = {
  collectionTypesConfigurations: [
    {
      action: 'plugin::content-manager.collection-types.configure-view',
      subject: null,
    },
  ],
  componentsConfigurations: [
    {
      action: 'plugin::content-manager.components.configure-layout',
      subject: null,
    },
  ],
  singleTypesConfigurations: [
    {
      action: 'plugin::content-manager.single-types.configure-view',
      subject: null,
    },
  ],
};

interface LinkToCMSettingsViewProps {
  disabled: boolean;
  contentTypeKind?: string;
  isInContentTypeView?: boolean;
  isTemporary?: boolean;
  targetUid?: string;
}

export const LinkToCMSettingsView = memo(
  ({
    disabled,
    isTemporary = false,
    isInContentTypeView = true,
    contentTypeKind = 'collectionType',
    targetUid = '',
  }: LinkToCMSettingsViewProps) => {
    const { formatMessage } = useIntl();
    const navigate = useNavigate();
    const { collectionTypesConfigurations, componentsConfigurations, singleTypesConfigurations } =
      cmPermissions;
    const label = formatMessage({
      id: 'content-type-builder.form.button.configure-view',
      defaultMessage: 'Configure the view',
    });
    let permissionsToApply = collectionTypesConfigurations;

    const handleClick = () => {
      if (isTemporary) {
        return false;
      }

      if (isInContentTypeView) {
        navigate(`/content-manager/collection-types/${targetUid}/configurations/edit`);
      } else {
        navigate(`/content-manager/components/${targetUid}/configurations/edit`);
      }

      return false;
    };

    if (isInContentTypeView && contentTypeKind === 'singleType') {
      permissionsToApply = singleTypesConfigurations;
    }

    if (!isInContentTypeView) {
      permissionsToApply = componentsConfigurations;
    }
    const {
      allowedActions: { canViewConfig },
    } = useRBAC({
      viewConfig: permissionsToApply,
    });

    if (!canViewConfig) {
      return null;
    }

    return (
      <Button
        startIcon={<Layer />}
        variant="tertiary"
        onClick={handleClick}
        disabled={isTemporary || disabled}
      >
        {label}
      </Button>
    );
  }
);
