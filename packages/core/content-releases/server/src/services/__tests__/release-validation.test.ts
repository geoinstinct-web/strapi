import EE from '@strapi/strapi/dist/utils/ee';
import type { CreateReleaseAction } from '../../../../shared/contracts/release-actions';
import createReleaseValidationService from '../validation';

const baseStrapiMock = {
  utils: {
    errors: {
      ValidationError: jest.fn(),
    },
  },
  contentType: jest.fn(),
};

jest.mock('@strapi/strapi/dist/utils/ee', () => ({
  features: {
    get: jest.fn(),
  },
}));

describe('Release Validation service', () => {
  describe('validateEntryContentType', () => {
    it('throws an error if the content type does not exist', () => {
      // @ts-expect-error Ignore missing properties
      const releaseValidationService = createReleaseValidationService({ strapi: baseStrapiMock });

      expect(() => releaseValidationService.validateEntryContentType('api::plop.plop')).toThrow(
        'No content type found for uid api::plop.plop'
      );
    });

    it('throws an error if the content type does not have draftAndPublish enabled', () => {
      const strapiMock = {
        ...baseStrapiMock,
        contentType: jest.fn().mockReturnValue({
          options: {},
        }),
      };
      // @ts-expect-error Ignore missing properties
      const releaseValidationService = createReleaseValidationService({ strapi: strapiMock });

      expect(() =>
        releaseValidationService.validateEntryContentType('api::category.category')
      ).toThrow(
        'Content type with uid api::category.category does not have draftAndPublish enabled'
      );
    });
  });

  describe('validateUniqueEntry', () => {
    it('throws an error if the release does not exist', () => {
      const strapiMock = {
        ...baseStrapiMock,
        contentType: jest.fn().mockReturnValue({
          options: {
            draftAndPublish: true,
          },
        }),
        entityService: {
          findOne: jest.fn().mockReturnValue(null),
        },
      };
      // @ts-expect-error Ignore missing properties
      const releaseValidationService = createReleaseValidationService({ strapi: strapiMock });

      const mockReleaseAction: CreateReleaseAction.Request['body'] = {
        entry: {
          id: 1,
          contentType: 'api::category.category',
        },
        type: 'publish',
      };

      expect(() =>
        releaseValidationService.validateUniqueEntry(1, mockReleaseAction)
      ).rejects.toThrow('No release found for id 1');
    });

    it('throws an error if a contentType entry already exists in the release', () => {
      const strapiMock = {
        ...baseStrapiMock,
        contentType: jest.fn().mockReturnValue({
          options: {
            draftAndPublish: true,
          },
        }),
        entityService: {
          findOne: jest.fn().mockReturnValue({
            actions: [
              {
                contentType: 'api::category.category',
                entry: {
                  id: 1,
                },
              },
            ],
          }),
        },
      };
      // @ts-expect-error Ignore missing properties
      const releaseValidationService = createReleaseValidationService({ strapi: strapiMock });

      const mockReleaseAction: CreateReleaseAction.Request['body'] = {
        entry: {
          id: 1,
          contentType: 'api::category.category',
        },
        type: 'publish',
      };

      expect(() =>
        releaseValidationService.validateUniqueEntry(1, mockReleaseAction)
      ).rejects.toThrow(
        'Entry with id 1 and contentType api::category.category already exists in release with id 1'
      );
    });
  });
  describe('validatePendingReleaseLimit', () => {
    it('should throw an error if the license does not have options for releases', () => {
      const strapiMock = {
        ...baseStrapiMock,
        db: {
          query: jest.fn().mockReturnValue({
            findWithCount: jest.fn().mockReturnValue([[], 3]),
          }),
        },
      };
      // @ts-expect-error Ignore missing properties
      const releaseValidationService = createReleaseValidationService({ strapi: strapiMock });

      expect(() => releaseValidationService.validatePendingReleaseLimit()).rejects.toThrow(
        'The license does not contain a configuration for releases'
      );
    });

    it('should throw an error if the pending release limit has been reached', () => {
      // @ts-expect-error - get is a mock
      EE.features.get.mockReturnValue({
        options: {
          maximumReleases: 3,
        },
      });
      const strapiMock = {
        ...baseStrapiMock,
        db: {
          query: jest.fn().mockReturnValue({
            findWithCount: jest.fn().mockReturnValue([[], 3]),
          }),
        },
      };
      // @ts-expect-error Ignore missing properties
      const releaseValidationService = createReleaseValidationService({ strapi: strapiMock });

      expect(() => releaseValidationService.validatePendingReleaseLimit()).rejects.toThrow(
        'You have reached the maximum number of pending releases'
      );
    });

    it('should not throw an error if the pending release limit has not been reached', async () => {
      // @ts-expect-error - get is a mock
      EE.features.get.mockReturnValue({
        options: {
          maximumReleases: 3,
        },
      });
      const strapiMock = {
        ...baseStrapiMock,
        db: {
          query: jest.fn().mockReturnValue({
            findWithCount: jest.fn().mockReturnValue([[], 2]),
          }),
        },
      };

      // @ts-expect-error Ignore missing properties
      const releaseValidationService = createReleaseValidationService({ strapi: strapiMock });

      await expect(releaseValidationService.validatePendingReleaseLimit()).resolves.not.toThrow();
    });
  });
});
