# Fix corrupted emoji icons in groups.json
# This script repairs Unicode emoji characters that got corrupted during import

param(
    [Parameter(Mandatory=$false)]
    [string]$GroupsFile = ".\public\data\groups.json"
)

Write-Host "Fixing corrupted emoji icons..." -ForegroundColor Cyan

if (-not (Test-Path $GroupsFile)) {
    Write-Error "Groups file not found: $GroupsFile"
    exit 1
}

# Load the groups data
try {
    $groups = Get-Content $GroupsFile -Raw | ConvertFrom-Json
    Write-Host "Loaded $($groups.Count) groups" -ForegroundColor Green
} catch {
    Write-Error "Failed to parse groups file: $($_.Exception.Message)"
    exit 1
}

# Define icon fixes for known groups
$iconFixes = @{
    "default-group" = "📚"
    "food-group" = "🍝"
    "travel-group" = "✈️"
    "family-group" = "👨‍👩‍👧‍👦"
    "time-group" = "⏰"
    "top1k-group" = "🇮🇹"
    "group-1758794957933-yu3i4hcsr" = "📚"
    "group-1758827924183-a2qnqqwjh" = "📚"
    "group-1758973861711-63j1ih1rf" = "📚"
    "group-1758993449384-pnna8rzry" = "📚"
    "group-1759172934049-fw1msl26b" = "👨‍👩‍👧‍👦"
    "group-1759174426291-6lxx2bxw9" = "🌟"
    "group-1759572673203-7uslqmjab" = "📚"
    "group-1759685219673-8w5c9tsvo" = "🏃‍♂️"
    "group-1759755838121-vkqtkwgus" = "🍝"
    "group-1759775573281-9a3hysik2" = "🍝"
    "group-1760127749214-nmbhfl7e2" = "🏠"
    "group-1760190565278-huiarl2by" = "🏠"
}

# Fix corrupted icons
$fixedCount = 0
foreach ($group in $groups) {
    $originalIcon = $group.icon
    
    # Check if icon is corrupted (contains weird characters)
    if ($group.icon -match "ð|â|ï¸|š|" -or $group.icon.Length -lt 1) {
        if ($iconFixes.ContainsKey($group.id)) {
            $group.icon = $iconFixes[$group.id]
            Write-Host "Fixed icon for '$($group.name)': '$originalIcon' -> '$($group.icon)'" -ForegroundColor Yellow
            $fixedCount++
        } else {
            # Assign default icons based on group name
            if ($group.name -match "Book|section") {
                $group.icon = "📚"
            } elseif ($group.name -match "Food|meal|Supermarket") {
                $group.icon = "🍝"
            } elseif ($group.name -match "Communication") {
                $group.icon = "👨‍👩‍👧‍👦"
            } elseif ($group.name -match "test") {
                $group.icon = "🌟"
            } elseif ($group.name -match "Travel|transport") {
                $group.icon = "✈️"
            } elseif ($group.name -match "Time|clock") {
                $group.icon = "⏰"
            } elseif ($group.name -match "Family|People") {
                $group.icon = "👨‍👩‍👧‍👦"
            } elseif ($group.name -match "super meal") {
                $group.icon = "🏠"
            } else {
                $group.icon = "📝"  # Default icon
            }
            Write-Host "Fixed icon for '$($group.name)': '$originalIcon' -> '$($group.icon)' (auto-assigned)" -ForegroundColor Blue
            $fixedCount++
        }
    }
}

Write-Host "Fixed $fixedCount corrupted icons" -ForegroundColor Green

# Create backup
$backupFile = $GroupsFile -replace "\.json$", "_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
Copy-Item $GroupsFile $backupFile
Write-Host "Backup created: $backupFile" -ForegroundColor Yellow

# Save fixed groups
try {
    $groupsJson = $groups | ConvertTo-Json -Depth 10 -Compress:$false
    Set-Content -Path $GroupsFile -Value $groupsJson -Encoding UTF8
    Write-Host "Groups file updated successfully!" -ForegroundColor Green
    Write-Host "Restart your application to see the fixed icons." -ForegroundColor Cyan
} catch {
    Write-Error "Failed to save groups file: $($_.Exception.Message)"
    Write-Host "You can restore from backup: $backupFile" -ForegroundColor Yellow
    exit 1
}