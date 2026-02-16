# Update Notification System

A universal update notification system for all HTML pages in the barbrickdesign.github.io repository. This system automatically displays a notification banner when pages are updated, showing the timestamp, user who made the update, and a description of changes.

## 🌟 Features

- ✅ **Automatic Git Integration** - Extracts commit information (date, author, message) from Git history
- ✅ **Persistent Tracking** - Uses localStorage to show notification only once per version
- ✅ **Auto-hide** - Banner automatically disappears after 8 seconds
- ✅ **Manual Close** - Users can dismiss the banner anytime with the ✕ button
- ✅ **Responsive Design** - Works perfectly on mobile and desktop
- ✅ **Consistent Styling** - Matches the site's futuristic theme
- ✅ **Zero Configuration** - Works out of the box once added to HTML files

## 📁 Files

- **`js/update-notification-system.js`** - Core notification banner system
- **`js/update-helper.js`** - Helper that auto-initializes with Git data
- **`add-update-notifications.py`** - Python script to add system to HTML files
- **`test-update-notification.html`** - Test page to verify functionality

## 🚀 Quick Start

### For New HTML Files

To add the update notification system to a new HTML file, use the Python script:

```bash
# Add to a single file
python3 add-update-notifications.py --file your-page.html

# Add to all HTML files in the repository
python3 add-update-notifications.py

# Preview changes without applying them
python3 add-update-notifications.py --dry-run
```

### Manual Installation

If you prefer to add it manually, include these elements in your HTML:

1. **Add meta tags in `<head>`** (before the closing `</head>` tag):

```html
<!-- Update Notification System Meta Information -->
<meta name="git-commit-hash" content="abc123">
<meta name="git-commit-date" content="2026-01-06T09:30:00Z">
<meta name="git-commit-author" content="Your Name">
<meta name="git-commit-message" content="Description of your changes">

<!-- Update Notification System -->
<script src="js/update-notification-system.js"></script>
<script src="js/update-helper.js"></script>
```

2. **That's it!** The system will automatically initialize and display the notification.

## 🔧 Configuration

### Default Configuration

The system uses these defaults (can be customized):

```javascript
{
  version: 'v2026.01.06',
  date: 'Jan 6, 2026',
  time: '09:30 UTC',
  description: 'Page updated with latest improvements',
  updatedBy: 'GitHub Copilot',
  autoHideDelay: 8000,  // 8 seconds
  showOnce: true        // Only show once per version
}
```

### Custom Configuration

To manually control the notification, you can use JavaScript:

```javascript
// Show notification with custom settings
UpdateNotificationSystem.init({
  version: 'v2.0.0',
  date: 'Jan 6, 2026',
  time: '10:00 UTC',
  description: 'Added awesome new features!',
  updatedBy: 'Your Name',
  autoHideDelay: 10000,
  showOnce: false
});

// Manually show notification
UpdateNotificationSystem.showManually({
  description: 'Test notification',
  updatedBy: 'Developer'
});

// Hide the banner
UpdateNotificationSystem.hideBanner();
```

## 🎨 Styling

The notification banner uses these CSS classes:

- `.universal-update-banner` - Main banner container
- `.update-banner-content` - Content wrapper
- `.update-icon` - Animated sparkle icon
- `.update-info` - Information container
- `.update-badge` - "Updated" badge
- `.update-description` - Description text
- `.update-meta` - Metadata (date, time, author)
- `.update-close-btn` - Close button

All styles are self-contained and won't conflict with existing page styles.

## 📱 Responsive Design

The banner automatically adapts to different screen sizes:

- **Desktop** (>768px): Full-width banner with all information
- **Tablet** (768px): Slightly smaller with adjusted spacing
- **Mobile** (<480px): Compact layout with stacked elements

## 🔍 Testing

Open `test-update-notification.html` in a browser to:

- See the notification banner in action
- Test manual controls
- View Git metadata extraction
- Verify responsive behavior

## 🛠️ Python Script Usage

The `add-update-notifications.py` script automates the process of adding the system to HTML files.

### Options

```bash
python3 add-update-notifications.py [OPTIONS]

Options:
  --dry-run          Show what would be done without making changes
  --file FILE        Process only this specific file
  --force            Force update even if system already exists
  -h, --help         Show help message
```

### Examples

```bash
# Preview changes for all files
python3 add-update-notifications.py --dry-run

# Add to a specific file
python3 add-update-notifications.py --file index.html

# Force update of bCert.html
python3 add-update-notifications.py --file bCert.html --force

# Process all HTML files
python3 add-update-notifications.py
```

## 📊 Git Integration

The system automatically extracts Git information:

1. **Last commit date** - Shows when the file was last modified
2. **Commit author** - Shows who made the update
3. **Commit message** - Shows what was changed
4. **Commit hash** - Stored for reference (not displayed)

If a file is not tracked in Git, it uses fallback values with the current timestamp.

## 🔐 Privacy & Storage

- Git information is extracted from the repository's history
- No external services or APIs are used
- localStorage is used only to track if a notification has been shown
- All data stays in the user's browser

## 🐛 Troubleshooting

### Notification doesn't appear

1. Check browser console for JavaScript errors
2. Verify that both script files are loaded correctly
3. Check that meta tags are present in the HTML
4. Clear localStorage and refresh: `localStorage.clear()`

### Notification appears every time

- The `showOnce: true` setting uses localStorage
- Clear localStorage to test: `localStorage.clear()`
- Check that the version hasn't changed

### Styling conflicts

- All CSS is scoped to `.universal-update-banner` and children
- The banner has `z-index: 10000` - may need adjustment if you have higher z-index elements

## 📝 Maintenance

### Updating the System

When you push updates to Git, the system automatically:

1. Extracts the latest commit information
2. Updates meta tags via the Python script
3. Displays notification on next page load

### Customizing Messages

To customize the update message for a specific commit:

```bash
git commit -m "Added new feature X - users can now do Y"
python3 add-update-notifications.py --file your-page.html
```

The commit message becomes the notification description.

## 🎯 Best Practices

1. **Write descriptive commit messages** - They become the update descriptions
2. **Run the Python script after significant changes** - Keeps notifications current
3. **Test on multiple devices** - Verify responsive behavior
4. **Don't abuse the system** - Only show important updates
5. **Keep descriptions concise** - 50-100 characters work best

## 📦 Requirements

- Python 3.6 or higher
- Git (for extracting commit information)
- Modern web browser with JavaScript enabled
- localStorage support in browser

## 🤝 Contributing

To improve the system:

1. Modify `js/update-notification-system.js` for core functionality
2. Modify `js/update-helper.js` for initialization logic
3. Update `add-update-notifications.py` for automation
4. Test with `test-update-notification.html`
5. Document changes in this README

## 📄 License

Part of the barbrickdesign.github.io repository.

## ✨ Credits

Created by GitHub Copilot for the barbrickdesign.github.io project.

---

**Last Updated:** January 6, 2026  
**Version:** 1.0.0
