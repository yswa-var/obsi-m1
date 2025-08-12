---
title: "Backtesting the Viral Nadaraya-Watson Envelope Trading Indicator in Python"
description: "A deep dive into implementing and backtesting the Nadaraya-Watson Envelope dicator, with important warnings about repainting issues"
author: "Yashaswa Varshney"
date: 2023-01-31
tags:
  - trading
  - backtesting
  - python
  - trading-bot
  - technical-analysis
---

# Backtesting the Viral Nadaraya-Watson Envelope Trading Indicator in Python

*Too good to be true is often a warning sign, and this is certainly the case with the Nadaraya-Watson indicator. Let me explain...*

## What is the Nadaraya-Watson Envelope?

The Nadaraya-Watson envelope is a type of moving average calculated by taking a weighted average of data points over a period of time. The envelope is created by drawing two lines (one above and one below) parallel to the moving average at a user-defined percentage distance. 

The top and bottom lines form a "band" around the moving average that can be used to identify potential trend changes and generate trading signals. The Nadaraya-Watson envelope is named after its creators, Vasily Nadaraya and Geoffrey Watson.

**Official TradingView Script:** [Nadaraya-Watson Envelope by LuxAlgo](https://www.tradingview.com/script/Iko0E2kL-Nadaraya-Watson-Envelope-LuxAlgo/)

## How It Works: The Logic Behind the Indicator

The main computation is done in a 'for' loop that iterates over 'n'. At each iteration "i", a weighted average of the data points is calculated using another inner "for" loop that iterates "j". 

The weight "w" is exponentially calculated and depends on the difference between the indices "i" and "j" and the smoothing parameter "h":

```python
w = np.exp(-(np.power(i-j,2)/(h*h*2)))
```

The weighted sum of data points is stored in 'sum' and the weighted sum of weights is stored in 'sumw'. The weighted average of the data points for each iteration "i" is computed as the ratio of "sum" and "sumw".

The value "y2[i]" is set to this weighted average at each iteration. The value "y1[i]" is computed as the average of "y2[i]" and "y2[i-1]" for all iterations except the first (because the first value of "y1" is undefined).

Finally, the arrays 'y2' and 'y1' are added as new columns to the dataframe 'df'.

### Signal Generation Logic

The function generates buy and sell signals based on the difference between two elements of the Nadaraya-Watson Envelope (y2):

- **Buy Signal**: If the difference is greater than a threshold AND the previous y2 value is below the previous y1 value
- **Sell Signal**: If the difference is less than the negative of the threshold AND the previous y2 value is above the previous y1 value

## Let's Backtest This in Python

Here's a complete implementation with backtesting capabilities:

```python
import numpy as np
from sklearn.kernel_ridge import KernelRidge
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf

class Backtest:
    def __init__(self, symbol, tim):
        self.tim = tim
        self.symbol = symbol
        self.df = yf.download(tickers=symbol, period=self.tim)
        self.src = self.df["Close"].values
        self.h = 7
        y2, y1 = self.nadaraya_watson_envelope()
        self.gen_signals(y1, y2)

    def nadaraya_watson_envelope(self):
        n = len(self.src)
        y2 = np.empty(n)
        y1 = np.empty(n)
        h = self.h
        
        for i in range(n):
            sum = 0
            sumw = 0
            for j in range(n):
                w = np.exp(-(np.power(i-j, 2)/(h*h*2)))
                sum += self.src[j]*w
                sumw += w
            y2[i] = sum/sumw
            if i > 0:
                y1[i] = (y2[i] + y2[i-1]) / 2
        
        self.df['y2'] = y2
        self.df['y1'] = y1
        return y2, y1
    
    def gen_signals(self, y1, y2):
        buy_signals = []
        sell_signals = []
        thld = 0.01

        for i in range(1, len(y2)):
            d = y2[i] - y2[i-1]
            if d > thld and y2[i-1] < y1[i-1]:
                buy_signals.append(i)
            elif d < -thld and y2[i-1] > y1[i-1]:
                sell_signals.append(i)
        
        # Calculate returns
        money = 100
        profit = []
        for i in range(len(buy_signals)):
            buy_index = buy_signals[i]
            if i < len(sell_signals):
                sell_index = sell_signals[i]
                money *= self.src[sell_index] / self.src[buy_index]
                profit.append(money - 100)
        
        self.profit = pd.DataFrame(profit)
        rets = "returns " + self.tim + " = " + str(round(((money/100-1)*100), 2)) + "%"
        print(rets)
        
        # Plotting
        plt.figure(figsize=(20, 5))
        plt.plot(y2, label='y2')
        plt.plot(self.src, color='black', label='close')
        
        for signal in buy_signals:
            plt.axvline(x=signal, color='green', linewidth=2)

        for signal in sell_signals:
            plt.axvline(x=signal, color='red', linewidth=2)

        plt.text(0.80, 0.25, self.symbol, transform=plt.gca().transAxes, fontsize=34, verticalalignment='top')
        plt.text(0.80, 0.15, rets, transform=plt.gca().transAxes, fontsize=14, verticalalignment='top')
        plt.legend()
        plt.show()

# Test on your desired company
instance = Backtest("INFY.NS", tim='1y')
```

**Test on your desired company:** [Yahoo Finance](https://finance.yahoo.com/)

## The Repainting Problem: Why This Indicator is Considered "Trash"

### What is Repainting?

The Nadaraya-Watson indicator is considered problematic due to its tendency to "repaint," which is a tactic used by scamsters to sell indicators on platforms like TradingView. In this context, repainting means dynamically changing signals as new data is added, making the indicator appear more successful than it actually is.

### Why Does Repainting Occur?

While the code above does not inherently cause repainting, if the `self.src` data used to compute the Nadaraya-Watson envelopes (y1 and y2) changes dynamically, it will cause a redraw. This happens because:

1. **Dynamic Data Updates**: As new price data comes in, the entire calculation is recomputed
2. **Signal Changes**: The `gen_signals` function may generate different signals for the same historical data points
3. **False Performance**: Previous signals can change, making the indicator appear more successful than it really is

### The Reality Check

This is a new free viral indicator from TradingView that looks like a goldmine but is nothing more than a repaint and backtest fooling tool! The attractive backtest results you see are often misleading because they don't account for the repainting issue.

## Key Takeaways

1. **Mathematical Foundation**: The Nadaraya-Watson envelope has solid mathematical foundations in kernel regression
2. **Implementation**: The Python implementation is straightforward and educational
3. **Trading Caution**: The indicator suffers from repainting issues that make it unreliable for live trading
4. **Educational Value**: Great for learning about kernel methods and technical analysis, but not for actual trading

## Conclusion

The Nadaraya-Watson envelope indicator serves as an excellent educational tool for understanding kernel regression and technical analysis concepts. However, its repainting nature makes it unsuitable for live trading. Always be skeptical of indicators that promise extraordinary returns without proper validation of their real-time performance.

---

**For error correction, queries, or just to chat:**
[Connect with me on LinkedIn](https://www.linkedin.com/in/yashaswa-varshney/)

**Source Code:** [GitHub Repository](https://github.com/bbmusa/nadaraya_watson_envelope)

---

*Tags: #Trading #Backtesting #Python #TradingBot #TechnicalAnalysis*
