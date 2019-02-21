# About

Open bot is an event-driven open source cryptocurrency trading bot built using Node.js and RxJS.
- The only exchange integrated is [Bittrex](https://bittrex.com/).
- For backtesting the [cryptowat.ch](https://cryptowat.ch/) API is used.

# Requirements

### OSX/Linux
- To run open bot you need a Unix bash shell from OSX or Linux. If you are using Microsoft, setup a virtual machine. 

### Docker

- To run the project you need to install [Docker](https://www.docker.com/) including docker-compose

### Bittrex

- If you want to run open bot live against Bittrex you need to have `BITTREX_API_KEY` and `BITTREX_API_SECRET` in your path, look at how to [Obtain an API key](https://bittrex.github.io/api/v1-1) under the "Authentication" section.

# Installing open bot

## 1) Clone the project to your local machine by typing in your terminal

`git clone https://github.com/openbot-tech/core`

## 2) Navigate to open bot core directory by writing

`cd core`

## 3) Build the docker image by typing

`docker-compose build`

# Configuring open bot variables

Go to the config file in `src/config/index.js`. Here you will find the following parametres:

### Trading mode
Choose between
- Backtesting
- Paper testing
- Running the bot live

### Time measures
- Time frame (if backtest is chosen)
- Backtest days (if backtest is chosen)
- Retry order (to configure the order execution)

### Market
- Specify your market foreaxmple 'BTC-ETH' for Bitcoin / Ethereum market.

### Strategy
- Choose a premade strategy such as 'BBANDS-RSI' or set in your own custom strategy.
- Each folder in `src/core/strategy/strategies` folder is a strategy you can choose from 

# Running open bot live on Bittrex

## 1) Make sure these parametres are included in the config file
```
export const BACKTEST = false
export const PAPER_TRADE = false
``` 

## 2) Connect your Bittrex API key by typing

`BITTREX_API_KEY=<your api key> BITTREX_API_SECRET=<your api secret> docker-compose up --build`

# Backtesting & paper trading

## Backtesting

- If `BACKTEST` is set to `true` then the bot will run against the historic market chosen.

## Paper trading

- If `PAPER_TRADE` is set to `true` then the bot will run against a socket connection but not submit any orders to the exchange.

# For developers


The difference between production and developing is how we build it with webpack and that production doesn't contain `HMR` or hot module reloading which means that any changes in the project would reload the bot. If you run the project for production, changes in the code wouldn't affect the bot execution.


## Develop on open bot while it is running

- Include `HMR` and run

 `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

- Change a file in the `src` folder to verify that `HMR` is working

## Running open bot tests

To run the open bot test scripts run

- `docker-compose -f docker-compose.yml -f docker-compose.test.yml up`
