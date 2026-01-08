from typing import List, Dict, Optional
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv
import re
import json

load_dotenv()

# Common ATS keywords by category
ATS_KEYWORDS = {
    "technical_skills": [
        "python", "java", "javascript", "typescript", "c++", "sql", "aws", "azure", "gcp",
        "docker", "kubernetes", "git", "react", "node.js", "machine learning", "data analysis",
        "tensorflow", "pytorch", "pandas", "numpy", "mongodb", "postgresql", "redis", "graphql",
        "rest api", "microservices", "ci/cd", "agile", "scrum", "devops"
    ],
    "soft_skills": [
        "leadership", "communication", "teamwork", "problem-solving", "critical thinking",
        "adaptability", "time management", "collaboration", "creativity", "attention to detail",
        "project management", "mentoring", "strategic thinking"
    ],
    "action_verbs": [
        "achieved", "implemented", "developed", "managed", "led", "designed", "optimized",
        "increased", "reduced", "delivered", "created", "analyzed", "streamlined", "spearheaded",
        "architected", "mentored", "automated", "launched", "built", "transformed"
    ]
}

# Initialize LLM for suggestions
_llm = None

def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(model="openai/gpt-oss-120b", temperature=0.7)
    return _llm


def _generate_llm_suggestions(resume_text: str, score_breakdown: Dict, found_skills: List, found_verbs: List) -> List[str]:
    """
    Generate personalized resume improvement suggestions using LLM.
    """
    llm = _get_llm()
    
    system_prompt = """You are an expert resume consultant and ATS (Applicant Tracking System) specialist.
Analyze the resume and provide 5-7 specific, actionable suggestions to improve it.

Focus on:
1. Missing keywords that would help pass ATS filters
2. Quantifiable achievements that could be added
3. Skills gaps based on common job requirements
4. Formatting and structure improvements
5. Action verbs and impact statements

Be specific and reference actual content from the resume when possible.
Return ONLY a JSON array of suggestion strings, nothing else."""

    user_prompt = f"""Resume Content (excerpt):
{resume_text[:3000]}

Current ATS Score Breakdown:
- Technical Skills Score: {score_breakdown['technical_skills']}/35
- Soft Skills Score: {score_breakdown['soft_skills']}/20
- Action Verbs Score: {score_breakdown['action_verbs']}/15
- Formatting Score: {score_breakdown['formatting']}/30

Skills Found: {', '.join(found_skills[:15]) if found_skills else 'None'}
Action Verbs Found: {', '.join(found_verbs[:10]) if found_verbs else 'None'}

Based on this analysis, provide 5-7 specific improvement suggestions as a JSON array."""

    try:
        response = llm.invoke([
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ])
        
        # Parse JSON from response
        content = response.content.strip()
        # Handle markdown code blocks
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        suggestions = json.loads(content)
        if isinstance(suggestions, list):
            return suggestions[:7]  # Cap at 7 suggestions
    except Exception as e:
        print(f"LLM suggestion generation failed: {e}")
        # Fallback to basic suggestions
        return _generate_fallback_suggestions(score_breakdown)
    
    return _generate_fallback_suggestions(score_breakdown)


def _generate_fallback_suggestions(breakdown: Dict) -> List[str]:
    """Fallback suggestions if LLM fails."""
    suggestions = []
    if breakdown.get("technical_skills", 0) < 20:
        suggestions.append("Add more technical skills relevant to your target role (e.g., programming languages, frameworks, tools).")
    if breakdown.get("soft_skills", 0) < 10:
        suggestions.append("Include soft skills like leadership, communication, and problem-solving with examples.")
    if breakdown.get("action_verbs", 0) < 9:
        suggestions.append("Use more action verbs (achieved, implemented, led, optimized) to describe your accomplishments.")
    if breakdown.get("formatting", 0) < 30:
        suggestions.append("Ensure your contact information includes email, phone, and LinkedIn profile.")
    suggestions.append("Quantify your achievements with numbers, percentages, or dollar amounts where possible.")
    return suggestions


def calculate_ats_score(resume_text: str) -> Dict:
    """
    Calculate an ATS compatibility score based on keyword presence and formatting.
    Uses LLM for personalized suggestions.
    
    Args:
        resume_text: Full text content of the resume.
    
    Returns:
        dict: Score breakdown and LLM-generated suggestions.
    """
    text_lower = resume_text.lower()
    
    # Keyword matching
    found_technical = [kw for kw in ATS_KEYWORDS["technical_skills"] if kw in text_lower]
    found_soft = [kw for kw in ATS_KEYWORDS["soft_skills"] if kw in text_lower]
    found_verbs = [v for v in ATS_KEYWORDS["action_verbs"] if v in text_lower]
    
    # Score calculation (simple rule-based)
    technical_score = min(len(found_technical) * 5, 35)  # Max 35 points
    soft_score = min(len(found_soft) * 5, 20)            # Max 20 points
    verb_score = min(len(found_verbs) * 3, 15)           # Max 15 points
    
    # Format checks
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', resume_text))
    has_phone = bool(re.search(r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}', resume_text))
    has_linkedin = "linkedin" in text_lower
    
    format_score = (has_email * 10) + (has_phone * 10) + (has_linkedin * 10)  # Max 30 points
    
    total_score = technical_score + soft_score + verb_score + format_score
    
    breakdown = {
        "technical_skills": technical_score,
        "soft_skills": soft_score,
        "action_verbs": verb_score,
        "formatting": format_score
    }
    
    # Generate LLM-powered suggestions
    suggestions = _generate_llm_suggestions(
        resume_text, 
        breakdown, 
        found_technical + found_soft, 
        found_verbs
    )
    
    return {
        "total_score": min(total_score, 100),
        "breakdown": breakdown,
        "found_skills": found_technical + found_soft,
        "found_verbs": found_verbs,
        "suggestions": suggestions
    }


@tool
def ats_score_tool(resume_text: str) -> dict:
    """
    Analyze resume text and calculate an ATS (Applicant Tracking System) compatibility score.
    
    Args:
        resume_text: The full text content of the resume to analyze.
    
    Returns:
        dict: ATS score, breakdown, and LLM-generated improvement suggestions.
    """
    return calculate_ats_score(resume_text)
