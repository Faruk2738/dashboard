import csv
import json
import os
import random
from collections import defaultdict
from datetime import datetime

csv_path = "/Volumes/Current Projects/yazilim/dahs board/Adventureworks.Sales.csv"
full_json_path = "/Volumes/Current Projects/yazilim/dahs board/Adventureworks.Sales.json"
dashboard_json_path = "/Volumes/Current Projects/yazilim/dahs board/dashboard_data.json"

# Territory Mapping (Dutch)
territories_map = {
    "1": {"name": "Noordwest-VS", "group": "Noord-Amerika"},
    "2": {"name": "Noordoost-VS", "group": "Noord-Amerika"},
    "3": {"name": "Centraal-VS", "group": "Noord-Amerika"},
    "4": {"name": "Zuidwest-VS", "group": "Noord-Amerika"},
    "5": {"name": "Zuidoost-VS", "group": "Noord-Amerika"},
    "6": {"name": "Canada", "group": "Noord-Amerika"},
    "7": {"name": "Frankrijk", "group": "Europa"},
    "8": {"name": "Duitsland", "group": "Europa"},
    "9": {"name": "Australië", "group": "Pacific"},
    "10": {"name": "Verenigd Koninkrijk", "group": "Europa"}
}

# Keep track of unique reseller and product keys to generate realistic metadata mapping
reseller_keys = set()
product_keys = set()

# Helper to clean numbers with comma decimal separator
def parse_numeric(val):
    if not val:
        return 0.0
    val_clean = val.strip().replace('"', '').replace(' ', '')
    val_clean = val_clean.replace(',', '.')
    try:
        return float(val_clean)
    except ValueError:
        return 0.0

def parse_int(val):
    if not val:
        return 0
    try:
        return int(val.strip())
    except ValueError:
        return 0

# Lists to hold the records for the full JSON dump
full_records = []

# Dictionaries for aggregation
# monthly_data: key is (year, month, territory_key, segment) -> values
monthly_agg = defaultdict(lambda: {"sales": 0.0, "cost": 0.0, "quantity": 0, "orders": set()})

# product_data: key is (year, territory_key, segment, product_key) -> values
product_agg = defaultdict(lambda: {"sales": 0.0, "quantity": 0})

# reseller_data: key is (year, territory_key, reseller_key) -> values
reseller_agg = defaultdict(lambda: {"sales": 0.0, "quantity": 0})

# To compute RFM (Recency, Frequency, Monetary)
customer_rfm_raw = defaultdict(lambda: {"last_date": "20170101", "orders": set(), "monetary": 0.0})

print("Reading CSV and processing records...")

max_date_str = "20170101"

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        line_key = row['SalesOrderLineKey']
        reseller_key = row['ResellerKey']
        customer_key = row['CustomerKey']
        product_key = row['ProductKey']
        order_date_key = row['OrderDateKey']
        territory_key = row['SalesTerritoryKey']
        
        qty = parse_int(row['Order_Quantity'])
        unit_price = parse_numeric(row['Unit_Price'])
        ext_amount = parse_numeric(row['Extended_Amount'])
        std_cost = parse_numeric(row['Product_Standard_Cost'])
        total_cost = parse_numeric(row['Total_Product_Cost'])
        sales_amount = parse_numeric(row['Sales_Amount'])
        
        # Track max date
        if order_date_key > max_date_str:
            max_date_str = order_date_key
            
        # Save key sets for mapping generation
        reseller_keys.add(reseller_key)
        product_keys.add(product_key)
        
        # Determine Segment
        reseller_int = parse_int(reseller_key)
        customer_int = parse_int(customer_key)
        segment = "Reseller" if reseller_int != -1 else "Customer"
        
        # Extract Order ID (SalesOrderLineKey // 1000)
        order_id = parse_int(line_key) // 1000
        
        # Extract Year & Month
        year = order_date_key[:4]
        month = order_date_key[4:6]
        
        # Cleaned record for full JSON
        record = {
            "SalesOrderLineKey": parse_int(line_key),
            "ResellerKey": reseller_int,
            "CustomerKey": customer_int,
            "ProductKey": parse_int(product_key),
            "OrderDate": f"{year}-{month}-{order_date_key[6:8]}",
            "SalesTerritoryKey": parse_int(territory_key),
            "Order_Quantity": qty,
            "Unit_Price": unit_price,
            "Extended_Amount": ext_amount,
            "Product_Standard_Cost": std_cost,
            "Total_Product_Cost": total_cost,
            "Sales_Amount": sales_amount,
            "Segment": segment
        }
        full_records.append(record)
        
        # Aggregation 1: Monthly
        m_key = (year, month, territory_key, segment)
        monthly_agg[m_key]["sales"] += sales_amount
        monthly_agg[m_key]["cost"] += total_cost
        monthly_agg[m_key]["quantity"] += qty
        monthly_agg[m_key]["orders"].add(order_id)
        
        # Aggregation 2: Product
        p_key = (year, territory_key, segment, product_key)
        product_agg[p_key]["sales"] += sales_amount
        product_agg[p_key]["quantity"] += qty
        
        # Aggregation 3: Reseller (only B2B reseller sales)
        if segment == "Reseller" and reseller_int != -1:
            r_key = (year, territory_key, reseller_key)
            reseller_agg[r_key]["sales"] += sales_amount
            reseller_agg[r_key]["quantity"] += qty
            
        # RFM Data Collection
        cust_id = (customer_key, reseller_key)
        if order_date_key > customer_rfm_raw[cust_id]["last_date"]:
            customer_rfm_raw[cust_id]["last_date"] = order_date_key
        customer_rfm_raw[cust_id]["orders"].add(order_id)
        customer_rfm_raw[cust_id]["monetary"] += sales_amount

print(f"Processed {len(full_records)} rows.")
print(f"Max date is {max_date_str}.")

# Compute RFM Segmentation
print("Calculating RFM segments...")
max_date = datetime.strptime(max_date_str, "%Y%m%d")

# Dutch RFM names
rfm_segments = {
    "Kampioenen": {"count": 0, "sales": 0.0},
    "Loyaal": {"count": 0, "sales": 0.0},
    "Nieuw": {"count": 0, "sales": 0.0},
    "Risico": {"count": 0, "sales": 0.0},
    "Slapend": {"count": 0, "sales": 0.0}
}

single_order_count = 0
returning_customer_count = 0

for cust_id, info in customer_rfm_raw.items():
    last_date = datetime.strptime(info["last_date"], "%Y%m%d")
    recency_days = (max_date - last_date).days
    frequency = len(info["orders"])
    monetary = info["monetary"]
    
    if frequency == 1:
        single_order_count += 1
    else:
        returning_customer_count += 1
        
    # Scores (1 to 5)
    if recency_days <= 30:
        r_score = 5
    elif recency_days <= 90:
        r_score = 4
    elif recency_days <= 180:
        r_score = 3
    elif recency_days <= 365:
        r_score = 2
    else:
        r_score = 1
        
    if frequency >= 10:
        f_score = 5
    elif frequency >= 5:
        f_score = 4
    elif frequency >= 3:
        f_score = 3
    elif frequency == 2:
        f_score = 2
    else:
        f_score = 1
        
    if r_score >= 4 and f_score >= 4:
        seg = "Kampioenen"
    elif r_score >= 3 and f_score >= 3:
        seg = "Loyaal"
    elif r_score >= 4 and f_score == 1:
        seg = "Nieuw"
    elif r_score <= 2 and f_score >= 2:
        seg = "Risico"
    else:
        seg = "Slapend"
        
    rfm_segments[seg]["count"] += 1
    rfm_segments[seg]["sales"] += monetary

print(f"RFM Counts: { {k: v['count'] for k, v in rfm_segments.items()} }")

# Generate Product Metadata Mapping (Dutch)
print("Generating product metadata...")
products_metadata = {}
product_prices = {}
for r in full_records:
    p_key = str(r["ProductKey"])
    if p_key not in product_prices:
        product_prices[p_key] = r["Unit_Price"]

for p_key in sorted(product_keys, key=lambda k: int(k)):
    p_id = int(p_key)
    price = product_prices.get(p_key, 0.0)
    
    if price >= 500:
        category = "Fietsen"
        subcat = "Mountainbikes" if p_id % 2 == 0 else "Racefietsen"
        if price < 1000:
            subcat = "Toerfietsen"
    elif price >= 100:
        category = "Onderdelen"
        subcat = random.choice(["Frames", "Wielen", "Sturen", "Pedalen"])
    elif price >= 20:
        category = "Kleding"
        subcat = random.choice(["Jerseys", "Shorts", "Sokken", "Handschoenen", "Helmen"])
    else:
        category = "Accessoires"
        subcat = random.choice(["Bidons & Houders", "Banden & Binnenbanden", "Schoonmaaksets", "Pompen", "Sloten"])
    
    random.seed(p_id)
    if category == "Fietsen":
        color = random.choice(["Rood", "Zwart", "Zilver", "Blauw", "Geel"])
        size = random.choice(["38", "42", "48", "52", "56"])
        model_num = random.choice(["100", "200", "300", "500", "1000"])
        name = f"{subcat[:-2] if subcat.endswith('es') else subcat[:-1]} {model_num} {color}, {size}"
    elif category == "Onderdelen":
        material = random.choice(["Carbon", "Aluminium", "Lichtmetaal"])
        name = f"{material} {subcat[:-2] if subcat.endswith('en') else subcat}"
    elif category == "Kleding":
        color = random.choice(["Rood", "Zwart", "Blauw", "Geel", "Roze", "Wit"])
        size = random.choice(["S", "M", "L", "XL"])
        name = f"Klassiek {color} {subcat[:-2] if subcat.endswith('en') else subcat}, {size}"
    else:
        name = f"Accessoire - {subcat}"
        
    products_metadata[p_key] = {
        "name": name,
        "category": category,
        "subcategory": subcat,
        "price": price
    }

# Generate Reseller Metadata Mapping
print("Generating reseller metadata...")
resellers_metadata = {}
reseller_names_pool = [
    "Advanced Bike Components", "Association of Bikes", "Bicycle Central", "Bike Store", "Cycle Spares", 
    "Elegant Bikes", "Fleet Cycles", "Golden Bike Shop", "Interactive Distributors", "Metro Bike Shop", 
    "New Cycles", "Next-Step Sports", "Optimum Bike Shop", "Progressive Sports", "Riders Association", 
    "Suburban Bikeland", "Triathlon Outfitters", "Valley Bike Shop", "West Riding Replacements",
    "Capital Bike Store", "Corner Bicycle Shop", "Cycle & Toy Center", "Downtown Athletic Club",
    "Gear 360", "Hardy Spares", "Mountain Bike Depot", "Palo Alto Bikeshop", "Seattle Bike World"
]

for r_key in sorted(reseller_keys, key=lambda k: int(k)):
    r_id = int(r_key)
    if r_id == -1:
        continue
    random.seed(r_id)
    biz_type = random.choice(["Value Added Reseller", "Specialty Bike Shop", "Warehouse"])
    base_name = random.choice(reseller_names_pool)
    resellers_metadata[r_key] = {
        "name": f"{base_name} #{r_id}",
        "business_type": biz_type
    }

# Format aggregated data for output
print("Formatting aggregated data...")
monthly_list = []
for (year, month, territory, segment), val in monthly_agg.items():
    monthly_list.append({
        "year": int(year),
        "month": int(month),
        "territory": int(territory),
        "segment": segment,
        "sales": round(val["sales"], 2),
        "cost": round(val["cost"], 2),
        "quantity": val["quantity"],
        "order_count": len(val["orders"])
    })

product_list = []
for (year, territory, segment, product_key), val in product_agg.items():
    product_list.append({
        "year": int(year),
        "territory": int(territory),
        "segment": segment,
        "product_key": int(product_key),
        "sales": round(val["sales"], 2),
        "quantity": val["quantity"]
    })

reseller_list = []
for (year, territory, reseller_key), val in reseller_agg.items():
    reseller_list.append({
        "year": int(year),
        "territory": int(territory),
        "reseller_key": int(reseller_key),
        "sales": round(val["sales"], 2),
        "quantity": val["quantity"]
    })

aggregated_data = {
    "territories": territories_map,
    "products": products_metadata,
    "resellers": resellers_metadata,
    "monthly_data": monthly_list,
    "product_sales": product_list,
    "reseller_sales": reseller_list,
    "rfm_summary": rfm_segments,
    "single_order_count": single_order_count,
    "returning_customer_count": returning_customer_count,
    "total_customers_count": len(customer_rfm_raw)
}

# Write full JSON
print(f"Writing full JSON to {full_json_path}...")
with open(full_json_path, 'w', encoding='utf-8') as f:
    json.dump(full_records, f, ensure_ascii=False, indent=2)

# Write aggregated JSON
print(f"Writing aggregated JSON to {dashboard_json_path}...")
with open(dashboard_json_path, 'w', encoding='utf-8') as f:
    json.dump(aggregated_data, f, ensure_ascii=False, indent=2)

print("Data processing complete!")
