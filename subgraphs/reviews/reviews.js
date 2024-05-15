const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const { buildSubgraphSchema, printSubgraphSchema } = require('@apollo/subgraph');
const { readFileSync } = require('fs');

const port = process.env.APOLLO_PORT || 4000;

const reviews = [
    { id: 1, body: "Cool shoes", product_id: "vans-1" },
    { id: 2, body: "Love my vans", product_id: "vans-1" },
    { id: 3, body: "Good I guess", product_id: "vans-1" },
    { id: 4, body: "Nice seasonal colors", product_id: "converse-1" },
]

const typeDefs = gql(readFileSync('./reviews.graphql', { encoding: 'utf-8' }));
const resolvers = {
    Query: {
        review: (_, args, context) => {
            return reviews.find(r => r.id == args.id);
        },
    },
    Review: {
        __resolveReference: (review) => {
            return reviews.find(r => r.id === review.id);
        }
    },
    Product: {
        reviews: (product) => reviews.filter(r => r.product_id === product.id),
        reviewsCount: (product) => {
            console.log("product: ", product);
            console.log("product reviewsCount: ", reviews.filter(r => r.product_id === product.id).length, product);
            return reviews.filter(r => r.product_id === product.id).length;
        },
        reviewsScore: (product) => 4.6, // Static example score
    },
}

const app = express();
const schema = buildSubgraphSchema({ typeDefs, resolvers });

async function startApolloServer() {
    const server = new ApolloServer({
        schema,
        context: async ({ req, res }) => {
            res.setHeader('Cache-Control', 'max-age=300');
            // Ensure the header is being set
            console.log('Header set');
            return { req, res };
        }
    });
    await server.start(); // Start the Apollo server before applying middleware
    server.applyMiddleware({ app }); // Connect Apollo Server with Express application

    app.listen(port, () => {
        console.log(`🚀 Reviews subgraph ready at http://localhost:${port}${server.graphqlPath}`);
    });
}

startApolloServer().catch(err => {
    console.error(err);
});