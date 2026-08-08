#!/usr/bin/env python3
"""
Example usage of the Multi-Agent Financial System
"""

import sqlite3
import json
from datetime import datetime, timedelta

class SimpleFinancialSystem:
    """Simplified version of the financial system for demonstration"""
    
    def __init__(self):
        self.db_path = "financial_system.db"
    
    def create_transaction(self, tx_type, amount, description, category=None):
        """Create a new transaction"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        tx_id = f"tx_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        cursor.execute('''
            INSERT INTO transactions (id, type, amount, description, category, timestamp, account_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (tx_id, tx_type, amount, description, category or 'other', datetime.now(), 'default'))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Created {tx_type}: ${amount:,.2f} - {description}")
        return tx_id
    
    def add_inventory_item(self, name, quantity, unit_price, supplier):
        """Add inventory item"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        item_id = f"inv_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        cursor.execute('''
            INSERT INTO inventory (id, name, quantity, unit_price, supplier, category, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (item_id, name, quantity, unit_price, supplier, 'general', datetime.now()))
        
        conn.commit()
        conn.close()
        
        print(f"📦 Added inventory: {name} - {quantity} units @ ${unit_price:,.2f}")
        return item_id
    
    def calculate_mortgage(self, principal, rate, years):
        """Calculate mortgage payment"""
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
            'monthly_payment': round(monthly_payment, 2),
            'total_interest': round(total_interest, 2),
            'total_payment': round(total_payment, 2)
        }
    
    def get_financial_summary(self):
        """Get financial summary"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get transaction summary
        cursor.execute("SELECT type, SUM(amount) FROM transactions GROUP BY type")
        transactions = cursor.fetchall()
        
        # Get inventory value
        cursor.execute("SELECT SUM(quantity * unit_price) FROM inventory")
        inventory_value = cursor.fetchone()[0] or 0
        
        conn.close()
        
        income = sum(amount for tx_type, amount in transactions if tx_type == 'income')
        expenses = sum(amount for tx_type, amount in transactions if tx_type == 'expense')
        net_income = income - expenses
        
        return {
            'income': income,
            'expenses': expenses,
            'net_income': net_income,
            'inventory_value': inventory_value
        }

def main():
    """Main example function"""
    print("🚀 Multi-Agent Financial System - Example Usage")
    print("=" * 60)
    
    # Initialize system
    system = SimpleFinancialSystem()
    
    # Example 1: Personal Finance Management
    print("\n💰 Example 1: Personal Finance Management")
    print("-" * 40)
    
    # Add income
    system.create_transaction('income', 5000, 'Monthly salary', 'salary')
    system.create_transaction('income', 500, 'Freelance work', 'income')
    
    # Add expenses
    system.create_transaction('expense', 1500, 'Rent payment', 'housing')
    system.create_transaction('expense', 400, 'Grocery shopping', 'food')
    system.create_transaction('expense', 200, 'Gas and utilities', 'utilities')
    system.create_transaction('expense', 150, 'Entertainment', 'entertainment')
    
    # Get summary
    summary = system.get_financial_summary()
    print(f"\n📊 Financial Summary:")
    print(f"  - Total Income: ${summary['income']:,.2f}")
    print(f"  - Total Expenses: ${summary['expenses']:,.2f}")
    print(f"  - Net Income: ${summary['net_income']:,.2f}")
    print(f"  - Savings Rate: {(summary['net_income'] / summary['income'] * 100):.1f}%")
    
    # Example 2: Small Business Inventory
    print("\n🏢 Example 2: Small Business Inventory Management")
    print("-" * 40)
    
    # Add inventory items
    system.add_inventory_item('Coffee Beans', 50, 15.99, 'Local Roaster')
    system.add_inventory_item('Milk', 20, 3.50, 'Dairy Supplier')
    system.add_inventory_item('Cups', 200, 0.25, 'Paper Products Co')
    system.add_inventory_item('Sugar', 10, 2.99, 'Bulk Foods Inc')
    
    # Get inventory summary
    summary = system.get_financial_summary()
    print(f"\n📦 Inventory Summary:")
    print(f"  - Total Inventory Value: ${summary['inventory_value']:,.2f}")
    
    # Example 3: Mortgage Planning
    print("\n🏠 Example 3: Mortgage Planning")
    print("-" * 40)
    
    # Calculate different mortgage scenarios
    scenarios = [
        {'principal': 300000, 'rate': 4.5, 'years': 30, 'name': '30-Year Fixed'},
        {'principal': 300000, 'rate': 4.0, 'years': 15, 'name': '15-Year Fixed'},
        {'principal': 300000, 'rate': 5.0, 'years': 30, 'name': 'Higher Rate'}
    ]
    
    for scenario in scenarios:
        mortgage = system.calculate_mortgage(
            scenario['principal'], 
            scenario['rate'], 
            scenario['years']
        )
        print(f"\n{scenario['name']}:")
        print(f"  - Monthly Payment: ${mortgage['monthly_payment']:,.2f}")
        print(f"  - Total Interest: ${mortgage['total_interest']:,.2f}")
        print(f"  - Total Payment: ${mortgage['total_payment']:,.2f}")
    
    # Example 4: Budget Analysis
    print("\n📈 Example 4: Budget Analysis")
    print("-" * 40)
    
    # Calculate budget percentages
    income = summary['income']
    expenses = summary['expenses']
    
    # Get expense breakdown
    conn = sqlite3.connect(system.db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT category, SUM(amount) FROM transactions WHERE type='expense' GROUP BY category")
    expense_breakdown = cursor.fetchall()
    conn.close()
    
    print(f"Budget Analysis (Monthly):")
    print(f"  - Income: ${income:,.2f}")
    print(f"  - Expenses: ${expenses:,.2f}")
    print(f"  - Savings: ${income - expenses:,.2f}")
    print(f"  - Savings Rate: {((income - expenses) / income * 100):.1f}%")
    
    print(f"\nExpense Breakdown:")
    for category, amount in expense_breakdown:
        percentage = (amount / income) * 100
        print(f"  - {category}: ${amount:,.2f} ({percentage:.1f}%)")
    
    # Example 5: Financial Recommendations
    print("\n💡 Example 5: Financial Recommendations")
    print("-" * 40)
    
    savings_rate = (income - expenses) / income
    housing_expense = next((amount for category, amount in expense_breakdown if category == 'housing'), 0)
    housing_percentage = (housing_expense / income) * 100
    
    recommendations = []
    
    if savings_rate < 0.2:
        recommendations.append("Consider increasing your savings rate to at least 20%")
    
    if housing_percentage > 0.3:
        recommendations.append("Your housing costs are above the recommended 30% of income")
    
    if not recommendations:
        recommendations.append("Great job! Your budget looks well-balanced")
    
    print("Financial Recommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"  {i}. {rec}")
    
    print("\n✅ Example usage completed successfully!")
    print("The system demonstrates real-world financial management capabilities.")

if __name__ == "__main__":
    main()