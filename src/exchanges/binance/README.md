枚举定义
交易对类型:

FUTURE 期货
订单状态 (status):

NEW 新建订单
PARTIALLY_FILLED 部分成交
FILLED 全部成交
CANCELED 已撤销
REJECTED 订单被拒绝
EXPIRED 订单过期(根据timeInForce参数规则)
订单种类 (orderTypes, type):

LIMIT 限价单
MARKET 市价单
STOP 止损限价单
STOP_MARKET 止损市价单
TAKE_RPOFIT 止盈限价单
TAKE_RPOFIT_MARKET 止盈市价单
订单方向 (side):

BUY 买入
SELL 卖出
有效方式 (timeInForce):

GTC - Good Till Cancel 成交为止
IOC - Immediate or Cancel 无法立即成交(吃单)的部分就撤销
FOK - Fill or Kill 无法全部立即成交就撤销
GTX - Good Till Crossing 无法成为挂单方就撤销
条件价格触发类型 (workingType)

MARK_PRICE
CONTRACT_PRICE
K线间隔:

m -> 分钟; h -> 小时; d -> 天; w -> 周; M -> 月

1m
3m
5m
15m
30m
1h
2h
4h
6h
8h
12h
1d
3d
1w
1M
限制种类 (rateLimitType)

REQUESTS_WEIGHT 单位时间请求权重之和上限
    {
      "rateLimitType": "REQUEST_WEIGHT",
      "interval": "MINUTE",
      "intervalNum": 1,
      "limit": 1200
    }
ORDERS 单位时间下单(撤单)次数上限
    {
      "rateLimitType": "ORDERS",
      "interval": "SECOND",
      "intervalNum": 1,
      "limit": 10
    }
限制间隔 * MINUTE

