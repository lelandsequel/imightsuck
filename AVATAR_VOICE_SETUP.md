# Realistic Avatar & Voice Setup Guide

## 🎙️ Step 1: Get Your ElevenLabs API Key (REQUIRED for Realistic Voices)

**Yes, you need an ElevenLabs API key for hyper-realistic voices!**

1. **Sign Up:**
   - Go to https://elevenlabs.io
   - Click "Sign Up" (top right)
   - Create an account (you can use Google/GitHub)

2. **Get Your API Key:**
   - Once logged in, click your profile icon (top right)
   - Go to "Profile" → "API Keys"
   - Click "Generate New Key" or copy your existing key
   - **Important:** Copy this key immediately - you won't see it again!

3. **Add to App:**
   - Open the app (app.html)
   - Click the ⚙️ Settings button (or menu → Settings)
   - Select "ElevenLabs (Premium)" as Voice Provider
   - Paste your API key in the "ElevenLabs API Key" field
   - Click outside the modal to save

4. **Free Tier:**
   - ElevenLabs offers **10,000 characters/month free**
   - That's roughly 5-10 minutes of speech
   - Perfect for testing!

---

## 🎭 Step 2: Set Up Realistic Speaking Avatars

You have **3 options** for avatars that actually speak:

### Option A: D-ID Talking Avatars (BEST for Lip-Sync) ⭐

**D-ID creates realistic talking avatars with perfect lip-sync!**

1. **Get D-ID API Key:**
   - Go to https://www.d-id.com
   - Sign up for an account
   - Go to "API Keys" in your dashboard
   - Create a new API key
   - Copy the key

2. **Add to App:**
   - Open Settings in the app
   - Select "D-ID (Talking Avatar)" as Avatar Provider
   - Paste your D-ID API key
   - The avatar will automatically lip-sync with speech!

3. **How It Works:**
   - D-ID generates a video of a talking avatar
   - Perfect lip-sync with ElevenLabs voice
   - Works automatically when you get a response

4. **Free Tier:**
   - D-ID offers **20 credits free** (enough for ~20 responses)
   - Each response = 1 credit

---

### Option B: Ready Player Me 3D Avatars (BEST for Customization)

**Create your own 3D avatar that animates when speaking!**

1. **Create Your Avatar:**
   - Go to https://readyplayer.me
   - Click "Create Avatar"
   - Customize your avatar (face, hair, clothes, etc.)
   - Click "Done" when finished

2. **Get Avatar URL:**
   - After creating, you'll see your avatar
   - Right-click → "Copy Image Address" or look for the GLB/URL
   - You need the **GLB file URL** (looks like: `https://models.readyplayer.me/.../avatar.glb`)

3. **Add to App:**
   - Open Settings
   - Select "Ready Player Me (3D)" as Avatar Provider
   - Paste your avatar URL
   - The avatar will load and animate when speaking

4. **Note:**
   - Ready Player Me avatars animate with mouth movements
   - They sync with the audio automatically
   - You can customize them completely!

---

### Option C: Simple Avatar (Fallback - No Setup Needed)

- Uses a simple animated avatar
- Works immediately without any API keys
- Still animates when speaking (basic animation)
- Good for testing or if you don't want to set up APIs

---

## 🎯 Quick Setup Checklist

- [ ] Get ElevenLabs API key → Add to Settings → Voice Provider
- [ ] Choose avatar option:
  - [ ] D-ID (for perfect lip-sync) → Get D-ID API key
  - [ ] Ready Player Me (for custom 3D avatar) → Create avatar → Get URL
  - [ ] Simple Avatar (no setup needed)
- [ ] Test it! Ask the Guru something and watch the avatar speak!

---

## 💡 Pro Tips

1. **Best Combo:** D-ID Avatar + ElevenLabs Voice = Most realistic experience
2. **Budget Option:** Simple Avatar + ElevenLabs Voice = Still sounds great!
3. **Custom Avatar:** Ready Player Me + ElevenLabs = Your own personalized guru
4. **Auto-Play:** Enable "Auto-play responses" in Settings to hear responses automatically

---

## 🔧 Troubleshooting

**Avatar not speaking?**
- Make sure ElevenLabs API key is entered correctly
- Check that "Auto-play responses" is enabled (or click the 🔊 button)
- Try refreshing the page

**D-ID avatar not showing?**
- Verify your D-ID API key is correct
- Check that you have credits remaining
- Make sure "D-ID (Talking Avatar)" is selected as Avatar Provider

**Ready Player Me avatar not loading?**
- Make sure you're using the GLB file URL, not just an image
- Check that the URL is accessible (try opening it in a new tab)
- Some browsers may block iframe content - try a different browser

**Voice not working?**
- Check ElevenLabs API key
- Make sure you haven't exceeded your free tier limit
- Try switching to "Browser TTS" as a fallback

---

## 📞 Need Help?

- **ElevenLabs Support:** https://elevenlabs.io/docs
- **D-ID Support:** https://docs.d-id.com
- **Ready Player Me:** https://docs.readyplayer.me

