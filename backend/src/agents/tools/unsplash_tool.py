# -*- coding: utf-8 -*-
#!/usr/bin/env python3

import os
from dataclasses import dataclass
from typing import Optional, List, Dict, Union
from google.adk.tools import FunctionTool

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def search_photos(
        query: str,
        page: Union[int, str] = 1,
        per_page: Union[int, str] = 10,
        order_by: str = "relevant",
        color: Optional[str] = None,
        orientation: Optional[str] = None
) -> dict:
    """
    Search for Unsplash photos
    
    Args:
        query: Search keyword
        page: Page number (1-based)
        per_page: Results per page (1-30)
        order_by: Sort method (relevant or latest)
        color: Color filter (black_and_white, black, white, yellow, orange, red, purple, magenta, green, teal, blue)
        orientation: Orientation filter (landscape, portrait, squarish)
    
    Returns:
        dict: A dictionary containing photo object with the following properties:
            - id: Unique identifier for the photo
            - description: Optional text description of the photo
            - urls: Dictionary of available image URLs in different sizes
            - width: Original image width in pixels
            - height: Original image height in pixels
    """
    
    print("Searching for photos with query: " + query)

    access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not access_key:
        raise ValueError("Missing UNSPLASH_ACCESS_KEY environment variable")

    try:
        page_int = int(page)
    except (ValueError, TypeError):
        page_int = 1

    try:
        per_page_int = int(per_page)
    except (ValueError, TypeError):
        per_page_int = 10

    params = {
        "query": query,
        "page": page_int,
        "per_page": min(per_page_int, 30),
        "order_by": order_by,
    }

    if color:
        params["color"] = color
    if orientation:
        params["orientation"] = orientation

    headers = {
        "Accept-Version": "v1",
        "Authorization": f"Client-ID {access_key}"
    }

    try:
        with httpx.Client() as client:
            response = client.get(
                "https://api.unsplash.com/search/photos",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            print("Received " + str(len(data["results"])) + " results: " + data["results"])

            first_one = data["results"][0]
            return {
                    "id": first_one["id"],
                    "description": first_one.get("description"),
                    "urls": first_one["urls"],
                    "width": first_one["width"],
                    "height": first_one["height"]
                }
    except httpx.HTTPStatusError as e:
        print(f"HTTP error: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        print(f"Request error: {str(e)}")
        raise


unsplash_tool = FunctionTool(func=search_photos)