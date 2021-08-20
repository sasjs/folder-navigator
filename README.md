# Overview
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

The folderNavigator lets you navigate the SAS folder tree - be that metadata in SAS 9 or SAS Drive in Viya.

The purpose of building the app was to provide a way to modify Stored Process source code for developers on Unix / Mac - who don't have Enterprise Guide nor the patience to [wait for X11](https://rawsas.com/launching-smc-on-mac-os-over-ssh-with-x11/).

You can deploy the app in just two lines of code:

```
filename runme url "https://raw.githubusercontent.com/sasjs/folder-navigator/master/build.sas";
%inc runme;
```

To provide the convenience of running those two lines above in both SAS 9 and SAS Viya (without too much rework on our part) the services contain code for both SAS 9 and Viya. This redundancy (deploying Viya code to SAS 9 and vice versa) is not necessary if you are using the [SASjs CLI](https://cli.sasjs.io) - instead you could define your Viya or SAS 9 specific macros in the target-specific `macroFolders` and compile/build/deploy relevant code to each target whilst keeping a common codebase in GIT.

We do this extensively with [Data Controller](https://datacontroller.io) as well as customer project built with SASjs (where those projects need to work on both SAS 9 and Viya).

For more information, a demo, or SASjs training, contact [Allan Bowe](https://www.linkedin.com/in/allanbowe).

## Full Deployment

### Frontend Web

Clone the repo, `cd` into it, and `npm install`. Then update the following in `sas.service.ts`:

- `appLoc` - the location in the metadata or viya folder tree where the backend services will be located.
- `serverType` - either SAS9 or SASVIYA.
- `serverUrl` - only relevant if not serving from the SAS domain (`!SASCONFIG/LevX/Web/WebServer/htdocs` in SAS9 or `/var/www/html` on SAS Viya)
- `useComputeApi` - can be `true` or `false`, it's a switch for SASjs adapter whether to use `Compute` approach while doing requests (Viya only).
- `contextName` - only relevant if `useComputeApi` is true. Provides a context name that will be used in adapter.

More details in official @SASjs/adapter documentation: https://sasjs.io/sasjs-adapter/#configuration

If you are running locally you will either need to whitelist `localhost` on the server, or enable CORS as described [here](https://sasjs.io/cors)

Finally, execute `npm run build` to create a production build.

### Backend Services

Simply configure the target in the `sasjsconfig.json` and run `sasjs cbd -t yourTarget` to compile, build & deploy the backend services to your environment.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/medjedovicm"><img src="https://avatars.githubusercontent.com/u/18329105?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mihajlo Medjedovic</b></sub></a><br /><a href="https://github.com/sasjs/folder-navigator/commits?author=medjedovicm" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!