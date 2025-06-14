from pydantic import BaseModel, Field

class CourseInfo(BaseModel):
    title: str = Field(description="Title of the course")
    description: str = Field(description="Description of the course")
    image_url: str = Field(description="Image URL generated by the image_agent")