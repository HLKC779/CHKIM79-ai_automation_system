# Multi-Agent Backend Integration Guide

## Overview

This guide provides detailed specifications for integrating a multi-agent backend system with the existing AI Automation frontend application.

## Architecture Overview

### System Components

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   API Gateway    │────▶│  Agent Manager  │
│  (React App)    │     │  (REST + WS)     │     │   (Orchestrator)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                         │
                                ▼                         ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │  Message Queue   │────▶│   Agent Pool    │
                        │ (RabbitMQ/Redis) │     │ (Worker Agents) │
                        └──────────────────┘     └─────────────────┘
                                │                         │
                                ▼                         ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │    Database      │     │   Monitoring    │
                        │  (PostgreSQL)    │     │   (Prometheus)  │
                        └──────────────────┘     └─────────────────┘
```

## Backend Implementation Requirements

### 1. API Gateway Service

**Technology**: Node.js with Express or Python with FastAPI

```javascript
// Example Express.js structure
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// REST API Routes
app.use('/api/agents', require('./routes/agents'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/workflows', require('./routes/workflows'));

// WebSocket Server
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Handle agent communication
  });
});
```

### 2. Agent Manager Service

**Responsibilities**:
- Agent lifecycle management
- Task distribution and load balancing
- Workflow orchestration
- Health monitoring

**Required Endpoints**:

```yaml
# Agent Management
GET    /api/agents              # List all agents
GET    /api/agents/:id          # Get agent details
POST   /api/agents              # Create new agent
PATCH  /api/agents/:id          # Update agent
DELETE /api/agents/:id          # Remove agent
POST   /api/agents/:id/start    # Start agent
POST   /api/agents/:id/stop     # Stop agent
POST   /api/agents/:id/restart  # Restart agent

# Task Management
GET    /api/tasks               # List tasks
GET    /api/tasks/:id           # Get task details
POST   /api/tasks               # Create task
POST   /api/tasks/:id/assign    # Assign task to agent
POST   /api/tasks/:id/cancel    # Cancel task
POST   /api/tasks/:id/retry     # Retry failed task

# Workflow Management
GET    /api/workflows           # List workflows
GET    /api/workflows/:id       # Get workflow details
POST   /api/workflows           # Create workflow
PATCH  /api/workflows/:id       # Update workflow
DELETE /api/workflows/:id       # Delete workflow
POST   /api/workflows/:id/execute # Execute workflow

# Metrics & Monitoring
GET    /api/agents/:id/metrics  # Agent metrics
GET    /api/agents/metrics/system # System metrics
```

### 3. Message Queue Configuration

**RabbitMQ Setup**:

```javascript
// Task Queue Configuration
const amqp = require('amqplib');

async function setupQueues() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  // Task distribution queue
  await channel.assertQueue('task_queue', {
    durable: true,
    arguments: {
      'x-max-priority': 10
    }
  });
  
  // Agent communication exchanges
  await channel.assertExchange('agent_events', 'topic', {
    durable: true
  });
  
  // Result processing queue
  await channel.assertQueue('result_queue', {
    durable: true
  });
}
```

### 4. Database Schema

**PostgreSQL Tables**:

```sql
-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  capabilities JSONB,
  config JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority INTEGER DEFAULT 2,
  payload JSONB,
  requirements JSONB,
  assigned_to UUID REFERENCES agents(id),
  status VARCHAR(50) NOT NULL,
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  steps JSONB NOT NULL,
  triggers JSONB,
  status VARCHAR(50) NOT NULL,
  config JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  status VARCHAR(50) NOT NULL,
  steps JSONB,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Agent metrics
CREATE TABLE agent_metrics (
  id SERIAL PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cpu_usage DECIMAL(5,2),
  memory_usage DECIMAL(5,2),
  tasks_completed INTEGER,
  tasks_failed INTEGER,
  avg_task_time INTEGER
);
```

### 5. WebSocket Protocol

**Event Types and Payloads**:

```typescript
// Client -> Server Messages
{
  "type": "subscribe",
  "channels": ["agents", "tasks", "metrics"]
}

{
  "type": "agent:command",
  "agentId": "uuid",
  "command": "start|stop|restart"
}

// Server -> Client Events
{
  "event": "agent:connected",
  "data": {
    "agentId": "uuid",
    "agent": { /* Agent object */ }
  }
}

{
  "event": "task:completed",
  "data": {
    "taskId": "uuid",
    "task": { /* Task object */ },
    "result": { /* Result data */ }
  }
}

{
  "event": "metrics:update",
  "data": {
    "timestamp": "2024-01-01T00:00:00Z",
    "metrics": { /* System metrics */ }
  }
}
```

### 6. Agent Implementation Pattern

**Base Agent Class**:

```python
# Python example
from abc import ABC, abstractmethod
import asyncio
import json
from typing import Dict, Any

class BaseAgent(ABC):
    def __init__(self, agent_id: str, config: Dict[str, Any]):
        self.id = agent_id
        self.config = config
        self.status = "idle"
        self.current_task = None
        
    @abstractmethod
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a task and return results"""
        pass
    
    async def start(self):
        """Start the agent and begin processing tasks"""
        self.status = "idle"
        await self.connect_to_queue()
        await self.process_tasks()
    
    async def connect_to_queue(self):
        """Connect to message queue for task reception"""
        # RabbitMQ or Redis connection logic
        pass
    
    async def process_tasks(self):
        """Main task processing loop"""
        while self.status != "offline":
            task = await self.receive_task()
            if task:
                self.status = "busy"
                self.current_task = task
                try:
                    result = await self.execute_task(task)
                    await self.send_result(result)
                except Exception as e:
                    await self.send_error(task, str(e))
                finally:
                    self.status = "idle"
                    self.current_task = None
            else:
                await asyncio.sleep(1)
    
    async def receive_task(self) -> Dict[str, Any]:
        """Receive task from queue"""
        pass
    
    async def send_result(self, result: Dict[str, Any]):
        """Send task result back"""
        pass
    
    async def send_error(self, task: Dict[str, Any], error: str):
        """Send error notification"""
        pass

# Example specialized agents
class DataProcessorAgent(BaseAgent):
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        # Process data according to task requirements
        data = task['payload']['data']
        processed = self.process_data(data)
        return {
            'success': True,
            'data': processed,
            'executionTime': 123
        }
    
    def process_data(self, data):
        # Actual data processing logic
        return data

class APIIntegrationAgent(BaseAgent):
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        # Make external API calls
        endpoint = task['payload']['endpoint']
        response = await self.call_api(endpoint)
        return {
            'success': True,
            'data': response,
            'executionTime': 456
        }
    
    async def call_api(self, endpoint):
        # API calling logic
        pass
```

### 7. Environment Variables

```bash
# API Gateway
API_PORT=8080
WS_PORT=8081
CORS_ORIGIN=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_automation
DB_USER=postgres
DB_PASSWORD=password

# Message Queue
RABBITMQ_URL=amqp://localhost
REDIS_URL=redis://localhost:6379

# Agent Configuration
MAX_AGENTS_PER_TYPE=10
AGENT_HEARTBEAT_INTERVAL=30
TASK_TIMEOUT=300

# Monitoring
PROMETHEUS_PORT=9090
METRICS_INTERVAL=60
```

### 8. Docker Compose Setup

```yaml
version: '3.8'

services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
      - "8081:8081"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - rabbitmq
      - redis

  agent-manager:
    build: ./agent-manager
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - rabbitmq

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=ai_automation
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=admin

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

volumes:
  postgres_data:
```

## Integration Steps

1. **Set Environment Variables**:
   ```bash
   # Frontend .env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_WS_URL=ws://localhost:8081/agents
   ```

2. **Update Vite Proxy Configuration** (for development):
   ```javascript
   // vite.config.ts
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:8080',
         changeOrigin: true
       }
     }
   }
   ```

3. **Implement Backend Services**:
   - Start with API Gateway
   - Add database and message queue
   - Implement Agent Manager
   - Create sample agents
   - Add monitoring

4. **Test Integration**:
   - Test REST API endpoints
   - Verify WebSocket connections
   - Test agent lifecycle
   - Validate task execution
   - Monitor system metrics

## Security Considerations

1. **Authentication**: Implement JWT-based authentication
2. **Authorization**: Role-based access control (RBAC)
3. **API Rate Limiting**: Prevent abuse
4. **Input Validation**: Sanitize all inputs
5. **Secure WebSocket**: Use WSS in production
6. **Agent Isolation**: Run agents in containers/sandboxes
7. **Secrets Management**: Use environment variables or vault

## Performance Optimizations

1. **Connection Pooling**: Database and message queue
2. **Caching**: Redis for frequently accessed data
3. **Load Balancing**: Distribute agent workload
4. **Horizontal Scaling**: Support multiple instances
5. **Async Processing**: Non-blocking operations
6. **Resource Limits**: Prevent agent resource abuse

## Monitoring and Observability

1. **Metrics Collection**: Prometheus + Grafana
2. **Logging**: Centralized logging with ELK stack
3. **Tracing**: Distributed tracing with Jaeger
4. **Alerting**: Set up critical alerts
5. **Health Checks**: Regular agent health verification

This integration guide provides a complete blueprint for implementing a multi-agent backend system that seamlessly integrates with your existing frontend application.