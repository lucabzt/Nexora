import copy
import re

from google.genai import types
from typing import Optional

from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmResponse


def get_url_from_response(callback_context: CallbackContext, llm_response: LlmResponse) -> Optional[LlmResponse]:
    # --- Inspection ---
    original_text = ""
    if llm_response.content and llm_response.content.parts:
        # Assuming simple text response for this example
        if llm_response.content.parts[0].text:
            original_text = llm_response.content.parts[0].text
        elif llm_response.content.parts[0].function_call:
            return None
        else:
            return None
    elif llm_response.error_message:
        return None
    else:
        return None

    # --- URL Extraction ---
    # Match https:// followed by non-whitespace and non-quote characters
    match = re.search(r'https://[^\s\'"]+(?=[\s\'"]|$)', original_text)
    url = match.group(0) if match else "https://confetticampus.de/wp-content/uploads/2022/02/Oxford-Top-File-A4-Eckspannermappe-mit-Einschlagklappen-rot-1350x1350.jpg"

    print(f"EIERLECKER Parse JSON Callback modified response from {original_text} to {url}")

    # Create a NEW LlmResponse with the modified content
    # Deep copy parts to avoid modifying original if other callbacks exist
    modified_parts = [copy.deepcopy(part) for part in llm_response.content.parts]
    modified_parts[0].text = url  # Update the text in the copied part

    new_response = LlmResponse(
        content=types.Content(role="model", parts=modified_parts),
        grounding_metadata=llm_response.grounding_metadata
    )
    return new_response