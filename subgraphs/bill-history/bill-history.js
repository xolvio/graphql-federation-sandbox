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
    { id: '1', billingAccountNumber: '123', isCurrent: true, hints: [] },
    // { id: '2', billingAccountNumber: '123', isCurrent: false, account: { paperless: true }, hints: staticHints },
    // { id: '3', billingAccountNumber: '123', isCurrent: false, account: { paperless: false }, hints: staticHints },
];

// GraphQL
const typeDefs = gql(readFileSync('./bill-history.graphql', { encoding: 'utf-8' }));
const resolvers = {
    Query: {
        bills: async (_, args, context) => {
            console.info('26 _ michal: ', _);
            return billHistory;
        },
    },
    BillDetailResponse: {
        __resolveType(obj) {
            console.info('32 BillDetailResponse __resolveType obj michal: ', obj);
            if (obj.isCurrent) {
                return 'CurrentBillDetail';
            } else {
                return 'PastBillDetail';
            }
        },
        __resolveReference: (reference) => {
            let result = {};
            console.info('41 BillDetailResponse __resolveReference reference michal: ', reference);
            if (reference.id) {
                result = billHistory.find(bh => bh.id == reference.id);
            } else return { id: 'rover', package: '@apollo/rover', ...reference };

            return {
                ...reference,
                ...result,
            };
        },
    },
    CurrentBillDetail: {
        isTypeOf(obj, context, info) {
            console.info('40 CurrentBillDetail isTypeof michal: ', obj.isCurrent === false, obj);
            return obj.isCurrent === true;
        },
        isCurrent: (obj, args, context) => {
            return obj.isCurrent;
        },
        hints: (obj, args, context) => {
            console.info('47 CurrentBillDetail obj michal: ', obj);
            return obj.hints;
        },
        // account: (obj, args, context, info) => {
        //     console.info('53 CurrentBillDetail account obj michal: ', obj);
        //     return { __typename: 'Account', billingAccountNumber: obj.account.billingAccountNumber };
        // },
        __resolveReference: (reference) => {
            let result = {};
            console.info('52 CurrentBillDetail __resolveReference reference michal: ', reference);
            if (reference.id) {
                result = billHistory.find(bh => bh.id == reference.id);
            } else return { id: 'rover', package: '@apollo/rover', ...reference };

            return {
                ...reference,
                ...result,
            };
        },
    },
    PastBillDetail: {
        isTypeOf(obj, context, info) {
            console.info('62 PastBillDetail isTypeof michal: ', obj.isCurrent === false, obj);
            return obj.isCurrent === false;
        },
        hints: (obj, args, context) => {
            return obj.hints;
        },
    },
    BillDetailHint: {
        id: (obj) => {
            console.info('70 BillDetailHints obj michal: ', obj);
            return obj.id;
        },
        body: (obj) => {
            return obj.body;
        },
    },
    Account: {
        settings: obj => {
            console.info('82 Account settings obj michal: ', obj);
            return obj.settings;
        }

    }
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });

const server = new ApolloServer({ schema });
server.listen({ port }).then(({ url }) => {
    console.log(`🚀 Bill History subgraph ready at ${url}`);
}).catch(err => {
    console.error(err);
});
