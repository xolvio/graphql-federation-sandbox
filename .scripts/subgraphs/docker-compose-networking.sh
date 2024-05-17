#!/bin/bash

subgraphs=("inventory" "products" "users" "reviews" "accounts" "bill_history")

url_inventory="http://inventory:4000/graphql"
url_products="http://products:4000/graphql"
url_users="http://users:4000/graphql"
url_reviews="http://reviews:4000/graphql"
url_accounts="http://accounts:4000/graphql"
url_bill_history="http://bill-history:4000/graphql"

schema_inventory="subgraphs/inventory/app/src/main/resources/graphql/inventory.graphqls"
schema_products="subgraphs/products/products.graphql"
schema_users="subgraphs/users/users.graphql"
schema_reviews="subgraphs/reviews/reviews.graphql"
schema_accounts="subgraphs/accounts/accounts.graphql"
schema_bill_history="subgraphs/bill-history/bill-history.graphql"
