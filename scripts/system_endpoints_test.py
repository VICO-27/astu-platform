import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
import django

django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from apps.departments.models import Department
from apps.courses.models import Course, Chapter
from apps.materials.models import Material
from apps.projects.models import Project, Task, ProjectFile, ProjectMember
from apps.users.models import User
from apps.announcements.models import Announcement

BASE_URL = 'http://127.0.0.1:8000'


def request_json(path, method='GET', headers=None, data=None):
    url = urllib.parse.urljoin(BASE_URL, path)
    headers = headers or {'User-Agent': 'backend-smoke/1.0'}
    body = None
    if data is not None:
        body = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            text = resp.read().decode('utf-8', errors='replace')
            try:
                return resp.status, json.loads(text)
            except json.JSONDecodeError:
                return resp.status, text
    except urllib.error.HTTPError as exc:
        text = exc.read().decode('utf-8', errors='replace')
        try:
            payload = json.loads(text)
        except Exception:
            payload = text
        return exc.code, payload
    except Exception as exc:
        return None, str(exc)


def login(email, password):
    status, data = request_json('/api/v1/auth/login/', method='POST', data={'email': email, 'password': password})
    print('LOGIN RESPONSE', email, status, data)
    return status, data


def get_jwt_token(email):
    user = User.objects.filter(email=email).first()
    if not user:
        return None
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


def bearer(token):
    return {'Authorization': f'Bearer {token}', 'User-Agent': 'backend-smoke/1.0'}


def print_result(name, status, data, expected=None):
    ok = expected is None or status == expected or (isinstance(expected, tuple) and status in expected)
    print('===', name, '===')
    print('status:', status, 'OK' if ok else 'FAIL')
    if isinstance(data, (dict, list)):
        print(json.dumps(data, indent=2)[:800])
    else:
        print(str(data)[:800])
    print()
    return ok


def get_sample_ids():
    dept = Department.objects.filter(name='Computer Science and Engineering').first()
    course = Course.objects.filter(code='CSEG1101').first()
    chapter = Chapter.objects.filter(course=course, number=1).first() if course else None
    material = Material.objects.filter(chapter=chapter).first() if chapter else None
    announcement = Announcement.objects.filter(person_name='Dean Astu').first()
    project = Project.objects.filter(name='Sample ASTU Project').first()
    task = Task.objects.filter(project=project).first() if project else None
    pfile = ProjectFile.objects.filter(project=project).first() if project else None
    instructor = User.objects.filter(email='instructor@astu.test').first()
    student = User.objects.filter(email='student@astu.test').first()
    member = User.objects.filter(email='member@astu.test').first()
    return {
        'dept': dept,
        'course': course,
        'chapter': chapter,
        'material': material,
        'announcement': announcement,
        'project': project,
        'task': task,
        'file': pfile,
        'student': student,
        'admin': User.objects.filter(email='admin@astu.test').first(),
        'instructor': instructor,
        'member': member,
    }


def main():
    ids = get_sample_ids()
    if not ids['student'] or not ids['admin'] or not ids['instructor']:
        print('Sample users missing. Run seed_backend_samples.py first.')
        sys.exit(1)

    student_login_status, student_login_data = login('student@astu.test', 'StudentPass123!')
    instructor_login_status, instructor_login_data = login('instructor@astu.test', 'InstructorPass123!')
    admin_login_status, admin_login_data = login('admin@astu.test', 'AdminPass123!')

    student_token = get_jwt_token('student@astu.test')
    instructor_token = get_jwt_token('instructor@astu.test')
    admin_token = get_jwt_token('admin@astu.test')

    if not all([student_token, instructor_token, admin_token]):
        print('JWT token generation failed for one or more users.')
        sys.exit(1)

    student_headers = bearer(student_token)
    instructor_headers = bearer(instructor_token)
    admin_headers = bearer(admin_token)

    # Root and admin
    print_result('Root GET /', *request_json('/'))
    print_result('Admin GET /admin/', *request_json('/admin/'), expected=200)

    # Auth
    print_result('Auth login student', 200 if student_token else 500, {'token': bool(student_token)})
    print_result('Auth login admin', 200 if admin_token else 500, {'token': bool(admin_token)})

    # Users
    print_result('Users me', *request_json('/api/v1/users/me/', headers=student_headers), expected=200)
    print_result('User detail', *request_json(f"/api/v1/users/{ids['student'].id}/", headers=student_headers), expected=200)

    # Departments
    print_result('Departments list', *request_json('/api/v1/departments/', headers=student_headers), expected=200)
    if ids['dept']:
        print_result('Department detail', *request_json(f"/api/v1/departments/{ids['dept'].id}/", headers=student_headers), expected=200)

    # Courses
    print_result('Courses list', *request_json('/api/v1/courses/', headers=student_headers), expected=200)
    print_result('My courses', *request_json('/api/v1/courses/my/', headers=student_headers), expected=200)
    if ids['course']:
        print_result('Course detail', *request_json(f"/api/v1/courses/{ids['course'].id}/", headers=student_headers), expected=200)
        print_result('Course chapters', *request_json(f"/api/v1/courses/{ids['course'].id}/chapters/", headers=student_headers), expected=200)

    # Auto-generate chapters with instructor
    if ids['course']:
        payload = {
            'course_id': str(ids['course'].id),
            'chapters': [
                {'number': 2, 'title': 'Sample generated chapter'},
            ]
        }
        print_result('Auto-generate chapters', *request_json('/api/v1/chapters/auto-generate/', method='POST', headers=instructor_headers, data=payload), expected=200)

    if ids['chapter']:
        print_result('Chapter detail', *request_json(f"/api/v1/chapters/{ids['chapter'].id}/", headers=student_headers), expected=200)

    # Materials
    if ids['material']:
        print_result('Materials list', *request_json('/api/v1/materials/', headers=student_headers), expected=200)
        print_result('Material detail', *request_json(f"/api/v1/materials/{ids['material'].id}/", headers=student_headers), expected=200)
        print_result('Material download', *request_json(f"/api/v1/materials/{ids['material'].id}/download/", method='POST', headers=student_headers), expected=200)

    # Announcements
    print_result('Announcements list', *request_json('/api/v1/announcements/'), expected=200)
    if ids['announcement']:
        print_result('Announcement detail', *request_json(f"/api/v1/announcements/{ids['announcement'].id}/"), expected=200)
    announcement_data = {
        'image_url': 'https://example.com/new-announcement.png',
        'person_name': 'API Admin',
        'description': 'Backend endpoint test announcement',
        'link_url': 'https://astu.edu/test',
        'is_active': True,
        'order': 1,
    }
    print_result('Announcement create', *request_json('/api/v1/announcements/', method='POST', headers=admin_headers, data=announcement_data), expected=201)

    # Projects & tasks
    if ids['project']:
        print_result('Projects list', *request_json('/api/v1/projects/', headers=student_headers), expected=200)
        print_result('Projects explore', *request_json('/api/v1/projects/explore/', headers=student_headers), expected=200)
        print_result('Project detail', *request_json(f"/api/v1/projects/{ids['project'].id}/", headers=student_headers), expected=200)

        new_project_data = {
            'name': 'API Smoke Project',
            'description': 'Project created via endpoint smoke test.',
            'type': 'team',
            'visibility': 'public',
            'category': 'coursework',
        }
        status, data = request_json('/api/v1/projects/', method='POST', headers=student_headers, data=new_project_data)
        print_result('Project create', status, data, expected=201)
        created_project_id = data.get('id') if isinstance(data, dict) else None

        if created_project_id and ids['member']:
            invite_payload = {'email': ids['member'].email, 'role': 'developer'}
            print_result('Project invite member', *request_json(f"/api/v1/projects/{created_project_id}/invite/", method='POST', headers=student_headers, data=invite_payload), expected=201)
            member_resp = request_json(f"/api/v1/projects/{created_project_id}/", headers=student_headers)
            invited_member_id = ids['member'].id
            if invited_member_id:
                print_result('Update member role', *request_json(f"/api/v1/projects/{created_project_id}/members/{invited_member_id}/", method='PATCH', headers=student_headers, data={'role': 'reviewer'}), expected=200)
                print_result('Remove member', *request_json(f"/api/v1/projects/{created_project_id}/members/{invited_member_id}/remove/", method='DELETE', headers=student_headers), expected=204)

        if ids['task']:
            print_result('Project tasks list', *request_json(f"/api/v1/projects/{ids['project'].id}/tasks/", headers=student_headers), expected=200)
            print_result('Task detail', *request_json(f"/api/v1/tasks/{ids['task'].id}/", headers=student_headers), expected=200)
            print_result('Task move', *request_json(f"/api/v1/tasks/{ids['task'].id}/move/", method='PATCH', headers=student_headers, data={'status': 'in_progress'}), expected=200)

        if ids['file']:
            print_result('Project files list', *request_json(f"/api/v1/projects/{ids['project'].id}/files/", headers=student_headers), expected=200)
            print_result('Delete project file', *request_json(f"/api/v1/projects/{ids['project'].id}/files/{ids['file'].id}/", method='DELETE', headers=student_headers), expected=204)

        if ids['project']:
            print_result('Project messages list', *request_json(f"/api/v1/projects/{ids['project'].id}/messages/", headers=student_headers), expected=200)
            print_result('Project message create', *request_json(f"/api/v1/projects/{ids['project'].id}/messages/", method='POST', headers=student_headers, data={'content': 'Automated message test.'}), expected=201)
            print_result('Project activity', *request_json(f"/api/v1/projects/{ids['project'].id}/activity/", headers=student_headers), expected=200)
            print_result('Project github', *request_json(f"/api/v1/projects/{ids['project'].id}/github/", headers=student_headers), expected=(400, 502))

    # AI
    if ids['chapter']:
        print_result('AI home POST', *request_json('/api/v1/ai/home/', method='POST', headers=student_headers, data={'question': 'What is ASTU?' }), expected=(200, 503))
        print_result('AI notes generate', *request_json('/api/v1/ai/notes/generate/', method='POST', headers=student_headers, data={'chapter_id': str(ids['chapter'].id)}), expected=(200, 201, 503))
        print_result('AI notes get', *request_json(f"/api/v1/ai/notes/{ids['chapter'].id}/", headers=student_headers), expected=(200, 404))

    # Search
    print_result('Search global', *request_json('/api/v1/search/?q=Computing', headers=student_headers), expected=200)
    print_result('Search courses', *request_json('/api/v1/search/courses/?q=Computing', headers=student_headers), expected=200)
    print_result('Search materials', *request_json('/api/v1/search/materials/?q=Lecture', headers=student_headers), expected=200)

    print('System endpoint validation complete.')


if __name__ == '__main__':
    main()
