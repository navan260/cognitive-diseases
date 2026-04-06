import React, { useState } from "react";
import "../pages/dyscalculia.css";

export default function StoryMode({ onBack }) {
  const [mathExpression, setMathExpression] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const ollamaPort = 11434;

  // Indian & English languages for TTS
  const languages = [
    { code: "en-US", name: "English", flag: "🇬🇧" },
    { code: "hi-IN", name: "हिंदी", flag: "🇮🇳" },
    { code: "ta-IN", name: "தமிழ்", flag: "🇮🇳" },
    { code: "te-IN", name: "తెలుగు", flag: "🇮🇳" },
    { code: "kn-IN", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "bn-IN", name: "বাংলা", flag: "🇮🇳" },
    { code: "mr-IN", name: "मराठी", flag: "🇮🇳" },
  ];

  // Get language name and flag
  const getLanguageInfo = (code) => {
    return languages.find((l) => l.code === code) || languages[0];
  };

  // Map language codes to English names that Ollama understands
  const languageNameMap = {
    "en-US": "English",
    "hi-IN": "Hindi",
    "ta-IN": "Tamil",
    "te-IN": "Telugu",
    "kn-IN": "Kannada",
    "bn-IN": "Bengali",
    "mr-IN": "Marathi",
  };

  // Validate math expression format
  const isValidMathExpression = (expr) => {
    // Only allow numbers, +, -, *, /, (, ), and spaces
    const validPattern = /^[\d+\-*/()\s.]+$/;
    if (!validPattern.test(expr.trim())) {
      return false;
    }
    // Check if it contains at least one operator
    if (!/[+\-*\/]/.test(expr)) {
      return false;
    }
    return true;
  };

  // Generate story using practical style (default)
  const generateStory = async () => {
    if (!mathExpression.trim()) {
      setError("Please enter a math expression (e.g., 4 + 3)");
      return;
    }

    // Validate input
    if (!isValidMathExpression(mathExpression)) {
      setError("Invalid input! Please enter a valid math expression (e.g., 4 + 3, 10 - 5, 6 * 2)");
      return;
    }

    setLoading(true);
    setError("");
    setStory("");
    stopSpeech();

    try {
      // Step 1: Generate story in English first
      const englishPrompt = `Explain the math problem "${mathExpression}" using real everyday examples. Use scenarios like sharing cookies, toys, or playing games. Make it relatable for a child. Keep it short (2-3 sentences). Only provide the explanation, nothing else.`;

      let englishStory = null;
      try {
        const apiResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate_story`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: englishPrompt }),
        });

        if (apiResponse.ok) {
          const data = await apiResponse.json();
          englishStory = data.text;
        }
      } catch (err) {
        console.error("API error:", err);
      }

      if (!englishStory) {
        throw new Error("Failed to generate story with Gemini backend");
      }

      // Step 2: Translate to target language if not English
      let finalStory = englishStory;

      if (selectedLanguage !== "en-US") {
        const translationPrompts = {
          "hi-IN": `Translate this English text to Hindi. Keep it simple and suitable for a child. Maintain the meaning exactly.\n\nEnglish: "${englishStory}"\n\nHindi translation (ONLY the translation, no explanations):`,
          "ta-IN": `Translate this English text to Tamil. Keep it simple and suitable for a child. Maintain the meaning exactly.\n\nEnglish: "${englishStory}"\n\nTamil translation (ONLY the translation, no explanations):`,
          "te-IN": `Translate this English text to Telugu. Keep it simple and suitable for a child. Maintain the meaning exactly.\n\nEnglish: "${englishStory}"\n\nTelugu translation (ONLY the translation, no explanations):`,
          "kn-IN": `Translate this English text to Kannada. Keep it simple and suitable for a child. Maintain the meaning exactly.\n\nEnglish: "${englishStory}"\n\nKannada translation (ONLY the translation, no explanations):`,
          "bn-IN": `Translate this English text to Bengali. Keep it simple and suitable for a child. Maintain the meaning exactly.\n\nEnglish: "${englishStory}"\n\nBengali translation (ONLY the translation, no explanations):`,
          "mr-IN": `Translate this English text to Marathi. Keep it simple and suitable for a child. Maintain the meaning exactly.\n\nEnglish: "${englishStory}"\n\nMarathi translation (ONLY the translation, no explanations):`,
        };

        const translationPrompt = translationPrompts[selectedLanguage];

        if (translationPrompt) {
          try {
            const translateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate_story`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: translationPrompt }),
            });

            if (translateResponse.ok) {
              const translatedData = await translateResponse.json();
              const translated = (translatedData.text || "").trim();
              if (translated && translated.length > 5) {
                finalStory = translated;
              }
            }
          } catch (err) {
             console.error("Translation error:", err);
          }
        }
      }

      setStory(finalStory);
      setLoading(false);

      // Auto-play speech with selected language
      setTimeout(() => {
        playStoryAudio(finalStory);
      }, 500);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Could not generate story. Make sure backend is running.");
      console.error(err);
    }
  };

  // Text-to-Speech with multi-language support
  const playStoryAudio = (text) => {
    if (!("speechSynthesis" in window)) {
      setError("Text-to-speech not supported in your browser");
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // Slightly slower for clarity
    utterance.pitch = 1.1; // Pleasant pitch
    utterance.volume = 1;
    utterance.lang = selectedLanguage; // Use selected language

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      generateStory();
    }
  };

  const currentLanguage = getLanguageInfo(selectedLanguage);

  return (
    <div className="dycalculia-wrapper" style={styles.container}>
      <div className="snow-background"></div>
      <style>{globalStyles}</style>

      <div style={{ marginTop: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div style={styles.contentWrapper}>
        {/* Header */}
        <div style={styles.headerSection}>
          <h1 style={styles.mainTitle}>
            <span style={styles.titleEmoji}>📖</span> Story Mode
          </h1>
          <p style={styles.mainSubtitle}>Transform math into magical stories!</p>
        </div>

        {/* Main Card */}
        <div style={styles.mainCard}>
          {/* Language Selector */}
          <div style={styles.languageSection}>
            <div style={styles.languageSelectorBox}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                style={styles.languageButton}
              >
                {currentLanguage.flag} {currentLanguage.name}
                <span style={styles.chevron}>▼</span>
              </button>

              {showLanguageMenu && (
                <div style={styles.languageDropdown}>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      style={{
                        ...styles.languageOption,
                        ...(selectedLanguage === lang.code
                          ? styles.languageOptionActive
                          : {}),
                      }}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Input Section */}
          <div style={styles.inputContainer}>
            <div style={styles.inputLabel}>
              <span style={styles.inputIcon}>🔢</span>
              <label style={styles.label}>Enter Your Math Problem</label>
            </div>
            <input
              type="text"
              value={mathExpression}
              onChange={(e) => setMathExpression(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 4 + 3, 10 - 5, 3 × 2, 12 ÷ 3"
              style={styles.input}
              disabled={loading}
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateStory}
            disabled={loading || !mathExpression.trim()}
            style={{
              ...styles.generateButton,
              opacity: loading || !mathExpression.trim() ? 0.6 : 1,
              cursor:
                loading || !mathExpression.trim() ? "not-allowed" : "pointer",
              transform: loading ? "scale(0.98)" : "scale(1)",
            }}
          >
            <span style={styles.buttonIcon}>
              {loading ? "⏳" : "✨"}
            </span>
            {loading ? "Creating Magic..." : "Generate Story"}
          </button>

          {/* Error Display */}
          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠️</span>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div style={styles.loadingBox}>
              <div style={styles.loadingSpinner}>
                <div style={styles.spinnerDot}></div>
                <div style={styles.spinnerDot}></div>
                <div style={styles.spinnerDot}></div>
              </div>
              <p style={styles.loadingText}>Weaving your story...</p>
            </div>
          )}

          {/* Story Display */}
          {story && !loading && (
            <div style={styles.storyCard}>
              <div style={styles.storyHeader}>
                <span style={styles.storyIcon}>🎭</span>
                <h2 style={styles.storyTitle}>Your Story</h2>
              </div>

              <div style={styles.storyContent}>
                <p style={styles.storyText}>{story}</p>
              </div>

              {/* Audio Controls */}
              <div style={styles.audioSection}>
                <button
                  onClick={() =>
                    isSpeaking ? stopSpeech() : playStoryAudio(story)
                  }
                  style={{
                    ...styles.audioButton,
                    ...(isSpeaking ? styles.audioButtonActive : {}),
                  }}
                >
                  <span style={styles.audioIcon}>
                    {isSpeaking ? "🔊" : "🔉"}
                  </span>
                  {isSpeaking ? "Stop" : "Listen"} in {currentLanguage.name}
                </button>
              </div>

              {/* Story Stats */}
              <div style={styles.storyStats}>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>📝</span>
                  <span style={styles.statText}>Problem: {mathExpression}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>🗣️</span>
                  <span style={styles.statText}>{currentLanguage.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        <div style={styles.tipsSection}>
          <p style={styles.tipText}>
            💡 <strong>Tip:</strong> Try different languages to enhance learning!
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}

const globalStyles = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(-20px);
    }
    50% {
      transform: translateY(20px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.7;
      transform: scale(1.05);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes blobAnimation {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  input:focus {
    outline: none;
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
  }

  input::placeholder {
    color: #999999;
    opacity: 1;
  }

  input::-webkit-input-placeholder {
    color: #999999;
  }

  input:-moz-placeholder {
    color: #999999;
  }

  input::-moz-placeholder {
    color: #999999;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    overflow: "hidden",
    position: "relative",
  },

  animatedBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: 0,
  },

  blob1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
    top: "-100px",
    left: "-100px",
    animation: "blobAnimation 8s ease-in-out infinite",
  },

  blob2: {
    position: "absolute",
    width: "250px",
    height: "250px",
    background: "rgba(255, 255, 255, 0.08)",
    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
    bottom: "-50px",
    right: "-50px",
    animation: "blobAnimation 10s ease-in-out infinite reverse",
    animationDelay: "1s",
  },

  blob3: {
    position: "absolute",
    width: "200px",
    height: "200px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
    top: "50%",
    right: "10%",
    animation: "blobAnimation 12s ease-in-out infinite",
    animationDelay: "2s",
  },

  contentWrapper: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "700px",
    animation: "slideUp 0.6s ease-out",
  },

  headerSection: {
    textAlign: "center",
    marginBottom: "40px",
  },

  mainTitle: {
    fontSize: "48px",
    fontWeight: "800",
    color: "white",
    margin: "0 0 12px 0",
    textShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: "-1px",
  },

  titleEmoji: {
    marginRight: "12px",
    animation: "float 3s ease-in-out infinite",
  },

  mainSubtitle: {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.9)",
    margin: "0",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: "500",
  },

  mainCard: {
    background: "var(--dy-glass-bg)",
    backdropFilter: "blur(32px)",
    borderRadius: "32px",
    padding: "40px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    border: "1px solid var(--dy-glass-border)",
    animation: "slideUp 0.7s ease-out",
    animationDelay: "0.1s",
    color: "var(--dy-text-primary)",
  },

  languageSection: {
    marginBottom: "30px",
  },

  languageSelectorBox: {
    position: "relative",
  },

  languageButton: {
    width: "100%",
    padding: "16px 20px",
    background: "rgba(255, 255, 255, 0.03)",
    color: "white",
    border: "1px solid var(--dy-glass-border)",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.3s ease",
  },

  chevron: {
    marginLeft: "8px",
    fontSize: "12px",
  },

  languageDropdown: {
    position: "absolute",
    top: "60px",
    left: 0,
    right: 0,
    background: "var(--dy-glass-bg)",
    backdropFilter: "blur(32px)",
    border: "1px solid var(--dy-glass-border)",
    borderRadius: "16px",
    overflow: "hidden",
    zIndex: 10,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    animation: "slideUp 0.3s ease-out",
  },

  languageOption: {
    width: "100%",
    padding: "16px 20px",
    background: "transparent",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    borderBottom: "1px solid var(--dy-glass-border)",
    color: "var(--dy-text-secondary)",
  },

  languageOptionActive: {
    background: "rgba(37, 99, 235, 0.1)",
    color: "white",
    fontWeight: "700",
    borderLeft: "4px solid var(--dy-sapphire-main)",
  },

  inputContainer: {
    marginBottom: "25px",
  },

  inputLabel: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
  },

  inputIcon: {
    marginRight: "8px",
    fontSize: "18px",
    display: "inline-block",
  },

  label: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--dy-text-secondary)",
    margin: 0,
    letterSpacing: "0.5px",
  },

  input: {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--dy-glass-border)",
    borderRadius: "16px",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    color: "white",
  },

  generateButton: {
    width: "100%",
    padding: "16px 24px",
    fontSize: "16px",
    fontWeight: "700",
    color: "white",
    background: "linear-gradient(135deg, var(--dy-sapphire-main) 0%, rgb(30, 58, 138) 100%)",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)",
  },

  buttonIcon: {
    fontSize: "20px",
    animation: "float 2s ease-in-out infinite",
  },

  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid var(--dy-error)",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    animation: "slideUp 0.3s ease-out",
  },

  errorIcon: {
    fontSize: "20px",
    flexShrink: 0,
  },

  errorText: {
    color: "#fca5a5",
    margin: 0,
    fontSize: "14px",
    fontWeight: "500",
  },

  loadingBox: {
    textAlign: "center",
    padding: "40px 20px",
    marginBottom: "20px",
  },

  loadingSpinner: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "16px",
  },

  spinnerDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "var(--dy-sapphire-main)",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  loadingText: {
    color: "var(--dy-sapphire-main)",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
  },

  storyCard: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--dy-glass-border)",
    borderRadius: "24px",
    padding: "32px",
    animation: "slideUp 0.5s ease-out",
    marginBottom: "20px",
  },

  storyHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },

  storyIcon: {
    fontSize: "24px",
  },

  storyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "white",
    margin: 0,
  },

  storyContent: {
    marginBottom: "20px",
  },

  storyText: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "var(--dy-text-secondary)",
    margin: 0,
    fontWeight: "500",
  },

  audioSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },

  audioButton: {
    padding: "16px 24px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--dy-glass-border)",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  audioButtonActive: {
    background: "rgba(37, 99, 235, 0.2)",
    border: "1px solid var(--dy-sapphire-main)",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  audioIcon: {
    fontSize: "16px",
    animation: "float 2s ease-in-out infinite",
  },

  storyStats: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingTop: "16px",
    borderTop: "1px solid var(--dy-glass-border)",
  },

  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "var(--dy-sapphire-main)",
    fontWeight: "600",
  },

  statIcon: {
    fontSize: "14px",
  },

  statText: {
    fontSize: "13px",
  },

  tipsSection: {
    textAlign: "center",
    marginTop: "30px",
  },

  tipText: {
    color: "var(--dy-text-secondary)",
    fontSize: "14px",
    margin: 0,
    fontWeight: "500",
  },
};
