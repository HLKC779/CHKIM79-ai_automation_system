import asyncio
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import threading
import time
import schedule
import hashlib
import os

# AI and ML imports
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, 
    AutoModelForSequenceClassification, pipeline
)
import torch

# Web scraping imports
import requests
from bs4 import BeautifulSoup
import aiohttp
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

# Web3 imports
from web3 import Web3
from eth_account import Account

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        conn.commit()
        conn.close()
    
    def execute_query(self, query: str, params: tuple = None):
        """Execute database query safely"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            result = cursor.fetchall()
            conn.commit()
            return result
        except Exception as e:
            logger.error(f"Database error: {e}")
            return None
        finally:
            conn.close()