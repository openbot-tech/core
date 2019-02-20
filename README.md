# About

Open bot is an event-driven open source cryptocurrency trading bot built using Node.js and RxJS.
- The only exchange integrated is [Bittrex](https://bittrex.com/).
- For backtesting the [cryptowat.ch](https://cryptowat.ch/) API is used.

# Prerequisits 

### OSX or Linux
- You need to run the both from OSX or Linux. If you are using Microsoft, setup a virtual machine. 

### Docker

- To run the project you need to install [Docker](https://www.docker.com/) including docker-compose

### Bittrex

- If you want to run the bot live against Bittrex you need to have `BITTREX_API_KEY` and `BITTREX_API_SECRET` in your path, look at how to [Obtain an API key](https://bittrex.github.io/api/v1-1) under Authentication section.

# Start running openbot via Bittrex

## 1) Clone the project to your local machine by typing in your terminal

`git clone https://github.com/openbot-tech/core`

## 2) Navigate to the open bot core directory by writing

`cd core`

## 3) Build the docker image by typing

`docker-compose build`

## 4) Connect to your Bittrex API key

`BITTREX_API_KEY=<your api key> BITTREX_API_SECRET=<your api secret> docker-compose up --build`

## 5) Run the project for production by typing

`docker-compose up`

# Run 





For running the project while developing including `HMR` run

`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

Then change a file in the `src` folder to verify that `HMR` is working

To test the bot run

`docker-compose -f docker-compose.yml -f docker-compose.test.yml up`

## Configuring the project

To change the configuration for the project you have to go to the config file in `src/config/index.js` and change the variables.

To run the bot live against the exchange set the following in the config file

```
export const BACKTEST = false
export const PAPER_TRADE = false
```

if `PAPER_TRADE` is set to `true` then the bot will run against a socket connection but not submit any orders to the exchange.

To choose a strategy, you can in the config file set the

```
export const STRATEGY = 'BBANDS-RSI'
```

To the name of any strategy in the `src/core/strategy/strategies` folder - the strategy name is the name of the folder containing the strategy.

## References

[event-driven backtesting](https://www.quantstart.com/articles/Event-Driven-Backtesting-with-Python-Part-I)
