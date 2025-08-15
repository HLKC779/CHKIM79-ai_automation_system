#!/usr/bin/env python3
"""
Test script to verify database structure and data
"""

import sqlite3
import json

def test_database():
    """Test the database structure and data"""
    print("🔍 Testing Database Structure and Data")
    print("=" * 50)
    
    conn = sqlite3.connect("financial_system.db")
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print(f"📋 Found {len(tables)} tables:")
    for table in tables:
        print(f"  - {table[0]}")
    
    print("\n📊 Transaction Data:")
    cursor.execute("SELECT COUNT(*) FROM transactions")
    tx_count = cursor.fetchone()[0]
    print(f"  - Total transactions: {tx_count}")
    
    cursor.execute("SELECT type, SUM(amount) FROM transactions GROUP BY type")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: ${row[1]:,.2f}")
    
    print("\n📦 Inventory Data:")
    cursor.execute("SELECT COUNT(*) FROM inventory")
    inv_count = cursor.fetchone()[0]
    print(f"  - Total items: {inv_count}")
    
    cursor.execute("SELECT name, quantity, unit_price FROM inventory")
    for row in cursor.fetchall():
        total_value = row[1] * row[2]
        print(f"  - {row[0]}: {row[1]} units @ ${row[2]:,.2f} = ${total_value:,.2f}")
    
    print("\n🏠 Loan Applications:")
    cursor.execute("SELECT COUNT(*) FROM loan_applications")
    loan_count = cursor.fetchone()[0]
    print(f"  - Total applications: {loan_count}")
    
    cursor.execute("SELECT applicant_name, loan_amount, status FROM loan_applications")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: ${row[1]:,.2f} ({row[2]})")
    
    print("\n🛡️ Insurance Policies:")
    cursor.execute("SELECT COUNT(*) FROM insurance_policies")
    ins_count = cursor.fetchone()[0]
    print(f"  - Total policies: {ins_count}")
    
    cursor.execute("SELECT policy_holder, policy_type, coverage_amount, premium FROM insurance_policies")
    for row in cursor.fetchall():
        print(f"  - {row[0]}: {row[1]} insurance, ${row[2]:,.2f} coverage, ${row[3]:,.2f} premium")
    
    conn.close()
    
    print("\n✅ Database test completed successfully!")

if __name__ == "__main__":
    test_database()