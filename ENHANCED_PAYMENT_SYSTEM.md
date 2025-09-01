# Enhanced Payment System Documentation

## Overview

The KM Media Training Institute has implemented a comprehensive payment system that clearly distinguishes between **Application Fees** and **Course Fees**, with support for installment payments. This system provides flexibility for students while maintaining financial clarity and transparency.

## Payment Structure

### 1. Application Fee

- **Amount**: ₵100 (one-time, non-refundable)
- **Purpose**: To apply for a course
- **When Paid**: Before course application submission
- **Payment Type**: Single payment
- **Status**: Required for course application

### 2. Course Fee

- **Amount**: Varies by course (₵500 - ₵5,000+)
- **Purpose**: Actual training and course materials
- **When Paid**: After successful application
- **Payment Type**: Full payment or installments
- **Status**: Required for course access

## Enhanced Features

### ✅ **Dual Payment System**

- Clear separation between application and course fees
- Different payment flows for each type
- Independent tracking and management

### ✅ **Installment Payment Plans**

- Flexible payment options (weekly, monthly, quarterly)
- Up to 12 installments per course
- Automatic balance tracking
- Due date management

### ✅ **Payment Status Tracking**

- Real-time payment status updates
- Installment progress monitoring
- Payment history and receipts

### ✅ **Enhanced Security**

- Paystack integration for secure payments
- Webhook verification for real-time updates
- Duplicate payment prevention
- Payment verification system

## Database Schema

### Payments Table

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "courseId" INTEGER NOT NULL REFERENCES courses(id),
  reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'GHS',
  "paymentType" VARCHAR(50) NOT NULL CHECK("paymentType" IN ('application_fee', 'course_fee', 'installment')),
  status VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'success', 'failed', 'cancelled')),
  "paymentMethod" VARCHAR(50) DEFAULT 'paystack',
  "installmentNumber" INTEGER DEFAULT NULL,
  "totalInstallments" INTEGER DEFAULT NULL,
  "installmentAmount" DECIMAL(10,2) DEFAULT NULL,
  "remainingBalance" DECIMAL(10,2) DEFAULT NULL,
  metadata JSONB,
  "paidAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Course Fee Installments Table

```sql
CREATE TABLE course_fee_installments (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "courseId" INTEGER NOT NULL REFERENCES courses(id),
  "totalCourseFee" DECIMAL(10,2) NOT NULL,
  "applicationFeePaid" BOOLEAN DEFAULT FALSE,
  "applicationFeeReference" VARCHAR(255),
  "totalInstallments" INTEGER NOT NULL,
  "installmentAmount" DECIMAL(10,2) NOT NULL,
  "paidInstallments" INTEGER DEFAULT 0,
  "remainingBalance" DECIMAL(10,2) NOT NULL,
  "nextDueDate" DATE,
  "paymentPlan" VARCHAR(50) DEFAULT 'monthly' CHECK("paymentPlan" IN ('weekly', 'monthly', 'quarterly')),
  status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'completed', 'defaulted', 'cancelled')),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Payment Flow

### Application Fee Flow

1. **Student Application**: Student fills out course application form
2. **Payment Initialization**: System creates payment record for ₵100
3. **Payment Gateway**: Redirect to Paystack for payment
4. **Payment Processing**: Student completes payment
5. **Verification**: System verifies payment with Paystack
6. **Application Submission**: Course application is submitted
7. **Registration**: Student is registered for the course

### Course Fee Flow

1. **Installment Plan Creation**: Student creates payment plan
2. **Plan Configuration**: Choose number of installments and frequency
3. **Installment Payments**: Pay installments as scheduled
4. **Balance Tracking**: System tracks remaining balance
5. **Completion**: Course fee fully paid

## API Endpoints

### Application Fee Payment

```http
POST /api/payments/initialize
{
  "courseId": 1,
  "amount": 100,
  "email": "student@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+233123456789",
  "paymentType": "application_fee"
}
```

### Course Fee Installment Plan

```http
POST /api/payments/installment-plan
{
  "courseId": 1,
  "totalCourseFee": 2000,
  "totalInstallments": 6,
  "paymentPlan": "monthly"
}
```

### Installment Payment

```http
POST /api/payments/initialize
{
  "courseId": 1,
  "amount": 334,
  "paymentType": "installment",
  "installmentNumber": 1,
  "totalInstallments": 6,
  "installmentAmount": 334,
  "remainingBalance": 1666
}
```

### Get Installment Plans

```http
GET /api/payments/installment-plans
GET /api/payments/installment-plan/:courseId
```

## Frontend Components

### CourseFeeInstallmentModal

- **Purpose**: Manage course fee installment plans
- **Features**:
  - Create new installment plans
  - View current plan status
  - Pay installments
  - Track payment progress

### Enhanced CourseDetail Page

- **Application Fee**: Clear indication of ₵100 application fee
- **Course Fee**: Display total course fee
- **Installment Management**: Button to manage course fee installments

## Payment Types

### 1. Application Fee (`application_fee`)

- One-time payment for course application
- Required before application submission
- Non-refundable
- Creates course registration upon success

### 2. Course Fee (`course_fee`)

- Full payment for course access
- Can be paid in full or installments
- Required for course materials access

### 3. Installment (`installment`)

- Partial payment for course fee
- Part of installment plan
- Updates remaining balance
- Tracks payment progress

## Payment Statuses

### Payment Status

- `pending`: Payment initiated but not completed
- `success`: Payment completed successfully
- `failed`: Payment failed
- `cancelled`: Payment cancelled

### Installment Plan Status

- `active`: Plan is active and accepting payments
- `completed`: All installments paid
- `defaulted`: Payment overdue
- `cancelled`: Plan cancelled

## Security Features

### Payment Verification

- Real-time verification with Paystack
- Webhook signature validation
- Duplicate payment prevention
- Payment reference tracking

### Data Protection

- Encrypted payment data
- Secure API endpoints
- User authentication required
- Audit trail for all payments

## User Experience

### Application Process

1. **Course Selection**: Choose desired course
2. **Application Form**: Fill out comprehensive form
3. **Application Fee**: Pay ₵100 application fee
4. **Confirmation**: Receive application confirmation
5. **Course Fee**: Set up installment plan or pay in full

### Installment Management

1. **Plan Creation**: Choose payment frequency and installments
2. **Payment Schedule**: View upcoming payments
3. **Payment Processing**: Pay installments as due
4. **Progress Tracking**: Monitor payment progress
5. **Completion**: Access course upon full payment

## Benefits

### For Students

- **Flexibility**: Choose payment plan that works
- **Transparency**: Clear fee structure
- **Accessibility**: Manageable payment amounts
- **Security**: Secure payment processing

### For Institution

- **Revenue Management**: Predictable cash flow
- **Student Retention**: Flexible payment options
- **Administrative Efficiency**: Automated payment tracking
- **Financial Clarity**: Clear separation of fees

## Configuration

### Environment Variables

```env
# Payment Configuration
APPLICATION_FEE=100
CURRENCY=GHS

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_PUBLIC_KEY=pk_test_your_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Application Configuration
CLIENT_URL=http://localhost:3000
```

### Payment Plans

- **Weekly**: 7-day intervals
- **Monthly**: 30-day intervals
- **Quarterly**: 90-day intervals

### Installment Limits

- **Minimum**: 2 installments
- **Maximum**: 12 installments
- **Default**: 3 installments

## Monitoring and Analytics

### Payment Analytics

- Total revenue tracking
- Payment success rates
- Installment completion rates
- Payment method preferences

### Student Analytics

- Payment behavior patterns
- Installment plan preferences
- Payment completion rates
- Default rate monitoring

## Support and Maintenance

### Payment Issues

- Failed payment handling
- Refund processing
- Payment dispute resolution
- Technical support

### System Maintenance

- Regular security updates
- Payment gateway monitoring
- Database optimization
- Performance monitoring

## Future Enhancements

### Planned Features

- **Multiple Payment Methods**: Additional payment gateways
- **Advanced Analytics**: Detailed payment insights
- **Automated Reminders**: Payment due notifications
- **Mobile Payments**: USSD and mobile money integration
- **International Payments**: Multi-currency support

### Integration Opportunities

- **Accounting Systems**: QuickBooks, Xero integration
- **CRM Systems**: Customer relationship management
- **Marketing Tools**: Payment-based marketing automation
- **Reporting Tools**: Advanced financial reporting

## Conclusion

The enhanced payment system provides a professional, flexible, and secure solution for managing both application fees and course fees. The clear separation of payment types, combined with installment payment options, ensures a positive user experience while maintaining financial clarity and operational efficiency.

This system supports the growth and scalability of the KM Media Training Institute while providing students with accessible and manageable payment options for their educational investment.


