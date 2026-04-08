#!/bin/bash
# Test Integration Batch - Tests integrations with Test Mode
# Usage: ./test-integration-batch.sh <integration_name>

INTEGRATION=$1

if [ -z "$INTEGRATION" ]; then
    echo "Usage: ./test-integration-batch.sh <integration_name>"
    echo "Example: ./test-integration-batch.sh notion"
    exit 1
fi

echo "🧪 Testing: $INTEGRATION"
echo "================================"

FILE="lib/integrations/$INTEGRATION.ts"

if [ ! -f "$FILE" ]; then
    echo "❌ File not found: $FILE"
    exit 1
fi

echo "✅ File exists: $FILE"

# Check for Test Mode support
if grep -q "Test Mode" "$FILE" || grep -q "testMode" "$FILE" || grep -q "test_mode" "$FILE"; then
    echo "✅ Test Mode: Supported"
else
    echo "⚠️  Test Mode: Not explicitly documented"
fi

# Check for main export function
EXPORT_FUNC=$(grep -o "export async function [a-zA-Z]*" "$FILE" | head -1)
if [ -n "$EXPORT_FUNC" ]; then
    echo "✅ Main export: $EXPORT_FUNC"
else
    echo "❌ No export function found"
    exit 1
fi

# Check for error handling
if grep -q "try {" "$FILE" && grep -q "catch" "$FILE"; then
    echo "✅ Error handling: Present"
else
    echo "⚠️  Error handling: May be missing"
fi

# Check for config interface
if grep -q "interface.*Config" "$FILE"; then
    echo "✅ Config interface: Defined"
else
    echo "⚠️  Config interface: Not found"
fi

echo ""
echo "📝 First 30 lines of $FILE:"
echo "--------------------------------"
head -30 "$FILE"

echo ""
echo "================================"
echo "✅ Basic validation passed for $INTEGRATION"
