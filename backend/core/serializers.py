from rest_framework import serializers
from .models import Backtest, Trade

class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = ['date', 'type', 'price', 'quantity', 'profit_loss']

class BacktestSerializer(serializers.ModelSerializer):
    trades = TradeSerializer(many=True, read_only=True)

    class Meta:
        model = Backtest
        fields = ['id', 'name', 'created_at', 'parameters', 'results', 'trades']