# Data Import Instructions

This guide helps you import your 2k words from your phone app into the default application data.

## 📋 Prerequisites

1. **Export Data from Phone**: Use the backup/export feature in your phone app to create a JSON file
2. **Transfer File**: Copy the exported JSON file to your computer
3. **PowerShell**: Ensure PowerShell is available (Windows 10/11 have it by default)

## 🚀 Quick Start

### Method 1: Using the Batch File (Easiest)
1. Double-click `import-data.bat`
2. Enter the path to your exported JSON file
3. Choose if you want to do a dry run first (recommended)
4. Follow the prompts

### Method 2: Using PowerShell Directly
```powershell
# Dry run (preview changes without applying them)
.\import-data.ps1 -ImportFilePath "C:\path\to\your\export.json" -DryRun

# Actual import
.\import-data.ps1 -ImportFilePath "C:\path\to\your\export.json"
```

## 📁 Expected Export File Format

Your export file should contain:
```json
{
  "version": "1.0",
  "words": [
    {
      "id": "1",
      "italian": "ciao",
      "english": "hello",
      "groupId": "greetings",
      "difficulty": "beginner",
      "details": "Common greeting",
      "example": "Ciao, come stai?",
      "wrongAttempts": 0,
      "correctAttempts": 5,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "lastReviewed": "2024-01-02T10:00:00.000Z",
      "learned": false
    }
  ],
  "wordGroups": [
    {
      "id": "greetings",
      "name": "Greetings",
      "description": "Common greetings and salutations",
      "color": "#3b82f6",
      "icon": "👋",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "settings": {
    "theme": "dark",
    "language": "en",
    "notifications": true,
    "autoBackup": true,
    "lastBackup": "2024-01-02T10:00:00.000Z"
  }
}
```

## 🔧 What the Script Does

1. **Backup**: Creates automatic backup of existing data files
2. **Merge Words**: 
   - Adds new words with unique IDs
   - Updates existing words (matched by Italian + English text)
   - Preserves learning progress and statistics
3. **Merge Categories**: 
   - Adds new word groups/categories
   - Updates existing groups with new information
4. **Merge Settings**: 
   - Updates settings but preserves your current theme choice
5. **Summary**: Shows detailed report of what was imported

## 📊 Output Example

```
🇮🇹 Italian Quiz App - Data Import Script
==========================================
📂 Import File: C:\Downloads\my-export.json
📂 App Data Directory: .\public\data
✅ Successfully loaded import data
📚 Loaded 1000 existing words
📁 Loaded 5 existing groups
⚙️ Loaded existing settings

🔄 Processing imported data...
📝 Processing 2000 imported words...
📁 Processing 15 imported groups...
⚙️ Merging settings...

📊 Import Summary:
==================
📝 Words: 1200 new, 800 updated
📁 Groups: 12 new, 3 updated
📚 Total Words: 2200
📁 Total Groups: 17

💾 Backup created: .\public\data\backup_20241011_142530
✅ Words saved to .\public\data\words.json
✅ Groups saved to .\public\data\groups.json
✅ Settings saved to .\public\data\settings.json

🎉 Import completed successfully!
🔄 Restart the application to see the imported data.
```

## ⚠️ Important Notes

- **Backup**: The script automatically creates backups before making changes
- **Duplicates**: Words are matched by Italian + English text (case-insensitive)
- **IDs**: New words get fresh IDs to avoid conflicts
- **Theme**: Your current theme selection is preserved
- **Restart**: You need to restart the dev server to see imported data

## 🔍 Troubleshooting

### "File not found" error
- Check the file path is correct
- Use full path with quotes if it contains spaces
- Ensure the file is a valid JSON file

### "Failed to parse JSON" error
- Verify the export file is valid JSON
- Check if the file was corrupted during transfer
- Try opening the file in a text editor to verify content

### PowerShell execution policy error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### No changes visible after import
- Restart the development server (`npm run dev`)
- Clear browser cache and localStorage
- Check the console for any errors

## 🆘 Recovery

If something goes wrong:
1. Stop the development server
2. Restore files from the backup folder created by the script
3. Restart the development server

The backup folder is named with timestamp: `backup_YYYYMMDD_HHMMSS`