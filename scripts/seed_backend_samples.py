import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
import django

django.setup()

from apps.departments.models import Department
from apps.courses.models import Course, Chapter
from apps.users.models import User, UserProfile
from apps.materials.models import Material
from apps.announcements.models import Announcement
from apps.projects.models import Project, ProjectMember, Task, ProjectFile, ProjectMessage, ActivityLog


def get_or_create_department():
    dept, _ = Department.objects.get_or_create(
        name='Computer Science and Engineering',
        defaults={
            'short_name': 'CSE',
            'category': Department.Category.ENGINEERING,
            'description': 'Computer Science and Engineering',
        }
    )
    return dept


def get_or_create_course(department):
    course, created = Course.objects.get_or_create(
        department=department,
        code='CSEG1101',
        defaults={
            'name': 'Introduction to Computing',
            'description': 'Sample course for backend validation.',
            'year': Course.Year.YEAR_1,
            'semester': Course.Semester.SEMESTER_1,
            'is_active': True,
        }
    )
    return course, created


def get_or_create_chapter(course):
    chapter, created = Chapter.objects.get_or_create(
        course=course,
        number=1,
        defaults={
            'title': 'Introduction and Basics',
            'order': 1,
            'summary': 'This chapter covers the basics of computing and programming.',
        }
    )
    return chapter, created


def get_or_create_users():
    admin, _ = User.objects.get_or_create(
        email='admin@astu.test',
        defaults={'name': 'Admin User', 'role': User.Role.ADMIN, 'is_staff': True, 'is_superuser': True}
    )
    if not admin.password:
        admin.set_password('AdminPass123!')
        admin.save()

    instructor, _ = User.objects.get_or_create(
        email='instructor@astu.test',
        defaults={'name': 'Instructor User', 'role': User.Role.INSTRUCTOR, 'is_staff': True}
    )
    if not instructor.password:
        instructor.set_password('InstructorPass123!')
        instructor.save()

    student, _ = User.objects.get_or_create(
        email='student@astu.test',
        defaults={'name': 'Student User', 'role': User.Role.STUDENT}
    )
    if not student.password:
        student.set_password('StudentPass123!')
        student.save()

    member_user, _ = User.objects.get_or_create(
        email='member@astu.test',
        defaults={'name': 'Project Member', 'role': User.Role.STUDENT}
    )
    if not member_user.password:
        member_user.set_password('MemberPass123!')
        member_user.save()

    # Ensure profiles
    profile, _ = UserProfile.objects.get_or_create(user=student)
    if not profile.department:
        profile.department = get_or_create_department()
        profile.year = UserProfile.Year.YEAR_1
        profile.semester = UserProfile.Semester.SEMESTER_1
        profile.student_id = 'ASTU2026001'
        profile.save()

    return admin, instructor, student, member_user


def create_material(chapter, instructor):
    material, _ = Material.objects.get_or_create(
        chapter=chapter,
        title='Sample Lecture Notes',
        defaults={
            'uploaded_by': instructor,
            'file_type': Material.FileType.MARKDOWN,
            'file_url': 'https://example.com/sample-notes.md',
            'file_size_mb': 0.1,
            'is_primary': True,
        }
    )
    return material


def create_announcement():
    announcement, _ = Announcement.objects.get_or_create(
        person_name='Dean Astu',
        defaults={
            'image_url': 'https://example.com/banner.png',
            'description': 'Welcome to the ASTU platform!',
            'link_url': 'https://astu.edu',
            'is_active': True,
            'order': 0,
        }
    )
    return announcement


def create_project(student, instructor):
    project, created = Project.objects.get_or_create(
        owner=student,
        name='Sample ASTU Project',
        defaults={
            'description': 'A sample team project used for backend endpoint validation.',
            'type': Project.Type.TEAM,
            'visibility': Project.Visibility.PUBLIC,
            'category': Project.Category.COURSEWORK,
            'github_url': '',
        }
    )
    if created:
        ProjectMember.objects.create(project=project, user=student, role=ProjectMember.Role.OWNER)
    ProjectMember.objects.get_or_create(project=project, user=instructor, defaults={'role': ProjectMember.Role.DEVELOPER})
    return project


def create_task(project, student):
    task, _ = Task.objects.get_or_create(
        project=project,
        title='Write backend validation script',
        defaults={
            'description': 'Create and test backend endpoints for ASTU platform.',
            'status': Task.Status.TODO,
            'assignee': student,
            'priority': Task.Priority.HIGH,
            'order': 1,
        }
    )
    return task


def create_project_file(project, student):
    pfile, _ = ProjectFile.objects.get_or_create(
        project=project,
        name='project-plan.md',
        defaults={
            'file_url': 'https://example.com/project-plan.md',
            'file_type': 'markdown',
            'uploaded_by': student,
        }
    )
    return pfile


def create_project_message(project, student):
    pm, _ = ProjectMessage.objects.get_or_create(
        project=project,
        sender=student,
        content='This is a sample project message for endpoint testing.',
    )
    return pm


def create_activity_log(project, student):
    log, _ = ActivityLog.objects.get_or_create(
        project=project,
        actor=student,
        action='Created sample project test data.',
    )
    return log


def main():
    print('Seeding sample backend data...')
    department = get_or_create_department()
    print('Department:', department.name)
    course, created = get_or_create_course(department)
    print('Course:', course.code, course.name, '(created)' if created else '(existing)')
    chapter, created = get_or_create_chapter(course)
    print('Chapter:', chapter.title, '(created)' if created else '(existing)')
    admin, instructor, student, member_user = get_or_create_users()
    print('Users:', admin.email, instructor.email, student.email, member_user.email)
    material = create_material(chapter, instructor)
    print('Material:', material.title)
    announcement = create_announcement()
    print('Announcement:', announcement.person_name)
    project = create_project(student, instructor)
    print('Project:', project.name)
    task = create_task(project, student)
    print('Task:', task.title)
    pfile = create_project_file(project, student)
    print('Project file:', pfile.name)
    pm = create_project_message(project, student)
    print('Project message:', pm.content[:40])
    log = create_activity_log(project, student)
    print('Activity log:', log.action)
    print('Seed complete.')


if __name__ == '__main__':
    main()
