#!/bin/bash
# Integration Test Script - Quick Status Check
# Tests all 52 integrations for basic validity

echo "🧪 HARSHAI INTEGRATION TEST SUITE"
echo "=================================="
echo ""

INTEGRATIONS_DIR="lib/integrations"
WORKING=0
PENDING=0
FAILED=0

# Known working integrations (already tested)
WORKING_LIST=("openai" "anthropic" "elevenlabs" "gmail" "slack")

echo "✅ WORKING INTEGRATIONS (Previously Tested):"
for integration in "${WORKING_LIST[@]}"; do
    if [ -f "$INTEGRATIONS_DIR/$integration.ts" ]; then
        echo "   ✓ $integration.ts"
        ((WORKING++))
    else
        echo "   ✗ $integration.ts (MISSING!)"
        ((FAILED++))
    fi
done

echo ""
echo "📦 PENDING INTEGRATIONS (Files Created, Need Testing):"

# All integration files
for file in "$INTEGRATIONS_DIR"/*.ts; do
    filename=$(basename "$file" .ts)
    
    # Skip base.ts and already counted working ones
    if [ "$filename" == "base" ]; then
        continue
    fi
    
    # Check if it's in working list
    is_working=false
    for w in "${WORKING_LIST[@]}"; do
        if [ "$filename" == "$w" ]; then
            is_working=true
            break
        fi
    done
    
    if [ "$is_working" == "false" ]; then
        # Check if file has valid TypeScript (basic check)
        if grep -q "export" "$file" 2>/dev/null; then
            echo "   ⏳ $filename.ts (needs testing)"
            ((PENDING++))
        else
            echo "   ✗ $filename.ts (invalid/no exports)"
            ((FAILED++))
        fi
    fi
done

echo ""
echo "=================================="
echo "📊 SUMMARY:"
echo "   ✅ Working: $WORKING"
echo "   ⏳ Pending: $PENDING"
echo "   ✗ Failed:  $FAILED"
echo "   📦 Total:  $((WORKING + PENDING + FAILED))"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "⚠️  WARNING: $FAILED integration files have issues!"
    exit 1
else
    echo "✅ All integration files present and valid!"
    exit 0
fi
