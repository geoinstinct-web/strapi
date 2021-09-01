'use strict';

const { omit } = require('lodash/fp');

module.exports = ({ strapi }) => ({
  buildQueriesResolvers: ({ contentType }) => {
    const { uid } = contentType;

    return {
      async find(source, args) {
        return strapi.entityService.find(uid, { params: args });
      },

      async findOne(source, args) {
        return strapi.entityService.findOne(uid, args.id, { params: omit('id', args) });
      },
    };
  },
});
