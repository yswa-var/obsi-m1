---
title: "Testing Mean Reversion Trading Strategy on Nifty50 Stocks"
description: "A comprehensive analysis of implementing and backtesting mean reversion strategies on Indian market stocks using Python"
author: "Yashaswa Varshney"
date: 2023-01-04
tags:
  - python
  - trading
  - algorithmic-trading
  - quantitative-finance
  - trading-system
  - mean-reversion
  - nifty50
---

← [[index]] | See also: [[Trading Blogs/nadaraya-whatson_indicator]]

# Testing Mean Reversion Trading Strategy on Nifty50 Stocks

## What is Mean Reversion?

Mean reversion is a trading strategy based on the idea that asset prices tend to revert to their mean or median value over time. This strategy involves identifying assets whose prices deviate significantly from the average and betting that they will eventually return to the average.

To implement a mean-reverting strategy, traders typically use statistical techniques to identify assets that are trading significantly above or below their historical average. Then, place a trade to make a profit if the asset's price returns to its average value.

## Measuring Deviation from Mean

There are several ways to measure the deviation of an asset from its mean:

- **Statistical Indicators**: Standard deviation and Bollinger Bands
- **Moving Averages**: Identify assets trading above/below recent price trends
- **RSI (Relative Strength Index)**: Measure overbought/oversold conditions

**Important Note**: Mean reversion is not a guaranteed way to make money and there is no guarantee that an asset's price will return to its average. Traders should carefully consider risk and employ appropriate risk management techniques when implementing a return-to-average strategy.

## Implementation in Python

### Import Required Libraries

```python
import yfinance as yf
import pandas as pd
import numpy as np
import ta
import matplotlib.pyplot as plt
import time
from pandas_datareader import data as pdr
```

### Download Data from Yahoo Finance

```python
df = yf.download('AXISBANK.NS', start='2018-01-01')
```

### Calculate Required Statistical Parameters

```python
# 20-day moving average
df['ma_20'] = df.Close.rolling(20).mean()

# 20-day volatility (standard deviation)
df['vol'] = df.Close.rolling(20).std()

# Bollinger Bands (upper and lower)
df['upper_bb'] = df.ma_20 + (2*df.vol)
df['lower_bb'] = df.ma_20 - (2*df.vol)

# RSI indicator
df['rsi'] = ta.momentum.rsi(df.Close)
```

### Define Buy and Sell Conditions

```python
conditions = [(df.rsi < 30) & (df.Close < df.lower_bb),
              (df.rsi > 70) & (df.Close > df.upper_bb)]
choices = ['Buy', 'Sell']
df['Signal'] = np.select(conditions, choices)
df = df.dropna()
```

### Signal Timing Adjustment

Since we get a buy/sell signal, we can only perform that action the next day:

```python
df.Signal = df.Signal.shift()
df['Shifted_Close'] = df.Close.shift()
# ignore the warning
```

### Define Trading Logic

```python
position = False
buydates, selldates = [], []
buyprices, sellprices = []

for index, row in df.iterrows():
    if not position and row['Signal'] == 'Buy':
        buydates.append(index)
        buyprices.append(row.Open)
        position = True
    
    if position: 
        if row['Signal'] == 'Sell' or row.Shifted_Close < 0.95 * buyprices[-1]:
            # 0.95 is stop loss means 5% stop loss
            selldates.append(index)
            sellprices.append(row.Open)
            position = False
```

### Plotting the Results

```python
plt.figure(figsize=(10, 5))
plt.plot(df.Close)
plt.scatter(df.loc[buydates].index, df.loc[buydates].Close, marker='^', c='g')
plt.scatter(df.loc[selldates].index, df.loc[selldates].Close, marker='^', c='r')
```

### Calculate Returns

```python
(pd.Series([(sell-buy)/buy for sell, buy in zip(sellprices, buyprices)]) + 1).prod() - 1

# Result: 0.3181 = 31.8% return
```

## Compiling All Steps Under One Function

```python
def Test_MeanReversion(ticker='', date_start='2018-01-01'):
    df = yf.download(ticker, date_start)
    time.sleep(2)
    
    # Calculate indicators
    df['ma_20'] = df.Close.rolling(20).mean()
    df['vol'] = df.Close.rolling(20).std()
    df['upper_bb'] = df.ma_20 + (2*df.vol)
    df['lower_bb'] = df.ma_20 - (2*df.vol)
    df['rsi'] = ta.momentum.rsi(df.Close)
    
    # Generate signals
    conditions = [(df.rsi < 30) & (df.Close < df.lower_bb),
                  (df.rsi > 70) & (df.Close > df.upper_bb)]
    choices = ['Buy', 'Sell']
    df['Signal'] = np.select(conditions, choices)
    df = df.dropna()
    
    # Adjust timing
    df.Signal = df.Signal.shift()
    df['Shifted_Close'] = df.Close.shift()
    
    # Trading logic
    position = False
    buydates, selldates = [], []
    buyprices, sellprices = []

    for index, row in df.iterrows():
        if not position and row['Signal'] == 'Buy':
            buydates.append(index)
            buyprices.append(row.Open)
            position = True

        if position: 
            if row['Signal'] == 'Sell' or row.Shifted_Close < 0.90 * buyprices[-1]:
                selldates.append(index)
                sellprices.append(row.Open)
                position = False
    
    # Calculate returns
    return (pd.Series([(sell-buy)/buy for sell, buy in zip(sellprices, buyprices)]) + 1).prod() - 1
```

## Testing the Strategy Over India's Top 50 Stocks!

### Initialize Return and Ticker Columns

```python
ret = []
tick_list = []
```

### Get Nifty50/Nifty100 Tickers from NSE Website

```python
url = "https://www1.nseindia.com/content/indices/ind_niftysmallcap50list.csv"

# For nifty100 use this:
# url = "https://archives.nseindia.com/content/indices/ind_nifty100list.csv"

ticker_list = pd.read_csv(url)
ticker_list['Symbol'] = ticker_list['Symbol'] + '.NS'
```

### Download Data and Test Strategy

```python
count = 0
for tick in tick_list['Symbol']:
    try:
        ret.append(Test_MeanReversion(tick))
        tick_list.append(tick)
        count = count + 1
        print(count)
    except Exception as e:
        print(e)
        print(f"Could not gather data on {tick}")
```

### Convert Data to DataFrame

```python
rent = pd.DataFrame(ret)
tick_list = pd.DataFrame(tick_list)
Cum_return = pd.concat([rent, tick_list], axis=1)
Cum_return.set_axis(['returns', 'symbol'], axis='columns', inplace=True)
```

### Box Plot Analysis

```python
import plotly.express as px

fig = px.box(Cum_return.returns)
fig.show()
```

## Results and Analysis

According to the box plot analysis, this strategy shows mixed results with the current parameters. However, the performance can be significantly improved by:

1. **Adjusting Stop Loss**: Modify the stop loss percentage based on individual stock volatility
2. **Parameter Optimization**: Fine-tune the RSI thresholds and Bollinger Band multipliers
3. **Risk Management**: Implement position sizing and portfolio-level risk controls
4. **Market Regime Detection**: Consider market conditions when applying mean reversion strategies

## Key Insights

- **Strategy Viability**: Mean reversion can work well in sideways markets but may underperform in strong trending markets
- **Risk Management**: The 5% stop loss provides basic protection but may need adjustment based on volatility
- **Market Efficiency**: Indian markets may show different mean reversion characteristics compared to developed markets
- **Implementation Challenges**: Data quality, execution timing, and transaction costs can significantly impact real-world performance

## Conclusion

While the mean reversion strategy shows promise on individual stocks like AXISBANK.NS (31.8% return), its performance across the broader Nifty50 universe is mixed. The strategy's effectiveness depends heavily on:

- Market conditions and volatility
- Proper parameter optimization
- Robust risk management
- Transaction cost considerations

This analysis serves as a foundation for further research and optimization of mean reversion strategies in the Indian market context.

---

**For error correction, queries, or just to chat:**
[Connect with me on LinkedIn](https://www.linkedin.com/in/yashaswa-varshney/)

---

*Tags: #Python #Trading #AlgorithmicTrading #QuantitativeFinance #TradingSystem #MeanReversion #Nifty50*