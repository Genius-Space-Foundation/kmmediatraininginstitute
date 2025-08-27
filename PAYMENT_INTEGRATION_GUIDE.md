# Paystack Payment Integration Guide

## Overview

This guide explains the Paystack payment integration for the KM Media Training Institute course application system. Students are required to pay a ₵100 application fee before their course application can be submitted.

## Features

### ✅ **Payment Flow**

- **Application Fee**: ₵100 (configurable)
- **Payment Gateway**: Paystack
- **Currency**: Ghanaian Cedi (GHS)
- **Payment Methods**: Card, Bank Transfer, Mobile Money, USSD, QR Code

### ✅ **Security Features**

- Payment verification with Paystack
- Webhook handling for real-time updates
- Payment reference tracking
- Duplicate payment prevention

## Setup Instructions

### 1. **Environment Configuration**

Add the following variables to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret_here

# Application Configuration
APPLICATION_FEE=100
CURRENCY=GHS
CLIENT_URL=http://localhost:3000
```

### 2. **Database Migration**

Run the payment table migration:

```bash
# Connect to your PostgreSQL database
psql -d your_database_name -f server/src/database/payment-migration.sql
```

### 3. **Install Dependencies**

```bash
# Install server dependencies
cd server
npm install paystack uuid

# Install TypeScript types
npm install --save-dev @types/uuid
```

## Payment Flow

### **Step 1: Application Form**

1. Student fills out the comprehensive application form
2. Form includes all KM Media Training Institute requirements
3. Student clicks "Pay ₵100 & Submit Application"

### **Step 2: Payment Initialization**

1. System creates payment record in database
2. Paystack payment is initialized
3. Student is redirected to Paystack payment gateway

### **Step 3: Payment Processing**

1. Student completes payment on Paystack
2. Paystack redirects back to application with reference
3. System verifies payment with Paystack

### **Step 4: Application Submission**

1. If payment is successful, application is submitted
2. Student receives confirmation
3. Application is stored with payment reference

## API Endpoints

### **Initialize Payment**

```http
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": 1,
  "amount": 100,
  "email": "student@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+233123456789"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "reference": "KM_MEDIA_abc123def456",
    "accessCode": "access_code_here"
  }
}
```

### **Verify Payment**

```http
POST /api/payments/verify
Content-Type: application/json

{
  "reference": "KM_MEDIA_abc123def456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "status": "success",
    "reference": "KM_MEDIA_abc123def456",
    "amount": 100,
    "paidAt": "2024-01-15T10:30:00Z",
    "channel": "card",
    "currency": "GHS"
  }
}
```

### **Payment History**

```http
GET /api/payments/history
Authorization: Bearer <token>
```

## Database Schema

### **Payments Table**

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "courseId" INTEGER NOT NULL REFERENCES courses(id),
  reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'GHS',
  status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed')),
  "paymentMethod" VARCHAR(50) DEFAULT 'paystack',
  metadata JSONB,
  "paidAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Components

### **Payment Flow States**

1. **Form State**: Student fills application form
2. **Payment State**: Redirecting to payment gateway
3. **Complete State**: Payment successful, application submitted

### **Payment Callback**

- Handles return from Paystack
- Verifies payment status
- Shows success/failure messages
- Redirects to dashboard

## Webhook Configuration

### **Paystack Webhook URL**

```
https://your-domain.com/api/payments/webhook
```

### **Webhook Events**

- `charge.success`: Payment completed successfully
- `charge.failed`: Payment failed

### **Webhook Security**

- Verify webhook signature
- Process events asynchronously
- Update payment records
- Send notifications

## Error Handling

### **Common Error Scenarios**

1. **Payment Initialization Failed**

   - Invalid course ID
   - User already paid
   - Paystack API error

2. **Payment Verification Failed**

   - Invalid reference
   - Payment not found
   - Verification timeout

3. **Application Submission Failed**
   - Payment not verified
   - Database error
   - Validation error

## Testing

### **Test Payment Flow**

1. Use Paystack test keys
2. Test with test card numbers
3. Verify webhook handling
4. Test error scenarios

### **Test Cards (Paystack)**

- **Success**: 4084 0840 8408 4081
- **Failed**: 4084 0840 8408 4082
- **Insufficient Funds**: 4084 0840 8408 4083

## Security Considerations

### **Payment Security**

- Always verify payments server-side
- Use HTTPS for all payment communications
- Validate webhook signatures
- Store payment references securely

### **Data Protection**

- Encrypt sensitive payment data
- Log payment activities
- Implement rate limiting
- Monitor for suspicious activity

## Monitoring & Analytics

### **Payment Metrics**

- Success rate
- Average payment time
- Failed payment reasons
- Revenue tracking

### **Logging**

- Payment initialization logs
- Verification logs
- Webhook processing logs
- Error logs

## Troubleshooting

### **Common Issues**

1. **Payment Not Initializing**

   - Check Paystack API keys
   - Verify environment variables
   - Check network connectivity

2. **Payment Verification Fails**

   - Verify reference format
   - Check Paystack transaction status
   - Review webhook configuration

3. **Application Not Submitting**
   - Verify payment status
   - Check database connectivity
   - Review validation rules

## Support

For payment-related issues:

1. Check Paystack documentation
2. Review server logs
3. Verify webhook configuration
4. Contact technical support

## References

- [Paystack API Documentation](https://paystack.com/docs/api)
- [Paystack Webhook Guide](https://paystack.com/docs/payments/webhooks)
- [Paystack Test Cards](https://paystack.com/docs/payments/test-cards)

