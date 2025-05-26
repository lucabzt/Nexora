#!/usr/bin/env python3
import sys
import os
import argparse

# Add the parent directory (project root) to sys.path to allow importing app modules
# This assumes the script is in a subdirectory like 'scripts/'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal, engine # Import engine if you need to create tables
from app.models import User, Base # Import Base if you need to create tables
from app.auth import get_password_hash

# Optional: Create tables if they don't exist.
# This might be useful if running the script before the main app has ever run.
# However, typically the main app (app/main.py) handles table creation.
# To enable, uncomment the following line:
# Base.metadata.create_all(bind=engine)

def create_admin(username: str, email: str, password: str) -> bool:
    """
    Creates an admin user in the database.

    Args:
        username: The username for the admin.
        email: The email address for the admin.
        password: The password for the admin.

    Returns:
        True if the admin was created successfully, False otherwise.
    """
    db = SessionLocal()
    try:
        # Check if user with the same username already exists
        existing_user_by_username = db.query(User).filter(User.username == username).first()
        if existing_user_by_username:
            print(f"Error: User with username '{username}' already exists.")
            return False

        # Check if user with the same email already exists
        existing_user_by_email = db.query(User).filter(User.email == email).first()
        if existing_user_by_email:
            print(f"Error: User with email '{email}' already exists.")
            return False

        # Create new admin user
        hashed_password = get_password_hash(password)
        new_admin_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_admin=True,
            is_active=True  # Admins should be active by default
        )
        
        db.add(new_admin_user)
        db.commit()
        # db.refresh(new_admin_user) # Not strictly necessary for this script's output
        
        print(f"Admin user '{username}' created successfully.")
        return True
    
    except Exception as e:
        print(f"An error occurred while creating the admin user: {e}")
        db.rollback() # Rollback in case of error during commit
        return False
    
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create an admin user for the FastAPI application."
    )
    parser.add_argument(
        "--username",
        type=str,
        required=True,
        help="Username for the new admin user (e.g., 'admin')."
    )
    parser.add_argument(
        "--email",
        type=str,
        required=True,
        help="Email address for the new admin user (e.g., 'admin@example.com')."
    )
    parser.add_argument(
        "--password",
        type=str,
        required=True,
        help="Password for the new admin user. Choose a strong password."
    )
    
    args = parser.parse_args()

    # Basic password validation (optional, but good practice)
    if len(args.password) < 3:
        print("Error: Password must be at least 3 characters long.")
        sys.exit(1) # Exit with an error code
    
    if create_admin(args.username, args.email, args.password):
        sys.exit(0) # Exit successfully
    else:
        sys.exit(1) # Exit with an error code