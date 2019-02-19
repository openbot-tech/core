# OpenBot Core

OpenBot is an event-driven open source cryptocurrency trading bot built using Node.js and RxJS. Currently the only exchange implemented is [Bittrex](https://bittrex.com/), when backtesting data from [cryptowat.ch](https://cryptowat.ch/) API is used.

## Getting started

First clone the project to your local machine by typing in a terminal

`git clone https://github.com/openbot-tech/core`

Then in the sam terminal to into the project

`cd core`

To run the project you need to install [Docker](https://www.docker.com/) and docker-compose

If you want to run the bot live against bittrex you need to have `BITTREX_API_KEY` and `BITTREX_API_SECRET` in your path, look at how to [Obtain an API key](https://bittrex.github.io/api/v1-1) under Authentication section.

In a bash shell this can be done like this while running build

`BITTREX_API_KEY=<your api key> BITTREX_API_SECRET=<your api secret> docker-compose up --build`

First build the image by typing the following command from the root of the project

`docker-compose build`

Then to run the project for production run the following command

`docker-compose up`

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

To choose an strategy, you can in the config file set the

```
export const STRATEGY = 'BBANDS-RSI'
```

To the name of any strategy in the `src/core/strategy/strategies` folder - the strategy name is the name of the folder containing the strategy.

## References

[event-driven backtesting](https://www.quantstart.com/articles/Event-Driven-Backtesting-with-Python-Part-I)
