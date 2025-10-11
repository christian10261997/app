# Ingredient Validation System

## Overview

The recipe generator now includes comprehensive ingredient validation to prevent users from entering non-edible or potentially dangerous items when generating recipes.

## Validation Layers

### 1. Basic Validation (Primary)

- Checks ingredients against a comprehensive list of known non-edible items
- Includes cleaning products, personal care items, household objects, toxic substances, and poisonous plants
- Performs both exact matches and partial matches (e.g., "soap" matches "dish soap")
- Fast and reliable, works offline

### 2. AI Validation (Secondary)

- Uses Hugging Face API to validate ingredients when available
- Provides additional safety checks for edge cases
- Falls back to basic validation if AI service is unavailable

## Non-Edible Items List

The system blocks ingredients that fall into these categories:

### Cleaning Products & Chemicals

- Bleach, detergent, soap, shampoo, conditioner
- Window cleaner, floor cleaner, bathroom cleaner
- Pesticides, insecticides, herbicides, fertilizers
- Paint, varnish, glue, adhesives

### Personal Care Items

- Deodorant, perfume, cologne, lotion, sunscreen
- Makeup, nail polish, toothpaste, mouthwash
- Medical items: bandages, gauze, syringes, medicines

### Household Objects

- Paper, cardboard, plastic, rubber, metal, glass
- Electronics, batteries, wires, cables
- Fabric, cloth, leather, foam, sponges

### Toxic Substances

- Poison, toxic chemicals, heavy metals
- Antifreeze, gasoline, kerosene, lighter fluid
- Alcohol, tobacco, cigarettes

### Poisonous Plants

- Poison ivy, poison oak, hemlock, nightshade
- Foxglove, oleander, rhododendron, azalea
- Lily of the valley, daffodil, castor bean

### Raw/Unsafe Food Items

- Raw meat, raw chicken, raw fish, raw eggs
- Moldy, rotten, spoiled, expired, contaminated items

## User Experience

When invalid ingredients are detected:

1. **Alert Dialog**: Shows "Invalid Ingredients" with specific error message
2. **Clear Messaging**: Lists which ingredients are problematic
3. **User Guidance**: Suggests using only safe, edible ingredients
4. **No Recipe Generation**: Prevents recipe creation until valid ingredients are provided

## Example Error Messages

```
Invalid Ingredients
The following ingredients are not suitable for cooking: soap, bleach. Please use only safe, edible ingredients.
```

## Implementation Details

- Validation occurs before AI recipe generation
- Basic validation runs first for speed and reliability
- AI validation provides additional safety when available
- System fails safely - if AI is unavailable, basic validation still works
- Partial matching prevents circumvention (e.g., "dish soap" is caught)

## Testing

The validation system can be tested by trying to generate recipes with:

- Valid ingredients: chicken, onion, garlic, rice ✅
- Invalid ingredients: soap, bleach, poison ❌
- Mixed ingredients: chicken, detergent, salt ❌

This ensures users can only create recipes with safe, edible ingredients.
