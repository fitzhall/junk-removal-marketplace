# API Documentation

## Overview

RESTful API built with Next.js API Routes. All endpoints follow REST conventions and return JSON responses.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.junkremoval.com
```

## Authentication

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2025-09-23T10:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

## Endpoints

### Customer Endpoints

#### Upload Photo & Get Quote
```http
POST /api/quotes/create
```

**Request:**
```json
{
  "photos": ["base64_image_data"],
  "location": {
    "address": "123 Main St",
    "city": "Atlanta",
    "state": "GA",
    "zipCode": "30301"
  },
  "preferredDate": "2025-09-25",
  "preferredTimeWindow": "morning",
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quoteId": "quote_123",
    "estimatedPrice": {
      "min": 150,
      "max": 250,
      "recommended": 200
    },
    "items": [
      {
        "type": "couch",
        "quantity": 1,
        "confidence": 0.95
      },
      {
        "type": "mattress",
        "quantity": 2,
        "confidence": 0.88
      }
    ],
    "volume": "half_truck",
    "availableProviders": 3,
    "expiresAt": "2025-09-30T10:00:00Z"
  }
}
```

#### Get Quote Details
```http
GET /api/quotes/:quoteId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quote": {
      "id": "quote_123",
      "status": "pending",
      "items": [],
      "pricing": {},
      "customer": {},
      "createdAt": "2025-09-23T10:00:00Z"
    }
  }
}
```

#### Accept Quote
```http
POST /api/quotes/:quoteId/accept
```

**Request:**
```json
{
  "providerId": "provider_123",
  "scheduledDate": "2025-09-25",
  "scheduledTime": "09:00-11:00",
  "paymentMethod": "card"
}
```

#### Track Job
```http
GET /api/jobs/:jobId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "job_123",
      "status": "in_progress",
      "provider": {
        "name": "Quick Junk Removal",
        "phone": "+1234567890",
        "rating": 4.8
      },
      "estimatedArrival": "2025-09-25T10:30:00Z",
      "trackingUrl": "https://track.example.com/job_123"
    }
  }
}
```

### Provider Endpoints

#### Register Provider
```http
POST /api/providers/register
```

**Request:**
```json
{
  "businessInfo": {
    "name": "Quick Junk Removal",
    "address": "456 Business Ave",
    "phone": "+1234567890",
    "licenseNumber": "JR-12345"
  },
  "serviceAreas": [
    {
      "zipCode": "30301",
      "city": "Atlanta",
      "state": "GA",
      "maxRadius": 25
    }
  ],
  "capabilities": {
    "truckSizes": ["half", "full"],
    "specialItems": ["appliances", "electronics"],
    "sameDay": true
  }
}
```

#### Get Available Leads
```http
GET /api/providers/leads
```

**Query Parameters:**
- `status`: pending|viewed|accepted
- `zipCode`: Filter by zip code
- `date`: Filter by date
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "lead_123",
        "quoteId": "quote_123",
        "location": {
          "city": "Atlanta",
          "state": "GA",
          "distance": 5.2
        },
        "estimatedValue": 200,
        "items": ["couch", "mattress"],
        "preferredDate": "2025-09-25",
        "createdAt": "2025-09-23T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pages": 5
    }
  }
}
```

#### Accept Lead
```http
POST /api/providers/leads/:leadId/accept
```

**Request:**
```json
{
  "bidAmount": 180,
  "message": "We can pick up your items tomorrow morning!",
  "availableSlots": [
    "2025-09-25T09:00:00Z",
    "2025-09-25T14:00:00Z"
  ]
}
```

#### Update Job Status
```http
PATCH /api/providers/jobs/:jobId/status
```

**Request:**
```json
{
  "status": "completed",
  "completionPhotos": ["url1", "url2"],
  "notes": "All items removed successfully",
  "finalPrice": 185
}
```

### AI Vision Endpoints

#### Analyze Photo
```http
POST /api/ai/analyze-photo
```

**Request:**
```json
{
  "image": "base64_encoded_image",
  "context": {
    "location": "indoor",
    "roomType": "garage"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "refrigerator",
        "confidence": 0.92,
        "category": "appliance",
        "estimatedWeight": 250,
        "specialHandling": true
      }
    ],
    "totalVolume": "quarter_truck",
    "processingTime": 1250
  }
}
```

### Admin Endpoints

#### Dashboard Stats
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalQuotes": 1234,
      "totalJobs": 890,
      "totalRevenue": 45000,
      "activeProviders": 25
    },
    "trends": {
      "quotesThisWeek": 45,
      "conversionRate": 0.72,
      "avgQuoteValue": 195
    }
  }
}
```

#### Pricing Rules Management
```http
GET /api/admin/pricing-rules
POST /api/admin/pricing-rules
PATCH /api/admin/pricing-rules/:ruleId
DELETE /api/admin/pricing-rules/:ruleId
```

### Webhook Endpoints

#### Stripe Webhooks
```http
POST /api/webhooks/stripe
```

#### Twilio Webhooks
```http
POST /api/webhooks/twilio
```

## Rate Limiting

### Limits
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 500 requests/minute
- AI endpoints: 10 requests/minute

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1695465600
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `AUTH_INVALID` | Invalid authentication token |
| `PERMISSION_DENIED` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `RATE_LIMIT` | Rate limit exceeded |
| `AI_PROCESSING_ERROR` | AI analysis failed |
| `PAYMENT_FAILED` | Payment processing failed |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

## Pagination

### Request
```http
GET /api/quotes?page=2&limit=20&sort=createdAt&order=desc
```

### Response
```json
{
  "data": [],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Webhooks

### Quote Created
```json
{
  "event": "quote.created",
  "data": {
    "quoteId": "quote_123",
    "customerId": "user_456"
  },
  "timestamp": "2025-09-23T10:00:00Z"
}
```

### Job Completed
```json
{
  "event": "job.completed",
  "data": {
    "jobId": "job_123",
    "providerId": "provider_456",
    "finalPrice": 185
  },
  "timestamp": "2025-09-23T14:00:00Z"
}
```

## Testing

### Postman Collection
Available at: `/docs/postman-collection.json`

### Test Credentials
```
Email: test@example.com
Password: TestPass123!
API Key: test_api_key_123
```

### Test Card Numbers
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```