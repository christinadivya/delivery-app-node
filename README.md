
## Getting Started

Clone the repo:
```sh
git clone https://github.com/jaiobs/fetch-services.git
cd fetch39
```

Install yarn:
```js
npm install -g yarn
```

Install dependencies:
```sh
yarn
```

Set environment (vars):
```sh
cp .env.example .env
```

Start server:
```sh
# Start server
yarn start

# Selectively set DEBUG env var to get logs
DEBUG=mcl-service:* yarn start
```
Refer [debug](https://www.npmjs.com/package/debug) to know how to selectively turn on logs.


Tests:
```sh
# Run tests written in ES6 
yarn test

# Run test along with code coverage
yarn test:coverage

# Run tests on file change
yarn test:watch

# Run tests enforcing code coverage (configured via .istanbul.yml)
yarn test:check-coverage
```

Lint:
```sh
# Lint code with ESLint
yarn lint

# Run lint on any file change
yarn lint:watch
```

Other gulp tasks:
```sh
# Wipe out dist and coverage directory
gulp clean

# Default task: Wipes out dist and coverage directory. Compiles using babel.
gulp
```

##### Deployment

```sh
# compile to ES5
1. yarn build

# upload dist/ to your server
2. scp -rp dist/ user@dest:/path

# install production dependencies only
3. yarn --production

# Use any process manager to start your services
4. pm2 start dist/index.js




## Docker

```sh
# For Development
# service restarts on file change
1. bash bin/development.sh

```

## Docker Cloud deployment

```sh

1. docker push optisolbusiness/fetch39-services:latest
2. docker pull optisolbusiness/fetch39-services:latest
3. sudo docker run -d -p 9009:9009 optisolbusiness/fetch39-services
4. sudo docker build . -t "optisolbusiness/fetch39-services"


```




