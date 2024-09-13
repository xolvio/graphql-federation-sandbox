const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema, printSubgraphSchema } = require('@apollo/subgraph');
const { readFileSync } = require('fs');
const { printSchema } = require('graphql');

const port = process.env.APOLLO_PORT || 4000;

const subscribers = [
    {
        __typename: "Subscriber",
        phoneNumber: "123",
        nickName: "testNick",
        firstName: "FirstI",
        lastName: "Doe",
    }
]

// GraphQL
const typeDefs = gql(readFileSync('./bill-history.graphql', { encoding: 'utf-8' }));
const resolvers = {
    Query: {
        subscriberByPhoneNumber: async (_, args, context) => {
            const resultData = subscribers.find(sub => args.phoneNumber === sub.phoneNumber);
            return resultData
        },
    },
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });

const server = new ApolloServer({
    schema, context: async ({ req }) => {
        // this logs all the requests
        console.log(JSON.stringify(req.body))
    }
});
server.listen({ port }).then(({ url }) => {
    console.log(`🚀 Bill History subgraph ready at ${url}`);
}).catch(err => {
    console.error(err);
});
