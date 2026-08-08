# Backend Integration Guide for Multi-Agent Financial System

This guide provides comprehensive instructions for integrating the multi-agent financial system with your existing backend infrastructure.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Integration Patterns](#integration-patterns)
3. [API Integration](#api-integration)
4. [Message Queue Integration](#message-queue-integration)
5. [Microservices Architecture](#microservices-architecture)
6. [Database Synchronization](#database-synchronization)
7. [Real-time Communication](#real-time-communication)
8. [Security Considerations](#security-considerations)
9. [Monitoring and Observability](#monitoring-and-observability)
10. [Best Practices](#best-practices)

## Overview

The Multi-Agent Financial System is designed to be backend-agnostic and can integrate with various architectures:

- **REST/GraphQL APIs**: FastAPI, Flask, Django, Express.js
- **Message Queues**: RabbitMQ, Kafka, Redis Pub/Sub
- **Microservices**: Individual agents as services
- **Serverless**: AWS Lambda, Google Cloud Functions
- **Real-time**: WebSockets, Server-Sent Events
- **gRPC**: High-performance RPC communication

## Integration Patterns

### 1. Direct Integration
Embed the system directly into your backend application:

```python
from financial_system import MultiAgentSystem

# Initialize once at application startup
system = MultiAgentSystem()
system.start_system()

# Use throughout your application
result = system.process_command('create_transaction', {...})
```

### 2. Service-Oriented Architecture
Deploy as a standalone service with REST API:

```python
# See backend_integration_guide.py - FinancialSystemAPI class
api = FinancialSystemAPI()
# Exposes endpoints like:
# POST /api/v1/transactions
# GET  /api/v1/financial-report
# POST /api/v1/mortgage/calculate
```

### 3. Event-Driven Architecture
Use message queues for asynchronous processing:

```python
# RabbitMQ example
rabbit = RabbitMQAdapter()
await rabbit.consume('financial_commands')

# Kafka example
kafka = KafkaAdapter()
await kafka.consume(['transactions', 'inventory'])
```

## API Integration

### FastAPI (Recommended)

```python
from backend_integration_guide import FinancialSystemAPI

# Run with: uvicorn backend_integration_guide:api.app --reload
api = FinancialSystemAPI()

# Available endpoints:
# - POST   /api/v1/transactions
# - GET    /api/v1/financial-report
# - POST   /api/v1/mortgage/calculate
# - POST   /api/v1/portfolio/analyze
# - POST   /api/v1/budget/recommend
# - GET    /api/v1/system/status
```

### Django Integration

```python
# views.py
from financial_system import MultiAgentSystem

system = MultiAgentSystem()
system.start_system()

@csrf_exempt
def create_transaction(request):
    data = json.loads(request.body)
    result = system.process_command('create_transaction', data)
    return JsonResponse(result)
```

### Flask Integration

```python
# app.py
from integration_examples import create_flask_app

app = create_flask_app()
app.run(host='0.0.0.0', port=5000)
```

## Message Queue Integration

### RabbitMQ

```python
from backend_integration_guide import RabbitMQAdapter

# Publisher
rabbit = RabbitMQAdapter()
await rabbit.publish('financial.transaction', {
    'command': 'create_transaction',
    'params': {...}
})

# Consumer (runs as separate process)
await rabbit.consume('financial_commands')
```

### Kafka

```python
from backend_integration_guide import KafkaAdapter

kafka = KafkaAdapter('localhost:9092')

# Publish events
await kafka.publish('financial-events', {
    'command': 'analyze_portfolio',
    'params': {'symbols': ['AAPL', 'GOOGL']}
})

# Consume events
await kafka.consume(['financial-events'])
```

### Redis Pub/Sub

```python
from integration_examples import RedisIntegration

redis_int = RedisIntegration()

# Publish command
redis_int.publish_command('create_transaction', {
    'type': 'expense',
    'amount': 100.00
})

# Start subscriber (separate process)
redis_int.start_subscriber()
```

## Microservices Architecture

### Deploy Agents as Microservices

```yaml
# docker-compose.yml includes services for:
- accounting-service (port 8001)
- inventory-service (port 8002)
- mortgage-service (port 8003)
- finance-service (port 8004)
```

### Service Communication

```python
# Inter-service communication via HTTP
import requests

# From another service
response = requests.post('http://accounting-service:8001/create_transaction', 
                        json=transaction_data)
```

### API Gateway Pattern

```nginx
# nginx.conf
location /api/accounting/ {
    proxy_pass http://accounting-service:8001/;
}

location /api/inventory/ {
    proxy_pass http://inventory-service:8002/;
}
```

## Database Synchronization

### External Database Integration

```python
from backend_integration_guide import DatabaseSync

# Configure external database
external_db = {
    'type': 'postgresql',
    'connection': 'postgresql://user:pass@localhost/db'
}

sync = DatabaseSync(external_db)

# Sync data bidirectionally
await sync.sync_transactions('both')
```

### Multi-Database Support

```python
# Extend DatabaseManager for your database
class PostgreSQLDatabaseManager(DatabaseManager):
    def __init__(self, connection_string):
        # Use SQLAlchemy or psycopg2
        self.engine = create_engine(connection_string)
    
    def execute_query(self, query, params=None):
        # Implement PostgreSQL execution
        pass
```

## Real-time Communication

### WebSocket Integration

```python
# Using Socket.IO (see integration_examples.py)
@socketio.on('create_transaction')
def handle_transaction(data):
    result = system.process_command('create_transaction', data)
    emit('transaction_created', result)
    
    # Broadcast to all clients
    socketio.emit('new_transaction', result)
```

### Server-Sent Events

```python
@app.route('/api/v1/events')
def events():
    def generate():
        while True:
            # Get latest data
            report = system.process_command('financial_report')
            yield f"data: {json.dumps(report['result'])}\n\n"
            time.sleep(30)
    
    return Response(generate(), mimetype='text/event-stream')
```

## Security Considerations

### Authentication & Authorization

```python
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    # Verify JWT token
    if not verify_jwt(token):
        raise HTTPException(status_code=401)
    return token

@app.post("/api/v1/transactions", dependencies=[Depends(verify_token)])
async def create_transaction(transaction: TransactionRequest):
    # Protected endpoint
    pass
```

### Data Encryption

```python
# Encrypt sensitive data before storage
from cryptography.fernet import Fernet

class EncryptedDatabaseManager(DatabaseManager):
    def __init__(self, db_path, encryption_key):
        super().__init__(db_path)
        self.cipher = Fernet(encryption_key)
    
    def insert_record(self, table, data):
        # Encrypt sensitive fields
        if 'private_key' in data:
            data['private_key'] = self.cipher.encrypt(
                data['private_key'].encode()
            ).decode()
        return super().insert_record(table, data)
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/v1/transactions")
@limiter.limit("10/minute")
async def create_transaction(request: Request, transaction: TransactionRequest):
    # Rate limited to 10 requests per minute
    pass
```

## Monitoring and Observability

### Prometheus Metrics

```python
from integration_examples import MonitoredFinancialSystem

# Use monitored version for metrics collection
system = MonitoredFinancialSystem()

# Metrics available at http://localhost:8080/metrics
# - financial_transactions_total
# - financial_transaction_amount
# - inventory_items_total
# - inventory_low_stock_items
# - financial_system_uptime_seconds
```

### Logging

```python
import structlog

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger()
```

### Distributed Tracing

```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger import JaegerExporter

tracer = trace.get_tracer(__name__)

@app.post("/api/v1/transactions")
async def create_transaction(transaction: TransactionRequest):
    with tracer.start_as_current_span("create_transaction"):
        # Traced operation
        result = system.process_command('create_transaction', transaction.dict())
        return result
```

## Best Practices

### 1. Connection Pooling

```python
# Reuse system instance across requests
class SystemPool:
    _instance = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MultiAgentSystem()
            cls._instance.start_system()
        return cls._instance

# Use in endpoints
system = SystemPool.get_instance()
```

### 2. Async Operations

```python
# Use async for I/O operations
async def process_transaction_async(data):
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None, system.process_command, 'create_transaction', data
    )
    return result
```

### 3. Error Handling

```python
from typing import Union

@app.post("/api/v1/transactions")
async def create_transaction(
    transaction: TransactionRequest
) -> Union[Dict[str, Any], HTTPException]:
    try:
        result = system.process_command('create_transaction', transaction.dict())
        if result.get('error'):
            raise HTTPException(status_code=400, detail=result['error'])
        return {"status": "success", "data": result['result']}
    except Exception as e:
        logger.error(f"Transaction failed", error=str(e), transaction=transaction.dict())
        raise HTTPException(status_code=500, detail="Internal server error")
```

### 4. Health Checks

```python
@app.get("/health")
async def health_check():
    status = system.get_system_status()
    
    if status['system_status'] == 'operational':
        return {"status": "healthy", "details": status}
    else:
        raise HTTPException(status_code=503, detail="System unhealthy")
```

### 5. Graceful Shutdown

```python
import signal

def signal_handler(signum, frame):
    logger.info("Shutting down gracefully...")
    system.stop_system()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)
```

## Docker Deployment

### Quick Start

```bash
# Build and run all services
docker-compose up -d

# Scale specific services
docker-compose up -d --scale accounting-service=3

# View logs
docker-compose logs -f financial-api
```

### Production Deployment

```yaml
# kubernetes-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: financial-system
spec:
  replicas: 3
  selector:
    matchLabels:
      app: financial-system
  template:
    metadata:
      labels:
        app: financial-system
    spec:
      containers:
      - name: financial-api
        image: financial-system:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
```

## Testing Integration

### Unit Tests

```python
import pytest
from financial_system import MultiAgentSystem

@pytest.fixture
def system():
    system = MultiAgentSystem()
    system.start_system()
    yield system
    system.stop_system()

def test_create_transaction(system):
    result = system.process_command('create_transaction', {
        'type': 'income',
        'amount': 1000,
        'description': 'Test transaction'
    })
    assert result['result'] is not None
```

### Integration Tests

```python
def test_api_endpoint():
    from backend_integration_guide import FinancialSystemAPI
    from fastapi.testclient import TestClient
    
    api = FinancialSystemAPI()
    client = TestClient(api.app)
    
    response = client.post("/api/v1/transactions", json={
        "type": "expense",
        "amount": 50.0,
        "description": "Test expense"
    })
    
    assert response.status_code == 200
    assert "transaction_id" in response.json()
```

## Support and Resources

- **Documentation**: See README.md for system documentation
- **Examples**: Check `integration_examples.py` for more examples
- **Docker**: Use `docker-compose.yml` for containerized deployment
- **Issues**: Report integration issues in the GitHub repository

---

This integration guide provides the foundation for connecting the multi-agent financial system with your backend. Customize the integration patterns based on your specific requirements and architecture.