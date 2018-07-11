const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const Bundler = require('parcel-bundler');
const util = require('./util');

const engineModulesPath = path.resolve(__dirname, '..', 'node_modules');
console.log('engineModulesPath = ', engineModulesPath);

async function generateServerScript(
  pattern,
  data,
  patternLabConfig,
  engineFileExtension
) {
  console.log('generating server script...');
  const parcelOptions = {
    // cache: true, // Enabled or disables caching, defaults to true
    // cacheDir: '.cache', // The directory cache gets put in, defaults to .cache
    minify: false, // Minify files, enabled if process.env.NODE_ENV === 'production'
    target: 'node', // browser/node/electron, defaults to browser
    logLevel: 3, // 3 = log everything, 2 = log warnings & errors, 1 = log errors
    sourceMaps: true, // Enable or disable sourcemaps, defaults to enabled (not supported in minified builds yet)
    detailedReport: false, // Prints a detailed report of the bundles, assets, filesizes and times, defaults to false, reports are only printed if watch is disabled
    watch: false,
  };

  // Initialises a bundler using the entrypoint location and options provided
  const bundler = new Bundler(
    path.join(patternLabConfig.paths.source.patterns, pattern.relPath),
    parcelOptions
  );

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  return bundler.bundle().then(bundle => {
    console.log(
      'bundle.entryAsset.generated.js = ',
      bundle.entryAsset.generated.js
    );
    return bundle.entryAsset.generated.js;
  });
}

function createClientSideEntry(data) {
  return `
import React from 'react';
import ReactDOM from 'react-dom';
import Component from 'client_bundle.js';
console.log('Component: ', Component);
const data = ${JSON.stringify(data)};

ReactDOM.render(React.createElement(Component, data), document.body);
`;
}

async function writeClientSideEntry(data, patternOutputPath) {
  const fileName = 'entry.js';
  const entryFileContents = createClientSideEntry(data);

  fs.writeFileSync(path.join(patternOutputPath, fileName), entryFileContents);
  return fileName;
}

async function writeComponentScript(componentScript, patternOutputPath) {
  const fileName = 'Component.js';
  fs.writeFileSync(path.join(patternOutputPath, fileName), componentScript);
  return fileName;
}

async function generateClientScript(
  pattern,
  data,
  patternLabConfig,
  engineFileExtension,
  componentScript
) {
  console.log('generating client script...');
  const patternOutputDirectory = util.getAbsolutePatternOutputDir(
    pattern,
    patternLabConfig
  );
  const patternDirectory = util.getAbsolutePatternDir(
    pattern,
    patternLabConfig
  );

  const componentFileName = await writeComponentScript(
    componentScript,
    util.getAbsolutePatternOutputDir(pattern, patternLabConfig)
  );
  const entryFileName = await writeClientSideEntry(
    data,
    util.getAbsolutePatternOutputDir(pattern, patternLabConfig)
  );

  // create bundler object there

  // Set up the component script

  return new Promise((resolve, reject) => {
    // run bundler here
  });
}

// from the old Babel-only version
function moduleResolver(pattern, source, filename, patternLabConfig) {
  console.log('filename = ', filename);
  console.log('source = ', source);
  // console.log("pattern = ", pattern);

  if (source !== 'react') {
    return util.getAbsolutePatternPath(pattern, patternLabConfig);
  }

  return source;
}

module.exports = {
  generateServerScript,
  generateClientScript,
};
