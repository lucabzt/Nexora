import time
import requests
import json
import uuid
from typing import Dict, Any, Optional
import os


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


def test_create_course_without_file(base_url: str, user_id: str, session_id: str) -> Dict[str, Any]:
    """Test course creation without file upload using form data"""
    print_subsection("Testing Course Creation (No File)", Colors.CYAN)

    # Prepare form data (not JSON anymore)
    form_data = {
        "query": "Python programming fundamentals",
        "time": "2"  # Form data is always strings
    }

    try:
        start = time.time()
        response = requests.post(
            f"{base_url}/create_course/{user_id}/{session_id}",
            data=form_data  # Use data parameter for form data, not json
        )
        end = time.time()
        response.raise_for_status()

        data = response.json()
        print(f"{Colors.GREEN}✓ Course creation (no file) successful{Colors.RESET}")
        print(f"PDF Processed: {data.get('pdf_processed', False)}")
        print(f"Course creation takes {round((end - start) / 60., 2)} minutes")
        return data

    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}✗ Course creation (no file) failed: {e}{Colors.RESET}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Response text: {e.response.text}")
        return None


def test_create_course_with_file(base_url: str, user_id: str, session_id: str, pdf_path: Optional[str] = None) -> Dict[
    str, Any]:
    """Test course creation with file upload"""
    print_subsection("Testing Course Creation (With File)", Colors.CYAN)

    if not pdf_path or not os.path.exists(pdf_path):
        print(f"{Colors.YELLOW}⚠ No PDF file provided or file doesn't exist: {pdf_path}{Colors.RESET}")
        print(f"{Colors.YELLOW}Skipping file upload test{Colors.RESET}")
        return None

    # Prepare form data with file
    form_data = {
        "query": "Analyze this document and create a learning path",
        "time": "3"  # Form data is always strings
    }

    try:
        with open(pdf_path, 'rb') as pdf_file:
            files = {
                'file': ('test_document.pdf', pdf_file, 'application/pdf')
            }

            start = time.time()
            response = requests.post(
                f"{base_url}/create_course/{user_id}/{session_id}",
                data=form_data,
                files=files
            )
            end = time.time()
            response.raise_for_status()

        data = response.json()
        print(f"{Colors.GREEN}✓ Course creation (with file) successful{Colors.RESET}")
        print(f"PDF Processed: {data.get('pdf_processed', False)}")
        print(f"Course creation takes {round((end - start) / 60., 2)} minutes")
        return data

    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}✗ Course creation (with file) failed: {e}{Colors.RESET}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Response text: {e.response.text}")
        return None
    except FileNotFoundError:
        print(f"{Colors.RED}✗ PDF file not found: {pdf_path}{Colors.RESET}")
        return None


def display_course_response(course_data: Dict[str, Any]):
    """Display the course response in a human-readable format"""
    if not course_data:
        print(f"{Colors.RED}No course data to display{Colors.RESET}")
        return

    print_section("COURSE CREATION RESPONSE", Colors.MAGENTA)

    print(f"{Colors.BOLD}Status:{Colors.RESET} {course_data.get('status', 'Unknown')}")
    print(f"{Colors.BOLD}PDF Processed:{Colors.RESET} {course_data.get('pdf_processed', 'N/A')}")

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

    # Optional: specify a PDF file path for testing file upload
    # Change this path to a real PDF file on your system if you want to test file upload
    test_pdf_path = "test/test.pdf"  # e.g., "./test_document.pdf"

    print_section("FASTAPI BACKEND TESTING", Colors.BLUE)
    print(f"Base URL: {base_url}")
    print(f"Test User ID: {user_id}")
    if test_pdf_path:
        print(f"Test PDF File: {test_pdf_path}")

    # Test 1: Root endpoint
    if not test_root_endpoint(base_url):
        print(f"{Colors.RED}Stopping tests due to root endpoint failure{Colors.RESET}")
        return

    # Test 2: Create session
    session_id = test_create_session(base_url, user_id)
    if not session_id:
        print(f"{Colors.RED}Stopping tests due to session creation failure{Colors.RESET}")
        return

    # Test 3: Create course without file
    course_data_no_file = test_create_course_without_file(base_url, user_id, session_id)

    # Test 4: Create course with file (if PDF provided)
    course_data_with_file = None
    if test_pdf_path:
        # Create a new session for the file test
        session_id_file = test_create_session(base_url, user_id + "_file")
        if session_id_file:
            course_data_with_file = test_create_course_with_file(base_url, user_id + "_file", session_id_file,
                                                                 test_pdf_path)

    # Display results
    if course_data_no_file:
        print_section("COURSE WITHOUT FILE RESULTS", Colors.MAGENTA)
        display_course_response(course_data_no_file)

    if course_data_with_file:
        print_section("COURSE WITH FILE RESULTS", Colors.MAGENTA)
        display_course_response(course_data_with_file)

    print_section("TESTING COMPLETE", Colors.GREEN)


if __name__ == "__main__":
    print(f"{Colors.BOLD}Starting FastAPI Backend Tests...{Colors.RESET}")
    print(f"{Colors.YELLOW}Make sure your FastAPI server is running on http://localhost:8000{Colors.RESET}")
    print(f"{Colors.CYAN}To test file upload, set 'test_pdf_path' variable to point to a PDF file{Colors.RESET}")

    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}")
    except Exception as e:
        print(f"\n{Colors.RED}Unexpected error during testing: {e}{Colors.RESET}")