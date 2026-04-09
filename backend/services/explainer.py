import os
from openai import OpenAI

# Exact LLM Prompt Template (implement verbatim)
PROMPT_TEMPLATE = """System: You are an AI observability assistant. You explain why an AI agent
produced an anomalous output. You only reference information from the trace
data provided. Do not invent reasons or reference anything outside the trace.
Respond in exactly 2–3 sentences of plain English. No bullet points.

User:
Agent session ID: {session_id}
Tool called: {tool_name}
Input: {input_json}
Output: {output_json}
Anomaly detected: {flag_reason}

Explain in plain English why this output is anomalous, citing only the
specific input or output text that caused the flag."""

def explain_anomaly(event_data: dict) -> str:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", "dummy_key"))
    
    prompt = PROMPT_TEMPLATE.format(
        session_id=event_data.get("session_id", ""),
        tool_name=event_data.get("tool_name", ""),
        input_json=event_data.get("input_json", ""),
        output_json=event_data.get("output_json", ""),
        flag_reason=event_data.get("flag_reason") or event_data.get("injection_type") or "Unknown anomaly"
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=150
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating explanation: {str(e)}"
