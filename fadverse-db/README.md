# fadverse-db

## Usage

```js
const setupDatabase = requiere('fadverse-db')

setupDatabase(config)
  .then((db) => {
    const { Agent, Metric } = db
  })
  .catch((err) => console.error(err))
```
