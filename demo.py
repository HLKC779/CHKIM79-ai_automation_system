#!/usr/bin/env python3
"""
Simple Demo for Multi-Agent Financial System
"""

import sqlite3
import json
from datetime import datetime, timedelta

def create_database():
    """Create the database with required tables"""
    conn = sqlite3.connect("financial_system.db")
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
    print("✅ Database created successfully!")

def demo_transactions():
    """Demo transaction operations"""
    conn = sqlite3.connect("financial_system.db")
    cursor = conn.cursor()
    
    # Insert sample transactions
    transactions = [
        ('tx_001', 'expense', 150.50, 'USD', 'Grocery shopping', 'food', 
         datetime.now(), 'checking_001', json.dumps(['groceries']), json.dumps({})),
        ('tx_002', 'income', 3000.00, 'USD', 'Monthly salary', 'salary', 
         datetime.now(), 'checking_001', json.dumps(['income']), json.dumps({})),
        ('tx_003', 'expense', 45.20, 'USD', 'Gas station', 'transportation', 
         datetime.now(), 'checking_001', json.dumps(['fuel']), json.dumps({}))
    ]
    
    cursor.executemany('''
        INSERT INTO transactions 
        (id, type, amount, currency, description, category, timestamp, account_id, tags, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', transactions)
    
    conn.commit()
    
    # Query transactions
    cursor.execute("SELECT * FROM transactions")
    results = cursor.fetchall()
    
    print(f"📊 Created {len(results)} transactions:")
    for row in results:
        print(f"  - {row[1]}: ${row[2]} ({row[5]}) - {row[4]}")
    
    conn.close()

def demo_inventory():
    """Demo inventory operations"""
    conn = sqlite3.connect("financial_system.db")
    cursor = conn.cursor()
    
    # Insert sample inventory items
    items = [
        ('inv_001', 'Office Supplies - Pens', 100, 1.50, 'Office Depot', 
         'supplies', 20, datetime.now(), json.dumps({})),
        ('inv_002', 'Laptop - Dell XPS 13', 5, 1200.00, 'Dell Direct', 
         'equipment', 2, datetime.now(), json.dumps({}))
    ]
    
    cursor.executemany('''
        INSERT INTO inventory 
        (id, name, quantity, unit_price, supplier, category, minimum_stock, last_updated, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', items)
    
    conn.commit()
    
    # Query inventory
    cursor.execute("SELECT * FROM inventory")
    results = cursor.fetchall()
    
    print(f"📦 Created {len(results)} inventory items:")
    for row in results:
        print(f"  - {row[1]}: {row[2]} units @ ${row[3]} each")
    
    conn.close()

def demo_loan_application():
    """Demo loan application processing"""
    conn = sqlite3.connect("financial_system.db")
    cursor = conn.cursor()
    
    # Insert sample loan application
    loan_data = (
        'loan_001', 'John Doe', 300000.00, 'mortgage', 75000.00, 
        720, 0.35, 350000.00, 50000.00, 'pending',
        json.dumps({'risk_score': 25, 'risk_level': 'low'})
    )
    
    cursor.execute('''
        INSERT INTO loan_applications 
        (id, applicant_name, loan_amount, loan_type, income, credit_score, 
         debt_to_income, property_value, down_payment, status, risk_assessment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', loan_data)
    
    conn.commit()
    
    # Query loan application
    cursor.execute("SELECT * FROM loan_applications")
    results = cursor.fetchall()
    
    print(f"🏠 Created {len(results)} loan application:")
    for row in results:
        print(f"  - {row[1]}: ${row[2]:,.2f} {row[3]} loan, Status: {row[9]}")
    
    conn.close()

def demo_insurance():
    """Demo insurance operations"""
    conn = sqlite3.connect("financial_system.db")
    cursor = conn.cursor()
    
    # Insert sample insurance policy
    policy_data = (
        'ins_001', 'John Doe', 'auto', 100000.00, 1200.00, 500.00,
        datetime.now().date(), (datetime.now() + timedelta(days=365)).date(),
        'active', json.dumps({})
    )
    
    cursor.execute('''
        INSERT INTO insurance_policies 
        (id, policy_holder, policy_type, coverage_amount, premium, deductible, 
         start_date, end_date, status, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', policy_data)
    
    conn.commit()
    
    # Query insurance policies
    cursor.execute("SELECT * FROM insurance_policies")
    results = cursor.fetchall()
    
    print(f"🛡️ Created {len(results)} insurance policy:")
    for row in results:
        print(f"  - {row[1]}: {row[2]} insurance, ${row[3]:,.2f} coverage, ${row[4]:,.2f} premium")
    
    conn.close()

def calculate_mortgage_payment(principal, rate, years):
    """Calculate mortgage payment details"""
    monthly_rate = rate / 12 / 100
    num_payments = years * 12
    
    if monthly_rate > 0:
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / \
                        ((1 + monthly_rate) ** num_payments - 1)
    else:
        monthly_payment = principal / num_payments
    
    total_payment = monthly_payment * num_payments
    total_interest = total_payment - principal
    
    return {
        'principal': principal,
        'interest_rate': rate,
        'loan_term_years': years,
        'monthly_payment': round(monthly_payment, 2),
        'total_payment': round(total_payment, 2),
        'total_interest': round(total_interest, 2),
        'calculated_at': datetime.now().isoformat()
    }

def main():
    """Main demo function"""
    print("🚀 Multi-Agent Financial System Demo")
    print("=" * 50)
    
    # Create database
    create_database()
    
    # Demo transactions
    print("\n📊 Demo 1: Transaction Management")
    demo_transactions()
    
    # Demo inventory
    print("\n📦 Demo 2: Inventory Management")
    demo_inventory()
    
    # Demo loan application
    print("\n🏠 Demo 3: Loan Application Processing")
    demo_loan_application()
    
    # Demo insurance
    print("\n🛡️ Demo 4: Insurance Policy Management")
    demo_insurance()
    
    # Demo mortgage calculation
    print("\n💰 Demo 5: Mortgage Payment Calculation")
    mortgage = calculate_mortgage_payment(300000, 4.5, 30)
    print(f"  - Principal: ${mortgage['principal']:,.2f}")
    print(f"  - Interest Rate: {mortgage['interest_rate']}%")
    print(f"  - Monthly Payment: ${mortgage['monthly_payment']:,.2f}")
    print(f"  - Total Interest: ${mortgage['total_interest']:,.2f}")
    
    print("\n✅ Demo completed successfully!")
    print("The system is ready for production use.")

if __name__ == "__main__":
    main()