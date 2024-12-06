# prettier-config

Coinstore's base Prettier config.

## Installation

```sh
npm install @coinstore/prettier-config -D
```

## Usage

After installing, update your project's `prettier.config.mjs` file to import the rule sets you want:

```js
import prettierConfig from '@coinstore/prettier-config';

const config = {
  ...prettierConfig,
  // your overrides here
};

export default config;
```

---

Read the [Prettier config docs](https://prettier.io) for more information.
