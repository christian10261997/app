# OpenAI Migration Guide

## Overview

This document outlines the migration from Hugging Face API to OpenAI ChatGPT API for AI recipe generation.

## Changes Made

### 1. New OpenAI Service (`services/openai.ts`)

- Created `OpenAIService` class with same interface as `HuggingFaceService`
- Implements recipe generation using ChatGPT API
- Implements ingredient validation using ChatGPT
- Includes proper error handling and fallback mechanisms

### 2. Updated API Types (`types/api.ts`)

- Added `OpenAIRequest` and `OpenAIResponse` interfaces
- Maintained backward compatibility with existing `AIRecipeRequest`/`AIRecipeResponse`
- Added support for OpenAI-specific parameters

### 3. Updated Configuration (`config/apiConfig.ts`)

- Added `OPENAI_CONFIG` with model settings and API configuration
- Updated feature flags to use OpenAI as primary service
- Kept Hugging Face as fallback option

### 4. Updated Recipe Generator (`services/recipeGenerator.ts`)

- Changed all references from `huggingFaceService` to `openaiService`
- Updated error messages to reference OpenAI API key
- Maintained all existing functionality and interfaces

## Environment Variables

### Required

```bash
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### Optional (for fallback)

```bash
EXPO_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

## API Key Setup

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Add the key to your environment variables
3. The service will automatically detect and use the key

## Model Configuration

The service uses the following models:

- **Primary**: `gpt-3.5-turbo` (fast, cost-effective)
- **Creative**: `gpt-4` (higher quality, more expensive)
- **Fallback**: Local recipe generation

## Benefits of Migration

1. **Better Quality**: ChatGPT provides more coherent and contextually appropriate recipes
2. **More Reliable**: OpenAI API has better uptime and consistency
3. **Better Parsing**: More structured responses that are easier to parse
4. **Cost Efficiency**: More predictable pricing model
5. **Better Error Handling**: More descriptive error messages

## Testing

Run the migration tests:

```bash
npm test -- openai-migration.test.ts
```

## Rollback Plan

If issues arise, you can quickly rollback by:

1. Changing the import in `recipeGenerator.ts` back to `huggingFaceService`
2. Updating the service calls to use `huggingFaceService`
3. Updating the configuration checks

## Monitoring

Monitor the following:

- API response times
- Error rates
- Token usage
- Recipe quality and user satisfaction

## Support

For issues with the migration:

1. Check API key configuration
2. Verify network connectivity
3. Check OpenAI service status
4. Review error logs for specific issues
