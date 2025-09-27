# Admin API Endpoints Reference

## 1. Provider Management Endpoint
**URL:** `/api/admin/providers`
**Method:** GET

### Query Parameters:
- `search` (string, optional): Search providers by business name, phone, license number, email, or user name
- `status` (string, optional): Filter by provider status - 'all', 'active', 'pending', 'suspended' (default: 'all')
- `tier` (string, optional): Filter by tier - 'all', 'elite', 'professional', 'basic' (default: 'all')
  - Elite: rating >= 4.5
  - Professional: rating >= 3.5 && < 4.5
  - Basic: rating < 3.5
- `sortBy` (string, optional): Sort field - 'name', 'credits', 'acceptanceRate', 'revenue', 'createdAt' (default: 'createdAt')
- `sortOrder` (string, optional): Sort direction - 'asc' or 'desc' (default: 'desc')
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 10)

### Response Format:
```json
{
  "providers": [
    {
      "id": "uuid",
      "name": "Business Name",
      "email": "email@example.com",
      "phone": "123-456-7890",
      "status": "active" | "pending" | "suspended",
      "tier": "Elite" | "Professional" | "Basic",
      "rating": 4.5,
      "serviceArea": "City, State",
      "totalJobs": 50,
      "completedJobs": 45,
      "leadCredits": 75,
      "acceptanceRate": 85,
      "responseTime": "15 min" | "N/A",
      "revenue": 50000.00,
      "platformRevenue": 7500.00,
      "lastActive": "2025-09-27T10:00:00.000Z",
      "joinedDate": "2025-01-01T00:00:00.000Z",
      "licenseNumber": "LIC123456",
      "activeLeads": 3
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "stats": {
    "total": 100,
    "active": 75,
    "pending": 15,
    "suspended": 10,
    "totalRevenue": 750000.00,
    "avgAcceptanceRate": 82,
    "avgResponseTime": "18 min"
  }
}
```

### Database Queries:
- Fetches providers with user info, service areas, lead distributions, and jobs
- Calculates lead credits from lead distribution count
- Calculates acceptance rate from accepted leads / total leads
- Calculates average response time from lead response times
- Calculates revenue from job payouts and platform fees
- Determines tier based on rating, acceptance rate, and revenue
- Aggregates stats across all providers

---

## 2. Financial Data Endpoint
**URL:** `/api/admin/finance`
**Method:** GET

### Query Parameters:
- `timeRange` (string, optional): Time period for metrics - 'week', 'month', 'quarter', 'year' (default: 'month')
- `page` (number, optional): Page number for transactions pagination (default: 1)
- `limit` (number, optional): Transactions per page (default: 20)

### Response Format:
```json
{
  "metrics": {
    "mrr": 50000.00,
    "arr": 600000.00,
    "totalRevenue": 100000.00,
    "revenueGrowth": 15.5,
    "churnRate": 5.2,
    "ltv": 2500.00,
    "cac": 150.00,
    "collectionRate": 95.5
  },
  "revenueByTier": {
    "elite": 50000.00,
    "professional": 30000.00,
    "basic": 20000.00
  },
  "transactions": [
    {
      "id": "uuid",
      "date": "2025-09-27T10:00:00.000Z",
      "customer": "Customer Name",
      "provider": "Provider Business Name",
      "amount": 500.00,
      "commission": 75.00,
      "status": "completed",
      "type": "job_completion",
      "method": "credit_card"
    }
  ],
  "invoices": [
    {
      "id": "uuid",
      "dueDate": "2025-09-30T10:00:00.000Z",
      "customer": "Customer Name",
      "provider": "Provider Business Name",
      "amount": 400.00,
      "status": "pending" | "overdue",
      "description": "Job at 123 Main St"
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 20,
    "pages": 25
  },
  "summary": {
    "currentPeriodRevenue": 50000.00,
    "previousPeriodRevenue": 43500.00,
    "activeProviders": 75,
    "totalProviders": 100,
    "completedJobs": 250,
    "pendingInvoices": 15,
    "averageTransactionValue": 200.00
  }
}
```

### Database Queries:
- Fetches completed jobs for current and previous periods
- Calculates MRR (Monthly Recurring Revenue) from average daily platform fees
- Calculates ARR (Annual Recurring Revenue) as MRR * 12
- Calculates revenue growth comparing current to previous period
- Groups revenue by provider tier (based on rating)
- Calculates churn rate from inactive providers
- Calculates LTV (Lifetime Value) from average customer revenue
- Estimates CAC (Customer Acquisition Cost) from quote volume
- Fetches recent completed jobs as transactions
- Fetches in-progress jobs as pending invoices
- Calculates collection rate from revenue vs expected revenue

### Metrics Definitions:
- **MRR**: Monthly Recurring Revenue (average daily platform fees * 30)
- **ARR**: Annual Recurring Revenue (MRR * 12)
- **Revenue Growth**: Percentage change from previous period
- **Churn Rate**: Percentage of active providers who didn't complete jobs in period
- **LTV**: Average lifetime revenue per customer
- **CAC**: Estimated cost to acquire one customer
- **Collection Rate**: Actual revenue / expected revenue * 100

---

## Error Handling
Both endpoints include comprehensive error handling and return consistent error responses:

```json
{
  "error": "Failed to fetch providers",
  "details": "Error message details"
}
```

Status Code: 500 (Internal Server Error)

---

## Authentication
Note: These endpoints should be protected with admin authentication middleware. Consider adding:
```typescript
// Add to route.ts files
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Inside GET function:
const session = await getServerSession(authOptions)
if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}
```

---

## Database Schema Dependencies

### Provider Endpoint:
- `Provider` (main table)
- `User` (provider user info)
- `ServiceArea` (service locations)
- `LeadDistribution` (lead metrics)
- `Job` (revenue and performance)

### Finance Endpoint:
- `Job` (transactions and revenue)
- `Provider` (tier classification)
- `Quote` (customer data)
- `User` (customer acquisition)

Both endpoints use optimized Prisma queries with proper indexes and aggregations for performance.
