# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
from typing import List

from google.genai import types

from ..db.models.db_file import Document, Image


def create_text_query(query: str) -> types.Content:
    """ Takes a string and returns a user query that can be sent to an agent """
    return types.Content(role="user", parts=[types.Part(text=query)])


def create_docs_query(query: str, docs: List[Document], images: List[Image]) -> types.Content:
    """ Takes a string and fastapi UploadFile object and returns a user query that can be sent to an agent """
    parts = [types.Part(text=query)]
    for doc in docs:
        parts.append(types.Part.from_bytes(
            data=doc.file_data,
            mime_type=doc.content_type,
        ))
    for image in images:
        parts.append(types.Part.from_bytes(
            data=image.image_data,
            mime_type=image.content_type,
        ))
    return types.Content(role="user", parts=parts)


# ------- Loading system instructions for agents -------

def load_instruction_from_file(
    filename: str, default_instruction: str = "Default instruction."
) -> str:
    """Reads instruction text from a single file relative to this script."""
    instruction = default_instruction
    try:
        # Construct path relative to the current script file (__file__)
        filepath = os.path.join(os.path.dirname(__file__), filename)
        with open(filepath, "r", encoding="utf-8") as f:
            instruction = f.read()
        print(f"Successfully loaded instruction from {filename}")
    except FileNotFoundError:
        print(f"WARNING: Instruction file not found: {filepath}. Using default.")
    except Exception as e:
        print(f"ERROR loading instruction file {filepath}: {e}. Using default.")
    return instruction


def load_instructions_from_files(filenames: List[str], separator: str = "\n\n---\n\n") -> str:
    """
    Loads and combines multiple instruction files into a single string.

    Args:
        filenames: List of file paths relative to the calling script
        separator: String to separate content from different files

    Returns:
        Combined instruction string
    """
    combined_instructions = []

    for filename in filenames:
        try:
            filepath = os.path.join(os.path.dirname(__file__), filename)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read().strip()
                combined_instructions.append(f"# {os.path.basename(filename)}\n\n{content}")
        except FileNotFoundError:
            print(f"WARNING: Instruction file not found: {filepath}")
        except Exception as e:
            print(f"ERROR loading instruction file {filepath}: {e}")

    return separator.join(combined_instructions)