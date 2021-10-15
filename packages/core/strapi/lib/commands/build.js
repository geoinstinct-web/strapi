'use strict';
const { green } = require('chalk');

const strapiAdmin = require('@strapi/admin');
const { getConfigUrls } = require('@strapi/utils');

const ee = require('../utils/ee');
const addSlash = require('../utils/addSlash');
const strapi = require('../index');
const getEnabledPlugins = require('../core/loaders/plugins/get-enabled-plugins');

/**
 * `$ strapi build`
 *
 * @param {{
 *  clean: boolean,
 *  optimization: any,
 * }} ctx
 */
module.exports = async ({ clean, optimization }) => {
  const dir = process.cwd();

  const strapiInstance = strapi({
    dir,
    autoReload: true,
    serveAdminPanel: false,
  });

  const plugins = await getEnabledPlugins(strapiInstance);

  const env = strapiInstance.config.get('environment');
  const { serverUrl, adminPath } = getConfigUrls(strapiInstance.config.get('server'), true);

  console.log(`Building your admin UI with ${green(env)} configuration ...`);

  if (clean) {
    await strapiAdmin.clean({ dir });
  }

  ee({ dir });

  return strapiAdmin
    .build({
      dir,
      plugins,
      // front end build env is always production for now
      env: 'production',
      optimize: optimization,
      options: {
        backend: serverUrl,
        adminPath: addSlash(adminPath),
      },
    })
    .then(() => {
      process.exit();
    })
    .catch((/** @type {any} **/ err) => {
      console.error(err);
      process.exit(1);
    });
};
