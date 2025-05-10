from django.db import models
from django.contrib.auth.models import User

class Backtest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    parameters = models.JSONField()
    results = models.JSONField()

    def __str__(self):
        return f"{self.name} ({self.created_at})"

class Trade(models.Model):
    backtest = models.ForeignKey(Backtest, on_delete=models.CASCADE, related_name='trades')
    date = models.DateTimeField()
    type = models.CharField(max_length=10, choices=[
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
        ('SHORT', 'Short'),
        ('COVER', 'Cover'),
    ])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    profit_loss = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.type} at {self.price} on {self.date}"