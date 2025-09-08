# Phase 3 Setup Guide - AI Recipe Generation

## 🎯 Overview

Phase 3 adds AI-powered recipe generation to your KitchenPal app using Hugging Face. This guide will help you set up intelligent, creative recipe generation with Filipino cuisine bias.

## 📋 Prerequisites

- Completed Phase 1 & 2 (Authentication + Recipe Dashboard)
- Internet connection for API calls
- Email address for Hugging Face account (free)

## 🔧 API Setup

### Hugging Face API (AI Recipe Generation)

**Purpose**: Powers AI-based recipe generation with Filipino cuisine bias

**Steps**:

1. Visit [Hugging Face](https://huggingface.co) and create a free account
2. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
3. Click "New Token" and create a token with "Read" permission
4. Copy your API key

**Limits**: 30,000 characters/month (free tier)

### Environment Variables Setup

Create a `.env` file in your project root with:

```bash
# Hugging Face API
EXPO_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_token_here
```

## 🚀 Features Enabled by Phase 3

### ✅ **AI Recipe Generation**

- **When enabled**: Uses Hugging Face AI models to generate creative recipes
- **When disabled**: Falls back to local Filipino recipe database with smart matching
- **Benefits**: More creative, diverse recipes with better ingredient integration

### ✅ **Enhanced Recipe Details**

- AI-generated recipes with improved creativity
- Better ingredient quantity suggestions
- More detailed cooking instructions
- API source tracking

## 🔍 Verification

After setting up the API, you can verify the configuration:

1. **Check API Status**: The app will log API configuration status in development mode
2. **Test Generation**: Try generating a recipe - you'll see console logs indicating AI vs fallback usage
3. **Recipe Quality**: AI-generated recipes will be more creative and contextually relevant

## 📊 Usage Monitoring

### Free Tier Limits

- **Hugging Face**: 30,000 characters/month

### Smart Usage Features

- Automatic fallback when API is unavailable
- Error handling and retry logic
- Rate limiting awareness
- Local caching to reduce API calls

## 🛠️ Troubleshooting

### Common Issues

**1. "AI generation failed, falling back to local database"**

- Check your Hugging Face API key is correct
- Verify internet connection
- API might be temporarily unavailable (fallback works fine)

**2. Environment variables not working**

- Ensure `.env` file is in project root
- Restart the development server after adding variables
- Check variable names match exactly (case-sensitive)

### Debug Mode

In development, the app logs detailed information:

```
🤖 Starting AI recipe generation...
✅ AI generation successful!
🎉 Recipe generation completed successfully!
```

## 🔒 Security Notes

- Never commit API keys to version control
- Add `.env` to your `.gitignore` file
- Use environment variables for production deployment
- Monitor API usage to avoid unexpected charges

## 🚫 Optional Setup

The app is designed to work perfectly even without the API key:

- **Without Hugging Face**: Uses local Filipino recipe database with intelligent matching
- **Performance**: Local fallback is often faster than API calls
- **Quality**: Local recipes are curated and reliable

## 📈 Future Enhancements

Phase 3 foundation enables:

- Recipe image generation
- Advanced dietary preference filtering
- Meal planning suggestions
- Integration with cooking timers
- Custom cuisine preferences

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your API key is correct
3. Check the console logs for detailed error messages
4. The app will continue working with fallback systems

---

**Next**: Phase 4 will focus on user experience enhancements including recipe ratings, cooking timers, and advanced search features.
