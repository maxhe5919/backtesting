from django.urls import path
from .views import BacktestView, UploadDatasetView, UploadModelView

urlpatterns = [
    path('backtest/', BacktestView.as_view(), name='backtest'),
    path('upload-dataset/', UploadDatasetView.as_view(), name='upload-dataset'),
    path('upload-model/', UploadModelView.as_view(), name='upload-model'),
]