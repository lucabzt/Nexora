"""
Simple test for the create course endpoint.
Just calls the API and prints the response in a pretty format.
"""

import requests
import json
from pprint import pprint

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "username": "testuser123",
    "email": "testuser123@example.com",
    "password": "testpass123"
}


def register_user():
    """Register a test user"""
    print("🔧 Registering test user...")
    response = requests.post(f"{BASE_URL}/register", json=TEST_USER)

    if response.status_code == 201:
        print("✅ User registered successfully")
        return True
    elif response.status_code == 400 and "already registered" in response.text:
        print("ℹ️  User already exists, continuing...")
        return True
    else:
        print(f"❌ Failed to register user: {response.status_code}")
        print(response.text)
        return False


def login_user():
    """Login and get auth token"""
    print("\n🔐 Logging in...")

    login_data = {
        "username": TEST_USER["username"],
        "password": TEST_USER["password"]
    }

    response = requests.post(f"{BASE_URL}/token", data=login_data)

    if response.status_code == 200:
        token_data = response.json()
        print("✅ Login successful")
        return token_data["access_token"]
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None


def create_course(token):
    """Create a course and print the response"""
    print("\n📚 Creating course...")

    headers = {"Authorization": f"Bearer {token}"}

    course_data = {
        "query": "I want to learn Python programming from basics to advanced concepts",
        "time_hours": 3
    }

    response = requests.post(f"{BASE_URL}/courses/create", json=course_data, headers=headers)

    if response.status_code == 200:
        print("✅ Course created successfully!\n")

        course = response.json()

        # Print course info
        #print("=" * 60)
        #print(f"📖 COURSE: {course['title']}")
        print("=" * 60)
        #print(f"📝 Description: {course['description']}")
        #print(f"🆔 Course ID: {course['course_id']}")
        #print(f"🗂️  Session ID: {course['session_id']}")
        print(f"📊 Total Chapters: {len(course['chapters'])}")

        # Print chapters
        for i, chapter in enumerate(course['chapters'], 1):
            print(f"\n{'─' * 40}")
            print(f"📚 CHAPTER {i}: {chapter['caption']}")
            print(f"{'─' * 40}")
            print(f"⏱️  Time: {chapter['time_minutes']} minutes")
            print(f"📋 Summary: {chapter['summary']}")
            print(f"❓ Questions: {len(chapter['mc_questions'])}")

            # Print first few lines of content
            content_lines = chapter['content'].split('\n')[:3]
            print(f"📄 Content preview:")
            for line in content_lines:
                if line.strip():
                    print(f"   {line}")

            # Print one sample question
            if chapter['mc_questions']:
                q = chapter['mc_questions'][0]
                print(f"\n🤔 Sample Question:")
                print(f"   Q: {q['question']}")
                print(f"   A) {q['answer_a']}")
                print(f"   B) {q['answer_b']}")
                print(f"   C) {q['answer_c']}")
                print(f"   D) {q['answer_d']}")
                print(f"   ✅ Correct: {q['correct_answer'].upper()}")

        print(f"\n{'=' * 60}")
        print("🎉 Course creation test completed successfully!")
        print(f"{'=' * 60}")

    else:
        print(f"❌ Failed to create course: {response.status_code}")
        print("Response:")
        try:
            error_data = response.json()
            pprint(error_data)
        except:
            print(response.text)


def main():
    """Main test function"""
    print("🚀 Starting Create Course Test")
    print("=" * 40)

    # Step 1: Register user
    if not register_user():
        return

    # Step 2: Login
    token = login_user()
    if not token:
        return

    # Step 3: Create course
    create_course(token)


if __name__ == "__main__":
    main()