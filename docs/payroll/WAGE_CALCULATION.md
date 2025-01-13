# Wage Calculation System

## Overview
The wage calculation system provides accurate apprentice wage determination and host employer charge calculations through an AI-assisted interface. It combines award interpretation, cost calculations, and template management.

## Core Components

### 1. Pay Rate Assistant
- Conversational interface for award interpretation
- Real-time rate suggestions based on classifications
- Award and classification selection
- Historical chat tracking

### 2. Charge Calculator
- Base rate calculations
- Markup and additional charges
- Cost breakdown visualization
- Template management

### 3. Wage Calculator
- Statutory contribution calculations
- Leave entitlement handling
- Training cost incorporation
- Government funding offsets

## Data Schema

### Award Data Structure
| Resource Type | Field Name | Data Type | Description |
|--------------|------------|------------|-------------|
| Award | award_fixed_id | Integer | Unique code fixed over each year |
| Award | award_id | Integer | Unique identification number |
| Award | code | String | Award number |
| Award | name | String | Human readable title |
| Award | published_year | Integer | Annual wage review year |

### Classification Data
| Field | Type | Description |
|-------|------|-------------|
| classification_fixed_id | Integer | Unique ID fixed over each year |
| classification_level | Integer | Hierarchical level number |
| base_rate | Decimal | Base pay rate |
| calculated_rate | Decimal | Derived rate from base |
| employee_rate_type_code | String | AD (Adult), JN (Junior), AP (Apprentice) etc. |

### Allowances & Penalties
- Wage allowances (percentage or fixed amount)
- Expense allowances (CPI adjusted)
- Penalty rates (percentage of base)
- All-purpose vs specific purpose

## Business Rules

### Award Interpretation
- Base rates from current awards
- Progression through apprenticeship levels
- Allowance and penalty calculations
- Leave loading and entitlements

### Cost Components
1. Base Wage
   - Award rate
   - Classification level
   - Employment type

2. Statutory Contributions
   - Superannuation
   - Workers compensation
   - Payroll tax

3. Additional Costs
   - Training fees
   - Insurance
   - Administration
   - PPE and equipment

4. Adjustments
   - Government funding
   - Training subsidies
   - GTO margin

## Templates

### Standard Templates
- Full-time apprentice
- Part-time apprentice
- School-based apprentice

### Template Structure
```typescript
interface WageTemplate {
  name: string;
  employmentType: 'full_time' | 'part_time' | 'casual';
  defaultHours: number;
  gtoMargin: number;
  adminFee: number;
  allowances: AllowanceConfig[];
  deductions: DeductionConfig[];
}
```

## Calculations

### Hourly Rate
```
hourlyRate = baseRate + allowances + penalties
```

### Weekly Cost
```
weeklyCost = (hourlyRate × weeklyHours) + 
             superannuation + 
             workersComp +
             (trainingCosts ÷ 52) +
             adminFee
```

### Charge Rate
```
chargeRate = weeklyCost × (1 + marginPercentage) ÷ weeklyHours
```

## Integration

### Fair Work API
- Award data synchronization
- Rate updates
- Compliance checking

### Payroll System
- Rate export
- Cost center allocation
- Payment processing