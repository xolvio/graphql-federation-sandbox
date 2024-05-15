#!/bin/bash

subgraphs=("products" "inventory" "users" "reviews")

url_products="http://localhost:4001/graphql"
url_inventory="http://localhost:4002/graphql"
url_users="http://localhost:4003/graphql"
url_reviews="http://localhost:4004/graphql"

schema_products="subgraphs/products/products.graphql"
schema_inventory="subgraphs/inventory/app/src/main/resources/graphql/inventory.graphqls"
schema_users="subgraphs/users/users.graphql"
schema_reviews="subgraphs/reviews/reviews.graphql"
