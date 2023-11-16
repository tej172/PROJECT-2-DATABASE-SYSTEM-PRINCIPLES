<h1 align="center">Frontend</h1>

This package houses the frontend for our query optimizer. It takes in a user supplied SQL query made for the [TPC-H](http://www.tpc.org/tpch/) dataset and turns it into a query template that is parsed by Postgresql. It then displays various explanations and graphs on how the query optimizer determines the optimal query execution plan to pick from various plans by comparing the estimated costs of each query plan.

## Installation and setup

1. **Ensure that you have [npm] installed (A package manager for javascript) and [NodeJS](https://nodejs.org/en/) installed.**
2. `cd` into this folder and run `npm install` to install the dependencies needed for the client.
3. In your terminal, run `npm start` to start the frontend client for unit testing. You can also head back up to the `src` folder and run `npm start`, which starts both the frontend client and the API server concurrently. Make sure to check out the `api` folder if you haven't set up the API server yet.
