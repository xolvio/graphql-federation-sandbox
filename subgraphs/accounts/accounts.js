// Open Telemetry (optional)
const {ApolloOpenTelemetry} = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
    new ApolloOpenTelemetry({
        type: 'subgraph',
        name: 'accounts',
        exporter: {
            type: process.env.APOLLO_OTEL_EXPORTER_TYPE, // console, zipkin, collector
            host: process.env.APOLLO_OTEL_EXPORTER_HOST,
            port: process.env.APOLLO_OTEL_EXPORTER_PORT,
        }
    }).setupInstrumentation();
}

const {ApolloServer, gql} = require('apollo-server');
const {buildSubgraphSchema, printSubgraphSchema} = require('@apollo/subgraph');
const {readFileSync} = require('fs');
const {printSchema} = require('graphql');

const port = process.env.APOLLO_PORT || 4000;

// Data sources
const accounts = [
    {
        id: '1',
        billingAccountNumber: '123',
        name: 'Alice',
        email: 'alice@gmail.com',
        amountDue: 100.0,
        balance: 100.0,
        settings: {paperless: true}
    },
    {
        id: '2',
        billingAccountNumber: '456',
        name: 'Bob',
        email: 'bob@yahoo.com',
        amountDue: 200.0,
        balance: 50.0,
        settings: {paperless: false}
    },
    {
        id: '3',
        billingAccountNumber: '789',
        name: 'Charlie',
        email: 'charlie123@gmail.com',
        amountDue: 300.0,
        balance: 500.0,
        settings: {paperless: true}
    },
];

// GraphQL
const typeDefs = gql(readFileSync('./accounts.graphql', {encoding: 'utf-8'}));
const resolvers = {
    Query: {
        accounts: (_, args, context) => {
            return accounts;
        },
        account: (_, args, context) => {
            return accounts.find(account => account.billingAccountNumber === args.billingAccountNumber);
        }
    },
    CurrentBillDetail: {
        __resolveReference: (reference) => {
            return {
                ...reference,
                ...accounts.find(account => account.billingAccountNumber === reference.billingAccountNumber)
            };
        },
        account: (account) => {
            return accounts.find(acc => acc.billingAccountNumber === account.billingAccountNumber);
        }
    },
    Account: {
        account: (account) => {
            return account[0];
        },
        __resolveReference: reference => {
            return accounts.find(account => account.billingAccountNumber === reference.billingAccountNumber)
        }
    }
}
const schema = buildSubgraphSchema({typeDefs, resolvers});

const server = new ApolloServer({schema: schema});
server.listen({port: port}).then(({url}) => {
    console.log(`🚀 Accounts subgraph ready at ${url}`);
}).catch(err => {
    console.error(err)
});
