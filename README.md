[![Evans](http://i.imgur.com/EIBoAXM.jpg)](https://labs.magnet.me/)
## Evans - Work in Progress
Evans provides a fully automated build chain for iOS projects.
Evans consists of two artifacts: a *server* and a *client*.
The server receives events for build requests and announces them.
The clients are build slaves, which continuously check the server for tasks it can execute.

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
We would like to especially thank Felix Krause([@KrauseFx](https://twitter.com/KrauseFx)) and all the other Fastlane contributors for creating the tools on which Evans relies. This work wouldn't have been possible without you. Thank you.

## Contact
**Author:** [Martin Jorn Rogalla](https://keybase.io/martinrogalla) ([@MartinRogalla](https://twitter.com/MartinRogalla))

