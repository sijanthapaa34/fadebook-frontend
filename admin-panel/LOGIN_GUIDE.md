# Admin Panel Login Guide

## Mock Data Overview

The admin panel uses mock data stored in `src/data/mockData.ts` for development purposes.

### Mock Data Structure

#### **Shops** (3 shops)
- **Shop 1**: Elite Barbers Downtown (ID: '1')
- **Shop 2**: Modern Cuts Studio (ID: '2')
- **Shop 3**: Classic Barber Shop (ID: '3')

#### **Barbers** (4 barbers)
- **Marcus Johnson** - Shop 1
- **David Chen** - Shop 1
- **James Rodriguez** - Shop 2
- **Michael Brown** - Shop 3

#### **Services** (9 services)
- **Shop 1**: Haircut ($40), Beard Trim ($25), Hot Towel Shave ($45), Hair Color ($90)
- **Shop 2**: Haircut ($35), Beard Trim ($20), Facial ($50)
- **Shop 3**: Haircut ($35), Hot Towel Shave ($40)

#### **Appointments** (3 appointments)
- All appointments are for today's date
- Mix of confirmed and pending statuses
- Distributed across different shops

---

## How to Login

### Login Page URL
```
http://localhost:5173/login
```
(Or whatever port your Vite dev server is running on)

### Demo Accounts

#### **Main Admin** (Full Access)
- **Email**: `main@demo.com` OR `super@demo.com` OR `admin@demo.com`
- **Password**: Any password (not validated in mock login)
- **Access**: 
  - View all shops
  - Manage all barbers
  - View all services
  - View all bookings
  - Access analytics
  - System settings

#### **Shop Admin** (Limited Access)
- **Email**: `shop@demo.com`
- **Password**: Any password (not validated in mock login)
- **Access**:
  - View only Shop ID '1' (Elite Barbers Downtown)
  - Manage barbers for Shop 1 only
  - View services for Shop 1 only
  - View bookings for Shop 1 only
  - Shop settings only

---

## Login Flow

1. Navigate to `/login` page
2. Enter one of the demo email addresses
3. Enter any password (not validated)
4. Click "Sign In"
5. After 1 second, you'll be redirected to the appropriate dashboard:
   - **Main Admin** → Main Admin Dashboard (`/pages/admin/Dashboard.tsx`)
   - **Shop Admin** → Shop Admin Dashboard (`/pages/barberadmin/Dashboard.tsx`)

---

## Role Detection Logic

The login system determines the role based on the email address:

```typescript
if (email.includes('main') || email.includes('super')) {
  role = 'main_admin';
} else if (email.includes('shop')) {
  role = 'shop_admin';
  shopId = '1'; // Assigned to Shop 1
} else {
  role = 'main_admin'; // Default fallback
}
```

---

## Important Notes

1. **Password Validation**: Currently disabled for demo purposes - any password works
2. **Shop Admin Shop ID**: Shop admins are automatically assigned to Shop ID '1' (Elite Barbers Downtown)
3. **Data Filtering**: Shop admins only see data for their assigned shop
4. **Session Storage**: Login state is stored in localStorage and persists across page refreshes
5. **Auto-redirect**: If already logged in, visiting `/login` will redirect to the dashboard

---

## Testing Different Roles

### Test Main Admin
```
Email: main@demo.com
Password: (any)
```
Expected: See all shops, all barbers, all services, all bookings

### Test Shop Admin
```
Email: shop@demo.com
Password: (any)
```
Expected: See only Shop 1 data (Elite Barbers Downtown)

---

## Logout

Click the "Logout" button in the sidebar to clear the session and return to the login page.
