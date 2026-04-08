#!/bin/bash
# Add Test Mode logic to remaining integrations

cd lib/integrations

# List of remaining files to update
FILES="pinterest reddit postgresql mongodb airtable shopify sendgrid twilio zoom trello asana jira dropbox onedrive calendar figma canva zapier make http-request webhook rss weather news crypto stocks translation ocr midjourney jasper"

for file in $FILES; do
  FILENAME="$file.ts"
  if [ -f "$FILENAME" ]; then
    # Check if testMode logic already exists
    if grep -q "Test Mode" "$FILENAME"; then
      echo "⏭️  $FILENAME - already has Test Mode"
    else
      # Add testMode check after "try {" in main function
      # This is a simple pattern - may need manual adjustment for some files
      sed -i '0,/^  try {$/{s/  try {$/  try {\n    \/\/ Test Mode - return mock response\n    if (config.testMode) {\n      console.log('\''['"$file"' ] Test Mode: Simulating'\'');\n      return { success: true, id: '\''test_'\'' + Date.now() };\n    }\n/}' "$FILENAME"
      echo "✅ $FILENAME - Test Mode added"
    fi
  fi
done

echo "Done!"
