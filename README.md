[![Evans](http://i.imgur.com/EIBoAXM.jpg)](https://labs.magnet.me/)
## Evans - Work in Progress
Evans provides a fully automated build chain for iOS projects.
Evans consists of two types: a *server* and multiple *clients*.
The server receives events for build requests and announces them.
The clients are build slaves, which continuously check the server for tasks it can execute.

## Installation
**Clone the repository:**
```
git clone https://github.com/Magnetme/evans.git
```
**Retrieve Dependencies:**
```
npm install && sudo gem install fastlane pilot match gym cocoapods
```
**Configure Evans:**

See [#Configuration](#configuration).

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

### Server

## Examples

## License
Evans is is licensed under an [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).

## Acknowledgements

## Contact

