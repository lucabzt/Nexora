import os
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
from PIL import Image
from io import BytesIO
import matplotlib.pyplot as plt
import numpy as np


class VertexImagenAgent:
    def __init__(self):
        """
        Initialize the ImagenAgent with Vertex AI.
        
        Args:
            project_id: Your Google Cloud project ID
            location: The location to use (default: us-central1)
        """
        self.project_id = os.getenv("GOOGLE_PROJECT_ID")
        self.location = "us-central1"
        
        # Initialize Vertex AI
        vertexai.init(project=self.project_id, location=self.location)
        
        # Load the Imagen model
        self.model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")
        self.instructions = """
        --- These are your system instructions ---
        Please generate a vector image as a cover for the chapter which content is given to you.
        DO not include any text in your image. The image should be horizontal.

        --- Chapter Content ---
        """
    
    def run(self, query: str) -> bytes:
        """
        Generate an image based on the provided query.
        
        Args:
            query: Text description of the image to generate
            
        Returns:
            bytes: The generated image as a byte blob
        """
        try:
            # Generate images
            response = self.model.generate_images(
                prompt=self.instructions + "\n" + query,
                number_of_images=1,
                language="en",
                aspect_ratio="1:1",
                safety_filter_level="block_some",
                person_generation="allow_adult"
            )
            
            if response.images and len(response.images) > 0:
                # Convert PIL Image to bytes
                img_byte_arr = BytesIO()
                response.images[0]._pil_image.save(img_byte_arr, format='JPEG')
                return img_byte_arr.getvalue()
            else:
                raise ValueError("No image generated in the response")
                
        except Exception as e:
            print(f"Error generating image: {e}")
            raise


if __name__ == '__main__': # Replace with your actual project ID
    
    try:
        agent = VertexImagenAgent()
        image_blob = agent.run("generate a vector image of a mountain")
        
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