# Firestore Security Rules Deployment Guide

## Quick Fix for Permission Errors

You're seeing `Missing or insufficient permissions` errors because the new Firestore collections (`taskRevisionRequests` and `contentSubmissionRequests`) don't have security rules configured yet.

## Option 1: Deploy via Firebase CLI (Recommended)

If you have Firebase CLI installed:

```bash
# Make sure you're in the project directory
cd c:/Users/Lenovo/documents/thedeveloper/javascript/jira

# Deploy the rules
firebase deploy --only firestore:rules
```

## Option 2: Manual Update via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. Replace the entire content with the rules from `firestore.rules` file
6. Click **Publish**

## What Changed

### New Collections Added:
1. **taskRevisionRequests** - Students request changes to existing tasks
2. **contentSubmissionRequests** - Students submit new tasks/announcements

### Security Rules for New Collections:

```javascript
// Task revision requests
match /taskRevisionRequests/{requestId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
  allow update: if isAdmin();
  allow delete: if isAdmin();
}

// Content submission requests
match /contentSubmissionRequests/{requestId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
  allow update: if isAdmin();
  allow delete: if isAdmin();
}
```

## Testing After Deployment

Once rules are deployed, test these actions:

### As Student:
1. ✅ Click "Request Revision" on any task
2. ✅ Submit the revision form
3. ✅ Click "Submit New Content" button
4. ✅ Submit a new task or announcement
5. ✅ View your submission history

### As Admin:
1. ✅ Go to "Revision Requests" tab
2. ✅ Approve or reject a revision
3. ✅ Go to "Content Submissions" tab
4. ✅ Approve or reject a submission

## Troubleshooting

### Still getting permission errors?
- Clear browser cache and reload
- Check Firebase Console > Firestore Database > Rules to verify they're published
- Verify the timestamp shows recent deployment

### Rules not updating?
- Sometimes takes 1-2 minutes to propagate
- Try logging out and back in to refresh auth token

### Need to verify rules are correct?
In Firebase Console Rules tab, use the "Rules Playground" to simulate requests:
- Collection: `taskRevisionRequests`
- Document ID: `test123`
- Request type: `create`
- Should show: ✅ Allowed

## Quick Copy-Paste for Firebase Console

If manually updating, copy everything from line 1 to the end of `firestore.rules` file.

The complete rules file is at: `firestore.rules`
