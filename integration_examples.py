"""
Practical Integration Examples for Multi-Agent Financial System
==============================================================

This file contains ready-to-use examples for integrating the multi-agent
system with various backend architectures.
"""

import asyncio
from typing import Dict, Any, List
import json
from datetime import datetime

# =============================================
# 1. Django Integration
# =============================================

"""
# In your Django views.py:

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from financial_system import MultiAgentSystem
import json

# Initialize system (consider using Django app config)
financial_system = MultiAgentSystem()
financial_system.start_system()

@csrf_exempt
def create_transaction(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        result = financial_system.process_command('create_transaction', data)
        return JsonResponse(result)

def financial_report(request):
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    params = {}
    if start_date:
        params['start_date'] = datetime.fromisoformat(start_date)
    if end_date:
        params['end_date'] = datetime.fromisoformat(end_date)
    
    result = financial_system.process_command('financial_report', params)
    return JsonResponse(result['result'])

# In your urls.py:
from django.urls import path
from . import views

urlpatterns = [
    path('api/transactions/', views.create_transaction),
    path('api/reports/financial/', views.financial_report),
]
"""

# =============================================
# 2. Flask Integration
# =============================================

from flask import Flask, request, jsonify
from financial_system import MultiAgentSystem

def create_flask_app():
    app = Flask(__name__)
    
    # Initialize system
    system = MultiAgentSystem()
    system.start_system()
    
    @app.route('/api/v1/transactions', methods=['POST'])
    def create_transaction():
        data = request.json
        result = system.process_command('create_transaction', data)
        return jsonify(result)
    
    @app.route('/api/v1/financial-report', methods=['GET'])
    def financial_report():
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        params = {}
        if start_date:
            params['start_date'] = datetime.fromisoformat(start_date)
        if end_date:
            params['end_date'] = datetime.fromisoformat(end_date)
        
        result = system.process_command('financial_report', params)
        return jsonify(result['result'])
    
    @app.route('/api/v1/inventory', methods=['POST'])
    def add_inventory():
        data = request.json
        result = system.process_command('add_inventory', data)
        return jsonify(result)
    
    @app.teardown_appcontext
    def shutdown_system(exception=None):
        system.stop_system()
    
    return app

# =============================================
# 3. Celery Task Queue Integration
# =============================================

"""
# In your celery_tasks.py:

from celery import Celery
from financial_system import MultiAgentSystem
import json

app = Celery('financial_tasks', broker='redis://localhost:6379')

# Initialize system
system = MultiAgentSystem()
system.start_system()

@app.task
def process_transaction_async(transaction_data):
    '''Process transaction asynchronously'''
    result = system.process_command('create_transaction', transaction_data)
    return result

@app.task
def generate_monthly_report():
    '''Generate monthly report - can be scheduled'''
    from datetime import datetime, timedelta
    
    end_date = datetime.now()
    start_date = end_date.replace(day=1)
    
    result = system.process_command('financial_report', {
        'start_date': start_date,
        'end_date': end_date
    })
    
    # Store report or send via email
    return result

@app.task
def check_low_stock_items():
    '''Check inventory and create reorder tasks'''
    inventory_report = system.process_command('inventory_report')
    low_stock_items = inventory_report['result'].get('low_stock_items', [])
    
    for item in low_stock_items:
        # Create purchase order
        system.process_command('create_transaction', {
            'type': 'expense',
            'amount': item['unit_price'] * (item['minimum_stock'] - item['current_quantity']),
            'description': f"Reorder {item['name']}",
            'category': 'inventory'
        })
    
    return len(low_stock_items)

# Schedule periodic tasks
from celery.schedules import crontab

app.conf.beat_schedule = {
    'monthly-report': {
        'task': 'celery_tasks.generate_monthly_report',
        'schedule': crontab(day_of_month=1, hour=0, minute=0),
    },
    'check-inventory': {
        'task': 'celery_tasks.check_low_stock_items',
        'schedule': crontab(hour='*/6'),  # Every 6 hours
    },
}
"""

# =============================================
# 4. AWS Lambda Integration
# =============================================

"""
# In your lambda_function.py:

import json
import os
from financial_system import MultiAgentSystem

# Initialize outside handler for connection reuse
system = None

def get_system():
    global system
    if system is None:
        system = MultiAgentSystem()
        system.start_system()
    return system

def lambda_handler(event, context):
    '''AWS Lambda handler for financial system'''
    
    system = get_system()
    
    # Route based on API Gateway path
    path = event.get('path', '')
    method = event.get('httpMethod', '')
    
    if path == '/transactions' and method == 'POST':
        body = json.loads(event.get('body', '{}'))
        result = system.process_command('create_transaction', body)
        
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    
    elif path == '/financial-report' and method == 'GET':
        params = event.get('queryStringParameters', {})
        result = system.process_command('financial_report', params)
        
        return {
            'statusCode': 200,
            'body': json.dumps(result['result'])
        }
    
    else:
        return {
            'statusCode': 404,
            'body': json.dumps({'error': 'Not found'})
        }

# Serverless Framework configuration (serverless.yml):
'''
service: financial-system

provider:
  name: aws
  runtime: python3.9
  timeout: 30
  memorySize: 512

functions:
  api:
    handler: lambda_function.lambda_handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          
package:
  include:
    - financial_system.py
    - requirements.txt
'''
"""

# =============================================
# 5. Real-time WebSocket Integration
# =============================================

"""
# Using Socket.IO for real-time updates:

from flask import Flask
from flask_socketio import SocketIO, emit
from financial_system import MultiAgentSystem
import threading

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
system = MultiAgentSystem()
system.start_system()

# Background thread for monitoring
def monitor_system():
    while True:
        # Check for low stock
        inventory_report = system.process_command('inventory_report')
        low_stock = inventory_report['result'].get('low_stock_items', [])
        
        if low_stock:
            socketio.emit('low_stock_alert', {
                'items': low_stock,
                'timestamp': datetime.now().isoformat()
            })
        
        # Get latest transactions
        report = system.process_command('financial_report')
        socketio.emit('financial_update', {
            'summary': report['result']['summary'],
            'timestamp': datetime.now().isoformat()
        })
        
        socketio.sleep(60)  # Check every minute

@socketio.on('connect')
def handle_connect():
    emit('connected', {'data': 'Connected to Financial System'})

@socketio.on('create_transaction')
def handle_transaction(data):
    result = system.process_command('create_transaction', data)
    emit('transaction_created', result)
    
    # Broadcast to all clients
    socketio.emit('new_transaction', {
        'transaction_id': result['result'],
        'data': data
    })

@socketio.on('get_portfolio')
def handle_portfolio(data):
    symbols = data.get('symbols', [])
    result = system.process_command('analyze_portfolio', {'symbols': symbols})
    emit('portfolio_analysis', result['result'])

# Start monitoring thread
monitor_thread = threading.Thread(target=monitor_system)
monitor_thread.daemon = True
monitor_thread.start()

if __name__ == '__main__':
    socketio.run(app, debug=True)
"""

# =============================================
# 6. gRPC Service Integration
# =============================================

"""
# First, create financial_system.proto:

syntax = "proto3";

package financial;

service FinancialSystem {
    rpc CreateTransaction (TransactionRequest) returns (TransactionResponse);
    rpc GetFinancialReport (ReportRequest) returns (FinancialReport);
    rpc CalculateMortgage (MortgageRequest) returns (MortgageResponse);
}

message TransactionRequest {
    string type = 1;
    double amount = 2;
    string description = 3;
    string account_id = 4;
}

message TransactionResponse {
    string transaction_id = 1;
    bool success = 2;
}

message ReportRequest {
    string start_date = 1;
    string end_date = 2;
}

message FinancialReport {
    double total_income = 1;
    double total_expenses = 2;
    double net_income = 3;
    double savings_rate = 4;
}

# Then implement the service:

import grpc
from concurrent import futures
import financial_system_pb2
import financial_system_pb2_grpc
from financial_system import MultiAgentSystem

class FinancialSystemServicer(financial_system_pb2_grpc.FinancialSystemServicer):
    def __init__(self):
        self.system = MultiAgentSystem()
        self.system.start_system()
    
    def CreateTransaction(self, request, context):
        result = self.system.process_command('create_transaction', {
            'type': request.type,
            'amount': request.amount,
            'description': request.description,
            'account_id': request.account_id
        })
        
        return financial_system_pb2.TransactionResponse(
            transaction_id=result['result'],
            success=True
        )
    
    def GetFinancialReport(self, request, context):
        params = {}
        if request.start_date:
            params['start_date'] = datetime.fromisoformat(request.start_date)
        if request.end_date:
            params['end_date'] = datetime.fromisoformat(request.end_date)
        
        result = self.system.process_command('financial_report', params)
        summary = result['result']['summary']
        
        return financial_system_pb2.FinancialReport(
            total_income=summary['total_income'],
            total_expenses=summary['total_expenses'],
            net_income=summary['net_income'],
            savings_rate=summary['savings_rate']
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    financial_system_pb2_grpc.add_FinancialSystemServicer_to_server(
        FinancialSystemServicer(), server
    )
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()
"""

# =============================================
# 7. Redis Pub/Sub Integration
# =============================================

import redis
import json
from financial_system import MultiAgentSystem

class RedisIntegration:
    def __init__(self, redis_url='redis://localhost:6379'):
        self.redis_client = redis.from_url(redis_url)
        self.pubsub = self.redis_client.pubsub()
        self.system = MultiAgentSystem()
        self.system.start_system()
    
    def start_subscriber(self):
        """Subscribe to financial system commands"""
        self.pubsub.subscribe('financial:commands')
        
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    command = data.get('command')
                    params = data.get('params', {})
                    
                    # Process command
                    result = self.system.process_command(command, params)
                    
                    # Publish result
                    response_channel = data.get('response_channel', 'financial:results')
                    self.redis_client.publish(response_channel, json.dumps(result))
                    
                except Exception as e:
                    print(f"Error processing message: {e}")
    
    def publish_command(self, command: str, params: Dict[str, Any], response_channel: str = None):
        """Publish command to Redis"""
        message = {
            'command': command,
            'params': params,
            'timestamp': datetime.now().isoformat()
        }
        
        if response_channel:
            message['response_channel'] = response_channel
        
        self.redis_client.publish('financial:commands', json.dumps(message))

# =============================================
# 8. Kubernetes CronJob Integration
# =============================================

"""
# financial-reports-cronjob.yaml

apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-financial-report
spec:
  schedule: "0 9 * * *"  # Daily at 9 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: report-generator
            image: financial-system:latest
            command:
            - python
            - -c
            - |
              from financial_system import MultiAgentSystem
              from datetime import datetime, timedelta
              import requests
              
              system = MultiAgentSystem()
              system.start_system()
              
              # Generate daily report
              end_date = datetime.now()
              start_date = end_date - timedelta(days=1)
              
              report = system.process_command('financial_report', {
                  'start_date': start_date,
                  'end_date': end_date
              })
              
              # Send report to webhook or store in S3
              webhook_url = os.environ.get('WEBHOOK_URL')
              if webhook_url:
                  requests.post(webhook_url, json=report['result'])
              
              system.stop_system()
          restartPolicy: OnFailure
"""

# =============================================
# 9. Monitoring and Metrics Integration
# =============================================

from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time

class MetricsCollector:
    def __init__(self):
        # Define metrics
        self.transaction_counter = Counter('financial_transactions_total', 
                                         'Total number of transactions',
                                         ['type', 'category'])
        
        self.transaction_amount = Histogram('financial_transaction_amount',
                                          'Transaction amounts',
                                          ['type'])
        
        self.inventory_items = Gauge('inventory_items_total',
                                   'Total inventory items')
        
        self.low_stock_items = Gauge('inventory_low_stock_items',
                                    'Number of low stock items')
        
        self.system_uptime = Gauge('financial_system_uptime_seconds',
                                 'System uptime in seconds')
        
        self.start_time = time.time()
        
        # Start metrics server
        start_http_server(8080)
    
    def record_transaction(self, transaction_type: str, category: str, amount: float):
        """Record transaction metrics"""
        self.transaction_counter.labels(type=transaction_type, category=category).inc()
        self.transaction_amount.labels(type=transaction_type).observe(amount)
    
    def update_inventory_metrics(self, total_items: int, low_stock_count: int):
        """Update inventory metrics"""
        self.inventory_items.set(total_items)
        self.low_stock_items.set(low_stock_count)
    
    def update_uptime(self):
        """Update system uptime"""
        self.system_uptime.set(time.time() - self.start_time)

# Integrate with the main system
class MonitoredFinancialSystem(MultiAgentSystem):
    def __init__(self):
        super().__init__()
        self.metrics = MetricsCollector()
    
    def process_command(self, command: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process command with metrics collection"""
        result = super().process_command(command, params)
        
        # Collect metrics based on command
        if command == 'create_transaction' and result.get('result'):
            self.metrics.record_transaction(
                params.get('type', 'unknown'),
                params.get('category', 'uncategorized'),
                params.get('amount', 0)
            )
        
        elif command == 'inventory_report':
            report = result.get('result', {})
            summary = report.get('summary', {})
            self.metrics.update_inventory_metrics(
                summary.get('total_items', 0),
                summary.get('low_stock_alerts', 0)
            )
        
        self.metrics.update_uptime()
        return result

if __name__ == "__main__":
    # Example: Run Flask app
    app = create_flask_app()
    app.run(debug=True)
    
    # Example: Start Redis subscriber
    # redis_integration = RedisIntegration()
    # redis_integration.start_subscriber()