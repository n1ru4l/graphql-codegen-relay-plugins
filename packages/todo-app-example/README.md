## GraphQL Codegen Relay TodoMVC

Demonstration of using `graphql-codegen-relay-plugin` with TodoMVC.
Server code is based on [Relay TodoMVC](https://github.com/relayjs/relay-examples/tree/master/todo)
Frontend code is also based on [Relay TodoMVC](https://github.com/relayjs/relay-examples/tree/master/todo) but ported over to ReactApollo (`@apollo/react-hooks`).

## Usage instructions

- `yarn server`
- `yarn start`
- Visit TODO MVC App on `localhost:3000`

## Development Info

- Frontend uses `create-react-app`.
- GraphQL Server uns on port `3001`
- Types are generated with the command `yarn generate:types`
