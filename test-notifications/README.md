# Test Notifications for iOS Simulator

This folder contains `.apns` files for testing push notifications on the iOS Simulator.

## Quick Start

### Method 1: Drag and Drop (Easiest)
1. Run your app in the simulator: `npm run ios`
2. Drag any `.apns` file onto the simulator window
3. Notification appears!

### Method 2: Command Line
```bash
# Send a single notification
xcrun simctl push booted org.reactjs.native.example.FadeBook appointment-booked.apns

# Test all notifications at once
chmod +x test-all-notifications.sh
./test-all-notifications.sh
```

## Available Test Notifications

| File | Description | Notification Type |
|------|-------------|-------------------|
| `appointment-booked.apns` | Customer receives booking confirmation | APPOINTMENT_BOOKED |
| `new-appointment-barber.apns` | Barber receives new booking | NEW_APPOINTMENT |
| `new-review.apns` | Barber receives new review | NEW_REVIEW |
| `review-reply.apns` | Customer receives reply to review | REVIEW_REPLY |
| `application-approved.apns` | Application status update | APPLICATION_STATUS |
| `appointment-cancelled.apns` | Appointment cancellation | APPOINTMENT_CANCELLED |
| `appointment-rescheduled.apns` | Appointment time change | APPOINTMENT_RESCHEDULED |

## Testing Scenarios

### Foreground Notification
1. Keep app open
2. Send notification
3. Alert dialog appears with "Dismiss" and "View" buttons

### Background Notification
1. Press Home (Cmd+Shift+H in simulator)
2. Send notification
3. Notification appears in notification center
4. Tap to open app

### Navigation Testing
1. Send notification while app is in background
2. Tap the notification
3. Verify app navigates to correct screen

## Customizing Notifications

Edit any `.apns` file to customize:
- Title and body text
- Badge count
- Sound
- Custom data fields

Example:
```json
{
  "Simulator Target Bundle": "org.reactjs.native.example.FadeBook",
  "aps": {
    "alert": {
      "title": "Your Custom Title",
      "body": "Your custom message here"
    },
    "badge": 5,
    "sound": "default"
  },
  "data": {
    "type": "GENERAL",
    "customField": "customValue"
  }
}
```

## Troubleshooting

### Notification not appearing?
- Ensure simulator is running
- Check Settings → Notifications → FadeBook is enabled
- Verify bundle ID matches: `org.reactjs.native.example.FadeBook`

### JSON syntax error?
- Validate your JSON at https://jsonlint.com
- Ensure all quotes are properly closed
- Check for trailing commas

### Want to reset notification permissions?
```bash
xcrun simctl privacy booted reset notifications org.reactjs.native.example.FadeBook
```

## Next Steps

After testing on simulator:
1. Test on physical device with real backend integration
2. See `../SIMULATOR_PUSH_TESTING.md` for detailed guide
3. See `../IOS_PUSH_NOTIFICATION_SETUP.md` for production setup

## Quick Commands Reference

```bash
# List running simulators
xcrun simctl list devices | grep Booted

# Send notification
xcrun simctl push booted org.reactjs.native.example.FadeBook <file.apns>

# View simulator logs
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "FadeBook"'

# Reset app
xcrun simctl uninstall booted org.reactjs.native.example.FadeBook
```

Happy testing! 🚀
