# -*- coding: utf-8 -*-
# !/usr/bin/env python3

import os
from dataclasses import dataclass
from typing import List, Dict

import httpx
from dotenv import load_dotenv
from fastmcp import FastMCP

# Load environment variables
load_dotenv()

# Create an MCP server
mcp = FastMCP("Unsplash MCP Server")


@dataclass
class UnsplashPhoto:
    id: str
    description: str  # Remove Optional
    urls: Dict[str, str]
    width: int
    height: int


@mcp.tool()
async def search_photos(
        query: str,
        page: int = 1,
        per_page: int = 10,
        order_by: str = "relevant"
) -> List[UnsplashPhoto]:
    """
    Search for Unsplash photos

    Args:
        query: Search keyword
        page: Page number (1-based, integer only)
        per_page: Results per page (1-30, integer only)
        order_by: Sort method (relevant or latest)

    Returns:
        List[UnsplashPhoto]: List of search results containing photo objects
    """
    access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not access_key:
        raise ValueError("Missing UNSPLASH_ACCESS_KEY environment variable")

    # Validate and constrain parameters
    page = max(1, int(page))
    per_page = max(1, min(int(per_page), 30))

    params = {
        "query": query,
        "page": page,
        "per_page": per_page,
        "order_by": order_by,
    }

    headers = {
        "Accept-Version": "v1",
        "Authorization": f"Client-ID {access_key}"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.unsplash.com/search/photos",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            return [
                UnsplashPhoto(
                    id=photo["id"],
                    description=photo.get("description") or "No description available",  # Handle None
                    urls=photo["urls"],
                    width=photo["width"],
                    height=photo["height"]
                )
                for photo in data["results"]
            ]
    except httpx.HTTPStatusError as e:
        print(f"HTTP error: {e.response.status_code} - {e.response.text}")
        raise
    except Exception as e:
        print(f"Request error: {str(e)}")
        raise


# Add separate functions for filtering if needed
@mcp.tool()
async def search_photos_with_color(
        query: str,
        color: str,
        page: int = 1,
        per_page: int = 10
) -> List[UnsplashPhoto]:
    """
    Search for Unsplash photos with color filter

    Args:
        query: Search keyword
        color: Color filter (black_and_white, black, white, yellow, orange, red, purple, magenta, green, teal, blue)
        page: Page number (1-based)
        per_page: Results per page (1-30)

    Returns:
        List[UnsplashPhoto]: List of search results
    """
    access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not access_key:
        raise ValueError("Missing UNSPLASH_ACCESS_KEY environment variable")

    page = max(1, int(page))
    per_page = max(1, min(int(per_page), 30))

    params = {
        "query": query,
        "page": page,
        "per_page": per_page,
        "color": color,
    }

    headers = {
        "Accept-Version": "v1",
        "Authorization": f"Client-ID {access_key}"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.unsplash.com/search/photos",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            return [
                UnsplashPhoto(
                    id=photo["id"],
                    description=photo.get("description") or "No description available",
                    urls=photo["urls"],
                    width=photo["width"],
                    height=photo["height"]
                )
                for photo in data["results"]
            ]
    except Exception as e:
        print(f"Request error: {str(e)}")
        raise


@mcp.tool()
async def search_photos_with_orientation(
        query: str,
        orientation: str,
        page: int = 1,
        per_page: int = 10
) -> List[UnsplashPhoto]:
    """
    Search for Unsplash photos with orientation filter

    Args:
        query: Search keyword
        orientation: Orientation filter (landscape, portrait, squarish)
        page: Page number (1-based)
        per_page: Results per page (1-30)

    Returns:
        List[UnsplashPhoto]: List of search results
    """
    access_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if not access_key:
        raise ValueError("Missing UNSPLASH_ACCESS_KEY environment variable")

    page = max(1, int(page))
    per_page = max(1, min(int(per_page), 30))

    params = {
        "query": query,
        "page": page,
        "per_page": per_page,
        "orientation": orientation,
    }

    headers = {
        "Accept-Version": "v1",
        "Authorization": f"Client-ID {access_key}"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.unsplash.com/search/photos",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

            return [
                UnsplashPhoto(
                    id=photo["id"],
                    description=photo.get("description") or "No description available",
                    urls=photo["urls"],
                    width=photo["width"],
                    height=photo["height"]
                )
                for photo in data["results"]
            ]
    except Exception as e:
        print(f"Request error: {str(e)}")
        raise


if __name__ == "__main__":
    mcp.run()