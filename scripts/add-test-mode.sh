#!/bin/bash
# Add Test Mode pattern to all integration files

INTEGRATIONS_DIR="lib/integrations"

# List of integrations to update (excluding base.ts, registry.ts, and already done ones)
INTEGRATIONS=(
  "anthropic"
  "openai"
  "elevenlabs"
  "midjourney"
  "jasper"
  "gmail"
  "slack"
  "discord"
  "telegram"
  "whatsapp"
  "twitter"
  "linkedin"
  "facebook"
  "instagram"
  "tiktok"
  "youtube"
  "pinterest"
  "reddit"
  "notion"
  "airtable"
  "google-sheets"
  "google-drive"
  "mysql"
  "postgresql"
  "mongodb"
  "stripe"
  "shopify"
  "sendgrid"
  "twilio"
  "github"
  "figma"
  "canva"
  "zapier"
  "make"
  "trello"
  "asana"
  "jira"
  "dropbox"
  "onedrive"
  "zoom"
  "calendar"
  "weather"
  "news"
  "crypto"
  "stocks"
  "translation"
  "ocr"
  "http-request"
  "webhook"
  "rss"
)

echo "🔧 Adding Test Mode to integrations..."

for integration in "${INTEGRATIONS[@]}"; do
  FILE="$INTEGRATIONS_DIR/$integration.ts"
  
  if [ -f "$FILE" ]; then
    echo "Processing: $integration.ts"
    
    # Check if Test Mode already exists
    if grep -q "testMode" "$FILE" || grep -q "Test Mode" "$FILE"; then
      echo "  ⏭️  Test Mode already exists, skipping"
      continue
    fi
    
    # Add testMode to config interface (if exists)
    if grep -q "export interface.*Config" "$FILE"; then
      # Add testMode?: boolean; to the config interface
      sed -i '/export interface.*Config {/,/}/ {
        /^[[:space:]]*}/i\  testMode?: boolean;
      }' "$FILE"
    fi
    
    echo "  ✅ Updated"
  else
    echo "  ⚠️  File not found: $FILE"
  fi
done

echo ""
echo "✅ Test Mode addition complete!"
echo "Note: You may need to manually add Test Mode logic to each integration's main function"
