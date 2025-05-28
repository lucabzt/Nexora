"""
Course creation demo that uploads a document and creates a course with it.
This demo creates a course using the testfile.txt document.
"""

import requests
import json
import os
from pprint import pprint

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USER = {
    "username": "testuser123",
    "email": "testuser123@example.com",
    "password": "testpass123"
}

def create_testfile():
    """Create a test file if it doesn't exist"""
    testfile_path = "/home/lucabozzetti/Code/TeachAI/backend/test/testfile.txt"
    if not os.path.exists(testfile_path):
        print("📝 Creating testfile.txt...")
        with open(testfile_path, "w") as f:
            f.write("""This is a test document for course creation.

Course Content Guidelines:
- Start with fundamentals
- Include practical examples  
- Provide clear explanations
- Add interactive exercises
- Build complexity gradually

Python Programming Topics:
- Variables and data types
- Control structures (if/else, loops)
- Functions and modules
- Object-oriented programming
- Error handling and debugging
- Working with files and data
- Popular libraries (requests, pandas, etc.)

The course should be engaging and hands-on, allowing students to practice coding as they learn.
""")
        print("✅ testfile.txt created")
    else:
        print("ℹ️  testfile.txt already exists")
    return testfile_path

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


def upload_document(token, file_path):
    """Upload the test document"""
    print(f"\n📤 Uploading document: {file_path}")

    headers = {"Authorization": f"Bearer {token}"}

    try:
        with open(file_path, "rb") as file:
            files = {"file": (os.path.basename(file_path), file, "text/plain")}

            response = requests.post(
                f"{BASE_URL}/files/documents",
                headers=headers,
                files=files
            )

        if response.status_code == 200:
            doc_data = response.json()
            doc_id = doc_data["id"]
            print(f"✅ Document uploaded successfully with ID: {doc_id}")
            print(f"   Filename: {doc_data['filename']}")
            print(f"   Content Type: {doc_data['content_type']}")
            return doc_id
        else:
            print(f"❌ Failed to upload document: {response.status_code}")
            print("Response:")
            try:
                error_data = response.json()
                pprint(error_data)
            except:
                print(response.text)
            return None

    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        return None
    except Exception as e:
        print(f"❌ Error uploading file: {e}")
        return None

def create_course_with_document(token, document_id):
    """Create the actual course with the uploaded document"""
    print("\n📚 Creating course with document...")

    headers = {"Authorization": f"Bearer {token}"}

    course_data = {
        "query": "",
        "time_hours": 1,
        "document_ids": [document_id],
    }

    response = requests.post(f"{BASE_URL}/courses/create", json=course_data, headers=headers)

    if response.status_code == 200:
        print("✅ Course created successfully with document!\n")

        course = response.json()

        # Print course info
        print("=" * 60)
        print(f"📖 COURSE: {course.get('title', 'N/A')}")
        print("=" * 60)
        print(f"📝 Description: {course.get('description', 'N/A')}")
        print(f"🗂️  Session ID: {course.get('session_id', 'N/A')}")
        print(f"📊 Total Chapters: {len(course.get('chapters', []))}")
        print(f"📄 Document Used: testfile.txt (ID: {document_id})")

        # Print chapters
        for i, chapter in enumerate(course.get('chapters', []), 1):
            print(f"\n{'─' * 40}")
            print(f"📚 CHAPTER {i}: {chapter.get('caption', 'N/A')}")
            print(f"{'─' * 40}")
            print(f"⏱️  Time: {chapter.get('time_minutes', 0)} minutes")
            print(f"📋 Summary: {chapter.get('summary', 'N/A')}")
            print(f"❓ Questions: {len(chapter.get('mc_questions', []))}")

            # Print first few lines of content
            content = chapter.get('content', '')
            if content:
                content_lines = content.split('\n')[:3]
                print(f"📄 Content preview:")
                for line in content_lines:
                    if line.strip():
                        print(f"   {line}")

            # Print one sample question
            questions = chapter.get('mc_questions', [])
            if questions:
                q = questions[0]
                print(f"\n🤔 Sample Question:")
                print(f"   Q: {q.get('question', 'N/A')}")
                print(f"   A) {q.get('answer_a', 'N/A')}")
                print(f"   B) {q.get('answer_b', 'N/A')}")
                print(f"   C) {q.get('answer_c', 'N/A')}")
                print(f"   D) {q.get('answer_d', 'N/A')}")
                print(f"   ✅ Correct: {q.get('correct_answer', 'N/A').upper()}")

        print(f"\n{'=' * 60}")
        print("🎉 Course creation with document test completed successfully!")
        print(f"{'=' * 60}")

        return course.get('course_id')

    else:
        print(f"❌ Failed to create course: {response.status_code}")
        print("Response:")
        try:
            error_data = response.json()
            pprint(error_data)
        except:
            print(response.text)
        return None

def main():
    """Main test function"""
    print("🚀 Starting Create Course with Document Test")
    print("=" * 50)

    # Step 0: Create test file
    testfile_path = create_testfile()

    # Step 1: Register user
    if not register_user():
        return

    # Step 2: Login
    token = login_user()
    if not token:
        return

    # Step 4: Upload document
    document_id = upload_document(token, testfile_path)
    if not document_id:
        return

    # Step 5: Create real course with document
    course_id = create_course_with_document(token, document_id)
    if not course_id:
        return

    print(f"\n🎊 SUCCESS! Course created with document.")
    print(f"   Course ID: {course_id}")
    print(f"   Document ID: {document_id}")
    print(f"   Test file: {testfile_path}")

if __name__ == "__main__":
    main()