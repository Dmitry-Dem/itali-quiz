# Import Data Merger for Italian Quiz App
# This script merges exported JSON data with the application's default data files

param(
    [Parameter(Mandatory=$true)]
    [string]$ImportFilePath,
    
    [Parameter(Mandatory=$false)]
    [string]$AppDataPath = ".\public\data",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

Write-Host "Italian Quiz App - Data Import Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if import file exists
if (-not (Test-Path $ImportFilePath)) {
    Write-Error "Import file not found: $ImportFilePath"
    exit 1
}

# Check if app data directory exists
if (-not (Test-Path $AppDataPath)) {
    Write-Error "App data directory not found: $AppDataPath"
    exit 1
}

Write-Host "Import File: $ImportFilePath" -ForegroundColor Green
Write-Host "App Data Directory: $AppDataPath" -ForegroundColor Green

# Load import data
try {
    $importData = Get-Content $ImportFilePath -Raw | ConvertFrom-Json
    Write-Host "Successfully loaded import data" -ForegroundColor Green
} catch {
    Write-Error "Failed to parse import JSON file: $($_.Exception.Message)"
    exit 1
}

# Load existing application data
$wordsFile = Join-Path $AppDataPath "words.json"
$groupsFile = Join-Path $AppDataPath "groups.json"
$settingsFile = Join-Path $AppDataPath "settings.json"

$existingWords = @()
$existingGroups = @()
$existingSettings = $null

if (Test-Path $wordsFile) {
    try {
        $existingWords = Get-Content $wordsFile -Raw | ConvertFrom-Json
        Write-Host "Loaded $($existingWords.Count) existing words" -ForegroundColor Yellow
    } catch {
        Write-Warning "Failed to load existing words: $($_.Exception.Message)"
    }
}

if (Test-Path $groupsFile) {
    try {
        $existingGroups = Get-Content $groupsFile -Raw | ConvertFrom-Json
        Write-Host "Loaded $($existingGroups.Count) existing groups" -ForegroundColor Yellow
    } catch {
        Write-Warning "Failed to load existing groups: $($_.Exception.Message)"
    }
}

if (Test-Path $settingsFile) {
    try {
        $existingSettings = Get-Content $settingsFile -Raw | ConvertFrom-Json
        Write-Host "Loaded existing settings" -ForegroundColor Yellow
    } catch {
        Write-Warning "Failed to load existing settings: $($_.Exception.Message)"
    }
}

# Initialize counters
$newWordsCount = 0
$newGroupsCount = 0
$updatedWordsCount = 0
$updatedGroupsCount = 0

# Process imported data
Write-Host ""
Write-Host "Processing imported data..." -ForegroundColor Cyan

# Merge Words
if ($importData.words) {
    Write-Host "Processing $($importData.words.Count) imported words..." -ForegroundColor Blue
    
    # Convert existing words to hashtable for faster lookup
    $existingWordsHash = @{}
    foreach ($word in $existingWords) {
        $key = "$($word.italian.ToLower())-$($word.english.ToLower())"
        $existingWordsHash[$key] = $word
    }
    
    # Find next available ID
    $maxId = 0
    if ($existingWords.Count -gt 0) {
        $maxId = ($existingWords | ForEach-Object { [int]$_.id } | Measure-Object -Maximum).Maximum
    }
    
    foreach ($importWord in $importData.words) {
        $key = "$($importWord.italian.ToLower())-$($importWord.english.ToLower())"
        
        if ($existingWordsHash.ContainsKey($key)) {
            # Update existing word with new data (preserve ID)
            $existingWord = $existingWordsHash[$key]
            
            # Add missing properties if they don't exist
            if (-not $existingWord.PSObject.Properties.Name -contains "details") {
                $existingWord | Add-Member -MemberType NoteProperty -Name "details" -Value $null -Force
            }
            if (-not $existingWord.PSObject.Properties.Name -contains "example") {
                $existingWord | Add-Member -MemberType NoteProperty -Name "example" -Value $null -Force
            }
            if (-not $existingWord.PSObject.Properties.Name -contains "learned") {
                $existingWord | Add-Member -MemberType NoteProperty -Name "learned" -Value $false -Force
            }
            if (-not $existingWord.PSObject.Properties.Name -contains "wrongAttempts") {
                $existingWord | Add-Member -MemberType NoteProperty -Name "wrongAttempts" -Value 0 -Force
            }
            if (-not $existingWord.PSObject.Properties.Name -contains "correctAttempts") {
                $existingWord | Add-Member -MemberType NoteProperty -Name "correctAttempts" -Value 0 -Force
            }
            
            # Now safely update all properties
            $existingWord.groupId = $importWord.groupId
            $existingWord.difficulty = $importWord.difficulty
            $existingWord.details = $importWord.details
            $existingWord.example = $importWord.example
            $existingWord.wrongAttempts = $importWord.wrongAttempts
            $existingWord.correctAttempts = $importWord.correctAttempts
            $existingWord.lastReviewed = $importWord.lastReviewed
            $existingWord.learned = $importWord.learned
            $updatedWordsCount++
        } else {
            # Add new word with new ID
            $maxId++
            $newWord = [PSCustomObject]@{
                id = $maxId.ToString()
                italian = $importWord.italian
                english = $importWord.english
                groupId = $importWord.groupId
                difficulty = $importWord.difficulty
                details = $importWord.details
                example = $importWord.example
                wrongAttempts = $importWord.wrongAttempts
                correctAttempts = $importWord.correctAttempts
                createdAt = $importWord.createdAt
                lastReviewed = $importWord.lastReviewed
                learned = $importWord.learned
            }
            $existingWords += $newWord
            $newWordsCount++
        }
    }
}

# Merge Groups
if ($importData.wordGroups) {
    Write-Host "Processing $($importData.wordGroups.Count) imported groups..." -ForegroundColor Blue
    
    # Convert existing groups to hashtable for faster lookup
    $existingGroupsHash = @{}
    foreach ($group in $existingGroups) {
        $existingGroupsHash[$group.id] = $group
    }
    
    foreach ($importGroup in $importData.wordGroups) {
        if ($existingGroupsHash.ContainsKey($importGroup.id)) {
            # Update existing group
            $existingGroup = $existingGroupsHash[$importGroup.id]
            $existingGroup.name = $importGroup.name
            $existingGroup.description = $importGroup.description
            $existingGroup.color = $importGroup.color
            $existingGroup.icon = $importGroup.icon
            $updatedGroupsCount++
        } else {
            # Add new group
            $existingGroups += $importGroup
            $newGroupsCount++
        }
    }
}

# Merge Settings
if ($importData.settings -and $existingSettings) {
    Write-Host "Merging settings..." -ForegroundColor Blue
    # Keep existing theme but update other settings
    $currentTheme = $existingSettings.theme
    $existingSettings = $importData.settings
    $existingSettings.theme = $currentTheme
}

# Display summary
Write-Host ""
Write-Host "Import Summary:" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host "Words: $newWordsCount new, $updatedWordsCount updated" -ForegroundColor Green
Write-Host "Groups: $newGroupsCount new, $updatedGroupsCount updated" -ForegroundColor Green
Write-Host "Total Words: $($existingWords.Count)" -ForegroundColor Yellow
Write-Host "Total Groups: $($existingGroups.Count)" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host ""
    Write-Host "DRY RUN - No files were modified" -ForegroundColor Yellow
    exit 0
}

# Create backup
$backupDir = Join-Path $AppDataPath "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

if (Test-Path $wordsFile) {
    Copy-Item $wordsFile (Join-Path $backupDir "words.json")
}
if (Test-Path $groupsFile) {
    Copy-Item $groupsFile (Join-Path $backupDir "groups.json")
}
if (Test-Path $settingsFile) {
    Copy-Item $settingsFile (Join-Path $backupDir "settings.json")
}

Write-Host "Backup created: $backupDir" -ForegroundColor Green

# Save merged data
try {
    # Save words
    $wordsJson = $existingWords | ConvertTo-Json -Depth 10 -Compress:$false
    Set-Content -Path $wordsFile -Value $wordsJson -Encoding UTF8
    Write-Host "Words saved to $wordsFile" -ForegroundColor Green
    
    # Save groups
    $groupsJson = $existingGroups | ConvertTo-Json -Depth 10 -Compress:$false
    Set-Content -Path $groupsFile -Value $groupsJson -Encoding UTF8
    Write-Host "Groups saved to $groupsFile" -ForegroundColor Green
    
    # Save settings
    if ($existingSettings) {
        $settingsJson = $existingSettings | ConvertTo-Json -Depth 10 -Compress:$false
        Set-Content -Path $settingsFile -Value $settingsJson -Encoding UTF8
        Write-Host "Settings saved to $settingsFile" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Import completed successfully!" -ForegroundColor Green
    Write-Host "Restart the application to see the imported data." -ForegroundColor Yellow
    
} catch {
    Write-Error "Failed to save data: $($_.Exception.Message)"
    Write-Host "You can restore from backup: $backupDir" -ForegroundColor Yellow
    exit 1
}