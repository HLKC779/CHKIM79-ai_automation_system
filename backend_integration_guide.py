"""
Backend Integration Guide for Multi-Agent Financial System
==========================================================

This module provides integration patterns and adapters for connecting the 
multi-agent system with various backend architectures.
"""

from typing import Dict, Any, List, Optional, Callable
import asyncio
import json
from datetime import datetime
from abc import ABC, abstractmethod
import logging

# Message Queue Integrations
try:
    import pika  # RabbitMQ
    import redis
    from kafka import KafkaProducer, KafkaConsumer
    import aioredis
except ImportError:
    pass

# REST API Framework Integrations
try:
    from flask import Flask, request, jsonify
    from fastapi import FastAPI, HTTPException, BackgroundTasks
    from pydantic import BaseModel
except ImportError:
    pass

# gRPC Integration
try:
    import grpc
    from concurrent import futures
except ImportError:
    pass

from financial_system import MultiAgentSystem

logger = logging.getLogger(__name__)


# ============================================
# 1. REST API Integration (FastAPI Example)
# ============================================

class TransactionRequest(BaseModel):
    type: str
    amount: float
    description: str
    account_id: str = "default"
    category: Optional[str] = None

class MortgageRequest(BaseModel):
    principal: float
    rate: float
    years: int

class PortfolioRequest(BaseModel):
    symbols: List[str]

class BudgetRequest(BaseModel):
    income: float
    expenses: Dict[str, float]

class FinancialSystemAPI:
    """FastAPI wrapper for the multi-agent system"""
    
    def __init__(self):
        self.app = FastAPI(title="Multi-Agent Financial System API")
        self.system = MultiAgentSystem()
        self.system.start_system()
        self.setup_routes()
    
    def setup_routes(self):
        """Setup all API routes"""
        
        @self.app.post("/api/v1/transactions")
        async def create_transaction(transaction: TransactionRequest):
            """Create a new financial transaction"""
            result = self.system.process_command('create_transaction', transaction.dict())
            if result.get('error'):
                raise HTTPException(status_code=400, detail=result['error'])
            return {"transaction_id": result['result'], "status": "created"}
        
        @self.app.get("/api/v1/financial-report")
        async def get_financial_report(start_date: Optional[str] = None, end_date: Optional[str] = None):
            """Generate financial report"""
            params = {}
            if start_date:
                params['start_date'] = datetime.fromisoformat(start_date)
            if end_date:
                params['end_date'] = datetime.fromisoformat(end_date)
            
            result = self.system.process_command('financial_report', params)
            return result['result']
        
        @self.app.post("/api/v1/mortgage/calculate")
        async def calculate_mortgage(mortgage: MortgageRequest):
            """Calculate mortgage payment"""
            result = self.system.process_command('calculate_mortgage', mortgage.dict())
            return result['result']
        
        @self.app.post("/api/v1/portfolio/analyze")
        async def analyze_portfolio(portfolio: PortfolioRequest):
            """Analyze portfolio performance"""
            result = self.system.process_command('analyze_portfolio', portfolio.dict())
            return result['result']
        
        @self.app.post("/api/v1/budget/recommend")
        async def budget_recommendation(budget: BudgetRequest):
            """Get AI-powered budget recommendations"""
            result = self.system.process_command('budget_recommendation', budget.dict())
            return result['result']
        
        @self.app.get("/api/v1/system/status")
        async def system_status():
            """Get system status"""
            return self.system.get_system_status()
        
        @self.app.on_event("shutdown")
        async def shutdown_event():
            """Cleanup on shutdown"""
            self.system.stop_system()


# ============================================
# 2. Message Queue Integration
# ============================================

class MessageQueueAdapter(ABC):
    """Abstract base class for message queue adapters"""
    
    @abstractmethod
    async def publish(self, routing_key: str, message: Dict[str, Any]):
        """Publish message to queue"""
        pass
    
    @abstractmethod
    async def consume(self, queue_name: str, callback: Callable):
        """Consume messages from queue"""
        pass

class RabbitMQAdapter(MessageQueueAdapter):
    """RabbitMQ integration for async communication"""
    
    def __init__(self, host='localhost', exchange='financial_system'):
        self.host = host
        self.exchange = exchange
        self.connection = None
        self.channel = None
        self.system = MultiAgentSystem()
        self.system.start_system()
    
    def connect(self):
        """Establish connection to RabbitMQ"""
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(self.host)
        )
        self.channel = self.connection.channel()
        self.channel.exchange_declare(exchange=self.exchange, exchange_type='topic')
    
    async def publish(self, routing_key: str, message: Dict[str, Any]):
        """Publish message to RabbitMQ"""
        if not self.channel:
            self.connect()
        
        self.channel.basic_publish(
            exchange=self.exchange,
            routing_key=routing_key,
            body=json.dumps(message)
        )
    
    async def consume(self, queue_name: str, callback: Callable = None):
        """Consume messages and process with agents"""
        if not self.channel:
            self.connect()
        
        self.channel.queue_declare(queue=queue_name, durable=True)
        self.channel.queue_bind(
            exchange=self.exchange,
            queue=queue_name,
            routing_key='financial.*'
        )
        
        def process_message(ch, method, properties, body):
            try:
                message = json.loads(body)
                command = message.get('command')
                params = message.get('params', {})
                
                # Process with multi-agent system
                result = self.system.process_command(command, params)
                
                # Publish result if response queue specified
                if message.get('response_queue'):
                    self.channel.basic_publish(
                        exchange='',
                        routing_key=message['response_queue'],
                        body=json.dumps(result)
                    )
                
                ch.basic_ack(delivery_tag=method.delivery_tag)
                
            except Exception as e:
                logger.error(f"Error processing message: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
        
        self.channel.basic_consume(
            queue=queue_name,
            on_message_callback=callback or process_message
        )
        
        self.channel.start_consuming()

class KafkaAdapter(MessageQueueAdapter):
    """Kafka integration for event streaming"""
    
    def __init__(self, bootstrap_servers='localhost:9092'):
        self.bootstrap_servers = bootstrap_servers
        self.producer = None
        self.consumer = None
        self.system = MultiAgentSystem()
        self.system.start_system()
    
    def get_producer(self):
        """Get or create Kafka producer"""
        if not self.producer:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
        return self.producer
    
    async def publish(self, topic: str, message: Dict[str, Any]):
        """Publish message to Kafka topic"""
        producer = self.get_producer()
        producer.send(topic, message)
        producer.flush()
    
    async def consume(self, topics: List[str], callback: Callable = None):
        """Consume messages from Kafka topics"""
        consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=self.bootstrap_servers,
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            group_id='financial_system_group'
        )
        
        for message in consumer:
            try:
                data = message.value
                command = data.get('command')
                params = data.get('params', {})
                
                # Process with multi-agent system
                result = self.system.process_command(command, params)
                
                # Publish result to response topic if specified
                if data.get('response_topic'):
                    await self.publish(data['response_topic'], result)
                
                if callback:
                    callback(result)
                    
            except Exception as e:
                logger.error(f"Error processing Kafka message: {e}")


# ============================================
# 3. Microservices Integration
# ============================================

class AgentMicroservice:
    """Wrap individual agents as microservices"""
    
    def __init__(self, agent_name: str, port: int):
        self.agent_name = agent_name
        self.port = port
        self.app = FastAPI(title=f"{agent_name.title()} Agent Service")
        self.system = MultiAgentSystem()
        self.system.start_system()
        self.agent = self.system.agents.get(agent_name)
        self.setup_routes()
    
    def setup_routes(self):
        """Setup agent-specific routes"""
        
        if self.agent_name == 'accounting':
            @self.app.post("/create_transaction")
            async def create_transaction(data: Dict[str, Any]):
                return self.agent.create_transaction(data)
            
            @self.app.get("/financial_report")
            async def financial_report(start_date: Optional[str] = None, end_date: Optional[str] = None):
                start = datetime.fromisoformat(start_date) if start_date else None
                end = datetime.fromisoformat(end_date) if end_date else None
                return self.agent.generate_financial_report(start, end)
        
        elif self.agent_name == 'inventory':
            @self.app.post("/add_item")
            async def add_item(data: Dict[str, Any]):
                return self.agent.add_item(data)
            
            @self.app.put("/update_quantity/{item_id}")
            async def update_quantity(item_id: str, quantity_change: int):
                return self.agent.update_quantity(item_id, quantity_change)
        
        # Add more agent-specific routes...


# ============================================
# 4. Event-Driven Architecture Integration
# ============================================

class EventBus:
    """Event bus for agent communication"""
    
    def __init__(self):
        self.subscribers = {}
        self.system = MultiAgentSystem()
        self.system.start_system()
    
    def subscribe(self, event_type: str, callback: Callable):
        """Subscribe to specific event types"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(callback)
    
    async def publish(self, event_type: str, data: Dict[str, Any]):
        """Publish event to all subscribers"""
        if event_type in self.subscribers:
            for callback in self.subscribers[event_type]:
                await callback(data)
    
    def setup_agent_events(self):
        """Setup event handlers for agent interactions"""
        
        # Transaction created event
        async def on_transaction_created(data):
            # Update inventory if needed
            if data.get('type') == 'expense' and data.get('category') == 'inventory':
                await self.system.agents['inventory'].update_quantity(
                    data['item_id'], -data['quantity']
                )
        
        # Low stock event
        async def on_low_stock(data):
            # Create purchase order
            await self.system.agents['accounting'].create_transaction({
                'type': 'expense',
                'amount': data['reorder_amount'],
                'description': f"Reorder {data['item_name']}",
                'category': 'inventory'
            })
        
        self.subscribe('transaction.created', on_transaction_created)
        self.subscribe('inventory.low_stock', on_low_stock)


# ============================================
# 5. Database Synchronization
# ============================================

class DatabaseSync:
    """Sync multi-agent system with external databases"""
    
    def __init__(self, external_db_config: Dict[str, Any]):
        self.external_db = external_db_config
        self.system = MultiAgentSystem()
        self.system.start_system()
    
    async def sync_transactions(self, sync_direction: str = 'both'):
        """Sync transactions between systems"""
        if sync_direction in ['both', 'from_external']:
            # Pull from external database
            external_transactions = await self.fetch_external_transactions()
            for tx in external_transactions:
                self.system.process_command('create_transaction', tx)
        
        if sync_direction in ['both', 'to_external']:
            # Push to external database
            report = self.system.process_command('financial_report')
            await self.push_to_external(report['result'])
    
    async def fetch_external_transactions(self) -> List[Dict[str, Any]]:
        """Fetch transactions from external database"""
        # Implementation depends on external database type
        pass
    
    async def push_to_external(self, data: Dict[str, Any]):
        """Push data to external database"""
        # Implementation depends on external database type
        pass


# ============================================
# 6. Webhook Integration
# ============================================

class WebhookHandler:
    """Handle incoming webhooks and trigger agent actions"""
    
    def __init__(self):
        self.system = MultiAgentSystem()
        self.system.start_system()
        self.app = FastAPI()
        self.setup_webhooks()
    
    def setup_webhooks(self):
        """Setup webhook endpoints"""
        
        @self.app.post("/webhooks/payment")
        async def payment_webhook(data: Dict[str, Any]):
            """Handle payment provider webhooks"""
            transaction_data = {
                'type': 'income' if data['type'] == 'payment' else 'expense',
                'amount': data['amount'],
                'description': data['description'],
                'metadata': {'webhook_id': data['id']}
            }
            
            result = self.system.process_command('create_transaction', transaction_data)
            return {"status": "processed", "transaction_id": result['result']}
        
        @self.app.post("/webhooks/inventory")
        async def inventory_webhook(data: Dict[str, Any]):
            """Handle inventory system webhooks"""
            if data['event'] == 'stock_update':
                result = self.system.process_command('update_inventory', {
                    'item_id': data['item_id'],
                    'quantity_change': data['quantity_change']
                })
                return {"status": "processed", "result": result}


# ============================================
# 7. GraphQL Integration
# ============================================

try:
    from ariadne import QueryType, MutationType, make_executable_schema
    from ariadne.asgi import GraphQL
    
    type_defs = """
        type Query {
            financialReport(startDate: String, endDate: String): FinancialReport
            portfolioAnalysis(symbols: [String!]!): PortfolioAnalysis
            systemStatus: SystemStatus
        }
        
        type Mutation {
            createTransaction(input: TransactionInput!): Transaction
            calculateMortgage(principal: Float!, rate: Float!, years: Int!): MortgageCalculation
        }
        
        type FinancialReport {
            totalIncome: Float
            totalExpenses: Float
            netIncome: Float
            savingsRate: Float
        }
        
        input TransactionInput {
            type: String!
            amount: Float!
            description: String!
            category: String
        }
    """
    
    class GraphQLAdapter:
        """GraphQL API for the multi-agent system"""
        
        def __init__(self):
            self.system = MultiAgentSystem()
            self.system.start_system()
            self.schema = self.create_schema()
        
        def create_schema(self):
            query = QueryType()
            mutation = MutationType()
            
            @query.field("financialReport")
            async def resolve_financial_report(_, info, startDate=None, endDate=None):
                params = {}
                if startDate:
                    params['start_date'] = datetime.fromisoformat(startDate)
                if endDate:
                    params['end_date'] = datetime.fromisoformat(endDate)
                
                result = self.system.process_command('financial_report', params)
                return result['result']['summary']
            
            @mutation.field("createTransaction")
            async def resolve_create_transaction(_, info, input):
                result = self.system.process_command('create_transaction', input)
                return {"id": result['result'], **input}
            
            return make_executable_schema(type_defs, query, mutation)

except ImportError:
    pass


# ============================================
# Example Usage
# ============================================

if __name__ == "__main__":
    # Example 1: REST API
    api = FinancialSystemAPI()
    import uvicorn
    uvicorn.run(api.app, host="0.0.0.0", port=8000)
    
    # Example 2: Message Queue
    # rabbit = RabbitMQAdapter()
    # asyncio.run(rabbit.consume('financial_commands'))
    
    # Example 3: Microservice
    # accounting_service = AgentMicroservice('accounting', 8001)
    # uvicorn.run(accounting_service.app, port=8001)