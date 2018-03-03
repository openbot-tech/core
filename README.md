# RxJS Trading bot

This bot is build up of four different components that is tied together in the game loop:

**market:** Has two parts the ```historic``` data handler that fetches data from [cryptowat.ch api](https://cryptowat.ch/docs/api) and then drips the data into the game loop with a ```market``` event. The ```live``` data handler that fetches data from the ```bittrex``` socket connection and creates candle for the given timeframe, which is dripped into the gameloop when a new candle is created with a ```market``` event.

**strategy:** Which is the same for backtest and live trading, is using ```talib``` for the TA. Currently only the ```MA-CCI``` strategy is implemented, but its made to be extendable. When the stragedy makes a ```signal``` event it's dripped into the gameloop.

**portfolio:** Is recieving the buy or sell orders from the strategies as a ```signal``` event. Now it only filters out the signals because each time the strategy component emits a new event it doesnt care about us being in a current order or not. So we only filter out saying that if we have bought and we get a sell signal we sell. And then we don't do anything until we get another buy signal. Then we emit an ```order``` event to the gameloop.

**broker:** After the portfolio emits an ```order``` event this component should handle it both for papertrading and live with the broker. This is not implemented yet.