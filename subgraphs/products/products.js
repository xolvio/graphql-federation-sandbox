// Open Telemetry (optional)
const { ApolloOpenTelemetry } = require('supergraph-demo-opentelemetry');

if (process.env.APOLLO_OTEL_EXPORTER_TYPE) {
  new ApolloOpenTelemetry({
    type: 'subgraph',
    name: 'products',
    exporter: {
      type: process.env.APOLLO_OTEL_EXPORTER_TYPE, // console, zipkin, collector
      host: process.env.APOLLO_OTEL_EXPORTER_HOST,
      port: process.env.APOLLO_OTEL_EXPORTER_PORT,
    }
  }).setupInstrumentation();
}

const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema, printSubgraphSchema } = require('@apollo/subgraph');
const { readFileSync } = require('fs');
const { printSchema } = require('graphql');

const port = process.env.APOLLO_PORT || 4000;

// Data sources
const products = [
    { id: 'converse-1', sku: 'converse-1', package: 'converse', name: 'Converse Chuck Taylor', oldField: 'deprecated'},
    { id: 'vans-1', sku: 'vans-1', package: 'vans', name: 'Vans Classic Sneaker', oldField: 'deprecated'},
]

const variationByProduct = [
    { id: 'converse-1', variation: { id: 'converse-classic', name: 'Converse Chuck Taylor'}},
    { id: 'vans-1', variation: { id: 'vans-classic', name: 'Vans Classic Sneaker'}},
]

const userByProduct = [
    { id: 'converse-1', user: { email: 'info@converse.com', totalProductsCreated: 1099}},
    { id: 'vans-1', user: { email: 'info@vans.com', totalProductsCreated: 1099}},
]

// GraphQL
const typeDefs = gql(readFileSync('./products.graphql', { encoding: 'utf-8' }));
const resolvers = {
    Query: {
        allProducts: async (_, args, context) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return products;
        },
        product: async (_, args, context) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return products.find(p => p.id == args.id);
        }
    },
    ProductItf: {
        __resolveType(obj, context, info){
            return 'Product';
        },
    },
    Product: {
        variation: (reference) => {
            return new Promise(r => setTimeout(() => {
              if (reference.id) {
                const variation = variationByProduct.find(p => p.id == reference.id).variation;
                r(variation);
	      }
	      r({ id: 'defaultVariation', name: 'default variation' });
	    }, 1000));
        },
        dimensions: () => {
            return { size: "1", weight: 1 }
        },
        discount(product, args, context) {
            const reviewsCount = product.reviewsCount;
            console.log("product", product);
            if (reviewsCount === undefined) {
                throw new Error("reviewsCount is not provided");
            }
            return reviewsCount * 0.1;
        },
        createdBy: (reference) => {
            if (reference.id) {
                return userByProduct.find(p => p.id == reference.id).user;
            }
            return null;
        },
        reviewsScore: () => {
            return 4.5;
        },
        __resolveReference: (reference) => {
            let product = {};
            console.log("__resolveReference reference:", reference);
            if (reference.id) {
                product = products.find(p => p.id == reference.id);
            }
            else if (reference.sku && reference.package) {
                product = products.find(p => p.sku == reference.sku && p.package == reference.package);
            }
            else return { id: 'rover', package: '@apollo/rover', ...reference };

            return {
                ...reference,
                ...product,
            }
        }
    }
}
const schema = buildSubgraphSchema({ typeDefs, resolvers });

const server = new ApolloServer({ schema: schema });
server.listen( {port: port} ).then(({ url }) => {
  console.log(`🚀 Products subgraph ready at ${url}`);
}).catch(err => {console.error(err)});
