#!/usr/bin/env python3
"""
HR Intelligence Dashboard Backend Testing Suite
Comprehensive testing for high-priority backend endpoints
"""

import requests
import json
import uuid
import time
from datetime import datetime
import base64
import os

class BackendTester:
    def __init__(self):
        self.base_url = "https://resume-match-fix-1.preview.emergentagent.com/api"
        self.session_id = str(uuid.uuid4())
        self.headers = {
            "X-Session-ID": self.session_id,
            "Content-Type": "application/json"
        }
        self.created_resources = {
            "jobs": [],
            "resumes": [],
            "screenings": []
        }
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"\n{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        
    def test_session_authentication(self):
        """Test session-based authentication"""
        print("\n🔐 Testing Session Authentication...")
        
        try:
            response = requests.get(f"{self.base_url}/auth/me", headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                user_data = response.json()
                self.log_test("Session Authentication", True, f"User created: {user_data.get('name')}")
                return True
            else:
                self.log_test("Session Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Session Authentication", False, f"Exception: {str(e)}")
            return False
    
    def create_test_job(self):
        """Create a test job for screening and email generation"""
        print("\n📋 Creating Test Job...")
        
        job_data = {
            "title": "Senior Software Engineer",
            "department": "Engineering",
            "location": "San Francisco, CA",
            "employment_type": "Full-time",
            "experience_level": "Senior",
            "description": "We are looking for a skilled Senior Software Engineer to join our dynamic team. The ideal candidate will have strong experience in Python, React, and cloud technologies.",
            "requirements": [
                "5+ years of software development experience",
                "Strong proficiency in Python and JavaScript",
                "Experience with React and modern web frameworks",
                "Knowledge of cloud platforms (AWS, GCP, or Azure)",
                "Strong problem-solving and communication skills"
            ],
            "nice_to_have": [
                "Experience with machine learning",
                "DevOps and CI/CD knowledge",
                "Leadership experience"
            ],
            "salary_range": {
                "min": 120000,
                "max": 180000,
                "currency": "USD"
            },
            "status": "active"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/jobs", 
                headers=self.headers, 
                json=job_data,
                timeout=30
            )
            
            if response.status_code == 200:
                job = response.json()
                job_id = job.get("job_id")
                self.created_resources["jobs"].append(job_id)
                self.log_test("Job Creation", True, f"Job ID: {job_id}")
                return job_id
            else:
                self.log_test("Job Creation", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Job Creation", False, f"Exception: {str(e)}")
            return None
    
    def create_sample_resume_content(self):
        """Create sample resume content for testing"""
        resume_text = """John Smith
Senior Software Engineer
Email: john.smith@email.com
Phone: (555) 123-4567

EXPERIENCE
Senior Software Engineer | Tech Corp | 2019-2024
• Led development of microservices architecture using Python and FastAPI
• Built responsive web applications using React and TypeScript
• Managed AWS cloud infrastructure and CI/CD pipelines
• Mentored junior developers and conducted code reviews

Software Engineer | StartUp Inc | 2017-2019
• Developed REST APIs and database systems
• Implemented automated testing and deployment processes
• Collaborated with cross-functional teams on product features

SKILLS
• Programming: Python, JavaScript, TypeScript, SQL
• Frameworks: React, FastAPI, Django, Node.js
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, Jest, Pytest

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2017"""
        
        # Convert to base64 as if it were a PDF
        return base64.b64encode(resume_text.encode()).decode()
    
    def upload_test_resume(self):
        """Upload a test resume"""
        print("\n📄 Uploading Test Resume...")
        
        # Create test resume file
        resume_content = "John Smith Resume Content - Senior Software Engineer with 5+ years experience"
        
        files = {
            'files': ('john_smith_resume.txt', resume_content, 'text/plain')
        }
        
        # Remove Content-Type header for multipart form data
        headers_for_upload = {key: value for key, value in self.headers.items() if key != "Content-Type"}
        
        try:
            response = requests.post(
                f"{self.base_url}/resumes/upload",
                headers=headers_for_upload,
                files=files,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                resumes = result.get("resumes", [])
                if resumes:
                    resume_id = resumes[0].get("resume_id")
                    self.created_resources["resumes"].append(resume_id)
                    self.log_test("Resume Upload", True, f"Resume ID: {resume_id}")
                    return resume_id
                else:
                    self.log_test("Resume Upload", False, "No resumes in response")
                    return None
            else:
                self.log_test("Resume Upload", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Resume Upload", False, f"Exception: {str(e)}")
            return None
    
    def test_resume_screening(self, job_id, resume_id):
        """Test resume screening endpoint"""
        print("\n🔍 Testing Resume Screening...")
        
        screening_data = {
            "job_id": job_id,
            "resume_ids": [resume_id]
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/resumes/screen",
                headers=self.headers,
                json=screening_data,
                timeout=60  # AI processing may take longer
            )
            
            if response.status_code == 200:
                result = response.json()
                results = result.get("results", [])
                if results:
                    screening_id = results[0].get("screening_id")
                    match_score = results[0].get("match_score")
                    self.created_resources["screenings"].append(screening_id)
                    self.log_test("Resume Screening", True, f"Screening ID: {screening_id}, Match Score: {match_score}")
                    return screening_id
                else:
                    self.log_test("Resume Screening", False, "No screening results")
                    return None
            else:
                self.log_test("Resume Screening", False, f"Status: {response.status_code}, Response: {response.text}")
                return None
                
        except Exception as e:
            self.log_test("Resume Screening", False, f"Exception: {str(e)}")
            return None
    
    def test_email_generation(self, job_title="Senior Software Engineer"):
        """Test email generation endpoint with all email types"""
        print("\n📧 Testing Email Generation...")
        
        email_types = [
            "interview_invitation",
            "reschedule", 
            "offer_letter",
            "rejection",
            "follow_up"
        ]
        
        results = {}
        
        for email_type in email_types:
            print(f"\n  Testing {email_type} email...")
            
            email_data = {
                "email_type": email_type,
                "candidate_name": "John Smith",
                "job_title": job_title,
                "company_name": "AIRecruiter",
                "tone": "professional"
            }
            
            # Add specific fields for certain email types
            if email_type in ["interview_invitation", "reschedule"]:
                email_data.update({
                    "interview_date": "2024-12-20",
                    "interview_time": "2:00 PM",
                    "interview_location": "Conference Room A"
                })
            
            try:
                response = requests.post(
                    f"{self.base_url}/emails/generate-draft",
                    headers=self.headers,
                    json=email_data,
                    timeout=60  # AI generation may take longer
                )
                
                if response.status_code == 200:
                    result = response.json()
                    subject = result.get("subject", "")
                    body = result.get("body", "")
                    
                    if subject and body:
                        self.log_test(f"Email Generation - {email_type}", True, f"Subject: {subject[:50]}...")
                        results[email_type] = True
                    else:
                        self.log_test(f"Email Generation - {email_type}", False, "Missing subject or body")
                        results[email_type] = False
                else:
                    self.log_test(f"Email Generation - {email_type}", False, f"Status: {response.status_code}, Response: {response.text}")
                    results[email_type] = False
                    
            except Exception as e:
                self.log_test(f"Email Generation - {email_type}", False, f"Exception: {str(e)}")
                results[email_type] = False
        
        # Overall result
        all_passed = all(results.values())
        failed_types = [t for t, passed in results.items() if not passed]
        
        if all_passed:
            self.log_test("Email Generation - All Types", True, "All email types generated successfully")
        else:
            self.log_test("Email Generation - All Types", False, f"Failed types: {failed_types}")
        
        return all_passed, results
    
    def test_analytics_endpoint(self):
        """Test analytics dashboard endpoint"""
        print("\n📊 Testing Analytics Dashboard...")
        
        try:
            response = requests.get(f"{self.base_url}/analytics/dashboard", headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                analytics = response.json()
                total_screenings = analytics.get("total_screenings", 0)
                self.log_test("Analytics Dashboard", True, f"Total screenings: {total_screenings}")
                return True
            else:
                self.log_test("Analytics Dashboard", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Analytics Dashboard", False, f"Exception: {str(e)}")
            return False
    
    def run_comprehensive_test(self):
        """Run comprehensive backend testing"""
        print("🚀 Starting HR Intelligence Dashboard Backend Tests")
        print(f"🌐 Base URL: {self.base_url}")
        print(f"🔑 Session ID: {self.session_id}")
        
        results = {}
        
        # 1. Test Authentication
        results["authentication"] = self.test_session_authentication()
        
        if not results["authentication"]:
            print("\n❌ Authentication failed - stopping tests")
            return results
        
        # 2. Create test job (required for email generation)
        job_id = self.create_test_job()
        results["job_creation"] = job_id is not None
        
        # 3. Upload test resume 
        resume_id = self.upload_test_resume()
        results["resume_upload"] = resume_id is not None
        
        # 4. Test resume screening (if we have both job and resume)
        if job_id and resume_id:
            screening_id = self.test_resume_screening(job_id, resume_id)
            results["resume_screening"] = screening_id is not None
        else:
            results["resume_screening"] = False
            self.log_test("Resume Screening", False, "Missing job_id or resume_id")
        
        # 5. Test email generation (critical - user reported broken)
        job_title = "Senior Software Engineer" if job_id else "Software Engineer"
        email_success, email_results = self.test_email_generation(job_title)
        results["email_generation"] = email_success
        results["email_types"] = email_results
        
        # 6. Test analytics
        results["analytics"] = self.test_analytics_endpoint()
        
        # Summary
        self.print_test_summary(results)
        
        return results
    
    def print_test_summary(self, results):
        """Print comprehensive test summary"""
        print("\n" + "="*60)
        print("🏁 TEST SUMMARY")
        print("="*60)
        
        total_tests = 0
        passed_tests = 0
        
        # Core functionality tests
        core_tests = {
            "Session Authentication": results.get("authentication", False),
            "Job Creation": results.get("job_creation", False), 
            "Resume Upload": results.get("resume_upload", False),
            "Resume Screening": results.get("resume_screening", False),
            "Email Generation": results.get("email_generation", False),
            "Analytics Dashboard": results.get("analytics", False)
        }
        
        for test_name, passed in core_tests.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{status} {test_name}")
            total_tests += 1
            if passed:
                passed_tests += 1
        
        # Email type breakdown
        if "email_types" in results:
            print("\n📧 Email Generation Details:")
            for email_type, passed in results["email_types"].items():
                status = "✅" if passed else "❌"
                print(f"  {status} {email_type}")
        
        # Overall score
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        print(f"\n🎯 Overall Success Rate: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
        
        # Critical issues
        critical_failures = []
        if not results.get("email_generation", False):
            critical_failures.append("Email Generation (USER REPORTED BROKEN)")
        if not results.get("resume_screening", False):
            critical_failures.append("Resume Screening")
        if not results.get("authentication", False):
            critical_failures.append("Session Authentication")
        
        if critical_failures:
            print(f"\n🚨 CRITICAL FAILURES:")
            for failure in critical_failures:
                print(f"  ❌ {failure}")
        else:
            print(f"\n🎉 All critical functionality working!")

def main():
    """Main test execution"""
    tester = BackendTester()
    results = tester.run_comprehensive_test()
    
    # Return exit code based on critical functionality
    critical_working = (
        results.get("authentication", False) and
        results.get("email_generation", False) and
        results.get("resume_screening", False)
    )
    
    return 0 if critical_working else 1

if __name__ == "__main__":
    exit(main())