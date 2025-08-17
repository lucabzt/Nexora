"""
Updated course creation demo with streaming support.
"""

import requests
import json
from pprint import pprint
import time

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
    response = requests.post(f"{BASE_URL}/auth/signup", json=TEST_USER)

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


def create_course_streaming(token):
    """Create a course using the streaming endpoint"""
    print("\n📚 Creating course with streaming...")

    headers = {"Authorization": f"Bearer {token}"}

    course_data = {
        "query": "I want to learn Python programming from basics to advanced concepts",
        "time_hours": 3,
        "document_ids": [5],
        "picture_ids": []
    }

    print("🚀 Starting streaming request...")
    start_time = time.time()

    try:
        response = requests.post(
            f"{BASE_URL}/courses/create",
            json=course_data,
            headers=headers,
            stream=True  # Enable streaming
        )

        if response.status_code != 200:
            print(f"❌ Request failed: {response.status_code}")
            print(response.text)
            return

        print("✅ Stream started successfully!\n")

        # Initialize variables to track the course
        course_info = None
        chapters = []
        chapter_count = 0

        # Process the stream line by line
        for line in response.iter_lines():
            if line:
                try:
                    # Parse the JSON chunk
                    chunk = json.loads(line.decode('utf-8'))
                    chunk_type = chunk.get("type")
                    data = chunk.get("data", {})

                    if chunk_type == "course_info":
                        course_info = data
                        print("📖 COURSE CREATED")
                        print("=" * 60)
                        print(f"🆔 Course ID: {course_info['course_id']}")
                        print(f"📚 Title: {course_info['title']}")
                        print(f"📝 Description: {course_info['description']}")
                        print(f"🗂️  Session ID: {course_info['session_id']}")
                        print(f"⏰ Total Time: {course_info['total_time_hours']} hours")
                        print("=" * 60)
                        print("📋 Creating chapters...")
                        print()

                    elif chunk_type == "chapter":
                        chapter_count += 1
                        chapters.append(data)

                        print(f"{'─' * 40}")
                        print(f"📚 CHAPTER {chapter_count}: {data['caption']}")
                        print(f"{'─' * 40}")
                        print(f"⏱️  Time: {data['time_minutes']} minutes")
                        print(f"❓ Questions: {len(data['mc_questions'])}")

                        # Print first few lines of content
                        content_lines = data['content'].split('\n')[:3]
                        print(f"📄 Content preview:")
                        for line in content_lines:
                            if line.strip():
                                print(f"   {line[:80]}{'...' if len(line) > 80 else ''}")

                        # Print one sample question
                        if data['mc_questions']:
                            q = data['mc_questions'][0]
                            print(f"\n🤔 Sample Question:")
                            print(f"   Q: {q['question'][:60]}{'...' if len(q['question']) > 60 else ''}")
                            print(f"   A) {q['answer_a'][:40]}{'...' if len(q['answer_a']) > 40 else ''}")
                            print(f"   B) {q['answer_b'][:40]}{'...' if len(q['answer_b']) > 40 else ''}")
                            print(f"   ✅ Correct: {q['correct_answer'].upper()}")

                        elapsed = time.time() - start_time
                        print(f"⏰ Elapsed: {elapsed:.1f}s")
                        print()

                    elif chunk_type == "complete":
                        total_time = time.time() - start_time
                        print(f"{'=' * 60}")
                        print("🎉 COURSE CREATION COMPLETED!")
                        print(f"📊 Total Chapters: {len(chapters)}")
                        print(f"⏰ Total Time: {total_time:.1f} seconds")
                        print(f"🆔 Course ID: {course_info['course_id'] if course_info else 'N/A'}")
                        print(f"{'=' * 60}")
                        break

                    elif chunk_type == "error":
                        print(f"❌ ERROR: {data.get('message', 'Unknown error')}")
                        break

                    else:
                        print(f"⚠️  Unknown chunk type: {chunk_type}")

                except json.JSONDecodeError as e:
                    print(f"❌ Failed to parse JSON chunk: {e}")
                    print(f"Raw line: {line}")
                except Exception as e:
                    print(f"❌ Error processing chunk: {e}")

        print("\n📊 FINAL SUMMARY:")
        if course_info:
            print(f"Course '{course_info['title']}' created with {len(chapters)} chapters")

            # Calculate total questions
            total_questions = sum(len(ch['mc_questions']) for ch in chapters)
            total_time_minutes = sum(ch['time_minutes'] for ch in chapters)

            print(f"📝 Total Questions: {total_questions}")
            print(f"⏰ Total Study Time: {total_time_minutes} minutes ({total_time_minutes/60:.1f} hours)")
        else:
            print("❌ Course creation failed - no course info received")

    except requests.exceptions.RequestException as e:
        print(f"❌ Network error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


def main():
    """Main test function"""
    print("🚀 Starting Course Creation Streaming Test")
    print("=" * 50)

    # Step 1: Register user
    if not register_user():
        return

    # Step 2: Login
    token = login_user()
    if not token:
        return

    # Step 3: Create course with streaming
    create_course_streaming(token)

if __name__ == "__main__":
    main()