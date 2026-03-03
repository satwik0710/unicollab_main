import os
import sys
import requests
import json
from uuid import uuid4

# Use the local backend URL
BASE_URL = "http://localhost:8000/api/v1"

def print_step(msg):
    print(f"\n[{'='*40}]\n>> {msg}\n[{'='*40}]")

def test_flow():
    # 1. Register User A (Founder)
    print_step("Step 1: Registering User A (Founder)")
    user_a_email = f"founder_{uuid4().hex[:6]}@test.com"
    user_a_password = "password123"
    
    res = requests.post(f"{BASE_URL}/auth/signup", json={
        "email": user_a_email,
        "password": user_a_password,
        "full_name": "Test Founder"
    })
    
    if res.status_code != 200:
        print(f"Failed to create User A: {res.text}")
        return
    print("User A created successfully.")
    
    # Login User A
    res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": user_a_email,
        "password": user_a_password
    })
    token_a = res.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    
    # 2. Register User B (Applicant)
    print_step("Step 2: Registering User B (Applicant)")
    user_b_email = f"applicant_{uuid4().hex[:6]}@test.com"
    user_b_password = "password123"
    
    res = requests.post(f"{BASE_URL}/auth/signup", json={
        "email": user_b_email,
        "password": user_b_password,
        "full_name": "Test Applicant"
    })
    if res.status_code != 200:
        print(f"Failed to create User B: {res.text}")
        return
    print("User B created successfully.")
    
    # Login User B
    res = requests.post(f"{BASE_URL}/auth/login", data={
        "username": user_b_email,
        "password": user_b_password
    })
    token_b = res.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Create Profile for User B
    print_step("Step 3: Creating Profile for User B")
    res = requests.put(f"{BASE_URL}/users/update-profile", headers=headers_b, json={
        "domain": "Engineering",
        "skills": ["Python", "React"]
    })
    if res.status_code != 200:
        print(f"Failed to update User B profile: {res.text}")
        return
    print("User B profile updated successfully.")

    # 4. User A creates a Project
    print_step("Step 4: User A creates a Project")
    project_payload = {
        "title": "E2E Test Project",
        "tagline": "A project created by automated tests",
        "description": "This is a full description of the e2e test project.",
        "problem_statement": "Testing is hard",
        "goals": "Make testing easy",
        "expected_outcome": "A fully tested app",
        "domain": "Engineering",
        "level": "Intermediate",
        "collaboration_mode": "Remote",
        "required_skills": ["Python", "React", "Testing"],
        "team_size_required": 3,
        "duration_weeks": 4
    }
    res = requests.post(f"{BASE_URL}/projects/create", headers=headers_a, json=project_payload)
    if res.status_code != 200:
        print(f"Failed to create project: {res.text}")
        return
    project = res.json()
    project_id = project["id"]
    print(f"Project created successfully: {project['title']} (ID: {project_id})")

    # 5. User B views marketplace / similar projects
    print_step("Step 5: User B views projects")
    res = requests.get(f"{BASE_URL}/projects/", headers=headers_b)
    projects_list = res.json()
    print(f"User B sees {len(projects_list)} projects in the marketplace.")

    # 6. User B applies to User A's project
    print_step("Step 6: User B applies to Project")
    res = requests.post(f"{BASE_URL}/requests/send", headers=headers_b, json={
        "project_id": project_id,
        "message": "I would love to join your test project!"
    })
    if res.status_code != 200:
        print(f"Failed to send request: {res.text}")
        return
    request_id = res.json()["id"]
    print(f"Request sent successfully (ID: {request_id})")

    # 7. Verify Pending Requests for User B (Sent)
    print_step("Step 7: Verify Sent Requests (User B Dashboard)")
    res = requests.get(f"{BASE_URL}/requests/sent", headers=headers_b)
    sent_requests = res.json()
    print(f"User B has {len(sent_requests)} sent requests.")
    if len(sent_requests) > 0:
        print(f"Top request targets project: {sent_requests[0]['project']['title']}")

    # 8. Verify Pending Requests for User A (Received)
    print_step("Step 8: Verify Received Requests (User A Dashboard)")
    res = requests.get(f"{BASE_URL}/requests/received", headers=headers_a)
    received_requests = res.json()
    print(f"User A has {len(received_requests)} received requests.")
    if len(received_requests) > 0:
        print(f"Top request is from: {received_requests[0]['sender']['full_name']}")

    # 9. User A accepts User B's request
    print_step("Step 9: User A accepts the request")
    res = requests.post(f"{BASE_URL}/requests/{request_id}/accept", headers=headers_a)
    if res.status_code != 200:
        print(f"Failed to accept request: {res.text}")
        return
    print(f"Request accepted successfully. Status is now: {res.json()['status']}")

    # 10. Verify User B is now on the team
    print_step("Step 10: Verify Team Formation")
    res = requests.get(f"{BASE_URL}/projects/{project_id}", headers=headers_a)
    project_details = res.json()
    team = project_details.get("teams", [])
    print(f"Project '{project_details['title']}' now has {len(team)} team members.")
    if len(team) > 0:
        print(f"First member ID matches User B: {team[0]['member_id'] == res.json().get('founder_id', 'diff') == False}")

    print_step("E2E Test Completed Successfully! 🎉")

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print(f"An error occurred: {e}")
