# StoryMode - Demo Mode & Ollama Troubleshooting

## 🎮 Demo Mode Feature

**What's New:** StoryMode now includes a **Demo Mode** that lets you test the feature **without Ollama installed or running**.

### How to Use Demo Mode

1. Click the **⚙️ Settings** button in the StoryMode card
2. Check the box: **🎮 Demo Mode (Test without Ollama)**
3. Enter one of the supported math expressions:
   - `4 + 3`
   - `10 - 5`
   - `3 × 2`
   - `12 ÷ 3`
4. Click "Generate Story"
5. Choose a story style and enjoy the demo story!

### Demo Stories Included

Each supported expression has 4 story styles:

#### **4 + 3**
- **Story:** Emma's apple basket story
- **Visual:** Blue and red circles explanation
- **Cartoon:** Silly clowns with balloons
- **Practical:** Real-world cookie scenario

#### **10 - 5**
- **Story:** Butterflies flying away
- **Visual:** Stars fading from sky
- **Cartoon:** Penguins sliding on ice
- **Practical:** Candies eaten from bowl

#### **3 × 2**
- **Story:** Puppies with toys
- **Visual:** Groups of apples
- **Cartoon:** Superhero aliens with laser guns
- **Practical:** Bags with candies

#### **12 ÷ 3**
- **Story:** Cupcakes shared among friends
- **Visual:** Dots in equal groups
- **Cartoon:** Ducks in bathtubs
- **Practical:** Pencils shared in classroom

---

## 🔧 Troubleshooting Ollama Connection

### Error: "Ollama is not responding on localhost:5000"

**Root Cause:** Ollama is running but on a different port than expected.

### Quick Fix Steps

#### Step 1: Find Ollama's Actual Port
Open **Command Prompt** and run:
```cmd
netstat -ano | findstr LISTENING
```

Look for a port that shows something like:
```
TCP    127.0.0.1:11434    0.0.0.0:0    LISTENING    12345
```

The number before the colon is the port (usually 11434).

#### Step 2: Test Ollama Connection
Replace `11434` with your port and run:
```cmd
curl http://localhost:11434/api/tags
```

**Success:** You'll see JSON with model names like:
```json
{"models": [{"name": "llama3:latest"}, ...]}
```

**Failure:** `curl: (7) Failed to connect to localhost port 11434`

#### Step 3: Update StoryMode Port

1. Click **⚙️ Settings** in StoryMode
2. Change **Ollama Port** to your actual port (e.g., 11434 or 5000)
3. Click ✓ Done
4. Try generating a story again

---

## 🚀 If Ollama Is Not Running

### Install & Run Ollama

1. **Download:** https://ollama.ai/download
2. **Install** and run the application
3. **Pull a model** (opens Command Prompt):
   ```cmd
   ollama pull llama3
   ```
4. **Verify running:**
   ```cmd
   curl http://localhost:11434/api/tags
   ```

### Alternative: Use Demo Mode Instead

If you don't want to install Ollama, simply use Demo Mode:
- ✓ No installation needed
- ✓ Instant story generation
- ✓ Same 4 story styles
- ⚠️ Only works with: 4+3, 10-5, 3×2, 12÷3

---

## 📊 How the Feature Works

### Demo Mode Flow
```
User enters: "4 + 3"
    ↓
Clicks "Generate Story"
    ↓
Demo Mode enabled?
    ├─→ YES: Get demo story for "4 + 3" → Display instantly
    └─→ NO: Continue to Ollama connection...
```

### Live Ollama Flow
```
User enters: "7 + 8"
    ↓
Clicks "Generate Story"
    ↓
Check Ollama running on port?
    ├─→ YES: Send prompt to Ollama → Get generated story → Display
    └─→ NO: Show error with troubleshooting tips
```

---

## 🎨 Story Styles Explained

### 1. **Story** (Narrative Mode)
- Best for: Imagination and context
- Example: "Once upon a time..."
- Typical length: 2-3 sentences

### 2. **Visual** (Descriptive Mode)
- Best for: Visual learners
- Example: "Picture X circles..."
- Helps visualize the math

### 3. **Cartoon** (Fun Mode)
- Best for: Engagement and fun
- Example: "Silly clowns and balloons..."
- Adds humor and energy

### 4. **Practical** (Real-World Mode)
- Best for: Real-world connections
- Example: "You have X cookies..."
- Shows everyday applications

---

## 🔌 Default Ports

| Service | Default Port | Notes |
|---------|------------|-------|
| Ollama | 11434 | Standard, can be changed |
| StoryMode | N/A | Connects to Ollama's port |
| React App | 3000 | Frontend development |

---

## ❓ FAQ

**Q: Can I use custom math expressions with Demo Mode?**
A: Demo Mode only supports the 4 built-in examples (4+3, 10-5, 3×2, 12÷3). For custom math, disable Demo Mode and use live Ollama.

**Q: What if my Ollama port is not 11434 or 5000?**
A: Use `netstat` to find the actual port, then update it in ⚙️ Settings.

**Q: Can I switch between Demo and Live mode?**
A: Yes! Just toggle the Demo Mode checkbox in ⚙️ Settings.

**Q: Why does story generation take 5-20 seconds?**
A: Ollama needs time to run the AI model locally. Faster internet/computer = faster responses.

**Q: Do I need internet for StoryMode?**
A: No! Ollama runs completely locally. You need internet only to install/update Ollama.

---

## 🛠️ Technical Details

### Demo Story Data Structure
```javascript
const demos = {
  "4 + 3": {
    story: "...",
    visual: "...",
    cartoon: "...",
    practical: "..."
  },
  // More expressions...
}
```

### Port Configuration
- State: `useState(11434)` - Default port
- User can change via Settings UI
- No localStorage persistence yet (can be added)

### Error Handling
- Checks Ollama before API call using `/api/tags` endpoint
- Tries multiple models: llama3, mistral, neural-chat, dolphin-mixtral
- Falls back to error message with troubleshooting steps

---

## 📝 Next Steps

1. **Test Demo Mode** with 4+3, 10-5, 3×2, 12÷3
2. **Find your actual Ollama port** using netstat
3. **Update Settings** with correct port
4. **Test live generation** with custom math expressions
5. **Report any issues** with specific error messages

---

## 📧 Support

If you encounter issues:
1. Check the ⚙️ Settings port configuration
2. Verify Ollama is running: `curl http://localhost:11434/api/tags`
3. Try Demo Mode first to confirm the feature works
4. Check browser console (F12) for detailed error messages

