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

const port = process.env.APOLLO_PORT || 4000;

// Data sources
const accounts = [
    {
        billingAccountNumber: "123",
        phoneNumber: "123",
        role: "AM",
        userRole: "PAH",
        systemRole: "FULL"
    },
    {
        billingAccountNumber: "12343",
        phoneNumber: "234",
        role: "AM",
        userRole: "PAH",
        systemRole: "FULL"
    },
    {
        billingAccountNumber: "345",
        phoneNumber: "345",
        role: "AM",
        userRole: "PAH",
        systemRole: "FULL"
    },
];

// GraphQL
const typeDefs = gql(readFileSync('./accounts.graphql', {encoding: 'utf-8'}));
const resolvers = {
    Query: {
        accounts: (_, args, context) => {
            console.log("Query ==========================")
            return accounts;
        },
        account: (_, args, context) => {
            console.log("Query account ==========================")
            return accounts.find(account => account.billingAccountNumber === args.billingAccountNumber);
        }
    },
    Account: {
        account: (account) => {
            console.log("==========================")
            return account[0];
        },
        __resolveReference: reference => {
            console.log("=====")
            console.log("args",reference)
            return accounts.find(account => account.billingAccountNumber === reference.billingAccountNumber)
        }
    },
    Subscriber: {
        account: (args) => {
            console.log("====2======================")
            console.log(args)
            return accounts.find(account => account.phoneNumber === args.phoneNumber);;
        },
        // __resolveReference: reference => {
        //     console.log("=====")
        //     console.log("args",reference)
        //     return accounts.find(account => account.billingAccountNumber === reference.billingAccountNumber)
        // }
    }
}
const schema = buildSubgraphSchema({typeDefs, resolvers});

const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
        console.log(req.body)
    }
});

server.listen({port: port}).then(({url}) => {
    console.log(`🚀 Accounts subgraph ready at ${url}`);
}).catch(err => {
    console.error(err)
});
