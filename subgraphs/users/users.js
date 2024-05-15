// Open Telemetry (optional)
const { ApolloOpenTelemetry } = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
  new ApolloOpenTelemetry({
    type: 'subgraph',
    name: 'users',
    exporter: {
      type: process.env.APOLLO_OTEL_EXPORTER_TYPE, // console, zipkin, collector
      host: process.env.APOLLO_OTEL_EXPORTER_HOST,
      port: process.env.APOLLO_OTEL_EXPORTER_PORT,
    }
  }).setupInstrumentation();
}

const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { readFileSync } = require('fs');

const port = process.env.APOLLO_PORT || 4000;

const users = [
    { email: 'info@converse.com', name: 'Converse', totalProductsCreated: 1100 },
    { email: 'info@vans.com', name: 'Van Doren', totalProductsCreated: 1100 }
]

const typeDefs = gql(readFileSync('./users.graphql', { encoding: 'utf-8' }));
const resolvers = {
    User: {
        __resolveReference: async (reference) => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            return users.find(u => u.email == reference.email);
        }
    }
}

const app = express();

async function startApolloServer() {
    const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs, resolvers }),
        context: async ({ req, res }) => {
            res.setHeader('Cache-Control', 'max-age=600');
            // Ensure the header is being set
            console.log('Header set');
            return { req, res };
        }
    });
    await server.start(); // Start the Apollo server before applying middleware
    server.applyMiddleware({ app }); // Connect Apollo Server with Express application

    app.listen(port, () => {
        console.log(`🚀 Users subgraph ready at http://localhost:${port}${server.graphqlPath}`);
    });
}

startApolloServer().catch(err => {
    console.error(err);
});

// const server = new ApolloServer({ schema: buildSubgraphSchema({ typeDefs, resolvers }) });
// server.listen( {port: port} ).then(({ url }) => {
//   console.log(`🚀 Users subgraph ready at ${url}`);
// }).catch(err => {console.error(err)});
