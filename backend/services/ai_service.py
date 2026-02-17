"""
S.W.A.T.H.I. AI Service — The Brain 🧠
Powered by Groq (Llama 3.3 70B)
"""

import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def _call_groq(system_prompt: str, user_prompt: str, temperature: float = 0.3, max_tokens: int = 4000) -> str:
    """Core Groq API call with error handling"""
    response = groq_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def _parse_json(text: str) -> dict:
    """Extract JSON from AI response, handling markdown code blocks"""
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    return json.loads(text)


def analyze_resume(resume_text: str, jd_text: str) -> dict:
    """
    Deep resume analysis with scoring, star rating, and candidate info extraction.
    Returns a comprehensive analysis dict.
    """
    system = """You are S.W.A.T.H.I., an elite AI HR analyst. You analyze resumes with surgical precision.
Always respond with valid JSON only. No markdown, no explanations — just pure JSON."""

    prompt = f"""Analyze this resume against the job description. Be thorough and fair.

JOB DESCRIPTION:
{jd_text}

RESUME:
{resume_text}

Return this EXACT JSON structure:
{{
    "candidate_name": "<full name extracted from resume>",
    "candidate_email": "<email if found, else empty string>",
    "candidate_phone": "<phone if found, else empty string>",
    "current_role": "<current or most recent job title>",
    "experience_years": <estimated total years of experience as number>,
    "overall_match_score": <number 0-100>,
    "star_rating": <number 1.0-5.0 with one decimal>,
    "overall_summary": "<2-3 sentence professional summary>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
    "gaps": ["<gap 1>", "<gap 2>", "<gap 3>"],
    "matched_skills": ["<skill1>", "<skill2>", ...],
    "missing_skills": ["<skill1>", "<skill2>", ...],
    "experience_analysis": "<detailed analysis of experience relevance>",
    "recommendation": "<HIGHLY RECOMMENDED | RECOMMENDED | MAYBE | NOT RECOMMENDED>",
    "culture_fit_notes": "<brief notes on potential culture fit based on resume>",
    "red_flags": ["<any red flags noticed>"],
    "suggested_interview_questions": ["<question 1>", "<question 2>", "<question 3>"]
}}"""

    try:
        result = _call_groq(system, prompt, temperature=0.2, max_tokens=3000)
        analysis = _parse_json(result)

        # Ensure all fields exist with defaults
        defaults = {
            "candidate_name": "Unknown Candidate",
            "candidate_email": "",
            "candidate_phone": "",
            "current_role": "",
            "experience_years": 0,
            "overall_match_score": 0,
            "star_rating": 1.0,
            "overall_summary": "Analysis completed.",
            "strengths": [],
            "gaps": [],
            "matched_skills": [],
            "missing_skills": [],
            "experience_analysis": "",
            "recommendation": "PENDING",
            "culture_fit_notes": "",
            "red_flags": [],
            "suggested_interview_questions": [],
        }
        for key, default in defaults.items():
            if key not in analysis:
                analysis[key] = default

        return analysis

    except Exception as e:
        print(f"AI Analysis Error: {e}")
        return {
            "candidate_name": "Unknown Candidate",
            "candidate_email": "",
            "candidate_phone": "",
            "current_role": "",
            "experience_years": 0,
            "overall_match_score": 0,
            "star_rating": 1.0,
            "overall_summary": f"Analysis error: {str(e)}",
            "strengths": [],
            "gaps": [],
            "matched_skills": [],
            "missing_skills": [],
            "experience_analysis": "Analysis failed",
            "recommendation": "ERROR",
            "culture_fit_notes": "",
            "red_flags": [],
            "suggested_interview_questions": [],
        }


def generate_jd(title: str, department: str, brief: str, experience_level: str = "Mid-level") -> dict:
    """Generate a professional job description from minimal inputs"""
    system = """You are S.W.A.T.H.I., an expert HR content writer. Create compelling, inclusive job descriptions.
Always respond with valid JSON only."""

    prompt = f"""Create a professional job description for:
- Title: {title}
- Department: {department}
- Experience Level: {experience_level}
- Brief: {brief}

Return this EXACT JSON:
{{
    "title": "<polished job title>",
    "description": "<compelling 3-4 paragraph job description with role overview, team info, impact>",
    "requirements": "<bullet-pointed list of requirements, 6-8 items>",
    "nice_to_have": "<bullet-pointed list of nice-to-have skills, 3-4 items>",
    "salary_suggestion": "<suggested salary range based on role and level>"
}}"""

    try:
        result = _call_groq(system, prompt, temperature=0.5, max_tokens=2000)
        return _parse_json(result)
    except Exception as e:
        return {
            "title": title,
            "description": f"Error generating JD: {str(e)}",
            "requirements": "",
            "nice_to_have": "",
            "salary_suggestion": "",
        }


def generate_email(
    template_type: str,
    candidate_name: str,
    job_title: str,
    company_name: str = "i95dev",
    extra_context: str = "",
) -> dict:
    """Generate professional HR emails — rejection, interview invite, offer, follow-up"""
    system = """You are S.W.A.T.H.I., an empathetic HR communication expert. Write professional, warm emails.
Always respond with valid JSON only."""

    type_instructions = {
        "rejection": "Write a kind, professional rejection email. Be empathetic but clear. Encourage them to apply for future roles.",
        "interview_invite": "Write an exciting interview invitation email. Include placeholders for date/time. Make them feel valued.",
        "offer": "Write a congratulatory offer email. Be enthusiastic! Include placeholder for offer details.",
        "follow_up": "Write a professional follow-up email checking on the candidate's interest/availability.",
        "custom": f"Write a professional email with this context: {extra_context}",
    }

    instruction = type_instructions.get(template_type, type_instructions["custom"])

    prompt = f"""{instruction}

Candidate: {candidate_name}
Position: {job_title}
Company: {company_name}
{f"Additional context: {extra_context}" if extra_context else ""}

Return this EXACT JSON:
{{
    "subject": "<email subject line>",
    "body": "<full email body with proper greeting and sign-off>"
}}"""

    try:
        result = _call_groq(system, prompt, temperature=0.6, max_tokens=1500)
        return _parse_json(result)
    except Exception as e:
        return {
            "subject": f"Regarding {job_title} position",
            "body": f"Error generating email: {str(e)}",
        }


def compare_candidates(candidates_data: list, jd_text: str) -> dict:
    """Compare multiple candidates side-by-side — who should you call first?"""
    system = """You are S.W.A.T.H.I., a strategic HR advisor. Compare candidates objectively.
Always respond with valid JSON only."""

    candidates_summary = "\n\n".join([
        f"CANDIDATE {i+1}: {c.get('name', 'Unknown')}\n"
        f"Score: {c.get('match_score', 0)}/100\n"
        f"Strengths: {', '.join(c.get('strengths', []))}\n"
        f"Gaps: {', '.join(c.get('gaps', []))}\n"
        f"Experience: {c.get('experience_years', 0)} years"
        for i, c in enumerate(candidates_data)
    ])

    prompt = f"""Compare these candidates for the role:

JOB DESCRIPTION:
{jd_text}

{candidates_summary}

Return this EXACT JSON:
{{
    "ranking": [
        {{"name": "<candidate name>", "rank": 1, "reason": "<why #1>"}}
    ],
    "comparison_summary": "<overall comparison paragraph>",
    "hiring_recommendation": "<who to call first and why>"
}}"""

    try:
        result = _call_groq(system, prompt, temperature=0.3, max_tokens=2000)
        return _parse_json(result)
    except Exception as e:
        return {"ranking": [], "comparison_summary": f"Error: {str(e)}", "hiring_recommendation": ""}
