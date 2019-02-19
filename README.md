# OpenBot Core

OpenBot is an event-driven open source cryptocurrency trading bot built using Node.js and RxJS. Currently the only exchange implemented is [Bittrex](https://bittrex.com/), when backtesting data from [cryptowat.ch](https://cryptowat.ch/) API is used.

## Getting started

First clone the project to your local machine by typing in a terminal

`git clone https://github.com/openbot-tech/core`

Then in the sam terminal to into the project

`cd core`

To run the project you need to install [Docker](https://www.docker.com/) and docker-compose

If you want to run the bot live against bittrex you need to have `BITTREX_API_KEY` and `BITTREX_API_SECRET` in your path.

First build the image by typing the following command from the root of the project

`docker-compose build`

Then to run the project for production run the following command

`docker-compose up`

For running the project while developing including `HMR` run

`docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

Then change a file in the `src` folder to verify that `HMR` is working

here the difference between production and developing is how we build it with webpack and that production doesn't contain `HMR` or hot module reloading which means that any changes in the project would reload the bot. If you run the project for production, changes in the code wouldn't affect the bot execution.

To test the bot run

`docker-compose -f docker-compose.yml -f docker-compose.test.yml up`

## Configuring the project

To change the configuration for the project you have to go to the config file in `src/config/index.js` and change the variables.

## References

[event-driven backtesting](https://www.quantstart.com/articles/Event-Driven-Backtesting-with-Python-Part-I)
