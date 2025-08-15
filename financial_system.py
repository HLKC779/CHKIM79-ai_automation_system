#!/usr/bin/env python3
"""
Multi-Agent Financial Management System
A comprehensive AI-powered system for financial management, accounting, and web3 applications.
"""

import asyncio
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
import threading
import time
import schedule
import hashlib
import os
import sys

# AI and ML imports
try:
    from transformers import (
        AutoTokenizer, AutoModelForCausalLM, 
        AutoModelForSequenceClassification, pipeline
    )
    import torch
except ImportError:
    print("Warning: transformers and torch not installed. AI features will be limited.")

# Web scraping imports
import requests
from bs4 import BeautifulSoup
import aiohttp
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

# Web3 imports
try:
    from web3 import Web3
    from eth_account import Account
except ImportError:
    print("Warning: web3 not installed. Blockchain features will be limited.")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Data structures
@dataclass
class Transaction:
    id: str
    type: str
    amount: float
    currency: str
    description: str
    category: str
    timestamp: datetime
    account_id: str
    tags: List[str]
    metadata: Dict[str, Any]

@dataclass
class InventoryItem:
    id: str
    name: str
    quantity: int
    unit_price: float
    supplier: str
    category: str
    minimum_stock: int
    last_updated: datetime
    metadata: Dict[str, Any]

@dataclass
class LoanApplication:
    id: str
    applicant_name: str
    loan_amount: float
    loan_type: str
    income: float
    credit_score: int
    debt_to_income: float
    property_value: float
    down_payment: float
    status: str
    risk_assessment: Dict[str, Any]

@dataclass
class InsurancePolicy:
    id: str
    policy_holder: str
    policy_type: str
    coverage_amount: float
    premium: float
    deductible: float
    start_date: datetime
    end_date: datetime
    status: str
    metadata: Dict[str, Any]

class DatabaseManager:
    """Centralized database management for all agents"""
    
    def __init__(self, db_path: str = "financial_system.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                description TEXT,
                category TEXT,
                timestamp DATETIME,
                account_id TEXT,
                tags TEXT,
                metadata TEXT
            )
        ''')
        
        # Inventory table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                supplier TEXT,
                category TEXT,
                minimum_stock INTEGER DEFAULT 0,
                last_updated DATETIME,
                metadata TEXT
            )
        ''')
        
        # Loan applications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS loan_applications (
                id TEXT PRIMARY KEY,
                applicant_name TEXT NOT NULL,
                loan_amount REAL NOT NULL,
                loan_type TEXT NOT NULL,
                income REAL NOT NULL,
                credit_score INTEGER,
                debt_to_income REAL,
                property_value REAL,
                down_payment REAL,
                status TEXT DEFAULT 'pending',
                risk_assessment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insurance policies table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS insurance_policies (
                id TEXT PRIMARY KEY,
                policy_holder TEXT NOT NULL,
                policy_type TEXT NOT NULL,
                coverage_amount REAL NOT NULL,
                premium REAL NOT NULL,
                deductible REAL,
                start_date DATE,
                end_date DATE,
                status TEXT DEFAULT 'active',
                metadata TEXT
            )
        ''')
        
        # Web3 transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS web3_transactions (
                id TEXT PRIMARY KEY,
                transaction_hash TEXT UNIQUE,
                from_address TEXT,
                to_address TEXT,
                amount REAL,
                token_symbol TEXT,
                gas_used INTEGER,
                gas_price REAL,
                block_number INTEGER,
                timestamp DATETIME,
                status TEXT
            )
        ''')
        
        # Market data table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                price REAL NOT NULL,
                change REAL,
                change_percent REAL,
                volume INTEGER,
                market_cap REAL,
                data_type TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    
    def execute_query(self, query: str, params: tuple = None) -> List[Any]:
        """Execute database query safely"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                result = cursor.fetchall()
            else:
                conn.commit()
                result = cursor.lastrowid
            
            return result
        except Exception as e:
            logger.error(f"Database error: {e}")
            conn.rollback()
            return []
        finally:
            conn.close()
    
    def insert_record(self, table: str, data: Dict[str, Any]) -> Optional[int]:
        """Insert a record into a table"""
        columns = ', '.join(data.keys())
        placeholders = ', '.join(['?' for _ in data])
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        return self.execute_query(query, tuple(data.values()))

class AIModelManager:
    """Manages all AI models and provides inference capabilities"""
    
    def __init__(self):
        self.models = {}
        self.tokenizers = {}
        self.pipelines = {}
        self.device = None
        self.models_loaded = False
        
        # Try to load models
        try:
            import torch
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"Using device: {self.device}")
            self.load_models()
        except ImportError:
            logger.warning("PyTorch not available. AI features will be limited.")
    
    def load_models(self):
        """Load all required AI models from Hugging Face"""
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
            
            # For demo purposes, we'll use smaller models
            # In production, you can use the full models mentioned in the original code
            
            logger.info("Loading AI models...")
            
            # Text generation model (using GPT-2 small for demo)
            model_name = "gpt2"
            try:
                logger.info(f"Loading {model_name}...")
                self.tokenizers['gpt2'] = AutoTokenizer.from_pretrained(model_name)
                self.models['gpt2'] = AutoModelForCausalLM.from_pretrained(model_name)
                self.tokenizers['gpt2'].pad_token = self.tokenizers['gpt2'].eos_token
            except Exception as e:
                logger.warning(f"Could not load {model_name}: {e}")
            
            # Sentiment analysis pipeline
            try:
                self.pipelines['sentiment'] = pipeline(
                    "sentiment-analysis",
                    model="nlptown/bert-base-multilingual-uncased-sentiment",
                    device=0 if self.device.type == "cuda" else -1
                )
            except Exception as e:
                logger.warning(f"Could not load sentiment model: {e}")
            
            # Zero-shot classification for expense categorization
            try:
                self.pipelines['classification'] = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                    device=0 if self.device.type == "cuda" else -1
                )
            except Exception as e:
                logger.warning(f"Could not load classification model: {e}")
            
            self.models_loaded = True
            logger.info("AI models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.models_loaded = False
    
    def generate_text(self, prompt: str, max_length: int = 200) -> str:
        """Generate text using GPT-2"""
        if not self.models_loaded or 'gpt2' not in self.models:
            return self._fallback_text_generation(prompt)
        
        try:
            tokenizer = self.tokenizers['gpt2']
            model = self.models['gpt2']
            
            inputs = tokenizer.encode(prompt, return_tensors="pt", max_length=512, truncation=True)
            if self.device:
                inputs = inputs.to(self.device)
                model = model.to(self.device)
            
            with torch.no_grad():
                outputs = model.generate(
                    inputs,
                    max_length=min(max_length, 512),
                    num_return_sequences=1,
                    temperature=0.7,
                    pad_token_id=tokenizer.eos_token_id,
                    do_sample=True,
                    top_p=0.9
                )
            
            generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
            return generated_text
            
        except Exception as e:
            logger.error(f"Text generation error: {e}")
            return self._fallback_text_generation(prompt)
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze financial sentiment"""
        if not self.models_loaded or 'sentiment' not in self.pipelines:
            return self._fallback_sentiment_analysis()
        
        try:
            result = self.pipelines['sentiment'](text[:512])  # Limit text length
            if result:
                # Convert star rating to sentiment
                label = result[0]['label']
                stars = int(label.split()[0])
                if stars >= 4:
                    sentiment = "positive"
                elif stars == 3:
                    sentiment = "neutral"
                else:
                    sentiment = "negative"
                
                return {"label": sentiment, "score": result[0]['score'], "stars": stars}
            return self._fallback_sentiment_analysis()
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return self._fallback_sentiment_analysis()
    
    def classify_expense(self, description: str, categories: List[str] = None) -> str:
        """Classify expense into categories"""
        if categories is None:
            categories = [
                "food", "transportation", "utilities", "entertainment",
                "healthcare", "business", "shopping", "education", "other"
            ]
        
        if not self.models_loaded or 'classification' not in self.pipelines:
            return self._fallback_expense_classification(description)
        
        try:
            result = self.pipelines['classification'](description, categories)
            return result['labels'][0] if result else "other"
        except Exception as e:
            logger.error(f"Classification error: {e}")
            return self._fallback_expense_classification(description)
    
    def answer_question(self, question: str, context: str) -> str:
        """Answer questions based on context"""
        # For simplicity, we'll use text generation for Q&A
        prompt = f"Context: {context}\n\nQuestion: {question}\n\nAnswer:"
        answer = self.generate_text(prompt, max_length=150)
        
        # Extract just the answer part
        if "Answer:" in answer:
            answer = answer.split("Answer:")[-1].strip()
        
        return answer
    
    def _fallback_text_generation(self, prompt: str) -> str:
        """Fallback text generation without AI"""
        responses = [
            "Based on the analysis, I recommend maintaining a diversified portfolio.",
            "Consider reviewing your spending patterns and adjusting your budget accordingly.",
            "It's important to maintain an emergency fund of 3-6 months of expenses.",
            "Regular financial review helps identify opportunities for optimization."
        ]
        return prompt + " " + responses[hash(prompt) % len(responses)]
    
    def _fallback_sentiment_analysis(self) -> Dict[str, Any]:
        """Fallback sentiment analysis"""
        return {"label": "neutral", "score": 0.5, "stars": 3}
    
    def _fallback_expense_classification(self, description: str) -> str:
        """Simple rule-based expense classification"""
        description_lower = description.lower()
        
        if any(word in description_lower for word in ['food', 'restaurant', 'grocery', 'coffee']):
            return 'food'
        elif any(word in description_lower for word in ['gas', 'uber', 'taxi', 'parking', 'car']):
            return 'transportation'
        elif any(word in description_lower for word in ['electric', 'water', 'internet', 'phone']):
            return 'utilities'
        elif any(word in description_lower for word in ['movie', 'netflix', 'spotify', 'game']):
            return 'entertainment'
        elif any(word in description_lower for word in ['doctor', 'pharmacy', 'hospital', 'medicine']):
            return 'healthcare'
        elif any(word in description_lower for word in ['amazon', 'store', 'mall', 'shop']):
            return 'shopping'
        else:
            return 'other'

class WebScrapingAgent:
    """Agent for web scraping financial data"""
    
    def __init__(self, ai_manager: AIModelManager, db_manager: DatabaseManager):
        self.ai_manager = ai_manager
        self.db = db_manager
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    async def scrape_stock_prices(self, symbols: List[str]) -> Dict[str, Dict]:
        """Scrape stock prices from public sources (simulated for demo)"""
        results = {}
        
        # For demo purposes, we'll simulate stock data
        # In production, you would actually scrape from financial websites
        
        for symbol in symbols:
            try:
                # Simulated data with realistic ranges
                base_price = 100 + (hash(symbol) % 400)
                change = (hash(symbol + str(datetime.now().day)) % 20 - 10) / 10
                
                results[symbol] = {
                    'price': base_price + change,
                    'change': change,
                    'change_percent': (change / base_price) * 100,
                    'volume': 1000000 + (hash(symbol) % 9000000),
                    'timestamp': datetime.now()
                }
                
                # Store in database
                self.db.insert_record('market_data', {
                    'symbol': symbol,
                    'price': results[symbol]['price'],
                    'change': results[symbol]['change'],
                    'change_percent': results[symbol]['change_percent'],
                    'volume': results[symbol]['volume'],
                    'data_type': 'stock',
                    'timestamp': results[symbol]['timestamp']
                })
                
            except Exception as e:
                logger.error(f"Error scraping {symbol}: {e}")
        
        return results
    
    async def scrape_crypto_prices(self, symbols: List[str]) -> Dict[str, Dict]:
        """Scrape cryptocurrency prices"""
        results = {}
        
        try:
            # Try to get real data from a free API
            url = "https://api.coinbase.com/v2/exchange-rates?currency=USD"
            response = self.session.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                rates = data.get('data', {}).get('rates', {})
                
                for symbol in symbols:
                    if symbol in rates:
                        price = 1 / float(rates[symbol])
                        change = (hash(symbol + str(datetime.now().day)) % 20 - 10) / 10
                        
                        results[symbol] = {
                            'price': price,
                            'change': change,
                            'change_24h': (change / price) * 100,
                            'market_cap': price * 1000000 * (hash(symbol) % 100),
                            'timestamp': datetime.now()
                        }
            else:
                # Fallback to simulated data
                for symbol in symbols:
                    base_price = {'BTC': 45000, 'ETH': 3000, 'ADA': 0.5}.get(symbol, 100)
                    change = (hash(symbol + str(datetime.now().day)) % 20 - 10) / 10
                    
                    results[symbol] = {
                        'price': base_price + change,
                        'change': change,
                        'change_24h': (change / base_price) * 100,
                        'market_cap': base_price * 1000000000,
                        'timestamp': datetime.now()
                    }
                    
        except Exception as e:
            logger.error(f"Error scraping crypto prices: {e}")
            # Fallback to simulated data
            for symbol in symbols:
                base_price = {'BTC': 45000, 'ETH': 3000, 'ADA': 0.5}.get(symbol, 100)
                results[symbol] = {
                    'price': base_price,
                    'change': 0,
                    'change_24h': 0,
                    'market_cap': base_price * 1000000000,
                    'timestamp': datetime.now()
                }
        
        # Store in database
        for symbol, data in results.items():
            self.db.insert_record('market_data', {
                'symbol': symbol,
                'price': data['price'],
                'change': data['change'],
                'change_percent': data['change_24h'],
                'market_cap': data['market_cap'],
                'data_type': 'crypto',
                'timestamp': data['timestamp']
            })
        
        return results
    
    async def scrape_economic_indicators(self) -> Dict[str, Any]:
        """Scrape economic indicators (simulated for demo)"""
        indicators = {
            'gdp': {
                'value': 21.43,
                'unit': 'trillion USD',
                'change': 2.1,
                'timestamp': datetime.now()
            },
            'inflation': {
                'value': 3.7,
                'unit': 'percent',
                'change': 0.2,
                'timestamp': datetime.now()
            },
            'unemployment': {
                'value': 3.9,
                'unit': 'percent',
                'change': -0.1,
                'timestamp': datetime.now()
            },
            'interest_rate': {
                'value': 5.5,
                'unit': 'percent',
                'change': 0,
                'timestamp': datetime.now()
            }
        }
        
        return indicators

class AccountingAgent:
    """Agent for accounting and bookkeeping tasks"""
    
    def __init__(self, db_manager: DatabaseManager, ai_manager: AIModelManager):
        self.db = db_manager
        self.ai = ai_manager
        self.accounts = {}
    
    def create_transaction(self, transaction_data: Dict[str, Any]) -> Optional[str]:
        """Create a new financial transaction"""
        try:
            # Auto-categorize if not provided
            if 'category' not in transaction_data or not transaction_data['category']:
                transaction_data['category'] = self.ai.classify_expense(
                    transaction_data.get('description', '')
                )
            
            transaction = Transaction(
                id=self._generate_id(),
                type=transaction_data['type'],
                amount=float(transaction_data['amount']),
                currency=transaction_data.get('currency', 'USD'),
                description=transaction_data.get('description', ''),
                category=transaction_data['category'],
                timestamp=datetime.now(),
                account_id=transaction_data.get('account_id', 'default'),
                tags=transaction_data.get('tags', []),
                metadata=transaction_data.get('metadata', {})
            )
            
            # Insert into database
            query = '''
                INSERT INTO transactions 
                (id, type, amount, currency, description, category, timestamp, account_id, tags, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''
            
            self.db.execute_query(query, (
                transaction.id, transaction.type, transaction.amount,
                transaction.currency, transaction.description, transaction.category,
                transaction.timestamp, transaction.account_id,
                json.dumps(transaction.tags), json.dumps(transaction.metadata)
            ))
            
            logger.info(f"Transaction created: {transaction.id}")
            return transaction.id
            
        except Exception as e:
            logger.error(f"Error creating transaction: {e}")
            return None
    
    def generate_financial_report(self, start_date: datetime = None, end_date: datetime = None) -> Dict[str, Any]:
        """Generate comprehensive financial report"""
        try:
            if not end_date:
                end_date = datetime.now()
            if not start_date:
                start_date = end_date - timedelta(days=30)
            
            query = '''
                SELECT * FROM transactions 
                WHERE timestamp BETWEEN ? AND ?
                ORDER BY timestamp DESC
            '''
            
            results = self.db.execute_query(query, (start_date.isoformat(), end_date.isoformat()))
            
            if not results:
                return {"error": "No transactions found", "summary": {
                    "total_income": 0, "total_expenses": 0, "net_income": 0, "transaction_count": 0
                }}
            
            # Process transactions
            total_income = 0
            total_expenses = 0
            category_breakdown = {}
            
            for row in results:
                amount = float(row['amount'])
                tx_type = row['type']
                category = row['category']
                
                if tx_type == 'income':
                    total_income += amount
                else:
                    total_expenses += amount
                    
                if category not in category_breakdown:
                    category_breakdown[category] = 0
                category_breakdown[category] += amount
            
            net_income = total_income - total_expenses
            
            # Calculate expense percentages
            expense_percentages = {}
            if total_expenses > 0:
                for category, amount in category_breakdown.items():
                    expense_percentages[category] = (amount / total_expenses) * 100
            
            report = {
                'period': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
                'summary': {
                    'total_income': round(total_income, 2),
                    'total_expenses': round(total_expenses, 2),
                    'net_income': round(net_income, 2),
                    'transaction_count': len(results),
                    'savings_rate': round((net_income / total_income * 100) if total_income > 0 else 0, 2)
                },
                'category_breakdown': {k: round(v, 2) for k, v in category_breakdown.items()},
                'expense_percentages': {k: round(v, 2) for k, v in expense_percentages.items()},
                'generated_at': datetime.now().isoformat()
            }
            
            # Add AI insights
            context = f"""
            Financial Report Summary:
            Total Income: ${total_income:,.2f}
            Total Expenses: ${total_expenses:,.2f}
            Net Income: ${net_income:,.2f}
            Savings Rate: {report['summary']['savings_rate']:.1f}%
            Top spending category: {max(category_breakdown.keys(), key=category_breakdown.get) if category_breakdown else 'None'}
            """
            
            insights = self.ai.answer_question(
                "What are the key insights from this financial report?",
                context
            )
            
            report['ai_insights'] = insights
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating financial report: {e}")
            return {"error": str(e)}
    
    def get_account_balance(self, account_id: str = 'default') -> Dict[str, Any]:
        """Get current account balance"""
        try:
            query = '''
                SELECT 
                    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance,
                    COUNT(*) as transaction_count
                FROM transactions 
                WHERE account_id = ?
            '''
            
            result = self.db.execute_query(query, (account_id,))
            
            if result and result[0]:
                balance = result[0]['balance'] or 0
                count = result[0]['transaction_count'] or 0
                
                return {
                    'account_id': account_id,
                    'balance': round(balance, 2),
                    'transaction_count': count,
                    'checked_at': datetime.now().isoformat()
                }
            
            return {
                'account_id': account_id,
                'balance': 0,
                'transaction_count': 0,
                'checked_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting account balance: {e}")
            return {"error": str(e)}
    
    def reconcile_accounts(self) -> Dict[str, Any]:
        """Reconcile all accounts"""
        try:
            query = '''
                SELECT 
                    account_id,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance,
                    COUNT(*) as transaction_count
                FROM transactions 
                GROUP BY account_id
            '''
            
            results = self.db.execute_query(query)
            
            account_balances = {}
            total_assets = 0
            total_liabilities = 0
            
            for row in results:
                account_id = row['account_id']
                balance = row['balance'] or 0
                
                account_balances[account_id] = {
                    'balance': round(balance, 2),
                    'transaction_count': row['transaction_count']
                }
                
                if balance > 0:
                    total_assets += balance
                else:
                    total_liabilities += abs(balance)
            
            reconciliation_report = {
                'account_balances': account_balances,
                'total_assets': round(total_assets, 2),
                'total_liabilities': round(total_liabilities, 2),
                'net_worth': round(total_assets - total_liabilities, 2),
                'reconciled_at': datetime.now().isoformat()
            }
            
            return reconciliation_report
            
        except Exception as e:
            logger.error(f"Error reconciling accounts: {e}")
            return {"error": str(e)}
    
    def _generate_id(self) -> str:
        """Generate unique transaction ID"""
        return hashlib.md5(
            f"{datetime.now().isoformat()}{np.random.random()}".encode()
        ).hexdigest()[:12]

class InventoryAgent:
    """Agent for inventory management"""
    
    def __init__(self, db_manager: DatabaseManager, ai_manager: AIModelManager):
        self.db = db_manager
        self.ai = ai_manager
    
    def add_item(self, item_data: Dict[str, Any]) -> Optional[str]:
        """Add new inventory item"""
        try:
            item = InventoryItem(
                id=self._generate_id(),
                name=item_data['name'],
                quantity=int(item_data['quantity']),
                unit_price=float(item_data['unit_price']),
                supplier=item_data.get('supplier', ''),
                category=item_data.get('category', 'general'),
                minimum_stock=int(item_data.get('minimum_stock', 0)),
                last_updated=datetime.now(),
                metadata=item_data.get('metadata', {})
            )
            
            query = '''
                INSERT INTO inventory 
                (id, name, quantity, unit_price, supplier, category, minimum_stock, last_updated, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''
            
            self.db.execute_query(query, (
                item.id, item.name, item.quantity, item.unit_price,
                item.supplier, item.category, item.minimum_stock,
                item.last_updated, json.dumps(item.metadata)
            ))
            
            logger.info(f"Inventory item added: {item.id}")
            
            # Check if it's already low stock
            if item.quantity <= item.minimum_stock:
                logger.warning(f"LOW STOCK ALERT: {item.name} - Current: {item.quantity}, Minimum: {item.minimum_stock}")
            
            return item.id
            
        except Exception as e:
            logger.error(f"Error adding inventory item: {e}")
            return None
    
    def update_quantity(self, item_id: str, quantity_change: int) -> bool:
        """Update item quantity"""
        try:
            # Get current quantity
            query = "SELECT quantity, name, minimum_stock FROM inventory WHERE id = ?"
            result = self.db.execute_query(query, (item_id,))
            
            if not result:
                logger.error(f"Item not found: {item_id}")
                return False
            
            current_quantity = result[0]['quantity']
            item_name = result[0]['name']
            minimum_stock = result[0]['minimum_stock']
            new_quantity = current_quantity + quantity_change
            
            if new_quantity < 0:
                logger.error(f"Insufficient inventory for item {item_name}")
                return False
            
            # Update quantity
            update_query = '''
                UPDATE inventory 
                SET quantity = ?, last_updated = ? 
                WHERE id = ?
            '''
            
            self.db.execute_query(update_query, (new_quantity, datetime.now(), item_id))
            
            # Check for low stock alert
            if new_quantity <= minimum_stock and minimum_stock > 0:
                logger.warning(f"LOW STOCK ALERT: {item_name} - Current: {new_quantity}, Minimum: {minimum_stock}")
            
            logger.info(f"Inventory updated for {item_name}: {current_quantity} -> {new_quantity}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating inventory: {e}")
            return False
    
    def get_low_stock_items(self) -> List[Dict[str, Any]]:
        """Get items with low stock"""
        try:
            query = '''
                SELECT * FROM inventory 
                WHERE quantity <= minimum_stock AND minimum_stock > 0
                ORDER BY (quantity - minimum_stock) ASC
            '''
            
            results = self.db.execute_query(query)
            
            low_stock_items = []
            for row in results:
                item = {
                    'id': row['id'],
                    'name': row['name'],
                    'current_quantity': row['quantity'],
                    'minimum_stock': row['minimum_stock'],
                    'supplier': row['supplier'],
                    'unit_price': row['unit_price'],
                    'shortage': row['minimum_stock'] - row['quantity']
                }
                low_stock_items.append(item)
            
            return low_stock_items
            
        except Exception as e:
            logger.error(f"Error getting low stock items: {e}")
            return []
    
    def generate_inventory_report(self) -> Dict[str, Any]:
        """Generate comprehensive inventory report"""
        try:
            query = "SELECT * FROM inventory ORDER BY category, name"
            results = self.db.execute_query(query)
            
            if not results:
                return {"error": "No inventory items found", "summary": {
                    "total_items": 0, "total_value": 0, "low_stock_alerts": 0
                }}
            
            # Process inventory data
            total_items = len(results)
            total_value = 0
            low_stock_count = 0
            category_breakdown = {}
            
            for row in results:
                quantity = row['quantity']
                unit_price = row['unit_price']
                category = row['category']
                minimum_stock = row['minimum_stock']
                
                item_value = quantity * unit_price
                total_value += item_value
                
                if quantity <= minimum_stock and minimum_stock > 0:
                    low_stock_count += 1
                
                if category not in category_breakdown:
                    category_breakdown[category] = {
                        'count': 0,
                        'total_value': 0,
                        'total_quantity': 0
                    }
                
                category_breakdown[category]['count'] += 1
                category_breakdown[category]['total_value'] += item_value
                category_breakdown[category]['total_quantity'] += quantity
            
            # Get low stock items
            low_stock_items = self.get_low_stock_items()
            
            report = {
                'summary': {
                    'total_items': total_items,
                    'total_value': round(total_value, 2),
                    'low_stock_alerts': low_stock_count,
                    'categories': len(category_breakdown)
                },
                'category_breakdown': category_breakdown,
                'low_stock_items': low_stock_items[:10],  # Top 10 most critical
                'generated_at': datetime.now().isoformat()
            }
            
            # Add AI insights
            if low_stock_count > 0:
                context = f"""
                Inventory Report:
                Total Items: {total_items}
                Total Value: ${total_value:,.2f}
                Low Stock Alerts: {low_stock_count}
                Critical Items: {', '.join([item['name'] for item in low_stock_items[:3]])}
                """
                
                insights = self.ai.answer_question(
                    "What actions should be taken for these low stock items?",
                    context
                )
                report['ai_recommendations'] = insights
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating inventory report: {e}")
            return {"error": str(e)}
    
    def search_items(self, query: str) -> List[Dict[str, Any]]:
        """Search inventory items by name or category"""
        try:
            search_query = '''
                SELECT * FROM inventory 
                WHERE name LIKE ? OR category LIKE ? OR supplier LIKE ?
                ORDER BY name
            '''
            
            search_term = f"%{query}%"
            results = self.db.execute_query(search_query, (search_term, search_term, search_term))
            
            items = []
            for row in results:
                items.append({
                    'id': row['id'],
                    'name': row['name'],
                    'quantity': row['quantity'],
                    'unit_price': row['unit_price'],
                    'category': row['category'],
                    'supplier': row['supplier'],
                    'in_stock': row['quantity'] > 0
                })
            
            return items
            
        except Exception as e:
            logger.error(f"Error searching inventory: {e}")
            return []
    
    def _generate_id(self) -> str:
        """Generate unique item ID"""
        return hashlib.md5(
            f"inv_{datetime.now().isoformat()}{np.random.random()}".encode()
        ).hexdigest()[:12]

class MortgageAgent:
    """Agent for mortgage and loan processing"""
    
    def __init__(self, db_manager: DatabaseManager, ai_manager: AIModelManager):
        self.db = db_manager
        self.ai = ai_manager
    
    def submit_loan_application(self, application_data: Dict[str, Any]) -> Optional[str]:
        """Submit new loan application"""
        try:
            application = LoanApplication(
                id=self._generate_id(),
                applicant_name=application_data['applicant_name'],
                loan_amount=float(application_data['loan_amount']),
                loan_type=application_data['loan_type'],
                income=float(application_data['income']),
                credit_score=int(application_data.get('credit_score', 650)),
                debt_to_income=float(application_data.get('debt_to_income', 0.3)),
                property_value=float(application_data.get('property_value', 0)),
                down_payment=float(application_data.get('down_payment', 0)),
                status='pending',
                risk_assessment={}
            )
            
            # Perform initial risk assessment
            risk_assessment = self._assess_loan_risk(application)
            application.risk_assessment = risk_assessment
            
            # Update status based on risk
            if risk_assessment['risk_level'] == 'low':
                application.status = 'pre_approved'
            elif risk_assessment['risk_level'] == 'high':
                application.status = 'rejected'
            else:
                application.status = 'under_review'
            
            query = '''
                INSERT INTO loan_applications 
                (id, applicant_name, loan_amount, loan_type, income, credit_score, 
                 debt_to_income, property_value, down_payment, status, risk_assessment)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''
            
            self.db.execute_query(query, (
                application.id, application.applicant_name, application.loan_amount,
                application.loan_type, application.income, application.credit_score,
                application.debt_to_income, application.property_value,
                application.down_payment, application.status,
                json.dumps(application.risk_assessment)
            ))
            
            logger.info(f"Loan application submitted: {application.id} - Status: {application.status}")
            return application.id
            
        except Exception as e:
            logger.error(f"Error submitting loan application: {e}")
            return None
    
    def _assess_loan_risk(self, application: LoanApplication) -> Dict[str, Any]:
        """Assess loan risk using AI and traditional metrics"""
        try:
            # Calculate key ratios
            loan_to_income = application.loan_amount / application.income if application.income > 0 else 999
            loan_to_value = application.loan_amount / application.property_value if application.property_value > 0 else 1
            
            # Risk factors
            risk_factors = []
            risk_score = 0
            
            # Credit score assessment
            if application.credit_score < 580:
                risk_factors.append("Poor credit score")
                risk_score += 40
            elif application.credit_score < 670:
                risk_factors.append("Fair credit score")
                risk_score += 20
            elif application.credit_score > 740:
                risk_score -= 10
            
            # Debt-to-income ratio
            if application.debt_to_income > 0.43:
                risk_factors.append("High debt-to-income ratio")
                risk_score += 30
            elif application.debt_to_income < 0.28:
                risk_score -= 5
            
            # Loan-to-value ratio
            if loan_to_value > 0.95:
                risk_factors.append("High loan-to-value ratio")
                risk_score += 25
            elif loan_to_value < 0.8:
                risk_score -= 5
            
            # Loan-to-income ratio
            if loan_to_income > 5:
                risk_factors.append("High loan-to-income ratio")
                risk_score += 20
            elif loan_to_income < 3:
                risk_score -= 5
            
            # Determine risk level
            if risk_score <= 20:
                risk_level = 'low'
            elif risk_score <= 50:
                risk_level = 'medium'
            else:
                risk_level = 'high'
            
            # Generate AI recommendation
            context = f"""
            Loan Application Assessment:
            Applicant: {application.applicant_name}
            Loan Amount: ${application.loan_amount:,.2f}
            Annual Income: ${application.income:,.2f}
            Credit Score: {application.credit_score}
            Debt-to-Income Ratio: {application.debt_to_income:.2%}
            Property Value: ${application.property_value:,.2f}
            Down Payment: ${application.down_payment:,.2f}
            Risk Score: {risk_score}
            Risk Level: {risk_level}
            """
            
            recommendation = self.ai.generate_text(
                f"Provide a brief loan recommendation for this application: {context}",
                max_length=150
            )
            
            return {
                'risk_score': risk_score,
                'risk_level': risk_level,
                'risk_factors': risk_factors,
                'loan_to_income': round(loan_to_income, 2),
                'loan_to_value': round(loan_to_value, 2),
                'ai_recommendation': recommendation,
                'assessed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error assessing loan risk: {e}")
            return {
                'risk_score': 100,
                'risk_level': 'high',
                'risk_factors': ['Assessment error'],
                'error': str(e)
            }
    
    def calculate_mortgage_payment(self, principal: float, rate: float, years: int) -> Dict[str, Any]:
        """Calculate mortgage payment details"""
        try:
            monthly_rate = rate / 12 / 100
            num_payments = years * 12
            
            if monthly_rate > 0:
                monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / \
                                ((1 + monthly_rate) ** num_payments - 1)
            else:
                monthly_payment = principal / num_payments
            
            total_payment = monthly_payment * num_payments
            total_interest = total_payment - principal
            
            # Calculate amortization schedule (first year)
            amortization = []
            balance = principal
            
            for month in range(1, min(13, num_payments + 1)):
                interest_payment = balance * monthly_rate
                principal_payment = monthly_payment - interest_payment
                balance -= principal_payment
                
                amortization.append({
                    'month': month,
                    'payment': round(monthly_payment, 2),
                    'principal': round(principal_payment, 2),
                    'interest': round(interest_payment, 2),
                    'balance': round(balance, 2)
                })
            
            return {
                'principal': principal,
                'interest_rate': rate,
                'loan_term_years': years,
                'monthly_payment': round(monthly_payment, 2),
                'total_payment': round(total_payment, 2),
                'total_interest': round(total_interest, 2),
                'first_year_amortization': amortization,
                'calculated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating mortgage payment: {e}")
            return {"error": str(e)}
    
    def get_application_status(self, application_id: str) -> Dict[str, Any]:
        """Get loan application status and details"""
        try:
            query = "SELECT * FROM loan_applications WHERE id = ?"
            result = self.db.execute_query(query, (application_id,))
            
            if not result:
                return {"error": "Application not found"}
            
            row = result[0]
            application_data = {
                'id': row['id'],
                'applicant_name': row['applicant_name'],
                'loan_amount': row['loan_amount'],
                'loan_type': row['loan_type'],
                'income': row['income'],
                'credit_score': row['credit_score'],
                'debt_to_income': row['debt_to_income'],
                'property_value': row['property_value'],
                'down_payment': row['down_payment'],
                'status': row['status'],
                'risk_assessment': json.loads(row['risk_assessment']) if row['risk_assessment'] else {},
                'created_at': row['created_at']
            }
            
            return application_data
            
        except Exception as e:
            logger.error(f"Error getting application status: {e}")
            return {"error": str(e)}
    
    def get_all_applications(self, status_filter: str = None) -> List[Dict[str, Any]]:
        """Get all loan applications with optional status filter"""
        try:
            if status_filter:
                query = "SELECT * FROM loan_applications WHERE status = ? ORDER BY created_at DESC"
                results = self.db.execute_query(query, (status_filter,))
            else:
                query = "SELECT * FROM loan_applications ORDER BY created_at DESC"
                results = self.db.execute_query(query)
            
            applications = []
            for row in results:
                applications.append({
                    'id': row['id'],
                    'applicant_name': row['applicant_name'],
                    'loan_amount': row['loan_amount'],
                    'loan_type': row['loan_type'],
                    'status': row['status'],
                    'created_at': row['created_at']
                })
            
            return applications
            
        except Exception as e:
            logger.error(f"Error getting applications: {e}")
            return []
    
    def _generate_id(self) -> str:
        """Generate unique application ID"""
        return hashlib.md5(
            f"loan_{datetime.now().isoformat()}{np.random.random()}".encode()
        ).hexdigest()[:12]

# Continue with remaining agent classes
class FinanceAgent:
    """Agent for general financial analysis and advice"""
    
    def __init__(self, db_manager: DatabaseManager, ai_manager: AIModelManager, scraping_agent: WebScrapingAgent):
        self.db = db_manager
        self.ai = ai_manager
        self.scraper = scraping_agent
        self.portfolio = {}
    
    def analyze_portfolio_performance(self, portfolio_symbols: List[str]) -> Dict[str, Any]:
        """Analyze portfolio performance"""
        try:
            # Get current prices
            stock_data = asyncio.run(self.scraper.scrape_stock_prices(portfolio_symbols))
            
            total_value = 0
            total_change = 0
            holdings = []
            
            for symbol, data in stock_data.items():
                holding = {
                    'symbol': symbol,
                    'current_price': data['price'],
                    'change': data['change'],
                    'change_percent': data['change_percent']
                }
                holdings.append(holding)
                total_value += data['price']
                total_change += data['change']
            
            analysis = {
                'portfolio_value': round(total_value, 2),
                'total_change': round(total_change, 2),
                'change_percent': round((total_change / (total_value - total_change)) * 100 if total_value > 0 else 0, 2),
                'holdings': holdings,
                'analyzed_at': datetime.now().isoformat()
            }
            
            # Add AI insights
            context = f"""
            Portfolio Analysis:
            Total Value: ${total_value:,.2f}
            Total Change: ${total_change:,.2f}
            Change Percentage: {analysis['change_percent']:.2f}%
            Number of Holdings: {len(holdings)}
            """
            
            insights = self.ai.answer_question(
                "What insights can you provide about this portfolio performance?",
                context
            )
            
            analysis['ai_insights'] = insights
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing portfolio: {e}")
            return {"error": str(e)}
    
    def generate_budget_recommendation(self, income: float, expenses: Dict[str, float]) -> Dict[str, Any]:
        """Generate budget recommendations using AI"""
        try:
            total_expenses = sum(expenses.values())
            savings_rate = (income - total_expenses) / income if income > 0 else 0
            
            # Calculate expense ratios
            expense_ratios = {category: (amount / income) for category, amount in expenses.items() if income > 0}
            
            recommendations = []
            
            # Check against recommended percentages
            recommended_ratios = {
                'housing': 0.28,
                'transportation': 0.15,
                'food': 0.12,
                'utilities': 0.10,
                'entertainment': 0.05,
                'healthcare': 0.05,
                'savings': 0.20
            }
            
            for category, actual_ratio in expense_ratios.items():
                recommended_ratio = recommended_ratios.get(category, 0.05)
                if actual_ratio > recommended_ratio * 1.2:  # 20% over recommended
                    recommendations.append({
                        'category': category,
                        'current': f"{actual_ratio:.1%}",
                        'recommended': f"{recommended_ratio:.1%}",
                        'action': f"Consider reducing {category} spending"
                    })
            
            if savings_rate < 0.2:
                recommendations.append({
                    'category': 'savings',
                    'current': f"{savings_rate:.1%}",
                    'recommended': "20%",
                    'action': "Increase savings rate to build emergency fund"
                })
            
            context = f"""
            Budget Analysis:
            Monthly Income: ${income:,.2f}
            Total Expenses: ${total_expenses:,.2f}
            Savings Rate: {savings_rate:.1%}
            """
            
            ai_advice = self.ai.generate_text(
                f"Provide financial advice for this budget: {context}",
                max_length=200
            )
            
            return {
                'income': income,
                'total_expenses': round(total_expenses, 2),
                'savings_rate': round(savings_rate, 3),
                'expense_ratios': {k: round(v, 3) for k, v in expense_ratios.items()},
                'recommendations': recommendations,
                'ai_advice': ai_advice,
                'budget_health': 'good' if savings_rate >= 0.2 else 'needs improvement',
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error generating budget recommendation: {e}")
            return {"error": str(e)}
    
    def calculate_retirement_planning(self, current_age: int, retirement_age: int, 
                                    current_savings: float, monthly_contribution: float, 
                                    expected_return: float = 7.0) -> Dict[str, Any]:
        """Calculate retirement planning projections"""
        try:
            years_to_retirement = retirement_age - current_age
            months_to_retirement = years_to_retirement * 12
            monthly_return = expected_return / 12 / 100
            
            # Future value of current savings
            fv_current = current_savings * (1 + expected_return/100) ** years_to_retirement
            
            # Future value of monthly contributions
            if monthly_return > 0:
                fv_contributions = monthly_contribution * (((1 + monthly_return) ** months_to_retirement - 1) / monthly_return)
            else:
                fv_contributions = monthly_contribution * months_to_retirement
            
            total_retirement_savings = fv_current + fv_contributions
            
            # Estimate retirement income (4% rule)
            annual_retirement_income = total_retirement_savings * 0.04
            monthly_retirement_income = annual_retirement_income / 12
            
            # Calculate if on track
            target_savings = annual_retirement_income * 25  # 4% rule inverse
            savings_gap = target_savings - total_retirement_savings
            on_track = savings_gap <= 0
            
            return {
                'current_age': current_age,
                'retirement_age': retirement_age,
                'years_to_retirement': years_to_retirement,
                'current_savings': current_savings,
                'monthly_contribution': monthly_contribution,
                'expected_annual_return': expected_return,
                'projected_retirement_savings': round(total_retirement_savings, 2),
                'estimated_annual_retirement_income': round(annual_retirement_income, 2),
                'estimated_monthly_retirement_income': round(monthly_retirement_income, 2),
                'on_track': on_track,
                'savings_gap': round(abs(savings_gap), 2) if not on_track else 0,
                'calculated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error calculating retirement planning: {e}")
            return {"error": str(e)}


class InsuranceAgent:
    """Agent for insurance policy management"""
    
    def __init__(self, db_manager: DatabaseManager, ai_manager: AIModelManager):
        self.db = db_manager
        self.ai = ai_manager
    
    def create_policy_quote(self, policy_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insurance policy quote"""
        try:
            policy_type = policy_data['policy_type'].lower()
            coverage_amount = float(policy_data['coverage_amount'])
            
            # Basic premium calculation (simplified)
            base_rates = {
                'auto': 0.02,
                'home': 0.005,
                'life': 0.01,
                'health': 0.08,
                'business': 0.03
            }
            
            base_rate = base_rates.get(policy_type, 0.02)
            base_premium = coverage_amount * base_rate
            
            # Apply risk factors
            risk_multiplier = 1.0
            risk_factors = []
            
            if policy_type == 'auto':
                age = policy_data.get('age', 30)
                if age < 25:
                    risk_multiplier += 0.5
                    risk_factors.append("Young driver")
                elif age > 65:
                    risk_multiplier += 0.2
                    risk_factors.append("Senior driver")
                    
                driving_record = policy_data.get('driving_record', 'clean')
                if driving_record == 'violations':
                    risk_multiplier += 0.3
                    risk_factors.append("Traffic violations")
                elif driving_record == 'accidents':
                    risk_multiplier += 0.4
                    risk_factors.append("Previous accidents")
            
            elif policy_type == 'home':
                home_age = policy_data.get('home_age', 10)
                if home_age > 30:
                    risk_multiplier += 0.1
                    risk_factors.append("Older property")
                    
                location_risk = policy_data.get('location_risk', 'low')
                if location_risk == 'high':
                    risk_multiplier += 0.3
                    risk_factors.append("High-risk location")
                elif location_risk == 'medium':
                    risk_multiplier += 0.1
                    risk_factors.append("Moderate-risk location")
            
            elif policy_type == 'life':
                age = policy_data.get('age', 30)
                if age > 50:
                    risk_multiplier += (age - 50) * 0.02
                    risk_factors.append("Age factor")
                    
                health_status = policy_data.get('health_status', 'good')
                if health_status == 'poor':
                    risk_multiplier += 0.5
                    risk_factors.append("Health concerns")
                elif health_status == 'fair':
                    risk_multiplier += 0.2
                    risk_factors.append("Moderate health")
            
            annual_premium = base_premium * risk_multiplier
            monthly_premium = annual_premium / 12
            
            # Generate AI recommendation
            context = f"""
            Insurance Quote:
            Type: {policy_type}
            Coverage: ${coverage_amount:,.2f}
            Annual Premium: ${annual_premium:,.2f}
            Risk Factors: {', '.join(risk_factors) if risk_factors else 'None'}
            """
            
            recommendation = self.ai.answer_question(
                "What advice would you give about this insurance quote?",
                context
            )
            
            return {
                'policy_type': policy_type,
                'coverage_amount': coverage_amount,
                'annual_premium': round(annual_premium, 2),
                'monthly_premium': round(monthly_premium, 2),
                'risk_multiplier': round(risk_multiplier, 2),
                'risk_factors': risk_factors,
                'ai_recommendation': recommendation,
                'quote_id': self._generate_id(),
                'quote_expires': (datetime.now() + timedelta(days=30)).isoformat(),
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error creating policy quote: {e}")
            return {"error": str(e)}
    
    def create_policy(self, policy_data: Dict[str, Any]) -> Optional[str]:
        """Create new insurance policy"""
        try:
            policy_id = self._generate_id()
            
            query = '''
                INSERT INTO insurance_policies 
                (id, policy_holder, policy_type, coverage_amount, premium, deductible, 
                 start_date, end_date, status, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''
            
            start_date = policy_data.get('start_date', datetime.now().date())
            end_date = policy_data.get('end_date', (datetime.now() + timedelta(days=365)).date())
            
            self.db.execute_query(query, (
                policy_id,
                policy_data['policy_holder'],
                policy_data['policy_type'],
                float(policy_data['coverage_amount']),
                float(policy_data['premium']),
                float(policy_data.get('deductible', 500)),
                start_date,
                end_date,
                'active',
                json.dumps(policy_data.get('metadata', {}))
            ))
            
            logger.info(f"Insurance policy created: {policy_id}")
            return policy_id
            
        except Exception as e:
            logger.error(f"Error creating policy: {e}")
            return None
    
    def process_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process insurance claim"""
        try:
            policy_id = claim_data['policy_id']
            claim_amount = float(claim_data['claim_amount'])
            
            # Get policy details
            query = "SELECT * FROM insurance_policies WHERE id = ? AND status = 'active'"
            result = self.db.execute_query(query, (policy_id,))
            
            if not result:
                return {"error": "Policy not found or inactive"}
            
            policy = result[0]
            coverage_amount = policy['coverage_amount']
            deductible = policy['deductible'] or 0
            
            # Basic claim processing logic
            if claim_amount > coverage_amount:
                status = 'denied'
                payout = 0
                reason = 'Claim exceeds coverage amount'
            elif claim_amount <= deductible:
                status = 'denied'
                payout = 0
                reason = 'Claim amount below deductible'
            else:
                status = 'approved'
                payout = min(claim_amount - deductible, coverage_amount)
                reason = 'Claim approved'
            
            # Analyze claim with AI
            claim_description = claim_data.get('description', '')
            ai_analysis = self.ai.analyze_sentiment(claim_description)
            
            claim_result = {
                'claim_id': self._generate_id(),
                'policy_id': policy_id,
                'policy_type': policy['policy_type'],
                'claim_amount': claim_amount,
                'deductible': deductible,
                'payout_amount': round(payout, 2),
                'status': status,
                'reason': reason,
                'ai_sentiment': ai_analysis,
                'processed_at': datetime.now().isoformat()
            }
            
            # Store claim in database (you could add a claims table)
            logger.info(f"Claim processed: {claim_result['claim_id']} - Status: {status}")
            
            return claim_result
            
        except Exception as e:
            logger.error(f"Error processing claim: {e}")
            return {"error": str(e)}
    
    def get_active_policies(self, policy_holder: str = None) -> List[Dict[str, Any]]:
        """Get active insurance policies"""
        try:
            if policy_holder:
                query = "SELECT * FROM insurance_policies WHERE policy_holder = ? AND status = 'active'"
                results = self.db.execute_query(query, (policy_holder,))
            else:
                query = "SELECT * FROM insurance_policies WHERE status = 'active'"
                results = self.db.execute_query(query)
            
            policies = []
            for row in results:
                policies.append({
                    'id': row['id'],
                    'policy_holder': row['policy_holder'],
                    'policy_type': row['policy_type'],
                    'coverage_amount': row['coverage_amount'],
                    'premium': row['premium'],
                    'deductible': row['deductible'],
                    'start_date': row['start_date'],
                    'end_date': row['end_date'],
                    'status': row['status']
                })
            
            return policies
            
        except Exception as e:
            logger.error(f"Error getting active policies: {e}")
            return []
    
    def _generate_id(self) -> str:
        """Generate unique policy ID"""
        return hashlib.md5(
            f"ins_{datetime.now().isoformat()}{np.random.random()}".encode()
        ).hexdigest()[:12]


class Web3Agent:
    """Agent for Web3 and cryptocurrency operations"""
    
    def __init__(self, db_manager: DatabaseManager, ai_manager: AIModelManager):
        self.db = db_manager
        self.ai = ai_manager
        self.w3 = None
        self.account = None
        self._init_web3()
    
    def _init_web3(self):
        """Initialize Web3 connection"""
        try:
            from web3 import Web3
            # Try to connect to a local node first, then fallback to a public endpoint
            providers = [
                'http://localhost:8545',  # Local node
                'https://eth.public-rpc.com',  # Public RPC
            ]
            
            for provider_url in providers:
                try:
                    self.w3 = Web3(Web3.HTTPProvider(provider_url))
                    if self.w3.is_connected():
                        logger.info(f"Connected to Web3 provider: {provider_url}")
                        break
                except:
                    continue
                    
        except ImportError:
            logger.warning("Web3 not available. Blockchain features will be simulated.")
    
    def create_wallet(self) -> Dict[str, str]:
        """Create new wallet"""
        try:
            if not self.w3:
                # Simulate wallet creation
                fake_address = "0x" + hashlib.sha256(
                    f"{datetime.now().isoformat()}".encode()
                ).hexdigest()[:40]
                fake_key = "0x" + hashlib.sha256(
                    f"{fake_address}{np.random.random()}".encode()
                ).hexdigest()
                
                return {
                    'address': fake_address,
                    'private_key': fake_key,
                    'warning': 'Simulated wallet - not real',
                    'created_at': datetime.now().isoformat()
                }
            
            from eth_account import Account
            account = Account.create()
            
            wallet_data = {
                'address': account.address,
                'private_key': account.key.hex(),
                'created_at': datetime.now().isoformat()
            }
            
            # Store wallet info (in production, encrypt private key!)
            logger.warning("SECURITY WARNING: Private keys should be encrypted in production!")
            
            return wallet_data
            
        except Exception as e:
            logger.error(f"Error creating wallet: {e}")
            return {"error": str(e)}
    
    def get_balance(self, address: str) -> Dict[str, Any]:
        """Get wallet balance"""
        try:
            if not self.w3 or not self.w3.is_connected():
                # Simulate balance
                return {
                    'address': address,
                    'balance_wei': 1000000000000000000,  # 1 ETH in wei
                    'balance_eth': 1.0,
                    'warning': 'Simulated balance',
                    'checked_at': datetime.now().isoformat()
                }
            
            balance_wei = self.w3.eth.get_balance(address)
            balance_eth = self.w3.from_wei(balance_wei, 'ether')
            
            return {
                'address': address,
                'balance_wei': balance_wei,
                'balance_eth': float(balance_eth),
                'checked_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting balance: {e}")
            return {"error": str(e)}
    
    def track_transaction(self, tx_hash: str) -> Dict[str, Any]:
        """Track blockchain transaction"""
        try:
            if not self.w3 or not self.w3.is_connected():
                # Simulate transaction tracking
                return {
                    'hash': tx_hash,
                    'status': 'success',
                    'warning': 'Simulated transaction',
                    'tracked_at': datetime.now().isoformat()
                }
            
            tx = self.w3.eth.get_transaction(tx_hash)
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            
            transaction_data = {
                'hash': tx_hash,
                'from': tx['from'],
                'to': tx['to'],
                'value': float(self.w3.from_wei(tx['value'], 'ether')),
                'gas': tx['gas'],
                'gas_price': float(self.w3.from_wei(tx['gasPrice'], 'gwei')),
                'block_number': receipt['blockNumber'],
                'status': 'success' if receipt['status'] == 1 else 'failed',
                'gas_used': receipt['gasUsed']
            }
            
            # Store in database
            query = '''
                INSERT OR REPLACE INTO web3_transactions 
                (id, transaction_hash, from_address, to_address, amount, token_symbol,
                 gas_used, gas_price, block_number, timestamp, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''
            
            self.db.execute_query(query, (
                self._generate_id(),
                tx_hash,
                transaction_data['from'],
                transaction_data['to'],
                transaction_data['value'],
                'ETH',
                transaction_data['gas_used'],
                transaction_data['gas_price'],
                transaction_data['block_number'],
                datetime.now(),
                transaction_data['status']
            ))
            
            return transaction_data
            
        except Exception as e:
            logger.error(f"Error tracking transaction: {e}")
            return {"error": str(e)}
    
    def analyze_defi_portfolio(self, address: str) -> Dict[str, Any]:
        """Analyze DeFi portfolio (simulated for demo)"""
        try:
            # In production, this would integrate with DeFi protocols
            # For demo, we'll create a simulated analysis
            
            portfolio_analysis = {
                'address': address,
                'total_value_usd': np.random.uniform(1000, 50000),
                'positions': [
                    {
                        'protocol': 'Uniswap V3',
                        'type': 'Liquidity Pool',
                        'pair': 'ETH/USDC',
                        'value_usd': np.random.uniform(1000, 10000),
                        'apy': np.random.uniform(5, 25)
                    },
                    {
                        'protocol': 'Aave',
                        'type': 'Lending',
                        'asset': 'USDC',
                        'value_usd': np.random.uniform(1000, 10000),
                        'apy': np.random.uniform(2, 8)
                    }
                ],
                'yield_farming': [
                    {
                        'protocol': 'Curve',
                        'pool': '3pool',
                        'staked_value': np.random.uniform(1000, 5000),
                        'rewards_earned': np.random.uniform(10, 100)
                    }
                ],
                'analyzed_at': datetime.now().isoformat()
            }
            
            # Add AI insights
            context = f"""
            DeFi Portfolio Analysis:
            Total Value: ${portfolio_analysis['total_value_usd']:,.2f}
            Active Positions: {len(portfolio_analysis['positions'])}
            Yield Farming: {len(portfolio_analysis['yield_farming'])} pools
            """
            
            insights = self.ai.answer_question(
                "What recommendations do you have for this DeFi portfolio?",
                context
            )
            
            portfolio_analysis['ai_insights'] = insights
            
            return portfolio_analysis
            
        except Exception as e:
            logger.error(f"Error analyzing DeFi portfolio: {e}")
            return {"error": str(e)}
    
    def get_gas_prices(self) -> Dict[str, Any]:
        """Get current gas prices"""
        try:
            if not self.w3 or not self.w3.is_connected():
                # Simulate gas prices
                return {
                    'slow': 20,
                    'average': 30,
                    'fast': 50,
                    'unit': 'gwei',
                    'warning': 'Simulated prices',
                    'updated_at': datetime.now().isoformat()
                }
            
            latest_block = self.w3.eth.get_block('latest')
            base_fee = latest_block.get('baseFeePerGas', 0)
            
            # Calculate gas prices (simplified)
            slow_price = int(base_fee * 1.0)
            average_price = int(base_fee * 1.5)
            fast_price = int(base_fee * 2.0)
            
            return {
                'slow': self.w3.from_wei(slow_price, 'gwei'),
                'average': self.w3.from_wei(average_price, 'gwei'),
                'fast': self.w3.from_wei(fast_price, 'gwei'),
                'unit': 'gwei',
                'updated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting gas prices: {e}")
            return {"error": str(e)}
    
    def _generate_id(self) -> str:
        """Generate unique transaction ID"""
        return hashlib.md5(
            f"web3_{datetime.now().isoformat()}{np.random.random()}".encode()
        ).hexdigest()[:12]


class TaskScheduler:
    """Scheduler for automated tasks"""
    
    def __init__(self, agents: Dict[str, Any]):
        self.agents = agents
        self.running = False
        self.scheduler_thread = None
    
    def start(self):
        """Start the scheduler"""
        self.running = True
        
        # Schedule tasks
        schedule.every().hour.do(self._scrape_market_data)
        schedule.every().day.at("09:00").do(self._generate_daily_reports)
        schedule.every().day.at("18:00").do(self._check_inventory_alerts)
        schedule.every().week.do(self._reconcile_accounts)
        schedule.every().month.do(self._generate_monthly_reports)
        
        self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.scheduler_thread.start()
        
        logger.info("Task scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("Task scheduler stopped")
    
    def _run_scheduler(self):
        """Run scheduled tasks"""
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                logger.error(f"Scheduler error: {e}")
    
    def _scrape_market_data(self):
        """Scheduled market data scraping"""
        try:
            symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
            crypto_symbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK']
            
            asyncio.run(self.agents['scraping'].scrape_stock_prices(symbols))
            asyncio.run(self.agents['scraping'].scrape_crypto_prices(crypto_symbols))
            
            logger.info("Scheduled market data scraping completed")
            
        except Exception as e:
            logger.error(f"Error in scheduled market data scraping: {e}")
    
    def _generate_daily_reports(self):
        """Generate daily financial reports"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=1)
            
            report = self.agents['accounting'].generate_financial_report(start_date, end_date)
            logger.info("Daily financial report generated")
            
            # You could email this report or save it to a specific location
            
        except Exception as e:
            logger.error(f"Error generating daily report: {e}")
    
    def _check_inventory_alerts(self):
        """Check for low stock inventory alerts"""
        try:
            low_stock = self.agents['inventory'].get_low_stock_items()
            
            if low_stock:
                logger.warning(f"LOW STOCK ALERT: {len(low_stock)} items need restocking")
                for item in low_stock[:5]:  # Show top 5
                    logger.warning(f"  - {item['name']}: {item['current_quantity']} units (min: {item['minimum_stock']})")
                
        except Exception as e:
            logger.error(f"Error checking inventory alerts: {e}")
    
    def _reconcile_accounts(self):
        """Weekly account reconciliation"""
        try:
            reconciliation = self.agents['accounting'].reconcile_accounts()
            logger.info(f"Weekly reconciliation: Net worth: ${reconciliation.get('net_worth', 0):,.2f}")
            
        except Exception as e:
            logger.error(f"Error in account reconciliation: {e}")
    
    def _generate_monthly_reports(self):
        """Generate monthly comprehensive reports"""
        try:
            end_date = datetime.now()
            start_date = end_date.replace(day=1)
            
            # Financial report
            financial_report = self.agents['accounting'].generate_financial_report(start_date, end_date)
            
            # Inventory report
            inventory_report = self.agents['inventory'].generate_inventory_report()
            
            logger.info("Monthly comprehensive reports generated")
            
        except Exception as e:
            logger.error(f"Error generating monthly reports: {e}")


class MultiAgentSystem:
    """Main system coordinator for all agents"""
    
    def __init__(self):
        logger.info("Initializing Multi-Agent Financial System...")
        
        # Initialize core components
        self.db_manager = DatabaseManager()
        self.ai_manager = AIModelManager()
        
        # Initialize agents
        self.scraping_agent = WebScrapingAgent(self.ai_manager, self.db_manager)
        self.accounting_agent = AccountingAgent(self.db_manager, self.ai_manager)
        self.inventory_agent = InventoryAgent(self.db_manager, self.ai_manager)
        self.mortgage_agent = MortgageAgent(self.db_manager, self.ai_manager)
        self.finance_agent = FinanceAgent(self.db_manager, self.ai_manager, self.scraping_agent)
        self.insurance_agent = InsuranceAgent(self.db_manager, self.ai_manager)
        self.web3_agent = Web3Agent(self.db_manager, self.ai_manager)
        
        # Agent registry
        self.agents = {
            'scraping': self.scraping_agent,
            'accounting': self.accounting_agent,
            'inventory': self.inventory_agent,
            'mortgage': self.mortgage_agent,
            'finance': self.finance_agent,
            'insurance': self.insurance_agent,
            'web3': self.web3_agent
        }
        
        # Initialize scheduler
        self.scheduler = TaskScheduler(self.agents)
        
        logger.info("Multi-Agent Financial System initialized successfully!")
    
    def start_system(self):
        """Start the entire system"""
        try:
            self.scheduler.start()
            logger.info("🚀 Multi-Agent Financial System is now running!")
            return True
        except Exception as e:
            logger.error(f"Error starting system: {e}")
            return False
    
    def stop_system(self):
        """Stop the system gracefully"""
        try:
            self.scheduler.stop()
            logger.info("Multi-Agent Financial System stopped")
            return True
        except Exception as e:
            logger.error(f"Error stopping system: {e}")
            return False
    
    def process_command(self, command: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process user commands"""
        if params is None:
            params = {}
        
        try:
            command = command.lower().strip()
            
            # Accounting commands
            if command == 'create_transaction':
                return {
                    'result': self.accounting_agent.create_transaction(params),
                    'agent': 'accounting'
                }
            
            elif command == 'financial_report':
                start_date = params.get('start_date')
                end_date = params.get('end_date')
                return {
                    'result': self.accounting_agent.generate_financial_report(start_date, end_date),
                    'agent': 'accounting'
                }
            
            elif command == 'account_balance':
                account_id = params.get('account_id', 'default')
                return {
                    'result': self.accounting_agent.get_account_balance(account_id),
                    'agent': 'accounting'
                }
            
            # Inventory commands
            elif command == 'add_inventory':
                return {
                    'result': self.inventory_agent.add_item(params),
                    'agent': 'inventory'
                }
            
            elif command == 'update_inventory':
                return {
                    'result': self.inventory_agent.update_quantity(
                        params['item_id'], params['quantity_change']
                    ),
                    'agent': 'inventory'
                }
            
            elif command == 'inventory_report':
                return {
                    'result': self.inventory_agent.generate_inventory_report(),
                    'agent': 'inventory'
                }
            
            # Mortgage commands
            elif command == 'submit_loan':
                return {
                    'result': self.mortgage_agent.submit_loan_application(params),
                    'agent': 'mortgage'
                }
            
            elif command == 'calculate_mortgage':
                return {
                    'result': self.mortgage_agent.calculate_mortgage_payment(
                        params['principal'], params['rate'], params['years']
                    ),
                    'agent': 'mortgage'
                }
            
            # Finance commands
            elif command == 'analyze_portfolio':
                return {
                    'result': self.finance_agent.analyze_portfolio_performance(params['symbols']),
                    'agent': 'finance'
                }
            
            elif command == 'budget_recommendation':
                return {
                    'result': self.finance_agent.generate_budget_recommendation(
                        params['income'], params['expenses']
                    ),
                    'agent': 'finance'
                }
            
            elif command == 'retirement_planning':
                return {
                    'result': self.finance_agent.calculate_retirement_planning(
                        params['current_age'], params['retirement_age'],
                        params['current_savings'], params['monthly_contribution'],
                        params.get('expected_return', 7.0)
                    ),
                    'agent': 'finance'
                }
            
            # Insurance commands
            elif command == 'insurance_quote':
                return {
                    'result': self.insurance_agent.create_policy_quote(params),
                    'agent': 'insurance'
                }
            
            elif command == 'process_claim':
                return {
                    'result': self.insurance_agent.process_claim(params),
                    'agent': 'insurance'
                }
            
            # Web3 commands
            elif command == 'create_wallet':
                return {
                    'result': self.web3_agent.create_wallet(),
                    'agent': 'web3'
                }
            
            elif command == 'get_balance':
                return {
                    'result': self.web3_agent.get_balance(params['address']),
                    'agent': 'web3'
                }
            
            elif command == 'gas_prices':
                return {
                    'result': self.web3_agent.get_gas_prices(),
                    'agent': 'web3'
                }
            
            # Web scraping commands
            elif command == 'scrape_stocks':
                return {
                    'result': asyncio.run(
                        self.scraping_agent.scrape_stock_prices(params['symbols'])
                    ),
                    'agent': 'scraping'
                }
            
            elif command == 'scrape_crypto':
                return {
                    'result': asyncio.run(
                        self.scraping_agent.scrape_crypto_prices(params['symbols'])
                    ),
                    'agent': 'scraping'
                }
            
            # AI commands
            elif command == 'ask_question':
                return {
                    'result': self.ai_manager.answer_question(
                        params['question'], params.get('context', '')
                    ),
                    'agent': 'ai'
                }
            
            else:
                return {
                    'error': f"Unknown command: {command}",
                    'available_commands': [
                        'create_transaction', 'financial_report', 'account_balance',
                        'add_inventory', 'update_inventory', 'inventory_report',
                        'submit_loan', 'calculate_mortgage', 'analyze_portfolio',
                        'budget_recommendation', 'retirement_planning', 'insurance_quote',
                        'process_claim', 'create_wallet', 'get_balance', 'gas_prices',
                        'scrape_stocks', 'scrape_crypto', 'ask_question'
                    ]
                }
        
        except Exception as e:
            logger.error(f"Error processing command '{command}': {e}")
            return {'error': str(e)}
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get overall system status"""
        try:
            # Check database
            db_status = "connected" if self.db_manager else "disconnected"
            
            # Check AI models
            ai_status = "loaded" if self.ai_manager.models_loaded else "not_loaded"
            
            # Check scheduler
            scheduler_status = "running" if self.scheduler.running else "stopped"
            
            # Get recent activity
            recent_transactions = self.db_manager.execute_query(
                "SELECT COUNT(*) FROM transactions WHERE timestamp > datetime('now', '-24 hours')"
            )
            
            recent_inventory_updates = self.db_manager.execute_query(
                "SELECT COUNT(*) FROM inventory WHERE last_updated > datetime('now', '-24 hours')"
            )
            
            return {
                'system_status': 'operational',
                'database': db_status,
                'ai_models': ai_status,
                'scheduler': scheduler_status,
                'recent_activity': {
                    'transactions_24h': recent_transactions[0][0] if recent_transactions else 0,
                    'inventory_updates_24h': recent_inventory_updates[0][0] if recent_inventory_updates else 0
                },
                'agents': list(self.agents.keys()),
                'uptime': datetime.now().isoformat(),
                'version': '1.0.0'
            }
        
        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {
                'system_status': 'error',
                'error': str(e)
            }


def demo_system():
    """Demonstrate the multi-agent system capabilities"""
    print("🚀 Starting Multi-Agent Financial System Demo...")
    print("=" * 60)
    
    # Initialize system
    system = MultiAgentSystem()
    system.start_system()
    
    print("\n" + "="*60)
    print("MULTI-AGENT FINANCIAL SYSTEM DEMO")
    print("="*60)
    
    # Demo 1: Create sample transactions
    print("\n📊 Demo 1: Creating Sample Transactions")
    transactions = [
        {
            'type': 'expense',
            'amount': 150.50,
            'description': 'Grocery shopping at Whole Foods',
            'account_id': 'checking_001'
        },
        {
            'type': 'income',
            'amount': 3000.00,
            'description': 'Monthly salary deposit',
            'account_id': 'checking_001'
        },
        {
            'type': 'expense',
            'amount': 45.20,
            'description': 'Gas station fill-up',
            'account_id': 'checking_001'
        }
    ]
    
    for tx in transactions:
        result = system.process_command('create_transaction', tx)
        if result.get('result'):
            print(f"✅ Created transaction: {result['result']} - {tx['description']}")
    
    # Demo 2: Generate financial report
    print("\n📈 Demo 2: Generating Financial Report")
    report_result = system.process_command('financial_report')
    report = report_result.get('result', {})
    if 'summary' in report:
        print(f"📋 Financial Report Generated:")
        print(f"   Total Income: ${report['summary']['total_income']:,.2f}")
        print(f"   Total Expenses: ${report['summary']['total_expenses']:,.2f}")
        print(f"   Net Income: ${report['summary']['net_income']:,.2f}")
        print(f"   Savings Rate: {report['summary']['savings_rate']}%")
    
    # Demo 3: Add inventory items
    print("\n📦 Demo 3: Managing Inventory")
    inventory_items = [
        {
            'name': 'Office Supplies - Pens',
            'quantity': 100,
            'unit_price': 1.50,
            'supplier': 'Office Depot',
            'category': 'supplies',
            'minimum_stock': 20
        },
        {
            'name': 'Laptop - Dell XPS 13',
            'quantity': 5,
            'unit_price': 1200.00,
            'supplier': 'Dell Direct',
            'category': 'equipment',
            'minimum_stock': 2
        }
    ]
    
    for item in inventory_items:
        result = system.process_command('add_inventory', item)
        if result.get('result'):
            print(f"📦 Added inventory: {result['result']} - {item['name']}")
    
    # Demo 4: Calculate mortgage payment
    print("\n🏠 Demo 4: Mortgage Calculation")
    mortgage_result = system.process_command('calculate_mortgage', {
        'principal': 300000,
        'rate': 4.5,
        'years': 30
    })
    payment_info = mortgage_result.get('result', {})
    if 'monthly_payment' in payment_info:
        print(f"🏠 Mortgage Payment: ${payment_info['monthly_payment']}/month")
        print(f"   Total Interest: ${payment_info['total_interest']:,.2f}")
    
    # Demo 5: Insurance quote
    print("\n🛡️ Demo 5: Insurance Quote")
    quote_result = system.process_command('insurance_quote', {
        'policy_type': 'auto',
        'coverage_amount': 100000,
        'age': 35,
        'driving_record': 'clean'
    })
    quote_info = quote_result.get('result', {})
    if 'monthly_premium' in quote_info:
        print(f"🛡️ Auto Insurance Quote:")
        print(f"   Coverage: ${quote_info['coverage_amount']:,}")
        print(f"   Monthly Premium: ${quote_info['monthly_premium']}")
        print(f"   Risk Factors: {', '.join(quote_info['risk_factors']) if quote_info['risk_factors'] else 'None'}")
    
    # Demo 6: Create wallet
    print("\n💰 Demo 6: Web3 Wallet Creation")
    wallet_result = system.process_command('create_wallet')
    wallet_info = wallet_result.get('result', {})
    if 'address' in wallet_info:
        print(f"💰 New Wallet Created:")
        print(f"   Address: {wallet_info['address'][:10]}...")
        if 'warning' in wallet_info:
            print(f"   Note: {wallet_info['warning']}")
    
    # Demo 7: Portfolio analysis
    print("\n📊 Demo 7: Portfolio Analysis")
    portfolio_result = system.process_command('analyze_portfolio', {
        'symbols': ['AAPL', 'GOOGL', 'MSFT']
    })
    portfolio = portfolio_result.get('result', {})
    if 'portfolio_value' in portfolio:
        print(f"📊 Portfolio Analysis:")
        print(f"   Total Value: ${portfolio['portfolio_value']:,.2f}")
        print(f"   Change: ${portfolio['total_change']:,.2f} ({portfolio['change_percent']:.2f}%)")
    
    # Demo 8: Budget recommendation
    print("\n💡 Demo 8: AI-Powered Budget Recommendation")
    budget_result = system.process_command('budget_recommendation', {
        'income': 5000,
        'expenses': {
            'housing': 1500,
            'food': 800,
            'transportation': 500,
            'utilities': 200,
            'entertainment': 300
        }
    })
    budget = budget_result.get('result', {})
    if 'savings_rate' in budget:
        print(f"💡 Budget Analysis:")
        print(f"   Monthly Income: ${budget['income']:,.2f}")
        print(f"   Total Expenses: ${budget['total_expenses']:,.2f}")
        print(f"   Savings Rate: {budget['savings_rate']*100:.1f}%")
        print(f"   Budget Health: {budget['budget_health']}")
    
    # System status
    print("\n📊 System Status:")
    status = system.get_system_status()
    print(f"   Status: {status['system_status']}")
    print(f"   Database: {status['database']}")
    print(f"   AI Models: {status['ai_models']}")
    print(f"   Active Agents: {len(status['agents'])}")
    
    print("\n" + "="*60)
    print("✅ Demo completed successfully!")
    print("The system is now ready for production use.")
    print("="*60)
    
    # Keep system running for a moment to show it's active
    print("\nSystem is running... Press Ctrl+C to stop")
    try:
        time.sleep(5)  # Run for 5 seconds in demo mode
    except KeyboardInterrupt:
        pass
    
    system.stop_system()
    print("\n👋 System stopped. Goodbye!")


if __name__ == "__main__":
    # Check if running in demo mode or interactive mode
    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        demo_system()
    else:
        # Interactive mode
        print("Multi-Agent Financial System")
        print("Run with 'python financial_system.py demo' for demonstration")
        print("Or use as a module to integrate into your application")
        
        # Start the system in interactive mode
        system = MultiAgentSystem()
        system.start_system()
        
        print("\nSystem is running. Available commands:")
        print("- create_transaction")
        print("- financial_report")
        print("- add_inventory")
        print("- calculate_mortgage")
        print("- insurance_quote")
        print("- create_wallet")
        print("- analyze_portfolio")
        print("- budget_recommendation")
        print("\nPress Ctrl+C to exit")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            system.stop_system()
            print("\n👋 System stopped. Goodbye!")