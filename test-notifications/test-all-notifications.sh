#!/bin/bash

BUNDLE_ID="org.reactjs.native.example.FadeBook"

echo "🧪 Testing FadeBook Push Notifications on Simulator"
echo "=================================================="
echo ""

# Check if simulator is running
if ! xcrun simctl list devices | grep -q "Booted"; then
    echo "❌ No simulator is running. Please start the simulator first."
    exit 1
fi

echo "✅ Simulator is running"
echo ""

# Test each notification type
notifications=(
    "appointment-booked.apns:Appointment Booked"
    "new-appointment-barber.apns:New Appointment (Barber)"
    "new-review.apns:New Review"
    "review-reply.apns:Review Reply"
    "application-approved.apns:Application Approved"
    "appointment-cancelled.apns:Appointment Cancelled"
    "appointment-rescheduled.apns:Appointment Rescheduled"
)

for item in "${notifications[@]}"; do
    IFS=':' read -r file description <<< "$item"
    
    if [ -f "$file" ]; then
        echo "📱 Sending: $description"
        xcrun simctl push booted "$BUNDLE_ID" "$file"
        echo "   ✓ Sent"
        sleep 2
    else
        echo "⚠️  Skipping: $file (not found)"
    fi
    echo ""
done

echo "=================================================="
echo "✅ All notifications sent!"
echo ""
echo "Check your simulator for notifications."
echo "If app is in foreground, you'll see alerts."
echo "If app is in background, check notification center."
