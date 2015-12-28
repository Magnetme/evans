[![Evans](http://i.imgur.com/EIBoAXM.jpg)](https://labs.magnet.me/)
[![Contact: @MartinRogalla](https://img.shields.io/badge/contact-%40MartinRogalla-FF5C51.svg?style=flat-square)](https://twitter.com/MartinRogalla)
[![Status: Work in Progress](https://img.shields.io/badge/status-Work%20in%20Progress-FF5C51.svg?style=flat-square)](https://labs.magnet.me/)
[![Platform: OSX](https://img.shields.io/badge/platform-OS%20X-FF5C51.svg?style=flat-square)](#)
[![License: Apache License 2.0](https://img.shields.io/badge/license-Apache%202.0-FF5C51.svg?style=flat-square)](http://www.apache.org/licenses/LICENSE-2.0)

## Evans
Evans is a project started by [Magnet.me Labs](https://labs.magnet.me/). Evans provides a fully automated distributed build chain for iOS projects.
Evans consists of two artifacts: a *server* and a *client*.
The server receives events *(e.g. a specific message on a GitHub pull request)* and turns them into actions *(e.g. TestFlight submission, request for screenshots, etc)* and announces them.
The clients are build-slaves, which continuously check the server announcements for tasks it can execute.

During the development of the iOS App of Magnet.me we have noticed that a lot of time is taken up by waiting on routine processes to complete. Wether it’s simply uploading a build on TestFlight or creating screenshots for all kinds of devices. These problems have largely been solved by the Fastlane tools.  However, what we were looking for, is to have it fully automated, such that a person should be able to request a TestFlight submission of a given branch, simply by writing a comment on a given pull request and can then continue on their own machine with development.

It is important to note that *Evans is still a work in progress*. Evans is still maturing, so not expect everything to work smoothly right out of the box. You might want to check out the `/client/actions` folder if you want to customize the commands for each action.

## Installation
**Clone the repository:**
```
git clone https://github.com/Magnetme/evans.git
```
**Retrieve Dependencies:**
```
npm install && sudo gem install fastlane pilot gym cocoapods && sudo gem install match --version "=0.1.2"
```
**Configure Evans:**

See [Configuration](#configuration).

**Run Evans Server:**
```
cd server && node index.js
```
**Run Evans Client:**
```
cd client && node index.js
```
## Configuration

### Client
**Store Match' password in the keychain by running:**
```
match change_password
```

### Server

## Examples

## License
Evans is is licensed under an [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).

## Acknowledgements
We would like to especially thank Felix Krause ([@KrauseFx](https://twitter.com/KrauseFx)) and all the other Fastlane contributors for creating the tools on which Evans relies. This work wouldn't have been possible without you. Thank you.

## Contribute
Feel welcome to contribute to Evans. If you have any questions, please don't hesitate to contact us.

## Contact
**Author:** [Martin Jorn Rogalla](https://keybase.io/martinrogalla) ([@MartinRogalla](https://twitter.com/MartinRogalla))

