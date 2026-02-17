# 🎯 AI Resume Matcher for Shopify Back-End Developer

An intelligent web application that uses AI (Groq API) to analyze and match resumes against a job description for the Shopify Back-End Developer position. The system provides detailed analysis including match scores, strengths, gaps, skill matching, and hiring recommendations.

## ✨ Features

- 📄 **Resume Upload**: Supports PDF and DOCX formats
- 🤖 **AI-Powered Analysis**: Uses Groq's Llama 3.3 70B model for intelligent resume analysis
- 📊 **Match Score**: Get a 0-100 score indicating how well the resume matches the JD
- ✅ **Strengths & Gaps**: Detailed breakdown of candidate strengths and areas for improvement
- 💚 **Skills Matching**: Visual representation of matched and missing skills
- 💼 **Experience Analysis**: In-depth analysis of relevant experience
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- ⚡ **Fast Processing**: Quick analysis powered by Groq's high-performance AI

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Groq API key ([Get it here](https://console.groq.com/keys))

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd hr-agent
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   copy .env.example .env
   ```
   
   Edit the `.env` file and add your Groq API key:
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   
   Navigate to: `http://localhost:5000`

## 📖 Usage

1. **Upload Resume**: Click "Choose a file" and select a resume (PDF or DOCX format)
2. **Analyze**: Click "Analyze Resume" button
3. **Review Results**: The AI will analyze the resume and display:
   - Overall match score (0-100)
   - Hiring recommendation
   - Summary of the candidate
   - Strengths and gaps
   - Matched and missing skills
   - Experience analysis
4. **Analyze Another**: Click "Analyze Another Resume" to start over

## 🏗️ Project Structure

```
hr-agent/
├── app.py                              # Flask backend application
├── requirements.txt                    # Python dependencies
├── .env                               # Environment variables (create this)
├── .env.example                       # Example environment file
├── .gitignore                         # Git ignore file
├── Shopify Back-End Developer.docx    # Job description document
├── templates/
│   └── index.html                     # Main HTML template
└── static/
    ├── style.css                      # Stylesheet
    └── script.js                      # Frontend JavaScript
```

## 🔧 Configuration

### API Key

Get your free Groq API key:
1. Visit [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key to your `.env` file

### Model Configuration

The application uses the `llama-3.3-70b-versatile` model by default. You can modify this in [app.py](app.py) if needed:

```python
model="llama-3.3-70b-versatile"  # Change to another Groq model if desired
```

## 🎨 Customization

### Changing the Job Description

Replace the `Shopify Back-End Developer.docx` file with your own job description document (must be in DOCX format).

### Modifying Analysis Criteria

Edit the prompt in [app.py](app.py), function `analyze_resume_with_ai()` to customize:
- Analysis criteria
- Output format
- Scoring methodology
- Skills to look for

### Styling

Modify [static/style.css](static/style.css) to customize:
- Colors (CSS variables in `:root`)
- Layouts
- Animations
- Responsive breakpoints

## 📋 Supported File Formats

- **PDF** (.pdf)
- **DOCX** (.docx)

## 🐛 Troubleshooting

### "No module named 'groq'"
```bash
pip install -r requirements.txt
```

### "Failed to read job description"
Ensure `Shopify Back-End Developer.docx` exists in the root directory.

### "GROQ_API_KEY not found"
Make sure you:
1. Created a `.env` file
2. Added `GROQ_API_KEY=your_key` to it
3. Restarted the Flask application

### Port 5000 already in use
Change the port in [app.py](app.py):
```python
app.run(debug=True, port=5001)  # Use a different port
```

## 🔒 Security Notes

- Never commit your `.env` file with actual API keys
- Keep your Groq API key confidential
- Use environment variables for sensitive data
- Consider rate limiting for production use

## 📝 API Endpoints

### `GET /`
Returns the main HTML page

### `POST /analyze`
Analyzes a resume against the job description

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `resume` file (PDF or DOCX)

**Response:**
```json
{
  "overall_match_score": 85,
  "overall_summary": "Strong candidate with relevant experience...",
  "strengths": ["strength1", "strength2", ...],
  "gaps": ["gap1", "gap2", ...],
  "skills_match": {
    "matched_skills": ["Python", "Flask", ...],
    "missing_skills": ["GraphQL", ...]
  },
  "experience_analysis": "The candidate has...",
  "recommendation": "HIGHLY RECOMMENDED"
}
```

## 🌟 Features Coming Soon

- [ ] Batch resume processing
- [ ] Export analysis as PDF
- [ ] Comparison between multiple resumes
- [ ] Custom scoring weights
- [ ] Email notifications

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 💬 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ using Flask, Groq AI, and modern web technologies
