from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Backtest, Trade
from .serializers import BacktestSerializer
from .utils.backtest import run_backtest
import pandas as pd

class BacktestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        params = request.data.get('parameters', {})
        data_file = request.FILES.get('dataset')
        model_file = request.FILES.get('model')

        if data_file:
            df = pd.read_csv(data_file)
            results, trades = run_backtest(df, params)
            backtest = Backtest.objects.create(
                user=request.user,
                name=params.get('name', 'Backtest'),
                parameters=params,
                results=results
            )
            for trade in trades:
                Trade.objects.create(
                    backtest=backtest,
                    date=trade['date'],
                    type=trade['type'],
                    price=trade['price'],
                    quantity=trade['quantity'],
                    profit_loss=trade['profit_loss']
                )
            serializer = BacktestSerializer(backtest)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'error': 'No dataset provided'}, status=status.HTTP_400_BAD_REQUEST)

class UploadDatasetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        dataset = request.FILES.get('dataset')
        if dataset:
            # Save dataset to storage (e.g., S3 or local)
            return Response({'message': 'Dataset uploaded successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'No dataset provided'}, status=status.HTTP_400_BAD_REQUEST)

class UploadModelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        model = request.FILES.get('model')
        if model:
            # Save model to storage
            return Response({'message': 'Model uploaded successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'No model provided'}, status=status.HTTP_400_BAD_REQUEST)