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

DEPTS = [
    # CoEEC
    {"name": "Computer science and engineering", "short": "CSE", "cat": Department.Category.ENGINEERING},
    {"name": "Software engineering", "short": "SE", "cat": Department.Category.ENGINEERING},
    {"name": "Electronics and communication engineering", "short": "ECE", "cat": Department.Category.ENGINEERING},
    {"name": "Power and control engineering", "short": "PCE", "cat": Department.Category.ENGINEERING},
    # CoCE
    {"name": "Architecture", "short": "ARCH", "cat": Department.Category.ENGINEERING},
    {"name": "Civil engineering", "short": "CIVIL", "cat": Department.Category.ENGINEERING},
    {"name": "Water and recourse engineering", "short": "WRE", "cat": Department.Category.ENGINEERING},
    # CoMMCE
    {"name": "Mechanical engineering", "short": "MECH", "cat": Department.Category.ENGINEERING},
    {"name": "Chemical engineering", "short": "CHEME", "cat": Department.Category.ENGINEERING},
    {"name": "Material engineering", "short": "MATE", "cat": Department.Category.ENGINEERING},
    # Applied Science
    {"name": "Applied Mathematics", "short": "MATH", "cat": Department.Category.APPLIED_SCIENCE},
    {"name": "Applied Physics", "short": "PHYS", "cat": Department.Category.APPLIED_SCIENCE},
    {"name": "Applied Biology", "short": "BIO", "cat": Department.Category.APPLIED_SCIENCE},
    {"name": "Applied chemistry", "short": "CHEM", "cat": Department.Category.APPLIED_SCIENCE},
    {"name": "Industrial", "short": "IND", "cat": Department.Category.APPLIED_SCIENCE},
    {"name": "Pharmacy", "short": "PHARM", "cat": Department.Category.APPLIED_SCIENCE},
]

def main():
    admin, _ = User.objects.get_or_create(email='admin@astu.test', defaults={'name': 'Admin', 'role': User.Role.ADMIN})

    print("Seeding full department structure...")
    for d_data in DEPTS:
        dept, created = Department.objects.get_or_create(
            name=d_data['name'],
            defaults={
                'short_name': d_data['short'],
                'category': d_data['cat'],
                'description': f"Welcome to the {d_data['name']} department."
            }
        )
        print(f"{'Created' if created else 'Found'} Department: {dept.name}")

        # Seed sample courses for each department
        course, c_created = Course.objects.get_or_create(
            department=dept,
            code=f"{d_data['short']}1001",
            defaults={
                'name': f"Introduction to {d_data['name']}",
                'year': Course.Year.YEAR_1,
                'semester': Course.Semester.SEMESTER_1,
                'description': f"Foundations of {d_data['name']}.",
                'is_active': True
            }
        )

        # Create Chapter
        chapter, ch_created = Chapter.objects.get_or_create(
            course=course,
            number=1,
            defaults={
                'title': f"Basics of {d_data['name']}",
                'order': 1,
                'summary': f"This chapter covers the basic concepts and history of {d_data['name']}."
            }
        )

        # Seed Materials: PDF, PPT, YouTube
        Material.objects.get_or_create(
            chapter=chapter,
            title='Chapter 1 Lecture Slides (PPT)',
            defaults={
                'uploaded_by': admin,
                'file_type': Material.FileType.PPT,
                'file_url': 'https://example.com/slides.ppt',
                'is_primary': True
            }
        )
        Material.objects.get_or_create(
            chapter=chapter,
            title='Chapter 1 Notes (PDF)',
            defaults={
                'uploaded_by': admin,
                'file_type': Material.FileType.PDF,
                'file_url': 'https://example.com/notes.pdf'
            }
        )
        Material.objects.get_or_create(
            chapter=chapter,
            title='Lecture Video (YouTube)',
            defaults={
                'uploaded_by': admin,
                'file_type': Material.FileType.YOUTUBE,
                'file_url': 'https://youtube.com/watch?v=dQw4w9WgXcQ'
            }
        )

    print("Full structure seeded successfully!")

if __name__ == '__main__':
    main()
