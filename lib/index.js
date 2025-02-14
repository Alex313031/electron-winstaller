"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertVersion = convertVersion;
exports.createWindowsInstaller = createWindowsInstaller;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _lodash = _interopRequireDefault(require("lodash.template"));
var _spawnPromise = _interopRequireDefault(require("./spawn-promise"));
var _asar = _interopRequireDefault(require("asar"));
var _path = _interopRequireDefault(require("path"));
var _tempUtils = require("./temp-utils");
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var log = require('debug')('electron-windows-installer:main');
function convertVersion(version) {
  var parts = version.split('-');
  var mainVersion = parts.shift();
  if (parts.length > 0) {
    return [mainVersion, parts.join('-').replace(/\./g, '')].join('-');
  } else {
    return mainVersion;
  }
}
function createWindowsInstaller(_x) {
  return _createWindowsInstaller.apply(this, arguments);
}
function _createWindowsInstaller() {
  _createWindowsInstaller = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(options) {
    var useMono, monoExe, wineExe, appDirectory, outputDirectory, loadingGif, vendorPath, vendorUpdate, appUpdate, _cmd, _args, defaultLoadingGif, certificateFile, certificatePassword, remoteReleases, signWithParams, remoteToken, metadata, appResources, asarFile, appMetadata, templateData, nuspecContent, nugetOutput, targetNuspecPath, cmd, args, nupkgPath, setupPath, unfixedSetupPath, msiPath, unfixedMsiPath;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          useMono = false;
          monoExe = 'mono';
          wineExe = 'wine';
          if (!(process.platform !== 'win32')) {
            _context.next = 9;
            break;
          }
          useMono = true;
          if (!(!wineExe || !monoExe)) {
            _context.next = 7;
            break;
          }
          throw new Error('You must install both Mono and Wine on non-Windows');
        case 7:
          log("Using Mono: '".concat(monoExe, "'"));
          log("Using Wine: '".concat(wineExe, "'"));
        case 9:
          appDirectory = options.appDirectory, outputDirectory = options.outputDirectory, loadingGif = options.loadingGif;
          outputDirectory = _path["default"].resolve(outputDirectory || 'installer');
          vendorPath = _path["default"].join(__dirname, '..', 'vendor');
          vendorUpdate = _path["default"].join(vendorPath, 'Squirrel.exe');
          appUpdate = _path["default"].join(appDirectory, 'Squirrel.exe');
          _context.next = 16;
          return _fsExtra["default"].copy(vendorUpdate, appUpdate);
        case 16:
          if (!(options.setupIcon && options.skipUpdateIcon !== true)) {
            _context.next = 22;
            break;
          }
          _cmd = _path["default"].join(vendorPath, 'rcedit.exe');
          _args = [appUpdate, '--set-icon', options.setupIcon];
          if (useMono) {
            _args.unshift(_cmd);
            _cmd = wineExe;
          }
          _context.next = 22;
          return (0, _spawnPromise["default"])(_cmd, _args);
        case 22:
          defaultLoadingGif = _path["default"].join(__dirname, '..', 'resources', 'install-spinner.gif');
          loadingGif = loadingGif ? _path["default"].resolve(loadingGif) : defaultLoadingGif;
          certificateFile = options.certificateFile, certificatePassword = options.certificatePassword, remoteReleases = options.remoteReleases, signWithParams = options.signWithParams, remoteToken = options.remoteToken;
          metadata = {
            description: '',
            iconUrl: 'https://raw.githubusercontent.com/atom/electron/master/atom/browser/resources/win/atom.ico'
          };
          if (!(options.usePackageJson !== false)) {
            _context.next = 39;
            break;
          }
          appResources = _path["default"].join(appDirectory, 'resources');
          asarFile = _path["default"].join(appResources, 'app.asar');
          _context.next = 31;
          return _fsExtra["default"].pathExists(asarFile);
        case 31:
          if (!_context.sent) {
            _context.next = 35;
            break;
          }
          appMetadata = JSON.parse(_asar["default"].extractFile(asarFile, 'package.json'));
          _context.next = 38;
          break;
        case 35:
          _context.next = 37;
          return _fsExtra["default"].readJSON(_path["default"].join(appResources, 'app', 'package.json'), 'utf8');
        case 37:
          appMetadata = _context.sent;
        case 38:
          Object.assign(metadata, {
            exe: "".concat(appMetadata.name, ".exe"),
            title: appMetadata.productName || appMetadata.name
          }, appMetadata);
        case 39:
          Object.assign(metadata, options);
          if (!metadata.authors) {
            if (typeof metadata.author === 'string') {
              metadata.authors = metadata.author;
            } else {
              metadata.authors = (metadata.author || {}).name || '';
            }
          }
          metadata.owners = metadata.owners || metadata.authors;
          metadata.version = convertVersion(metadata.version);
          metadata.copyright = metadata.copyright || "Copyright \xA9 ".concat(new Date().getFullYear(), " ").concat(metadata.authors || metadata.owners);
          _context.next = 46;
          return _fsExtra["default"].readFile(_path["default"].join(__dirname, '..', 'template.nuspectemplate'), 'utf8');
        case 46:
          templateData = _context.sent;
          if (_path["default"].sep === '/') {
            templateData = templateData.replace(/\\/g, '/');
          }
          nuspecContent = (0, _lodash["default"])(templateData)(metadata);
          log("Created NuSpec file:\n".concat(nuspecContent));
          _context.next = 52;
          return (0, _tempUtils.createTempDir)('si-');
        case 52:
          nugetOutput = _context.sent;
          targetNuspecPath = _path["default"].join(nugetOutput, metadata.name + '.nuspec');
          _context.next = 56;
          return _fsExtra["default"].writeFile(targetNuspecPath, nuspecContent);
        case 56:
          cmd = _path["default"].join(vendorPath, 'nuget.exe');
          args = ['pack', targetNuspecPath, '-BasePath', appDirectory, '-OutputDirectory', nugetOutput, '-NoDefaultExcludes'];
          if (useMono) {
            args.unshift(cmd);
            cmd = monoExe;
          }

          // Call NuGet to create our package
          _context.t0 = log;
          _context.next = 62;
          return (0, _spawnPromise["default"])(cmd, args);
        case 62:
          _context.t1 = _context.sent;
          (0, _context.t0)(_context.t1);
          nupkgPath = _path["default"].join(nugetOutput, "".concat(metadata.name, ".").concat(metadata.version, ".nupkg"));
          if (!remoteReleases) {
            _context.next = 75;
            break;
          }
          cmd = _path["default"].join(vendorPath, 'SyncReleases.exe');
          args = ['-u', remoteReleases, '-r', outputDirectory];
          if (useMono) {
            args.unshift(cmd);
            cmd = monoExe;
          }
          if (remoteToken) {
            args.push('-t', remoteToken);
          }
          _context.t2 = log;
          _context.next = 73;
          return (0, _spawnPromise["default"])(cmd, args);
        case 73:
          _context.t3 = _context.sent;
          (0, _context.t2)(_context.t3);
        case 75:
          cmd = _path["default"].join(vendorPath, 'Squirrel.exe');
          args = ['--releasify', nupkgPath, '--releaseDir', outputDirectory, '--loadingGif', loadingGif];
          if (useMono) {
            args.unshift(_path["default"].join(vendorPath, 'Squirrel-Mono.exe'));
            cmd = monoExe;
          }
          if (signWithParams) {
            args.push('--signWithParams');
            if (!signWithParams.includes('/f') && !signWithParams.includes('/p') && certificateFile && certificatePassword) {
              args.push("".concat(signWithParams, " /a /f \"").concat(_path["default"].resolve(certificateFile), "\" /p \"").concat(certificatePassword, "\""));
            } else {
              args.push(signWithParams);
            }
          } else if (certificateFile && certificatePassword) {
            args.push('--signWithParams');
            args.push("/a /f \"".concat(_path["default"].resolve(certificateFile), "\" /p \"").concat(certificatePassword, "\""));
          }
          if (options.setupIcon) {
            args.push('--setupIcon');
            args.push(_path["default"].resolve(options.setupIcon));
          }
          if (options.noMsi) {
            args.push('--no-msi');
          }
          if (options.noDelta) {
            args.push('--no-delta');
          }
          if (options.frameworkVersion) {
            args.push('--framework-version');
            args.push(options.frameworkVersion);
          }
          _context.t4 = log;
          _context.next = 86;
          return (0, _spawnPromise["default"])(cmd, args);
        case 86:
          _context.t5 = _context.sent;
          (0, _context.t4)(_context.t5);
          if (!(options.fixUpPaths !== false)) {
            _context.next = 105;
            break;
          }
          log('Fixing up paths');
          if (!(metadata.productName || options.setupExe)) {
            _context.next = 96;
            break;
          }
          setupPath = _path["default"].join(outputDirectory, options.setupExe || "".concat(metadata.productName, "Setup.exe"));
          unfixedSetupPath = _path["default"].join(outputDirectory, 'Setup.exe');
          log("Renaming ".concat(unfixedSetupPath, " => ").concat(setupPath));
          _context.next = 96;
          return _fsExtra["default"].rename(unfixedSetupPath, setupPath);
        case 96:
          if (!(metadata.productName || options.setupMsi)) {
            _context.next = 105;
            break;
          }
          msiPath = _path["default"].join(outputDirectory, options.setupMsi || "".concat(metadata.productName, "Setup.msi"));
          unfixedMsiPath = _path["default"].join(outputDirectory, 'Setup.msi');
          _context.next = 101;
          return _fsExtra["default"].pathExists(unfixedMsiPath);
        case 101:
          if (!_context.sent) {
            _context.next = 105;
            break;
          }
          log("Renaming ".concat(unfixedMsiPath, " => ").concat(msiPath));
          _context.next = 105;
          return _fsExtra["default"].rename(unfixedMsiPath, msiPath);
        case 105:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _createWindowsInstaller.apply(this, arguments);
}