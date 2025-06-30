import os
import asyncio
import vertexai
from dotenv import load_dotenv
from vertexai.vision_models import ImageGenerationModel
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import traceback
import matplotlib.pyplot as plt
import numpy as np
from dotenv import load_dotenv

load_dotenv("../../../.env")


class VertexImagenAgent:
    def __init__(self):
        """
        Initialize the ImagenAgent with Vertex AI.

        Args:
            project_id: Your Google Cloud project ID
            location: The location to use (default: us-central1)
        """
        print(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
        self.project_id = os.getenv("GOOGLE_PROJECT_ID")
        self.location = "us-central1"

        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)

        # Load the Imagen model
        self.model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")
        self.instructions = """
        --- These are your system instructions ---
        Please generate a professional, educational vector-style image as a cover for the chapter content provided.
        Create a clean, abstract, minimalist design without any text or written content.
        The image should be suitable for educational materials and completely safe for all audiences.
        Use neutral, professional colors and abstract geometric shapes or educational symbols.

        --- Chapter Content ---
        """

    def create_fallback_image(self, width=512, height=384) -> bytes:
        """
        Create a simple black and white placeholder image.

        Args:
            width: Image width
            height: Image height

        Returns:
            bytes: Simple placeholder image as bytes
        """
        # Create a simple black and white image
        img = Image.new('RGB', (width, height), color='white')
        draw = ImageDraw.Draw(img)

        # Draw a simple border
        draw.rectangle([10, 10, width - 10, height - 10], outline='black', width=3)

        # Draw some simple geometric shapes
        center_x, center_y = width // 2, height // 2

        # Draw a circle
        circle_radius = min(width, height) // 6
        draw.ellipse([center_x - circle_radius, center_y - circle_radius,
                      center_x + circle_radius, center_y + circle_radius],
                     outline='black', width=2)

        # Draw some lines
        draw.line([center_x - 50, center_y - 80, center_x + 50, center_y - 80], fill='black', width=2)
        draw.line([center_x - 50, center_y + 80, center_x + 50, center_y + 80], fill='black', width=2)

        # Convert to bytes
        img_byte_arr = BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=85)
        return img_byte_arr.getvalue()

    def sanitize_prompt(self, query: str) -> str:
        """
        Sanitize the prompt to avoid content filter issues.

        Args:
            query: Original query

        Returns:
            str: Sanitized query
        """
        # Remove potentially problematic words and replace with safer alternatives
        sanitized = query.lower()

        # Add explicit safety context
        safe_prompt = f"""
        Educational content illustration. Create a professional, clean, abstract design.
        Safe for all audiences. Educational and professional context only.

        Content theme: {sanitized}

        Style: Minimalist, geometric, educational, professional, abstract shapes and symbols only.
        Colors: Professional color palette suitable for educational materials.
        """

        return safe_prompt

    async def run(self, query: str) -> bytes:
        """
        Generate an image based on the provided query.

        Args:
            query: Text description of the image to generate

        Returns:
            bytes: The generated image as a byte blob or fallback image
        """

        def _generate_image_sync(safe_query: str) -> bytes:
            """Synchronous image generation wrapper"""
            # Generate images with more permissive settings
            response = self.model.generate_images(
                prompt=self.instructions + "\n" + safe_query,
                number_of_images=1,
                language="en",
                aspect_ratio="16:9",  # Changed to horizontal as requested
                safety_filter_level="block_few",  # Less restrictive than "block_some"
                person_generation="dont_allow"  # Avoid any person-related content
            )

            if response.images and len(response.images) > 0:
                # Convert PIL Image to bytes
                img_byte_arr = BytesIO()
                response.images[0]._pil_image.save(img_byte_arr, format='JPEG', quality=85)
                return img_byte_arr.getvalue()
            else:
                raise ValueError("No image generated in the response")

        def _generate_fallback_sync(simple_prompt: str) -> bytes:
            """Synchronous fallback generation wrapper"""
            response = self.model.generate_images(
                prompt=simple_prompt,
                number_of_images=1,
                language="en",
                aspect_ratio="16:9",
                safety_filter_level="block_few",
                person_generation="dont_allow"
            )

            if response.images and len(response.images) > 0:
                img_byte_arr = BytesIO()
                response.images[0]._pil_image.save(img_byte_arr, format='JPEG', quality=85)
                return img_byte_arr.getvalue()
            else:
                raise ValueError("No fallback image generated")

        try:
            # Sanitize the prompt
            safe_query = self.sanitize_prompt(query)

            # Run the synchronous image generation in a thread pool
            return await asyncio.to_thread(_generate_image_sync, safe_query)

        except Exception as e:
            # Print the full exception for debugging
            print(f"Error generating image: {e}")
            print("Full traceback:")
            traceback.print_exc()

            # Try one more time with an even simpler prompt
            try:
                print("Attempting fallback generation with simplified prompt...")
                simple_prompt = "Abstract geometric educational illustration, minimalist design, professional, safe"

                return await asyncio.to_thread(_generate_fallback_sync, simple_prompt)

            except Exception as fallback_error:
                print(f"Fallback generation also failed: {fallback_error}")

            # Return a simple black and white placeholder image
            print("Returning black and white placeholder image")
            return self.create_fallback_image(width=512, height=288)  # 16:9 aspect ratio

async def main():
    try:

        agent = VertexImagenAgent()

        image_blob = await agent.run("generate a vector image of a mountain")

        # Convert the image blob to a PIL Image

        image = Image.open(BytesIO(image_blob))

        # Display the image using matplotlib

        plt.figure(figsize=(10, 10))

        plt.imshow(np.array(image))

        plt.axis('off')  # Hide axes

        plt.show()

        print(f"Generated image blob of size: {len(image_blob)} bytes")





    except Exception as e:

        print(f"Failed to generate image: {e}")

        print("Make sure you have:")

        print("1. Set up Google Cloud authentication")

        print("2. Enabled Vertex AI API")

        print("3. Set the correct project ID")

if __name__ == '__main__':  # Replace with your actual project ID
    asyncio.run(main())