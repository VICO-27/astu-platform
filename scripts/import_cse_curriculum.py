import argparse
import os
import re
import sys
from dataclasses import dataclass, field
from typing import List, Optional

PROJ_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJ_ROOT not in sys.path:
    sys.path.insert(0, PROJ_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
import django
django.setup()

from apps.courses.models import Course
from apps.departments.models import Department

COURRICULUM_TEXT = """
###### First Year First Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sMATH1101Applied Mathematics I04

PHYS1101General Physics- I03

CHEM1101General Chemistry03

CSEg1101Introduction to Computing03

EnLa1001Communicative English53

LART1001Introduction to Civics & Ethics53

HPED1011Health and Physical Education I00

MATH 1101Applied Mathematics I04

###### First Year Second Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sMATH1102Applied Mathematics II04
- Applied Mathematics I(MATH1101)

CSEg1104Fundamentals of Programming53
- Introduction to Computing(CSEg1101)

EnLa1002Basic Writing Skill53
- Communicative English (EnLa1001)

HPED1022Health and Physical Education II00
- Health and Physical Education I(HPED1011)

CSEg1102Introduction to Emerging Technology53

LART1002Logic and Critical Thinking53

MENG1031Engineering Drawing53

###### Second Year First Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sMATH2101Applied Mathematics III04
- Applied Mathematics II(MATH1102)

EPCE2101Fundamentals of Electrical Engineering-4
- Applied Mathematics I(MATH1101)

CSEg2101Data Structures & Algorithms-3
- Fundamentals of Programming (CSEg1104)

ECEg2201Electronics Circuit I-4

LART1004Geography of Ethiopia and the Horn53

###### Second Year Second Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sCSEg2202Object oriented Programming53
- Fundamentals of Programming (CSEg1104)

ECEg2204Signals and Systems Analysis53
- Applied Mathematics III(MATH2101)

CSEg2208Design and Analysis of Algorithms53
- Data Structures & Algorithms(CSEg2101)

CSEg2210Discrete Mathematics for Computer Science-3
- Applied Mathematics I(MATH1101)

MATH2207Discrete mathematics03
- Applied Mathematics I(MATH1101)

SEng 2204Database Systems-4
- Fundamentals of Programming (CSEg1104)

Math2201Linear Algebra53
- Applied Mathematics I(MATH1101)

CSEg2206Database Systems64

LART1003History of Ethiopian and the Horn-3

###### Second Year Second Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/s

###### Third Year First Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sCSEg3203Advanced Programming53
- Object oriented Programming (CSEg2202)

ECEg3201Digital Logic Design74
- Electronics Circuit I(ECEg2201)

CSEg3301Computer Graphics53
- Fundamentals of Programming (CSEg1104)

ECEg3103Probabilty & Random Process53

CSEg3205Fundamentals of Software Engineering53

LART2002General Psychology and Life Skills-3

###### Third Year First Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sECEg3103Probabilty & Random Process53
- Applied Mathematics II(MATH1102)

ECEg3201Digital Logic Design74
- Electronics Circuit I(ECEg2201)

CSEg3203Advanced Programming53
- Object oriented Programming (CSEg2202)

SEng2206Fundamentals of Software Engineering53
- Introduction to Computing(CSEg1101)

Math 3201Numerical Analysis I-3
- Applied Mathematics III(MATH2101)

CSEg3303Computer Graphics-3
- Fundamentals of Programming (CSEg1104)

###### Third Year Second Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sCSEg3204Data Communication and Computer Networks64
- Introduction to Computing(CSEg1101)

SEng4208Introduction to Artificial Intelligence53
- Introduction to Computing(CSEg1101)

CSEg3306Mobile Computing and Applications53
- Object oriented Programming (CSEg2202)

SEng 3301Software Requirement Engineering-3
- Fundamentals of Software Engineering(SEng2206)

CSEg3202Computer Architecture & Organization53

SOSC2002Introduction to Economics33

SEng3302Information Storage and Retrieval-3

###### Third Year Second Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sCSEg3202Computer Architecture & Organization53
- Digital Logic Design(ECEg3201)

SEng4208Introduction to Artificial Intelligence53
- Introduction to Computing(CSEg1101)
- Data Structures & Algorithms(CSEg2101)

SEng3302Information Storage and Retrieval-3
- Database Systems(SEng 2204)

SEng 3301Software Requirement Engineering-3
- Fundamentals of Software Engineering(SEng2206)

CSEg3306Mobile Computing and Applications53
- Object oriented Programming (CSEg2202)

CSEg3204Data Communication and Computer Networks64

SOSC2002Introduction to Economics33

###### Fourth Year First Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sCSEg4207Microcomputer & Interfacing-3
- Computer Architecture & Organization(CSEg3202)

CSEg4203Formal Language & Automata Theory53
- Applied Mathematics III(MATH2101)

CSEg4205Computer Systems Security53
- Data Communication and Computer Networks(CSEg3204)

CSEg4201Operating Systems64
- Computer Architecture & Organization(CSEg3202)

CSEg4301Introduction to Data mining53
- Introduction to Artificial Intelligence(SEng4208)

CSEg4303System Programming53

CSEg4305Multimedia Technologies53

###### Fourth Year Second Semester
Course CodeCourse TitleECTSCredit HourCourse Prerequisite/sCSEg4204Web Programming53
- Introduction to Computing(CSEg1101)

Math2201Linear Algebra53
- Applied Mathematics I(MATH1101)

CSEg4302Image Processing53
- Signals and Systems Analysis(ECEg2204)

CSEg4304Complexity Theory53
- Design and Analysis of Algorithms (CSEg2208)

CSEg4306Programming languages53
- Advanced Programming(CSEg3203)

SEng4304Human Computer Interaction53
- Fundamentals of Software Engineering(CSEg3205)

SEng5305Introduction to Machine Learning53
- Introduction to Artificial Intelligence(SEng4208)

SEng4206Engineering Research and Development methodology42

CSEg 4206Special Topics in CSE-2

IETP4202Integrated Engineering Team Project-3
"""

SECTION_MAP = {
    'FIRST YEAR FIRST SEMESTER': (1, 1),
    'FIRST YEAR SECOND SEMESTER': (1, 2),
    'SECOND YEAR FIRST SEMESTER': (2, 1),
    'SECOND YEAR SECOND SEMESTER': (2, 2),
    'THIRD YEAR FIRST SEMESTER': (3, 1),
    'THIRD YEAR SECOND SEMESTER': (3, 2),
    'FOURTH YEAR FIRST SEMESTER': (4, 1),
    'FOURTH YEAR SECOND SEMESTER': (4, 2),
}

COURSE_CODE_RE = re.compile(r'^[A-Za-z]{2,5}g?\s*\d{4}')
COURSE_LINE_RE = re.compile(r'^(?P<code>[A-Za-z]{2,5}g?\s*\d{4})(?P<rest>.+)$')
TRAILING_CREDIT_RE = re.compile(r'^(?P<title>.*?)(?:-)?(?P<credit>\d{1,2})$')

@dataclass
class ParsedCourse:
    code: str
    title: str
    year: int
    semester: int
    credits: Optional[str] = None
    prerequisites: List[str] = field(default_factory=list)


def normalize_code(code: str) -> str:
    return code.replace(' ', '').upper().strip()


def normalize_title(title: str) -> str:
    return ' '.join(title.replace('  ', ' ').strip().split())


def parse_section_header(line: str):
    line = line.strip('#').strip()
    key = line.upper()
    return SECTION_MAP.get(key)


def parse_course_entry(line: str, year: int, semester: int) -> Optional[ParsedCourse]:
    line = line.strip()
    if not line or line.startswith('Course Code'):
        return None
    m = COURSE_LINE_RE.match(line)
    if not m:
        return None
    code = normalize_code(m.group('code'))
    rest = m.group('rest').strip()
    if not rest:
        return None
    # Remove trailing descriptors that are not title (credit digits)
    credits = None
    title = rest
    m2 = TRAILING_CREDIT_RE.match(rest)
    if m2:
        title = m2.group('title').strip()
        credits = m2.group('credit')
    title = normalize_title(title)
    if not title:
        return None
    return ParsedCourse(code=code, title=title, year=year, semester=semester, credits=credits)


def parse_curriculum(text: str):
    current_section = None
    parsed = []
    last_course = None

    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith('######'):
            current_section = parse_section_header(line)
            last_course = None
            continue
        if line.startswith('-') and last_course is not None:
            prereq = line[1:].strip()
            if prereq:
                last_course.prerequisites.append(normalize_title(prereq))
            continue
        if current_section is None:
            continue
        parsed_course = parse_course_entry(line, *current_section)
        if parsed_course:
            parsed.append(parsed_course)
            last_course = parsed_course
        else:
            # Attempt fallback for lines where code is separated by space
            parts = line.split()
            if len(parts) >= 2 and COURSE_CODE_RE.match(parts[0]):
                code = normalize_code(parts[0])
                title = normalize_title(' '.join(parts[1:]))
                parsed_course = ParsedCourse(code=code, title=title, year=current_section[0], semester=current_section[1])
                parsed.append(parsed_course)
                last_course = parsed_course
    return parsed


def build_description(course: ParsedCourse) -> str:
    bits = []
    if course.credits:
        bits.append(f'Credits: {course.credits}')
    if course.prerequisites:
        bits.append('Prerequisites: ' + '; '.join(course.prerequisites))
    return ' | '.join(bits)


def get_or_create_department():
    dept, _ = Department.objects.get_or_create(
        name='Computer Science and Engineering',
        defaults={
            'short_name': 'CSE',
            'category': Department.Category.ENGINEERING,
            'description': 'Computer Science and Engineering curriculum.',
        }
    )
    return dept


def import_courses(dry_run: bool = False):
    parsed = parse_curriculum(COURRICULUM_TEXT)
    print(f'Parsed {len(parsed)} course entries')
    department = get_or_create_department()
    created = 0
    updated = 0
    skipped = 0

    for course in parsed:
        desc = build_description(course)
        if dry_run:
            print(f'[{course.year}.{course.semester}] {course.code} - {course.title} ({desc})')
            continue
        obj, created_flag = Course.objects.update_or_create(
            department=department,
            code=course.code,
            defaults={
                'name': course.title,
                'year': course.year,
                'semester': course.semester,
                'description': desc,
                'is_active': True,
            }
        )
        if created_flag:
            created += 1
        else:
            updated += 1
    print(f'Imported courses for department {department.name}: created={created} updated={updated}')


def main():
    parser = argparse.ArgumentParser(description='Import CSE curriculum into the database.')
    parser.add_argument('--dry-run', action='store_true', help='Parse and print courses without writing to DB')
    args = parser.parse_args()
    import_courses(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
