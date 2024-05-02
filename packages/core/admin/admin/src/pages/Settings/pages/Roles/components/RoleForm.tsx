import {
  Box,
  Button,
  Field,
  Flex,
  Grid,
  GridItem,
  Textarea,
  TextInput,
  Typography,
} from '@strapi/design-system';
import { FormikProps } from 'formik';
import { useIntl } from 'react-intl';

import type { AdminRole } from '../../../../../hooks/useAdminRoles';
import type { EditRoleFormValues } from '../EditPage';

interface RoleFormProps extends Pick<FormikProps<EditRoleFormValues>, 'values' | 'errors'> {
  onBlur: FormikProps<EditRoleFormValues>['handleBlur'];
  onChange: FormikProps<EditRoleFormValues>['handleChange'];
  disabled?: boolean;
  role: AdminRole;
}

const RoleForm = ({ disabled, role, values, errors, onChange, onBlur }: RoleFormProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box background="neutral0" padding={6} shadow="filterShadow" hasRadius>
      <Flex direction="column" alignItems="stretch" gap={4}>
        <Flex justifyContent="space-between">
          <Box>
            <Box>
              <Typography fontWeight="bold">
                {role
                  ? role.name
                  : formatMessage({
                      id: 'global.details',
                      defaultMessage: 'Details',
                    })}
              </Typography>
            </Box>
            <Box>
              <Typography textColor="neutral500" variant="pi">
                {role
                  ? role.description
                  : formatMessage({
                      id: 'Settings.roles.form.description',
                      defaultMessage: 'Name and description of the role',
                    })}
              </Typography>
            </Box>
          </Box>
          <Button disabled variant="secondary">
            {formatMessage(
              {
                id: 'Settings.roles.form.button.users-with-role',
                defaultMessage:
                  '{number, plural, =0 {# users} one {# user} other {# users}} with this role',
              },
              { number: role.usersCount }
            )}
          </Button>
        </Flex>
        <Grid gap={4}>
          <GridItem col={6}>
            <Field.Root
              name="name"
              error={errors.name && formatMessage({ id: errors.name })}
              required
            >
              <Field.Label>
                {formatMessage({
                  id: 'global.name',
                  defaultMessage: 'Name',
                })}
              </Field.Label>
              <TextInput
                disabled={disabled}
                onChange={onChange}
                onBlur={onBlur}
                value={values.name || ''}
              />
              <Field.Error />
            </Field.Root>
          </GridItem>
          <GridItem col={6}>
            <Field.Root
              name="description"
              error={errors.name && formatMessage({ id: errors.name })}
            >
              <Field.Label>
                {formatMessage({
                  id: 'global.description',
                  defaultMessage: 'Description',
                })}
              </Field.Label>
              <Textarea disabled={disabled} onChange={onChange} onBlur={onBlur}>
                {values.description || ''}
              </Textarea>
              <Field.Error />
            </Field.Root>
          </GridItem>
        </Grid>
      </Flex>
    </Box>
  );
};

export { RoleForm };
export type { RoleFormProps };
