#!/bin/bash

subgraphs=("products" "inventory" "users" "reviews" "accounts" "bill_history")

url_products="http://localhost:4001/graphql"
url_inventory="http://localhost:4002/graphql"
url_users="http://localhost:4003/graphql"
url_reviews="http://localhost:4004/graphql"
url_accounts="http://localhost:4005/graphql"
url_bill_history="http://localhost:4006/graphql"

schema_products="subgraphs/products/products.graphql"
schema_inventory="subgraphs/inventory/app/src/main/resources/graphql/inventory.graphqls"
schema_users="subgraphs/users/users.graphql"
schema_reviews="subgraphs/reviews/reviews.graphql"
schema_accounts="subgraphs/accounts/accounts.graphql"
schema_bill_history="subgraphs/bill-history/bill-history.graphql"
