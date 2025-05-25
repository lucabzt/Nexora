import requests
import json
import uuid
from typing import Dict, Any


class Colors:
    """ANSI color codes for terminal output"""
    RESET = "\033[0m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"


def print_section(title: str, color: str = Colors.BLUE):
    """Print a formatted section header"""
    print(f"\n{color}{Colors.BOLD}{'=' * 60}{Colors.RESET}")
    print(f"{color}{Colors.BOLD}{title.center(60)}{Colors.RESET}")
    print(f"{color}{Colors.BOLD}{'=' * 60}{Colors.RESET}\n")


def print_subsection(title: str, color: str = Colors.CYAN):
    """Print a formatted subsection header"""
    print(f"\n{color}{Colors.BOLD}{'-' * 40}{Colors.RESET}")
    print(f"{color}{Colors.BOLD}{title}{Colors.RESET}")
    print(f"{color}{Colors.BOLD}{'-' * 40}{Colors.RESET}")


def format_mc_questions(questions: list) -> str:
    """Format multiple choice questions in a readable way"""
    if not questions:
        return "No questions available"

    formatted = ""
    for i, q in enumerate(questions, 1):
        formatted += f"\n{Colors.YELLOW}{Colors.BOLD}Question {i}:{Colors.RESET}\n"
        formatted += f"{q['question']}\n\n"

        # Format possible answers using the new schema
        answers = {
            'a': q['answer_a'],
            'b': q['answer_b'],
            'c': q['answer_c'],
            'd': q['answer_d']
        }

        for letter, answer in answers.items():
            if letter == q['correct_answer']:
                formatted += f"{Colors.GREEN}  {letter}) {answer} ✓{Colors.RESET}\n"
            else:
                formatted += f"  {letter}) {answer}\n"

        formatted += f"\n{Colors.GREEN}Correct Answer: {q['correct_answer']}{Colors.RESET}\n"
        if i < len(questions):
            formatted += f"\n{'-' * 30}\n"

    return formatted


def test_root_endpoint(base_url: str) -> bool:
    """Test the root endpoint"""
    print_subsection("Testing Root Endpoint", Colors.CYAN)

    try:
        response = requests.get(f"{base_url}/")
        response.raise_for_status()

        data = response.json()
        print(f"{Colors.GREEN}✓ Root endpoint successful{Colors.RESET}")
        print(f"Response: {json.dumps(data, indent=2)}")
        return True

    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}✗ Root endpoint failed: {e}{Colors.RESET}")
        return False


def test_create_session(base_url: str, user_id: str) -> str:
    """Test session creation and return session_id"""
    print_subsection("Testing Session Creation", Colors.CYAN)

    try:
        response = requests.post(f"{base_url}/create_session/{user_id}")
        response.raise_for_status()

        data = response.json()
        session_id = data.get('session_id')

        print(f"{Colors.GREEN}✓ Session creation successful{Colors.RESET}")
        print(f"User ID: {user_id}")
        print(f"Session ID: {session_id}")
        return session_id

    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}✗ Session creation failed: {e}{Colors.RESET}")
        return None


def test_create_course(base_url: str, user_id: str, session_id: str) -> Dict[str, Any]:
    """Test course creation and return the full response"""
    print_subsection("Testing Course Creation", Colors.CYAN)

    # Sample course details
    course_details = {
        "query": "Python programming fundamentals",
        "time": 2  # 2 hours
    }

    try:
        response = requests.post(
            f"{base_url}/create_course/{user_id}/{session_id}",
            json=course_details
        )
        response.raise_for_status()

        data = response.json()
        print(f"{Colors.GREEN}✓ Course creation successful{Colors.RESET}")
        return data

    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}✗ Course creation failed: {e}{Colors.RESET}")
        return None


def display_course_response(course_data: Dict[str, Any]):
    """Display the course response in a human-readable format"""
    if not course_data:
        print(f"{Colors.RED}No course data to display{Colors.RESET}")
        return

    print_section("COURSE CREATION RESPONSE", Colors.MAGENTA)

    print(f"{Colors.BOLD}Status:{Colors.RESET} {course_data.get('status', 'Unknown')}")

    chapters = course_data.get('chapters', [])
    print(f"{Colors.BOLD}Total Chapters:{Colors.RESET} {len(chapters)}")

    for chapter in chapters:
        print_subsection(f"Chapter {chapter.get('index', '?')}: {chapter.get('caption', 'Untitled')}", Colors.YELLOW)

        # Chapter summary
        print(f"{Colors.BOLD}Summary:{Colors.RESET}")
        try:
            summary = json.loads(chapter.get('summary', '[]'))
            for point in summary:
                print(f"  • {point}")
        except json.JSONDecodeError:
            print(f"  {chapter.get('summary', 'No summary available')}")

        # Chapter content (truncated for readability)
        content = chapter.get('content', 'No content available')
        print(f"\n{Colors.BOLD}Content Preview:{Colors.RESET}")
        if len(content) > 300:
            print(f"{content[:300]}...")
            print(f"{Colors.CYAN}[Content truncated - Full length: {len(content)} characters]{Colors.RESET}")
        else:
            print(content)

        # Multiple choice questions
        mc_questions = chapter.get('mc_questions', [])
        print(f"\n{Colors.BOLD}Multiple Choice Questions ({len(mc_questions)} total):{Colors.RESET}")
        print(format_mc_questions(mc_questions))

        print("\n" + "=" * 80 + "\n")


def main():
    """Main test function"""
    base_url = "http://localhost:8000"
    user_id = str(uuid.uuid4())

    print_section("FASTAPI BACKEND TESTING", Colors.BLUE)
    print(f"Base URL: {base_url}")
    print(f"Test User ID: {user_id}")

    # Test 1: Root endpoint
    if not test_root_endpoint(base_url):
        print(f"{Colors.RED}Stopping tests due to root endpoint failure{Colors.RESET}")
        return

    # Test 2: Create session
    session_id = test_create_session(base_url, user_id)
    if not session_id:
        print(f"{Colors.RED}Stopping tests due to session creation failure{Colors.RESET}")
        return

    # Test 3: Create course
    course_data = test_create_course(base_url, user_id, session_id)

    # Display results
    display_course_response(course_data)

    print_section("TESTING COMPLETE", Colors.GREEN)


if __name__ == "__main__":
    print(f"{Colors.BOLD}Starting FastAPI Backend Tests...{Colors.RESET}")
    print(f"{Colors.YELLOW}Make sure your FastAPI server is running on http://localhost:8000{Colors.RESET}")

    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
    except Exception as e:
        print(f"\n{Colors.RED}Unexpected error during testing: {e}{Colors.RESET}")