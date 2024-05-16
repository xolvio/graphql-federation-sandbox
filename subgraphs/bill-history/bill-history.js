const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema, printSubgraphSchema } = require('@apollo/subgraph');
const { readFileSync } = require('fs');
const { printSchema } = require('graphql');

const port = process.env.APOLLO_PORT || 4000;

// Data sources
const staticHints = [
    { id: '1', body: 'static hint 1' },
    { id: '2', body: 'static hint 2' },
    { id: '3', body: 'static hint 3' },
];

const billHistory = [
    { id: '1', billingAccountNumber: '123', accountId: '1', isCurrent: true, hints: [] },
    { id: '2', billingAccountNumber: '123', isCurrent: false, account: { paperless: true }, hints: staticHints },
    { id: '3', billingAccountNumber: '123', isCurrent: false, account: { paperless: false }, hints: staticHints },
    { id: '4', billingAccountNumber: '456', isCurrent: false, account: { paperless: true }, hints: staticHints },
    { id: '5', billingAccountNumber: '789', isCurrent: false, account: { paperless: false }, hints: staticHints },
];

// GraphQL
const typeDefs = gql(readFileSync('./bill-history.graphql', { encoding: 'utf-8' }));
const resolvers = {
    Query: {
        bills: async (_, args, context) => {
            return billHistory;
        },
    },
    BillDetailResponse: {
        __resolveType(obj) {
            if (obj.isCurrent) {
                return 'CurrentBillDetail';
            } else {
                return 'PastBillDetail';
            }
        }
    },
    CurrentBillDetail: {
        hints: (obj, args, context) => {
            if (obj.account?.settings?.paperless) {
                return [
                    staticHints[0],
                    staticHints[2],
                ]
            }
            return null;
        },
        __resolveReference: (reference) => {
            let result = {};
            if (reference.billingAccountNumber) {
                result = billHistory.find(bh => bh.billingAccountNumber === reference.billingAccountNumber);
            } else return { id: 'rover', package: '@apollo/rover', ...reference };

            return {
                ...reference,
                ...result,
            };
        },
    },
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });

const server = new ApolloServer({ schema });
server.listen({ port }).then(({ url }) => {
    console.log(`🚀 Bill History subgraph ready at ${url}`);
}).catch(err => {
    console.error(err);
});
