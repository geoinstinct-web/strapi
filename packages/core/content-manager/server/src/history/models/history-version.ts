import type { Model } from '@strapi/database';
import { HISTORY_VERSION_UID } from '../constants';

const historyVersion: Model = {
  uid: HISTORY_VERSION_UID,
  tableName: 'strapi_history_versions',
  singularName: 'history-version',
  attributes: {
    id: {
      type: 'increments',
    },
    contentType: {
      type: 'string',
      column: { notNullable: true },
    },
    // documentId is a reserved attribute name
    relatedDocumentId: {
      type: 'string',
      column: { notNullable: true },
    },
    locale: {
      type: 'string',
    },
    status: {
      type: 'enumeration',
      enum: ['draft', 'published', 'modified'],
    },
    data: {
      type: 'json',
    },
    schema: {
      type: 'json',
    },
    createdAt: {
      type: 'datetime',
    },
    // FIXME: joinTable should be optional
    // @ts-expect-error database model is not yet updated to support useJoinTable
    createdBy: {
      type: 'relation',
      relation: 'oneToOne',
      target: 'admin::user',
      useJoinTable: false,
    },
  },
};

export { historyVersion };